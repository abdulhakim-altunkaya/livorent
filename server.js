const express = require("express");
const app = express();
const path = require("path");

//user authentication packages, bcrypt is used to hash passwords
//jsonwebtoken is used to send frontend an ok if the user is created
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { pool, supabase, upload } = require("./db"); // Import configurations
const useragent = require("useragent");

const cors = require("cors");
app.use(cors()); //frontend and backend will run on different ports when in development. We need this to overcome 
//issues arising because of this.
app.use(express.json()); //we need this to read the data is coming from frontend to backend in req.body

//UNCOMMENT WHEN IN PRODUCTION
//app.use(express.static(path.join(__dirname, "client/build")));

// 🔒 MIDDLEWARE 1: Custom input sanitization
const sanitizeInputs = require('./utilsSanitize.js');
app.use(sanitizeInputs);

// 🔐 MIDDLEWARE 2: Token verification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SEC);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
};

// 🔒 MIDDLEWARE 3: Rate Limiter
const rateLimit = require('express-rate-limit');
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,             // 100 requests per minute
  message: { myMessage: 'Too many attempts from this visitor' },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

// 🔒 MIDDLEWARE 4: Custom spam ip block
// List of IPs to ignore (server centers, ad bots, my ip etc) 
const ignoredIPs = ["66.249.68.5", "66.249.68.4", "66.249.88.2", "66.249.89.2", "66.249.65.32", "66.249.88.3", 
  "209.85.238.224", "80.89.77.205", "212.3.197.186", "80.89.74.90", "80.89.79.74", "80.89.77.116", "80.89.73.22", 
  "66.249.64.10", "66.249.64.6", "66.249.64.5", "66.249.66.169", "66.249.66.160", "212.3.194.116", "212.3.194.116", 
  "66.249.73.233", "66.249.73.234", "62.103.210.169", "66.249.66.161", "66.249.69.65", "66.249.68.33", "66.249.68.37",
  "66.249.68.38", "66.249.68.34", "40.77.189.152", "17.246.15.253", "17.246.15.253", "152.39.239.250", "45.114.243.179", 
  "66.249.73.197", "66.249.73.202", "205.169.39.19", "209.85.238.225", "205.169.39.232"];
const blockBannedIPs = (req, res, next) => {
  const ipVisitor = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip;
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({ myMessage: 'Visitor is banned' });
  }
  next();
};


//A temporary cache to save ip addresses and it will prevent spam comments and replies for 1 minute.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
const ipCache3 = {}
app.post("/api/post/serversavead", upload.array("images", 4), authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const adData = JSON.parse(req.body.adData);  // ✅ Parse the JSON string
  const { adTitle, adDescription, adPrice, adCity, adName, adTelephone, adCategory, adVisitorNumber } = adData;

  const visitorData = {
    ip: ipVisitor,
    visitDate: new Date().toLocaleDateString('en-GB')
  };

  //IMAGE UPLOAD
  const files = req.files;
  let uploadedImageUrls = [];
  // Supported image file types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  for (const file of files) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
                .from("livo") // Supabase Storage Bucket
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: "3600",
                    upsert: false,
                });
    if (error) {
        console.error("Supabase Upload Error:", error);
        return res.status(500).json({ error: "Error uploading file to storage." });
    }
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/livo/${fileName}`;
    uploadedImageUrls.push(imageUrl);
  }

  //CATEGORY DATA MANAGEMENT
  //First digit of each number represent its main category. The number itself is its section category.
  const stringNum = adCategory.toString(); // Convert number to string
  const mainCategoryNum = parseInt(stringNum[0], 10); // Convert first character back to number
  const sectionCategoryNum = parseInt(adCategory); // Convert second character back to number

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_ads 
      (title, description, price, city, name, telephone, ip, date, image_url, main_group, sub_group, user_id) 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [adTitle, adDescription, adPrice, adCity, adName, adTelephone, visitorData.ip, 
        visitorData.visitDate, JSON.stringify(uploadedImageUrls), mainCategoryNum, sectionCategoryNum, adVisitorNumber]
    );
    res.status(201).json({myMessage: "Ad saved"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while saving ad"})
  } finally {
    client.release();
  } 

}); 

//A temporary cache to save ip addresses and it will prevent spam sign-up attempts for 1 minute.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
const ipCache4 = {}
const JWT_SEC = process.env.JWT_SECRET; // Ensure you have this in your .env file
const SALT_ROUNDS = 5; // For password hashing, normally 10 would be safe. I am not storing sensitive data. So, 5 is enough.
app.post("/api/register", rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam signups
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const registerObject = req.body;
  const registerLoad = {
    name1: registerObject.registerName.trim(),
    telephone1: registerObject.registerTelephone.trim(),     // Ensure text values are trimmed
    email1: registerObject.registerEmail.trim().toLowerCase(),     // Ensure date is trimmed and lowercased,
    passtext1: registerObject.registerPasstext.trim(),
    secretWord1: registerObject.registerSecretWord.trim(),
  };
  const visitorData = {
    ip: ipVisitor,
    visitDate: new Date().toLocaleDateString('en-GB')
  };

  if (!registerLoad.email1 || !registerLoad.passtext1 || !registerLoad.secretWord1
      || !registerLoad.name1 || !registerLoad.telephone1) {
    return res.status(400).json({ 
      resStatus: false,
      resMessage: 'Missing fields', 
      resVisitorNumber: 0, 
      resToken: "",
      resUser: null,
      resErrorCode: 1
    });
  }

  try {
    // Hash the password and secret word
    const hashedPassword = await bcrypt.hash(registerLoad.passtext1, SALT_ROUNDS);
    const hashedSecretWord = await bcrypt.hash(registerLoad.secretWord1, SALT_ROUNDS);

    client = await pool.connect();

    //CHECK: existing emails mean user already registered
    const { rowCount } = await client.query(
      /*select 1 means check if there is matching record. select 1 focuses on match, not on data */
      `SELECT 1 FROM livorent_users WHERE email = $1`,
      [registerLoad.email1]
    );
    if (rowCount > 0) {
      return res.status(409).json({ 
        resStatus: false,
        resMessage: 'User exists', 
        resVisitorNumber: 0, 
        resToken: "",
        resUser: null,
        resErrorCode: 2
      });
    }

    const { rows: newUser } = await client.query(
      `INSERT INTO livorent_users 
      (name, telephone, email, passtext, ip, date, secretword, loginattempt, logintime, tokenversion) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [registerLoad.name1, registerLoad.telephone1, registerLoad.email1, 
        hashedPassword, visitorData.ip, visitorData.visitDate, 
        hashedSecretWord, 0, new Date().toISOString(), 1]
    );

    // Generate a JWT for the new user and send it to frontend
    const token = jwt.sign({ userId: newUser[0].id, tokenVersion: 1 }, JWT_SEC, { expiresIn: '100d' });
    res.status(201).json({ 
      resStatus: true,
      resMessage: 'Profile created', 
      resVisitorNumber: newUser[0].id, 
      resToken: token,
      resUser: newUser[0],
      resErrorCode: 0
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      resStatus: false,
      resMessage: 'Profile creation failed', 
      resVisitorNumber: 0, 
      resToken: "",
      resUser: null,
      resErrorCode: 3
    });
  } finally {
    if (client) client.release();
  } 
});

app.post("/api/login", rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam logins
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client; 
  const loginObject = req.body;
  const loginLoad = {
    // Ensure date is trimmed, no whitespace and also if frontend sends invalid data, keep values "" to prevent crashes.    
    email1: loginObject.loginEmail?.trim() || "",
    passtext1: loginObject.loginPasstext?.trim() || ""
  };

  // Early field check
  if (!loginLoad.email1 || !loginLoad.passtext1) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Lauki nevar būt tukši.', 
      resVisitorNumber: 0,
      resToken: "",
      resUser: null,
      resErrorCode: 4 // Missing fields
    });
  }

  try {
    client = await pool.connect();
    //find user by email
    const { rows: users } = await client.query(
      `SELECT id, email, passtext, tokenversion, name, telephone, loginattempt, loginblockeduntil
       FROM livorent_users WHERE email = $1`, [loginLoad.email1]
    )
    if(users.length === 0) {
      return res.status(401).json({
        resStatus: false,
        resMessage: 'no user found', 
        resVisitorNumber: 0, 
        resToken: "",
        resUser: null,
        resErrorCode: 1
      });
    }
    const user = users[0];

    //1. CHECK IF LOGIN IS BLOCKED
    //check if value is not null and if blocked time still left. If yes, then return with error message.
    if (user.loginblockeduntil && new Date(user.loginblockeduntil) > new Date()) {
      return res.status(403).json({
        resStatus: false,
        resMessage: 'login blocked temporarily', 
        resVisitorNumber: 0, 
        resToken: "",
        resUser: null,
        resErrorCode: 6
      });
    } 

    //comparing password. Bcrypt will know from hashed password the number of salt rounds
    const passwordMatch = await bcrypt.compare(loginLoad.passtext1, user.passtext);

    //* WRONG PASSWORD CODE *//
    if (!passwordMatch) {
      if (user.loginattempt < 3) {
        //increment only if login attempt below 3
        await client.query(`UPDATE livorent_users SET loginattempt = loginattempt + 1 WHERE email = $1`,
          [loginLoad.email1]);
      } else {
        //block if login attempt is 3 
        await client.query(
          `UPDATE livorent_users SET loginblockeduntil = NOW() + INTERVAL '300 seconds' WHERE email = $1`, 
          [loginLoad.email1]);
      }
      return res.status(401).json({
        resStatus: false,
        resMessage: 'wrong password or e-mail', 
        resVisitorNumber: 0, 
        resToken: "",
        resUser: null,
        resErrorCode: 2
      });
    }

    //Control Check: verify if tokenversion exists
    if (user.tokenversion === undefined || user.tokenversion === null || user.tokenversion < 1) {
      return res.status(500).json({ 
        resStatus: false,
        resMessage: "Invalid user data: Contact the website support or create a new profile.", 
        resVisitorNumber: 0, 
        resToken: "",
        resUser: null,
        resErrorCode: 5
      });
    }
    //** SUCCESS CODE LOGIC **//
    //generating JWT for authenticated users
    //tokenversion: field name in DB
    //tokenVersion: jwt field name
    const token = jwt.sign({ userId: user.id, tokenVersion: user.tokenversion }, JWT_SEC, { expiresIn: "100d" });
    await client.query(
      `UPDATE livorent_users SET loginattempt = 0, loginblockeduntil = NULL WHERE email = $1`, [loginLoad.email1]);
    res.status(200).json({
      resStatus: true,
      resMessage: "Autorizācija veiksmīga.",
      resUser: user,
      resVisitorNumber: user.id, 
      resToken: token,
      resErrorCode: 0
    })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      resStatus: false,
      resMessage: 'Database connection failed', 
      resVisitorNumber: 0, 
      resToken: "",
      resUser: null,
      resErrorCode: 3
    })
  } finally {
    if (client) client.release();
  } 
});

app.post("/api/post/password-renewal", rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam logins
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client; 
  const renewalObject = req.body;
  const renewalLoad = {
    // Ensure date is trimmed, no whitespace and if frontend sends invalid data, keep values "" to prevent crashes. 
    email1: renewalObject.renewalEmail?.trim() || "",
    passtext1: renewalObject.renewalPasstext?.trim() || "", 
    secretWord1: renewalObject.renewalSecretWord?.trim() || "",
  };
  

  try {
    const hashedNewPassword = await bcrypt.hash(renewalLoad.passtext1, SALT_ROUNDS);

    client = await pool.connect();
    //find user by email
    const { rows: users } = await client.query(
      `SELECT id, passtext, tokenversion, secretword FROM livorent_users WHERE email = $1`, [renewalLoad.email1]
    )
    if(users.length === 0) {
      return res.status(401).json({
        responseMessage: "No user data with that email",
        responseStatus: false,
        responseNumber: 0,
        responseUser: null,
        responseToken:""
      });
    }
    const user = users[0];
    //comparing secret word. Bcrypt will know from hashed secret word the number of salt rounds used previously
    const secretWordMatch = await bcrypt.compare(renewalLoad.secretWord1, user.secretword);
    if (!secretWordMatch) {
      return res.status(401).json({
        responseMessage: "Secret word does not match",
        responseStatus: false,
        responseNumber: 0,
        responseUser: null,
        responseToken:""
      });
    }

    //If secret word matches, then update the password and send a new token to frontend
    const { rows: updatedUser } = await client.query(
      `UPDATE livorent_users SET passtext = $1, tokenversion = tokenversion + 1 WHERE id = $2 RETURNING *`,
      [hashedNewPassword, user.id]
    );
    if (updatedUser.length === 0) {
      return res.status(500).json({
        responseMessage: "Failed to update password.",
        responseStatus: false,
        responseNumber: 0,
        responseUser: null,
        responseToken: ""
      });
    }
    //Control Check: verify if tokenversion exists
    if (updatedUser[0].tokenversion === undefined || updatedUser[0].tokenversion=== null || updatedUser[0].tokenversion < 1) {
      return res.status(500).json({ 
        responseStatus: false,
        responseMessage: "Invalid user data: Contact the website support or create a new profile.", 
        responseNumber: 0, 
        responseToken: "",
        responseUser: null
      });
    }
    //generating JWT for authenticated users
    //tokenversion: field name in DB
    //tokenVersion: jwt field name
    const token = jwt.sign(
      { userId: updatedUser[0].id, tokenVersion: updatedUser[0].tokenversion}, JWT_SEC, { expiresIn: '100d' }
    );
    res.status(200).json({
      responseMessage: "Password updated",
      responseStatus: true,
      responseNumber: user.id,
      responseUser: updatedUser[0],
      responseToken: token
    });
  } catch (error) {
    console.log(error);//log all error stack 
    res.status(500).json({
      responseMessage: "Probably database connection failed.",
      responseStatus: false,
      responseNumber: 0,
      responseUser: null,
      responseToken:""
    })
  } finally {
    if (client) client.release();
  } 
})

app.post("/api/post/password-change", rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam logins
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;


  let client; 
  const changeObject = req.body;
  const changeLoad = {
    // Ensure date is trimmed, no whitespace and if frontend sends invalid data, keep values "" to prevent crashes. 
    email1: changeObject.changeEmail?.trim().toLowerCase() || "",
    newPassword1: changeObject.changePasstext?.trim() || "", //new password
    currentPassword1: changeObject.changeCurrentPassword?.trim() || "", //old password
  };
  
  if (!changeLoad.email1 || !changeLoad.newPassword1 || !changeLoad.currentPassword1) {
    return res.status(400).json({
      resMessage: "All fields are required", 
      resStatus: false,
      resNumber: 0,
      resUser: null,
      resErrorCode: 5
    });
  }

  try {
    const hashedNewPassword = await bcrypt.hash(changeLoad.newPassword1, SALT_ROUNDS);

    client = await pool.connect();
    //find user by email
    const { rows: users } = await client.query(
      `SELECT id, passtext FROM livorent_users WHERE email = $1`, [changeLoad.email1]
    )
    if(users.length === 0) {
      return res.status(401).json({
        resMessage: "No user data with that email",
        resStatus: false,
        resNumber: 0,
        resUser: null,
        resErrorCode: 1
      });
    }
    const user = users[0];

    //comparing passwords. Bcrypt will know from hashed password the number of salt rounds used previously
    const passwordMatch = await bcrypt.compare(changeLoad.currentPassword1, user.passtext);
    if (!passwordMatch) {
      return res.status(401).json({
        resMessage: "Current password is wrong",
        resStatus: false,
        resNumber: 0,
        resUser: null,
        resErrorCode: 2
      });
    }
    //new password should be different than old password
    const samePassword = await bcrypt.compare(changeLoad.newPassword1, user.passtext);
    if (samePassword) {
      return res.status(400).json({
        resMessage: "New password must be different from current",
        resStatus: false,
        resNumber: 0,
        resUser: null,
        resErrorCode: 6
      });
    }

    //If current password is correct, then update the password
    const { rows: updatedUser } = await client.query(
      `UPDATE livorent_users SET passtext = $1 WHERE id = $2 RETURNING *`,
      [hashedNewPassword, user.id]
    );
    if (updatedUser.length === 0) {
      return res.status(500).json({
        resMessage: "Failed to update password.",
        resStatus: false,
        resNumber: 0,
        resUser: null,
        resErrorCode: 3
      });
    }
    res.status(200).json({
      resMessage: "Password updated",
      resStatus: true,
      resNumber: user.id,
      resUser: updatedUser[0],
      resErrorCode: 0
    });
  } catch (error) {
    console.log(error);//log all error stack 
    res.status(500).json({
      resMessage: "Probably database connection failed.",
      resStatus: false,
      resNumber: 0,
      resUser: null,
      resErrorCode: 4
    })
  } finally {
    if (client) client.release();
  } 
})
app.get("/api/get/adsbycategory/:idcategory", rateLimiter, blockBannedIPs, async (req, res) => {
  const { idcategory } = req.params; 
  let client;
  if(!idcategory) {
    return res.status(404).json({myMessage: "No category detected"});
  }
  try {
    client = await pool.connect();
    //Only last 10 records will be uploaded to the page. 
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE main_group = $1
      ORDER BY id DESC LIMIT 10`, [idcategory]
    );
    const categoryDetails = await result.rows;
    if(!categoryDetails) {
      return res.status(404).json({ myMessage: "Category details not found although category id is correct"})
    }
    res.status(200).json(categoryDetails);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: Couldnt fetch category details"})
  } finally {
    if(client) client.release();
  }
});

app.get("/api/get/adsbysubsection/:sectionNumber", rateLimiter, blockBannedIPs, async (req, res) => {
  const { sectionNumber } = req.params; 
  let client;
  if(!sectionNumber) {
    return res.status(404).json({myMessage: "No category detected"});
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE sub_group = $1
      ORDER BY id DESC`, [sectionNumber]
    );
    const categoryDetails = await result.rows;
    if(!categoryDetails) {
      return res.status(404).json({ myMessage: "Category details not found although category id is correct"})
    }
    res.status(200).json(categoryDetails);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: Couldnt fetch category details"})
  } finally {
    if(client) client.release();
  }
}); 

app.get("/api/get/adsbyuser/:iduser", rateLimiter, blockBannedIPs, async (req, res) => {
  const { iduser } = req.params;
  let client;
  if(!iduser) {
    return res.status(404).json({myMessage: "No user detected"});
  }
  try {
    client = await pool.connect();
    //Only last 10 records will be uploaded to the page. 
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE user_id = $1
      ORDER BY id DESC LIMIT 100`, [iduser]
    );
    const userAds = await result.rows;
    if(!userAds) {
      return res.status(404).json({ myMessage: "Category details not found although category id is correct"})
    }
    res.status(200).json(userAds);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: Couldnt fetch category details"})
  } finally {
    if(client) client.release();
  }
});

app.get("/api/get/userdata/:iduser", rateLimiter, blockBannedIPs, async (req, res) => {
  const { iduser } = req.params;
  let client;
  if(!iduser) {
    return res.status(404).json({myMessage: "No user id detected"});
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_users WHERE id = $1`,
      [iduser]
    );
    const userRawData = await result.rows[0];
    if(!userRawData) {
      return res.status(404).json({ myMessage: "User details not found although user id is correct"})
    }
    res.status(200).json(userRawData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: Couldnt fetch user details"})
  } finally {
    if(client) client.release();
  }
});

app.get("/api/get/item/:itemNumber", rateLimiter, blockBannedIPs, async (req, res) => {
  const { itemNumber } = req.params;
  let client;
  if(!itemNumber) {
    return res.status(404).json({myMessage: "No item number detected"});
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE id = $1`,
      [itemNumber]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]); ; // Return the first matching item
    } else {
      return res.status(404).json({ myMessage: "Item details not found although item id is correct"})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: Couldnt fetch item details"})
  } finally {
    if(client) client.release();
  }
});
 
app.post("/api/update", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam signups
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const updateObject = req.body;
  
  const updateLoad = {
    id1: updateObject.updateId,
    name1: updateObject.updateName.trim(),
    telephone1: updateObject.updateTelephone.trim(),     // Ensure text values are trimmed
    email1: updateObject.updateEmail.trim(),     // Ensure date is trimmed (still stored as text in DB),
    passtext1: updateObject.updatePasstext.trim()
  };

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(updateLoad.passtext1, SALT_ROUNDS);

    client = await pool.connect(); 
    const { rows: updatedUser } = await client.query(
      `UPDATE livorent_users SET name = $1, telephone = $2, email = $3, passtext = $4 WHERE id = $5 
      RETURNING id, tokenversion`,
      [updateLoad.name1, updateLoad.telephone1, updateLoad.email1, hashedPassword, updateLoad.id1]
    );
    // Generate a JWT for the new user and send it to frontend
    const token = jwt.sign(
      {userId: updatedUser[0].id, tokenVersion: updatedUser[0].tokenversion }, JWT_SEC, { expiresIn: '100d' });
    res.status(201).json({ myMessage: 'Profile updated', visitorNumber:updatedUser[0].id, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while updating the profile"})
  } finally {
    client.release();
  } 
});
app.delete("/api/delete/item/:itemNumber", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  const { itemNumber } = req.params;
  let client;
  if(!itemNumber) {
    return res.status(404).json({myMessage: "No item number detected"});
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `DELETE FROM livorent_ads WHERE id = $1`,
      [itemNumber]
    );
    res.status(200).json({ message: "Sludinājums veiksmīgi dzēsts" }); 
    if (result.rowCount > 0) {
      console.log("Sludinājums veiksmīgi dzēsts"); // "Advertisement deleted successfully"
    } else {
      console.log("Sludinājums nav atrasts" ); // "Advertisement not found"
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error at the Backend: database connection error"})
  } finally {
    if(client) client.release();
  }
});
app.patch("/api/profile/update-ad", upload.array("adUpdateImages", 5), authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => { 
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
 
  let client;
  const adData = JSON.parse(req.body.adUpdateData);  // ✅ Parse the JSON string
  const { adNumber, adTitle, adDescription, adPrice, adCity, 
    adCategory, adVisitorNumber, adOldImages, adRemovedImages } = adData;
  const adNumber2 = Number(adNumber);
  const visitorData = {
    ip: ipVisitor,
    visitDate: formatDateReverse(new Date())
  };  
  function formatDateReverse(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  //CATEGORY DATA MANAGEMENT
  //First digit of each number represent its main category. The number itself is its section category.
  const stringNum = adCategory.toString(); // Convert number to string
  const mainCategoryNum = parseInt(stringNum[0], 10); // Convert first character back to number
  const sectionCategoryNum = parseInt(adCategory); // Convert second character back to number

  // 1. DELETE REMOVED IMAGES FROM STORAGE
  console.log("full path of images before function: ", adRemovedImages)
  if (adRemovedImages && adRemovedImages.length > 0) {
    const filePathsToDelete = adRemovedImages.map(url => url.split("/livo/")[1]);
    //supabase returns data and error after remove method is called. data will contain data if deletion is ok.
    //error will contain error if deletion fails.
    console.log("filepaths of images before deletion: ", filePathsToDelete);
    /*
    check if spaces at the beginning and at the end are causing error
    check if missing image type is causing error. If so, you can add it. like "1744834152595-PTJGL00094.jpeg"
    [ '1744834152595-PTJGL00094', '1744834151211-OAYFG55766' ]
    ['folder/avatar1.png']
    */
    const { data, error } = await supabase.storage.from("livo").remove(filePathsToDelete);
    console.log(error);
    console.log(data)
    if (error) {
      console.error("Deletion failed:", error);
    } else {
      console.log("Successfully deleted files:", data);
    }
  }

  //UPLOAD IMAGES TO SUPABASE STORAGE
  const files = req.files; 
  let uploadedImageUrls = [];
  // Supported image file types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (files.length > 0) {
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await supabase.storage
                  .from("livo") // Supabase Storage Bucket
                  .upload(fileName, file.buffer, {
                      contentType: file.mimetype,
                      cacheControl: "3600",
                      upsert: false,
                  });
      if (error) {
          console.error("Supabase Upload Error:", error);
          return res.status(500).json({ error: "Error uploading file to storage." });
      }
      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/livo/${fileName}`;
      uploadedImageUrls.push(imageUrl);
    }
  }
  //WRITE DATA TO SUPABASE DATABASE
  client = await pool.connect();

  const allImageUrls = [...adOldImages, ...uploadedImageUrls];

  try {
    client = await pool.connect();
    const result = await client.query(
      `UPDATE livorent_ads
       SET title = $1,
           description = $2,
           price = $3,
           city = $4,
           update_date = $5,
           main_group = $6,
           sub_group = $7,
           image_url = $8
       WHERE id = $9`, 
      [adTitle, adDescription, adPrice, adCity,
       visitorData.visitDate, mainCategoryNum, 
       sectionCategoryNum, JSON.stringify(allImageUrls), adNumber2]
    );
    //,
    res.status(201).json({myMessage: "Ad updated"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: error.message})
  } finally {
    client.release();
  } 

});
app.post("/api/like/sellers", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { likeStatus, likedId, userId } = req.body;
  const sellerId = Number(likedId);
  const userId2 = Number(userId);
  // 1. We connect to DB and check if user exists
  // 2. Then we check if like exists in liked_sellers array
  // 3. Then we save like or remove depending like/unlike info coming from frontend.
  client = await pool.connect();
  const result = await client.query(`SELECT * FROM livorent_likes_users WHERE user_id = $1`, [userId2]);
  const existingUser = result.rows[0];
  let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
  let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
  if (existingUser) {
    // 1) if liked_ads is already a JS array then we can use it as it is. 
    //If not, we need to convert/parse it to JS array.
    // 2) Sometimes a user may like a seller but not an item yet. 
    // In those cases, we will have an error on the item side because 
    // seller side will be an array but item side will be NULL and as there is a user registered
    //the code will try to read NULL field as an array. 
    //To prevent those situtions, there is this if check down here.
    if (existingUser.liked_ads === null) {
      existingArray = [];
    } else {
      existingArray = Array.isArray(existingUser.liked_sellers)
      ? existingUser.liked_sellers
      : JSON.parse(existingUser.liked_sellers);
    }
    existingLike = existingArray.includes(sellerId);
  }



  try {
    //SITUATION 1
    if (likeStatus === false && !existingUser) {
      console.log("No user. No like. Nothing to do.");
      return res.json({myMessage: "No user. No like. Nothing to do."});
    }

    //SITUATION 2
    if (likeStatus === true && !existingUser) {
      console.log("No user. Create a new user-like record. First like of user.");
      const newArray = [sellerId];
      //Everytime we save a like to liked_sellers, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes_users (user_id, liked_sellers) VALUES ($1, $2)`,
        [userId2, newArray2]
      );
      return res.json({myMessage: "No user. Create a new user record. First like of user."})
    }

    //SITUATION 3
    //In these if statements below, we check if the seller is already liked to prevent repetitive records.
    if (likeStatus === false && existingUser) {
      if (existingLike === true) {
        console.log("User exists. Remove unliked seller from liked array.");

        const newArray = existingArray.filter(sellerNum => sellerNum !== sellerId);
        //Everytime we save a like to liked_sellers, we need to make sure we are saving an array not a number.
        //And we cannot save an array directly in postgresql, we need to stringfy it.
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`UPDATE livorent_likes_users SET liked_sellers = $2 WHERE user_id = $1`,
          [userId2, newArray2]);

        return res.json({myMessage: "User exists. Remove unliked seller from liked array."})
      } else {
        console.log("User exists. the unliked seller is NOT in the liked array. Nothing to do here.");
        return res.json({myMessage: "User exists. Unliked seller is not in liked array. Nothing to do."})
      }

    }

    //SITUATION 4
    if (likeStatus === true && existingUser) {
      if (existingLike === true) {
        console.log("User exists. liked seller is in liked_sellers array. Nothing to do here.");
        return res.json({myMessage: "User exists. liked seller is in liked_sellers array. Nothing to do."})
      } else {
        existingArray.push(sellerId);
        const newArray = JSON.stringify(existingArray);
        const result = await client.query(`UPDATE livorent_likes_users SET liked_sellers = $2 WHERE user_id = $1`,
          [userId2, newArray]);
        console.log("User exists. Add liked seller to liked_sellers array.");
        return res.json({myMessage: "User exists. Add liked seller to liked_sellers array."})
      }

    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting basic user data"})
  } finally {
    if (client) client.release();
  } 
});
app.post("/api/like/items", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { likeStatus, likedId, userId } = req.body;
  const itemId = Number(likedId);
  const userId2 = Number(userId);
  // 1. We connect to DB and check if user exists
  // 2. Then we check if like exists in liked_ads array
  // 3. Then we save like or remove depending like/unlike info coming from frontend.
  client = await pool.connect();
  const result = await client.query(`SELECT * FROM livorent_likes_users WHERE user_id = $1`, [userId2]);
  const existingUser = result.rows[0];
  let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
  let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
  if (existingUser) {
    // 1) if liked_ads is already a JS array then we can use it as it is. 
    //If not, we need to convert/parse it to JS array.
    // 2) Sometimes a user may like a seller but not an item yet. 
    // In those cases, we will have an error on the item side because 
    // seller side will be an array but item side will be NULL and as there is a user registered
    //the code will try to read NULL field as an array. 
    //To prevent those situtions, there is this if check down here.
    if (existingUser.liked_ads === null) {
      existingArray = [];
    } else {
      existingArray = Array.isArray(existingUser.liked_ads)
      ? existingUser.liked_ads
      : JSON.parse(existingUser.liked_ads);
    }
    existingLike = existingArray.includes(itemId);
  }



  try {
    //SITUATION 1
    if (likeStatus === false && !existingUser) {
      console.log("No user. No like. Nothing to do.");
      return res.json({myMessage: "No user. No like. Nothing to do."});
    }

    //SITUATION 2
    if (likeStatus === true && !existingUser) {
      console.log("No user. Create a new user record. First like of user.");
      const newArray = [itemId];
      //Everytime we save a like to liked_ads, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes_users (user_id, liked_ads) VALUES ($1, $2)`,
        [userId2, newArray2]
      );
      return res.json({myMessage: "No user. Create a new user record. First like of user."})
    }

    //SITUATION 3
    //In these if statements below, we check if the item/ad is already liked to prevent repetitive records.
    if (likeStatus === false && existingUser) {
      if (existingLike === true) {
        console.log("User exists. Remove unliked ad from liked_ads array.");

        const newArray = existingArray.filter(adNum => adNum !== itemId);
        //Everytime we save a like to liked_ads, we need to make sure we are saving an array not a number.
        //And we cannot save an array directly in postgresql, we need to stringfy it.
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`UPDATE livorent_likes_users SET liked_ads = $2 WHERE user_id = $1`,
          [userId2, newArray2]);

        return res.json({myMessage: "User exists. Remove unliked ad from liked array."})
      } else {
        console.log("User exists. the unliked ad is NOT in the liked_ads array. Nothing to do here.");
        return res.json({myMessage: "User exists. Unliked ad is not in liked_ads array. Nothing to do."})
      }

    }

    //SITUATION 4
    if (likeStatus === true && existingUser) {
      if (existingLike === true) {
        console.log("User exists. liked ad is in liked_ads array. Nothing to do here.");
        return res.json({myMessage: "User exists. liked ad is in liked_ads array. Nothing to do."})
      } else {
        existingArray.push(itemId);
        const newArray = JSON.stringify(existingArray);
        const result = await client.query(`UPDATE livorent_likes_users SET liked_ads = $2 WHERE user_id = $1`,
          [userId2, newArray]);
        console.log("User exists. Add liked ad to liked_ads array.");
        return res.json({myMessage: "User exists. Add liked ad to liked_ads array."})
      }

    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting basic user data"})
  } finally {
    if (client) client.release();
  } 
});
app.post("/api/like/seller-to-users", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { likeStatus, likedId, userId } = req.body;
  const sellerId = Number(likedId);
  const likerId = Number(userId);
  // 1. We connect to DB and check if the seller exists
  // 2. Then we check if liker exists in voted_clients array
  // 3. Then we save liker or remove him depending like/unlike info coming from frontend.
  client = await pool.connect();
  const result = await client.query(`SELECT * FROM livorent_likes_ads_sellers WHERE seller_id = $1`, [sellerId]);
  const existingSeller = result.rows[0];
  let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
  let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
  if (existingSeller) {
    // 1) if voted_clients is already a JS array then we can use it as it is. 
    //If not, we need to convert/parse it to JS array.
    //2) NULL check below is only an extra step to prevent errors. 
    // In other endpoints we need this check but here We dont need it.
    //Because I cannot think of a situation where there will be seller record without any liker array.
    if (existingSeller.voted_clients === null) {
      existingArray = [];
    } else {
      existingArray = Array.isArray(existingSeller.voted_clients)
      ? existingSeller.voted_clients
      : JSON.parse(existingSeller.voted_clients);
    }
    existingLike = existingArray.includes(likerId);
  }



  try {
    //SITUATION 1
    if (likeStatus === false && !existingSeller) {
      console.log("No seller record. No liker. Nothing to do.");
      return res.json({myMessage: "No seller record. No liker. Nothing to do."});
    }

    //SITUATION 2
    if (likeStatus === true && !existingSeller) {
      console.log("No seller record. Create a new seller record. First like for that seller.");
      const newArray = [likerId];
      //Everytime we save a liker to voted_clients, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes_ads_sellers (seller_id, voted_clients) VALUES ($1, $2)`,
        [sellerId, newArray2]
      );
      return res.json({myMessage: "No seller record. Create a new seller record. First like for that seller."})
    }

    //SITUATION 3
    //1) check if the liker is already in voted_clients array 
    //2) to prevent overwriting.
    if (likeStatus === false && existingSeller) {
      if (existingLike === true) {
        console.log("Seller exists. Remove liker from voted_clients array.");

        const newArray = existingArray.filter(likerNum => likerNum !== likerId);
        //And we cannot save an array directly in postgresql, we need to stringfy it.
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`UPDATE livorent_likes_ads_sellers SET voted_clients = $2 WHERE seller_id = $1`,
          [sellerId, newArray2]);

        return res.json({myMessage: "Seller exists. Remove liker from voted_clients array."})
      } else {
        console.log("Seller exists. unliker is NOT in the voted_clients array. Nothing to do here.");
        return res.json({myMessage: "Seller exists. unliker is NOT in the voted_clients array. Nothing to do here."})
      }

    }

    //SITUATION 4
    if (likeStatus === true && existingSeller) {
      if (existingLike === true) {
        console.log("Seller exists. liker is in voted_clients array. Nothing to do here.");
        return res.json({myMessage: "Seller exists. liker is in voted_clients array. Nothing to do here."})
      } else {
        existingArray.push(likerId);
        const newArray = JSON.stringify(existingArray);
        const result = await client.query(`UPDATE livorent_likes_ads_sellers SET voted_clients = $2 WHERE seller_id = $1`,
          [sellerId, newArray]);
        console.log("Seller exists. Add liker to voted_clients array.");
        return res.json({myMessage: "Seller exists. Add liker to voted_clients array."})
      }

    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting basic seller data"})
  } finally {
    if (client) client.release();
  } 
});
app.post("/api/like/item-to-users", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { likeStatus, likedId, userId } = req.body;
  const adId = Number(likedId);
  const likerId = Number(userId);
  // 1. We connect to DB and check if the ad exists
  // 2. Then we check if liker exists in voted_clients array
  // 3. Then we save liker or remove him depending like/unlike info coming from frontend.
  client = await pool.connect();
  const result = await client.query(`SELECT * FROM livorent_likes_ads_sellers WHERE ad_id = $1`, [adId]);
  const existingAd = result.rows[0];
  let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
  let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
  if (existingAd) {
    // 1) if voted_clients is already a JS array then we can use it as it is. 
    //If not, we need to convert/parse it to JS array.
    //2) NULL check below is only an extra step to prevent errors. 
    // In other endpoints we need this check but here We dont need it.
    //Because I cannot think of a situation where there will be an ad record without any liker array.
    if (existingAd.voted_clients === null) {
      existingArray = [];
    } else {
      existingArray = Array.isArray(existingAd.voted_clients)
      ? existingAd.voted_clients
      : JSON.parse(existingAd.voted_clients);
    }
    existingLike = existingArray.includes(likerId);
  }



  try {
    //SITUATION 1
    if (likeStatus === false && !existingAd) {
      console.log("No ad record. No liker. Nothing to do.");
      return res.json({myMessage: "No ad record. No liker. Nothing to do."});
    }

    //SITUATION 2
    if (likeStatus === true && !existingAd) {
      console.log("No ad record. Create a new ad record. First like for that ad.");
      const newArray = [likerId];
      //Everytime we save a liker to voted_clients, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes_ads_sellers (ad_id, voted_clients) VALUES ($1, $2)`,
        [adId, newArray2]
      );
      return res.json({myMessage: "No ad record. Create a new ad record. First like for that ad."})
    }

    //SITUATION 3
    //check if the liker is already in voted_clients array to prevent overwriting.
    if (likeStatus === false && existingAd) {
      if (existingLike === true) {
        console.log("Ad exists. Liker exists. Remove liker from voted_clients array.");

        const newArray = existingArray.filter(likerNum => likerNum !== likerId);
        //And we cannot save an array directly in postgresql, we need to stringfy it.
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`UPDATE livorent_likes_ads_sellers SET voted_clients = $2 WHERE ad_id = $1`,
          [adId, newArray2]);

        return res.json({myMessage: "Ad exists. Liker exists. Remove liker from voted_clients array."})
      } else {
        console.log("Ad exists. unliker is NOT in the voted_clients array. Nothing to do here.");
        return res.json({myMessage: "Ad exists. unliker is NOT in the voted_clients array. Nothing to do here."})
      }

    }

    //SITUATION 4
    if (likeStatus === true && existingAd) {
      if (existingLike === true) {
        console.log("Ad exists. liker is in voted_clients array. Nothing to do here.");
        return res.json({myMessage: "Ad exists. liker is in voted_clients array. Nothing to do here."})
      } else {
        existingArray.push(likerId);
        const newArray = JSON.stringify(existingArray);
        const result = await client.query(`UPDATE livorent_likes_ads_sellers SET voted_clients = $2 WHERE ad_id = $1`,
          [adId, newArray]);
        console.log("Ad exists. Add liker to voted_clients array.");
        return res.json({myMessage: "Ad exists. Add liker to voted_clients array."})
      }

    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting basic ad data"})
  } finally {
    if (client) client.release();
  } 
});
app.get("/api/like/get-seller-likes-count/:idSeller1", rateLimiter, blockBannedIPs, async (req, res) => {

  const { idSeller1 } = req.params;
  const sellerId = Number(idSeller1);
  const visitor = req.query.visitor;
  const visitor2 = Number(visitor);

  let client;
  
  if(!idSeller1) {
    return res.status(404).json({myMessage: "no seller id detected on endpoint route"});
  }
  if (sellerId < 1) {
    return res.status(404).json({myMessage: "seller id is wrong"});
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_likes_ads_sellers WHERE seller_id = $1`,
      [sellerId]
    );
    if (result.rows.length < 1) {
      return res.status(404).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseLikeStatus: false,
        responseLikeCount: 0
      });
    }
    if (result.rows[0].voted_clients === null) {
      return res.status(404).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseLikeStatus: false,
        responseLikeCount: 0
      });
    }
    if (result.rows[0].voted_clients.includes(visitor2)) {
      //If visitor has already liked, we will return a true and liker count data.
      //TRUE means visitor has already liked and the heart on frontend should be filled.
      return res.status(200).json({
        responseLikeStatus: true,
        responseLikeCount: result.rows[0].voted_clients.length
      });
    }
    return res.status(200).json({
      //If visitor has not liked yet, we will return a false and liker count data.
      //FALSE means visitor has not liked yet and the heart on frontend should be empty.
      responseLikeStatus: false,
      responseLikeCount: result.rows[0].voted_clients.length
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting like data"})
  } finally {
    if (client) client.release();
  } 
})
app.get("/api/like/get-item-likes-count/:idItem1", rateLimiter, blockBannedIPs, async (req, res) => {

  const { idItem1 } = req.params;
  const idItem = Number(idItem1);
  const visitor = req.query.visitor;
  const visitor2 = Number(visitor);

  let client;
  
  if(!idItem1) {
    return res.status(404).json({myMessage: "no ad id detected on endpoint route"});
  }
  if (idItem < 1) {
    return res.status(404).json({myMessage: "ad id is wrong"});
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_likes_ads_sellers WHERE ad_id = $1`,
      [idItem]
    );
    if (result.rows.length < 1) {
      return res.status(404).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseLikeStatus: false,
        responseLikeCount: 0
      });
    }
    if (result.rows[0].voted_clients === null) {
      return res.status(404).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseLikeStatus: false,
        responseLikeCount: 0
      });
    }
    if (result.rows[0].voted_clients.includes(visitor2)) {
      //If visitor has already liked, we will return a true and liker count data.
      //TRUE means visitor has already liked and the heart on frontend should be filled.
      return res.status(200).json({
        responseLikeStatus: true,
        responseLikeCount: result.rows[0].voted_clients.length
      });
    }
    return res.status(200).json({
        //If visitor has not liked yet, it will a return a FALSE and liker count value.
        //FALSE means visitor has not liked yet and the heart on frontend should be empty.
        responseLikeStatus: false,
        responseLikeCount: result.rows[0].voted_clients.length
    }); 
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting like data"})
  } finally {
    if (client) client.release();
  } 
});
app.get("/api/search", rateLimiter, blockBannedIPs, async (req, res) => {

  const searchText = req.query.myQuery;

  let client;
  
  if(!searchText) {
    return res.status(200).json({
      responseStatus: false, //false mean search failed, it brought zero result.
      responseMessage: "search text is missing",
      responseResult: []
    });
  }
  if (searchText.trim().length < 3) {
    return res.status(200).json({ //we are saying 200 here because I want below values to display 
      //If I say 400, only the catch error statement will display.
      responseStatus: false, //false mean search failed, it brought zero result.
      responseMessage: "search text is too small",
      responseResult: []
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY id DESC LIMIT 20`,
      [`%${searchText.trim()}%`]
    );//we will limit result by 20 records. No need to bring all records. Also, newest one comes first. 

    if (result.rows.length < 1) {
      return res.status(200).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseStatus: false, //false mean search failed, it brought zero result.
        responseMessage: "No ad with that word",
        responseResult: []
      });
    }
    return res.status(200).json({
      //If visitor has not liked yet, we will return a false and liker count data.
      //FALSE means visitor has not liked yet and the heart on frontend should be empty.
      responseStatus: true, //true mean search succeeded.
      responseMessage: "",
      responseResult: result.rows
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      responseStatus: false,
      responseMessage: "",
      responseResult: []
    })
  } finally {
    if (client) client.release();
  } 
});

app.get('/api/verify-token', rateLimiter, blockBannedIPs, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
 
  let client;
  try {
    const decoded = jwt.verify(token, JWT_SEC );
    const requestedId = decoded.userId;

    client = await pool.connect();
    const result = await client.query( 
      'SELECT * FROM livorent_users WHERE id = $1',
      [requestedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = result.rows[0];
    return res.status(200).json({ userId: requestedId, userData });
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ error: 'Invalid token' });
  } finally {
    if (client) client.release();
  }
});

app.post("/api/post/save-comment", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;

  const { commentText, commentToken, commentUserNum, commentName, commentReceiverNum } = req.body;
  const commentReceiver2 = Number(commentReceiverNum);
  const commentUserNum2 = Number(commentUserNum);
  const commentDate = new Date().toLocaleDateString('en-GB')
  const trimmedText = commentText.trim();
  const trimmedName = commentName.trim();

  // === Simple input validations ===
  if (!trimmedText || !trimmedName) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Comment is empty",
      resErrorCode: 2
    });
  }

  if (trimmedText.length < 4 || trimmedText.length > 3000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Comment length must be between 4 and 3000 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 4 || trimmedName.length > 100) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 4 and 100 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(commentUserNum2) || commentUserNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(commentReceiver2) || commentReceiver2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid receiver ID",
      resErrorCode: 6
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_comments (comment, date, commentor_id, receiver, commentor_name) VALUES ($1, $2, $3, $4, $5)`,
        [commentText, commentDate, commentUserNum2, commentReceiver2, commentName]
    );
    return res.status(200).json({ 
      resStatus: true,
      resMessage: "Comment saved successfully.",
      resVisitor: commentUserNum2,
      resReceiver: commentReceiver2,
      resErrorCode: 0
    });
  } catch (error) {
      return res.status(500).json({ 
        resStatus: false,
        resMessage: "Saving comment to DB failed",
        resVisitor: commentUserNum2,
        resReceiver: commentReceiver2,
        resErrorCode: 1,
      });
  } finally {
    if (client) client.release();
  }
});

app.get("/api/get/comments/:commentReceiver", rateLimiter, blockBannedIPs, async (req, res) => {
  const { commentReceiver } = req.params;
  let client;
  const commentReceiver2 = Number(commentReceiver);

  if(!commentReceiver || isNaN(commentReceiver2) || commentReceiver2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "comments could not be displayed, advertisement id not detected",
      resData:[],
      resErrorCode: 1,
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_comments WHERE receiver = $1 ORDER BY id DESC`,
      [commentReceiver2]
    );
    if (result.rows.length > 0) {
      return res.status(200).json({
        resStatus: true,
        resMessage: "comments successfully fetched",
        resData: result.rows,
        resErrorCode: 0,
      });
    } else {
      return res.status(200).json({
          resStatus: false,
          resMessage: "no comments yet",
          resData: [],
          resErrorCode: 2,
      })
    }
  } catch (error) {
    return res.status(500).json({
        resStatus: false,
        resMessage: "comments could not be displayed, db connection failed",
        resData: [],
        resErrorCode: 3,
    })
  } finally {
    if(client) client.release();
  } 
});
app.post("/api/post/save-reply", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { replyText, replyToken, replierNum, replierName, replyReceiverNum, repliedCommentId } = req.body;
  const replyReceiverNum2 = Number(replyReceiverNum);
  const replierNum2 = Number(replierNum);
  const repliedCommentId2 = Number(repliedCommentId);
  const replyDate = new Date().toLocaleDateString('en-GB');

  const trimmedReply = replyText.trim();
  const trimmedName = replierName.trim();

  // === Simple input validations ===
  if (!trimmedReply || !trimmedName) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Reply is empty",
      resErrorCode: 2
    });
  }

  if (trimmedReply.length < 4 || trimmedReply.length > 300) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Reply length must be between 4 and 300 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 4 || trimmedName.length > 100) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 4 and 100 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(replierNum2) || replierNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(replyReceiverNum2) || replyReceiverNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid receiver ID",
      resErrorCode: 6
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_comments (comment, date, commentor_name, commentor_id, receiver, parent) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [replyText, replyDate, replierName, replierNum2, replyReceiverNum2, repliedCommentId2 ]
    );
    return res.status(200).json({ 
      resStatus: true,
      resMessage: "Reply saved successfully.",
      resVisitor: replierNum2,
      resReceiverItem: replyReceiverNum2,
      resReceiverComment: repliedCommentId2,
      resErrorCode: 0,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ 
      resStatus: false,
      resMessage: "Connection to DB failed",
      resErrorCode: 1,
    });
  } finally {
    if (client) client.release();
  }
});
app.post("/api/post/save-review", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;

  const { reviewText, reviewToken, reviewUserNum, reviewerName, reviewReceiverNum, reviewRating } = req.body;

  const reviewReceiver2 = Number(reviewReceiverNum);
  const reviewUserNum2 = Number(reviewUserNum);
  const reviewDate = new Date().toLocaleDateString('en-GB')
  const trimmedText = reviewText.trim();
  const trimmedName = reviewerName.trim();

  // === Simple input validations ===
  if (!trimmedText || !trimmedName) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Review is empty",
      resErrorCode: 2
    });
  }
  if (reviewRating < 1 || reviewRating > 10) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Did you choose rating score?",
      resErrorCode: 7
    });
  }

  if (trimmedText.length < 4 || trimmedText.length > 3000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Review length must be between 4 and 3000 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 4 || trimmedName.length > 100) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 4 and 100 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(reviewUserNum2) || reviewUserNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(reviewReceiver2) || reviewReceiver2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid receiver ID",
      resErrorCode: 6
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_reviews (review_text, date, receiver, rating, reviewer_id, reviewer_name) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
        [trimmedText, reviewDate, reviewReceiver2, reviewRating, reviewUserNum2, trimmedName]
    );
    return res.status(200).json({ 
      resStatus: true,
      resMessage: "Review saved successfully.",
      resVisitor: reviewUserNum2,
      resReceiver: reviewReceiver2,
      resErrorCode: 0
    });
  } catch (error) {
      return res.status(500).json({ 
        resStatus: false,
        resMessage: "Saving review to DB failed",
        resVisitor: reviewUserNum2,
        resReceiver: reviewReceiver2,
        resErrorCode: 1,
      });
  } finally {
    if (client) client.release();
  }
});
app.post("/api/post/save-review-reply", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  const { replyText, replyToken, replierNum, replierName, replyReceiverNum, repliedReviewId } = req.body;
  const replyReceiverNum2 = Number(replyReceiverNum);
  const replierNum2 = Number(replierNum);
  const repliedReviewId2 = Number(repliedReviewId);
  const replyDate = new Date().toLocaleDateString('en-GB');

  const trimmedReply = replyText.trim();
  const trimmedName = replierName.trim();

  // === Simple input validations ===
  if (!trimmedReply || !trimmedName) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Reply is empty",
      resErrorCode: 2
    });
  }

  if (trimmedReply.length < 4 || trimmedReply.length > 300) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Reply length must be between 4 and 300 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 4 || trimmedName.length > 100) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 4 and 100 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(replierNum2) || replierNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(replyReceiverNum2) || replyReceiverNum2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid receiver ID",
      resErrorCode: 6
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_reviews (review_text, date, reviewer_name, reviewer_id, receiver, parent) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [replyText, replyDate, replierName, replierNum2, replyReceiverNum2, repliedReviewId2 ]
    );
    return res.status(200).json({ 
      resStatus: true,
      resMessage: "Reply saved successfully.",
      resVisitor: replierNum2,
      resReceiverItem: replyReceiverNum2,
      resReceiverComment: repliedReviewId2,
      resErrorCode: 0,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ 
      resStatus: false,
      resMessage: "Connection to DB failed",
      resErrorCode: 1,
    });
  } finally {
    if (client) client.release();
  }
});
app.get("/api/get/reviews/:reviewReceiver", rateLimiter, blockBannedIPs, async (req, res) => {
  const { reviewReceiver } = req.params;
  let client;
  const reviewReceiver2 = Number(reviewReceiver);

  if(!reviewReceiver || isNaN(reviewReceiver2) || reviewReceiver2 <= 0) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "reviews could not be displayed, seller id not detected",
      resData:[],
      resErrorCode: 1,
    });
  }

  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_reviews WHERE receiver = $1 ORDER BY id DESC`,
      [reviewReceiver2]
    );
    if (result.rows.length > 0) {
      return res.status(200).json({
        resStatus: true,
        resMessage: "reviews successfully fetched",
        resData: result.rows,
        resErrorCode: 0,
      });
    } else {
      return res.status(200).json({
          resStatus: false,
          resMessage: "no reviews yet",
          resData: [],
          resErrorCode: 2,
      })
    }
  } catch (error) {
    return res.status(500).json({
        resStatus: false,
        resMessage: "reviews could not be displayed, db connection failed",
        resData: [],
        resErrorCode: 3,
    })
  } finally {
    if(client) client.release();
  } 
});
//This line must be under all server routes. Otherwise you will have like not being able to fetch comments etc.
//This code helps with managing routes that are not defined on react frontend. If you dont add, only index 
//route will be visible.
//this line can be commented out during development.
/* app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
}); */

/* //Then go to server.js file and make sure you serve static files from build directory:
app.use(express.static(path.join(__dirname, 'client/build'))); */

/*
UNCOMMENT THIS IN SERVER.JS: app.use(express.static(path.join(__dirname, 'client/build'))); 
*/
//remove "build" from gitignore before production deployment
//create "build" folder-- npm run build in client folder
//You may remove cors before production
//Fix server api routes before production, remove "localhost" part
//add environment variables
//add "::1", to the ignored ip list


const PORT = process.env.PORT ||5000;
app.listen(PORT, () => {
  console.log("Port is open on " + PORT);
})

  /* 
  In like logic, we will display all liked sellers or items to the user on profile page.
  A seller or ad will be deleted after some time. And user who liked those, will still have deleted id 
  numbers in his liked ads or sellers array. Make sure you skip the deleted id numbers while mapping array.
  We will map array to display favourite sellers or ad to the user.
  Also develop isLikeAllowed state to improve security on like logic code. state is in BtmItem and BtmSeller components
add two more comment section to each part
check time limits on post routes . They are not 1 minute, if so, convert them to 1 minute
ip check to make sure same ip can upload once in 5 minutes and twice in 24 hour 
//Add comment system
//search text should approximately match the word. 
//Add password renewal logic
//add security check for repetitive wrong login attemps
//Add visit counter to each ad page
//Only last 10 records will be uploaded to the main pages. How to add a button to add another 10 when user clicks?
//And another 10 if user clicks again and so on?
//prevent spam uploads by putting a time limit
//People should not upload many images and long inputs
//Add a loading circle when uploading an ad and waiting for reply if ad is saved
Add date column to ads
Remove ipVisitor data from endpoints if they are not used. Wait for counter and visitor log code before removing it.
After password change, a new is sent to frontend and it is ok. What if user has account open on another computer?
In that case, as there will be a valid token on another computer, he will have two different logins to the same account.
How to prevent that?
Maybe you can update the endpoints to send comprehensive data like in the case of password renewal
Maybe you can limit resUser to specific fields to prevent sending hashed password and secret words
Add small screen style
resultArea style improve on big screen
Add input validations signup and login and password change and  password renewal components
change input types for passwords from "text" to "password"

GENERAL SECURITY
  *Done: verify token middleware: backend
  *Done: input sanitization: backend
  input validation and checks: frontend and backend
  *Done: rate limiter: backend
  *Done: password reset: done with token version update
  *Done: password change: token version remains the same 

BEFORE DEPLOYING:
  Delete images from storage too   
  change 1000 to 3600000 in the time limit of serversavevisitor endpoint
  change 1000 to 60000 in the serversavecomment endpoint
  change 1000 to 60000 in the serversavecommentreply endpoint
  remove console.log statements from all components and server.js
  also check server file to uncomment relevant code
  remove all localhost words from api endpoints in frontend
  convert all error, success and alert messages to Latvian, also buttons and any other text
  change all xxxxx things in the footer component 
*/

app.post("/api/save-comment")

//A temporary cache to save ip addresses and it will prevent saving same ip addresses for 1 hour.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
//We will save each visitor data to database. 


//A temporary cache to save ip addresses and it will prevent spam comments and replies for 1 minute.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
const ipCache2 = {}
app.post("/serversavecomment", async (req, res) => {
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last comment was less than 1 minute ago
  if (ipCache2[ipVisitor] && Date.now() - ipCache2[ipVisitor] < 1000) {
    return res.status(429).json({message: 'Too many comments'});
  }
 
  ipCache2[ipVisitor] = Date.now();//save visitor ip to ipCache2

  let client;
  const newComment = req.body;
  const {name, text, date} = newComment;

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO latviaresidency_comments (date, name, comment) values ($1, $2, $3)`, [date, name, text]
    );
    res.status(201).json({message: "Comment saved"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error while saving comment"})
  } finally {
    if(client) client.release();
  }
});

app.post("/serversavecommentreply", async (req, res) => {
  //preventing spam replies
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last reply was less than 1 minute ago
  if (ipCache2[ipVisitor] && Date.now() - ipCache2[ipVisitor] < 1000) {
    return res.status(429).json({message: 'Too many comments'});
  }
  ipCache2[ipVisitor] = Date.now();//save visitor ip to ipCache2

  let client;
  const newComment = req.body;
  const {name, text, date, commentId} = newComment;

  try {
    client = await pool.connect(); 
    const result = await client.query(
      `INSERT INTO latviaresidency_comments (date, name, comment, parent_id) values ($1, $2, $3, $4)`, 
      [date, name, text, commentId]
    );
    res.status(201).json({message: "Reply saved"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error while saving reply"})
  } finally {
    if(client) client.release();
  }
});

app.get("/servergetcomments", async (req, res) => {
  let client;
  try {
    client = await pool.connect(); 
    const result = await client.query(
      `SELECT * FROM latviaresidency_comments`
    );
    const allComments = await result.rows;
    if(!allComments) {
      return res.status(404).json({ message: "No comments yet"})
    }
    res.status(200).json(allComments);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error while fetching comments"})
  } finally {
    if(client) client.release();
  }
});

app.post("/api/save-message", async (req, res) => {
  const messageObject = req.body;
  try {
    const msgLoad = {
      name1: messageObject.inputName.trim(),
      email1: messageObject.inputMail.trim(),     // Ensure text values are trimmed
      message1: messageObject.inputMessage.trim(),     // Ensure date is trimmed (still stored as text in DB)
      visitDate1: new Date().toLocaleDateString('en-GB')
    };
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO latviaresidency_messages (name, email, message, visitdate) 
      VALUES ($1, $2, $3, $4)`, 
      [msgLoad.name1, msgLoad.email1, msgLoad.message1, msgLoad.visitDate1]
    );
    res.status(200).json({message: "Mesajınız gönderildi."});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Mesaj kaydedilirken hata oluştu. Lütfen doğrudan mail atınız.' });
  }
});
const ipCache = {}
app.post("/serversavevisitor", async (req, res) => {
  //Here we could basically say "const ipVisitor = req.ip" but my app is running on Render platform
  //and Render is using proxies or load balancers. Because of that I will see "::1" as ip data if I not use
  //this line below
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  let client;
  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return; // Simply exit the function, doing nothing for this IP
  }
  // Check if IP exists in cache and if last visit was less than 1 hour ago 
  if (ipCache[ipVisitor] && Date.now() - ipCache[ipVisitor] < 1000) {
    return res.status(429).json({message: 'Too many requests from this IP.'});
  }

  ipCache[ipVisitor] = Date.now();//save visitor ip to ipCache
  const userAgentString = req.get('User-Agent');
  const agent = useragent.parse(userAgentString);
  
  try {
    const visitorData = {
      ip: ipVisitor,
      os: agent.os.toString(), // operating system
      browser: agent.toAgent(), // browser
      visitDate: new Date().toLocaleDateString('en-GB')
    };
    //save visitor to database
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO latviaresidency_visitors (ip, op, browser, date) 
      VALUES ($1, $2, $3, $4)`, [visitorData.ip, visitorData.os, visitorData.browser, visitorData.visitDate]
    );
    res.status(200).json({myMessage: "Visitor IP successfully logged"});
  } catch (error) {
    console.error('Error logging visit:', error);
    res.status(500).json({myMessage: 'Error logging visit dude'});
  } finally {
    if(client) client.release();
  }
})