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
// sanitizeInput will be used to process all data coming from frontend in req.body, query, params.
// However, for upload endpoint sanitizeInput will not be enough because upload data is coming inside 
// multipart form data. That is why we need custom sanitizeObject function to sanitize the data there.
// For all the other data coming from frontend sanitizeInputs will automatically process as it is a middleware.
const { sanitizeInputs, sanitizeObject } = require('./utilsSanitize.js');
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
// Currently it has 2 decoy ip addresses
const ignoredIPs = ["66.249.68.523123123", "66.222222249.68.523123123"];
const blockBannedIPs = (req, res, next) => {
  const ipVisitor = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || req.ip;
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({ myMessage: 'Visitor is banned' });
  }
  next();
};

// 🔒 MIDDLEWARE 5: Custom ip block for spam uploads. Only to be used on "serversavead" endpoint.
const lastUploadTimes = new Map();
const checkUploadCooldown = (req, res, next) => {
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  const lastTime = lastUploadTimes.get(ipVisitor);
  const now = Date.now();

  if (lastTime && now - lastTime < 10 * 60 * 1000) {
    return res.status(429).json({
      resStatus: false,
      resMessage: "You can only upload one ad every 10 minutes",
      resErrorCode: 11
    });
  }

  lastUploadTimes.set(ipVisitor, now);
  next(); // passes control to your upload handler
}
// 🔒 MIDDLEWARE 6: Custom ip block for spam comments, reviews etc. Resets once in 3 minutes
const lastUploadTimes2 = new Map();
const checkCooldown = (req, res, next) => {
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  const lastTime = lastUploadTimes2.get(ipVisitor);
  const now = Date.now();

  if (lastTime && now - lastTime < 2 * 60 * 1000) {
    return res.status(429).json({
      resStatus: false,
      resMessage: "You can do this once every 2 minutes",
      resErrorCode: 11
    });
  }

  lastUploadTimes2.set(ipVisitor, now);
  next(); // passes control to your upload handler
}

//A temporary cache to save ip addresses and it will prevent spam comments/replies/posts etc.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
//Thats why I am using a custom rateLimiter
app.post("/api/post/serversavead", checkUploadCooldown, authenticateToken, 
  rateLimiter, blockBannedIPs, upload.array("images", 5), async (req, res) => {
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;

  // ✅ 1. Parse and sanitize input
  let adData;
  try {
    adData = JSON.parse(req.body.adData);
  } catch (err) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid ad data format",
      resErrorCode: 1
    });
  }
  sanitizeObject(adData); // 👈 Sanitize after parsing
  // ✅ 2. Extract sanitized values
  const { adTitle, adDescription, adPrice, adCity, adName, 
    adTelephone, adCategory, adVisitorNumber } = adData;
 
  if (!adTitle || !adDescription || adTitle.trim().length < 20 || adDescription.trim().length < 50 ||
    adTitle.trim().length > 400 || adDescription.trim().length > 2000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Ad title or description not valid",
      resErrorCode: 2
    });
  }
  if (!adPrice || !adCity || adPrice.trim().length < 1 || adCity.trim().length < 3 || 
  adCity.trim().length > 40 || adPrice.trim().length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "City or price info not valid",
      resErrorCode: 3
    });
  }
  if (!adName || !adTelephone || adName.trim().length < 3 || adName.trim().length > 40 ||
  String(adTelephone).trim().length < 7 || String(adTelephone).trim().length > 15) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name or telelphone info not valid",
      resErrorCode: 4
    });
  }
  if (!adVisitorNumber || Number(adVisitorNumber) < 1 || Number(adVisitorNumber) > 1000000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Visitor number not valid",
      resErrorCode: 5
    });
  }
  if (!adCategory || Number(adCategory) < 10 || Number(adCategory) > 99) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Ad category not valid",
      resErrorCode: 6
    });
  }
  const visitorData = {
    ip: ipVisitor,
    visitDate: new Date().toLocaleDateString('en-GB')
  };

  //IMAGE UPLOAD
  const files = req.files;
  if (!Array.isArray(files) || files.length < 1 || files.length > 5) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "1 to 5 images required",
      resErrorCode: 7
    });
  }
  
  // Supported image file types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        resStatus: false,
        resMessage: "Unsupported file type",
        resErrorCode: 8
      });
    }
  }
  let uploadedImageUrls = [];
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
        return res.status(503).json({
          resStatus: false,
          resMessage: "Error uploading file to storage.",
          resErrorCode: 9
        });
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
      [adTitle, adDescription, adPrice, adCity, adName, Number(adTelephone), visitorData.ip, 
        visitorData.visitDate, JSON.stringify(uploadedImageUrls), mainCategoryNum, 
        sectionCategoryNum, Number(adVisitorNumber)]
    );
    return res.status(201).json({
      resStatus: true,
      resMessage: "Ad saved",
      resOkCode: 1
    });
  } catch (error) {
    console.log(error.message);
    return res.status(503).json({
      resStatus: false,
      resMessage: "Database connection failed",
      resErrorCode: 10
    });
  } finally {
    if (client) client.release();
  } 

}); 

//A temporary cache to save ip addresses and it will prevent spam sign-up attempts for 1 minute.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
const ipCache4 = {}
const JWT_SEC = process.env.JWT_SECRET; // Ensure you have this in your .env file
const SALT_ROUNDS = 5; // For password hashing, normally 10 would be safe. I am not storing sensitive data. So, 5 is enough.
app.post("/api/register", checkCooldown, rateLimiter, blockBannedIPs, async (req, res) => {
  //preventing spam signups
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;

  let client;
  if (!req.body || typeof req.body !== 'object') {
  return res.status(400).json({
    resStatus: false,
    resMessage: 'Invalid request body',
    resErrorCode: 1
  });
}
  const registerObject = req.body;
  const registerLoad = {
    name1: registerObject.registerName.trim(),
    telephone1: registerObject.registerTelephone,
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
      resErrorCode: 2
    });
  }
  if (registerLoad.email1.length < 10 || !registerLoad.email1.includes('@') || registerLoad.email1.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Invalid email length or format',
      resErrorCode: 3
    });
  }
  if (registerLoad.passtext1.length < 6 || registerLoad.passtext1.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Password must be at least 6 characters',
      resErrorCode: 4
    });
  }
  if (registerLoad.secretWord1.length < 4 || registerLoad.secretWord1.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Secret word too short or too long',
      resErrorCode: 5
    });
  }
  if (registerLoad.name1.trim().length < 3 || registerLoad.name1.trim().length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Name is required',
      resErrorCode: 6
    });
  }
  if (String(registerLoad.telephone1).trim().length < 7 || String(registerLoad.telephone1).trim().length > 15) {
    return res.status(400).json({
      resStatus: false,
      resMessage: 'Invalid telephone number',
      resErrorCode: 7
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
        resErrorCode: 8
      });
    }

    const { rows: newUser } = await client.query(
      `INSERT INTO livorent_users 
      (name, telephone, email, passtext, ip, date, secretword, loginattempt, logintime, tokenversion) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [registerLoad.name1, Number(registerLoad.telephone1), registerLoad.email1, 
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
      resMessage: 'DB connection error', 
      resErrorCode: 9
    });
  } finally {
    if (client) client.release();
  } 
});

app.post("/api/login", rateLimiter, blockBannedIPs, async (req, res) => {

  let client; 
  const loginObject = req.body;
  const loginLoad = {
    // Ensure date is trimmed, no whitespace and also if frontend sends invalid data, keep values "" to prevent crashes.    
    email1: loginObject.loginEmail?.trim() || "",
    passtext1: loginObject.loginPasstext?.trim() || ""
  };

  // Early field check
  if (!loginLoad.email1 || !loginLoad.passtext1 || 
    loginLoad.passtext1.length < 6 || loginLoad.email1.length < 10 ||
    loginLoad.passtext1.length > 40 || loginLoad.email1.length > 40) {
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

app.post("/api/post/password-renewal", checkCooldown, rateLimiter, blockBannedIPs, async (req, res) => {

  let client; 
  const renewalObject = req.body;
  const renewalLoad = {
    // Ensure date is trimmed, no whitespace and if frontend sends invalid data, keep values "" to prevent crashes. 
    email1: renewalObject.renewalEmail?.trim() || "",
    passtext1: renewalObject.renewalPasstext?.trim() || "", 
    secretWord1: renewalObject.renewalSecretWord?.trim() || "",
  };
  if (!renewalLoad.email1 || !renewalLoad.passtext1 || !renewalLoad.secretWord1 ||
    renewalLoad.passtext1 < 6 || renewalLoad.email1 < 10 || renewalLoad.secretWord1 < 4 ||
    renewalLoad.passtext1 > 40 || renewalLoad.email1 > 40 || renewalLoad.secretWord1 > 40
  ) {
    return res.status(400).json({
      responseMessage: "All fields are required.",
      responseStatus: false,
      responseNumber: 0,
      responseUser: null,
      responseToken: "",
      resErrorCode: 6
    });
  }

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
        responseToken:"",
        resErrorCode: 1
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
        responseToken:"",
        resErrorCode: 2
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
        responseToken: "",
        resErrorCode: 3
      });
    }
    //Control Check: verify if tokenversion exists
    if (updatedUser[0].tokenversion === undefined || updatedUser[0].tokenversion=== null || updatedUser[0].tokenversion < 1) {
      return res.status(500).json({ 
        responseStatus: false,
        responseMessage: "Invalid user data: Contact the website support or create a new profile.", 
        responseNumber: 0, 
        responseToken: "",
        responseUser: null,
        resErrorCode: 4
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
      responseToken:"",
      resErrorCode: 5
    })
  } finally {
    if (client) client.release();
  } 
})

app.post("/api/post/password-change", checkCooldown, rateLimiter, blockBannedIPs, async (req, res) => {

  let client; 
  const changeObject = req.body;
  const changeLoad = {
    // Ensure date is trimmed, no whitespace and if frontend sends invalid data, keep values "" to prevent crashes. 
    email1: changeObject.changeEmail?.trim().toLowerCase() || "",
    newPassword1: changeObject.changePasstext?.trim() || "", //new password
    currentPassword1: changeObject.changeCurrentPassword?.trim() || "", //old password
  };
  
  if (!changeLoad.email1 || !changeLoad.newPassword1 || !changeLoad.currentPassword1 ||
    changeLoad.email1 < 10 || changeLoad.newPassword1 < 6 ||
    changeLoad.email1 > 50 || changeLoad.newPassword1 > 50
  ) {
    return res.status(400).json({
      resMessage: "Password and email required and must be valid length",  
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
});

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
 
app.post("/api/update", checkCooldown, authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

  let client;
  const updateObject = req.body;
  
  const updateLoad = { 
    id1: updateObject.updateId,
    name1: updateObject.updateName.trim(),
    telephone1: updateObject.updateTelephone,     
    email1: updateObject.updateEmail.trim()
  };

  // Input checks
  if (!updateLoad.id1) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "User ID is required.",
      resErrorCode: 1
    });
  }

  if (!updateLoad.name1 || updateLoad.name1.length < 3 || updateLoad.name1.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name is not valid",
      resErrorCode: 2
    });
  }

  if (!updateLoad.telephone1 || String(updateLoad.telephone1).trim().length < 7 || 
    String(updateLoad.telephone1).trim().length > 15) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Telephone number is not valid.",
      resErrorCode: 3
    });
  }

  if (!updateLoad.email1 || !updateLoad.email1.includes("@") || updateLoad.email1.length < 10 ||
    updateLoad.email1.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Valid email is required.",
      resErrorCode: 4
    });
  }

  try {
    client = await pool.connect(); 
    const { rows: updatedUser } = await client.query(
      `UPDATE livorent_users SET name = $1, telephone = $2, email = $3 WHERE id = $4 
      RETURNING id, name, telephone, email`,
      [updateLoad.name1, Number(updateLoad.telephone1), updateLoad.email1, Number(updateLoad.id1)]
    );
    if (updatedUser.length === 0) {
      return res.status(404).json({
        resStatus: false,
        resMessage: "User not found or update failed.",
        resErrorCode: 5
      });
    }
    return res.status(201).json({
      resStatus: true,
      resMessage: "Profile updated",
      resVisitorNum: updatedUser[0].id,
      resUpdatedUser: {
        name: updatedUser[0].name,
        telephone: updatedUser[0].telephone,
        email: updatedUser[0].email
      }
    })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      resStatus: false,
      resMessage: "DB connection error",
      resErrorCode: 6
    })
  } finally {
    if (client) client.release();
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
  let adData;
  try {
    adData = JSON.parse(req.body.adUpdateData);// ✅ Parse the JSON string
  } catch (error) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid ad data format",
      resErrorCode: 1
    });
  }
  sanitizeObject(adData); // 👈 Sanitize after parsing

  const { adNumber, adTitle, adDescription, adPrice, adCity, 
    adCategory, adVisitorNumber, adOldImages, adRemovedImages } = adData;
  const adNumber2 = Number(adNumber);


  if (!adTitle || !adDescription || adTitle.trim().length < 20 || adDescription.trim().length < 50) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Ad title or description not valid",
      resErrorCode: 2
    });
  }
  if (!adPrice || !adCity || adPrice.trim().length < 1 || adCity.trim().length < 3) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "City or price info not valid",
      resErrorCode: 3
    });
  }
  if (!adVisitorNumber || Number(adVisitorNumber) < 1 || Number(adVisitorNumber) > 1000000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Visitor number not valid",
      resErrorCode: 4
    });
  }
  if (!adCategory || Number(adCategory) < 10 || Number(adCategory) > 99) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Ad category not valid",
      resErrorCode: 5
    });
  }
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
  if (adRemovedImages && adRemovedImages.length > 0) {
    const filePathsToDelete = adRemovedImages.map(url => url.split("/livo/")[1]);
    //supabase returns data and error after remove method is called. data will contain data if deletion is ok.
    //error will contain error if deletion fails.
    /*
    check if spaces at the beginning and at the end are causing error
    check if missing image type is causing error. If so, you can add it. like "1744834152595-PTJGL00094.jpeg"
    [ '1744834152595-PTJGL00094', '1744834151211-OAYFG55766' ]
    ['folder/avatar1.png']
    */
    const { data, error } = await supabase.storage.from("livo").remove(filePathsToDelete);
    if (error) {
      console.error("Deletion failed:", error);
    } else {
      console.log("Successfully deleted files:", data);
    }
  }

  //UPLOAD IMAGES TO SUPABASE STORAGE
  const files = req.files || []; 
  let uploadedImageUrls = [];
  // Supported image file types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        resStatus: false,
        resMessage: "Unsupported file type",
        resErrorCode: 6
      });
    }
  }
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
          return res.status(503).json({
            resStatus: false,
            resMessage: "Error uploading file to storage.",
            resErrorCode: 7
          });
      }
      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/livo/${fileName}`;
      uploadedImageUrls.push(imageUrl);
    }
  }
  const allImageUrls = [...adOldImages, ...uploadedImageUrls];
  if (allImageUrls.length > 5) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Cannot have more than 5 images",
      resErrorCode: 8
    });
  }
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
    return res.status(201).json({
      resStatus: true,
      resMessage: "Ad saved",
      resOkCode: 1
    });
  } catch (error) {
    console.log(error.message);
    return res.status(503).json({
      resStatus: false,
      resMessage: "Database connection failed",
      resErrorCode: 9
    });
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
      responseMessage: "Meklēšanas teksts trūkst",
      responseResult: []
    });
  }
  if (searchText.trim().length < 3) {
    return res.status(200).json({ //we are saying 200 here because I want below values to display 
      //If I say 400, only the catch error statement will display.
      responseStatus: false, //false mean search failed, it brought zero result.
      responseMessage: "Meklēšanas teksts ir pārāk īss",
      responseResult: []
    });
  }

  try {
    client = await pool.connect();
    /*The one below is for fuzzy-approximate search but it does not work.
    const result = await client.query(
      `SELECT * FROM livorent_ads
      WHERE similarity(title, $1) > 0.3 OR similarity(description, $1) > 0.3
      ORDER BY GREATEST(similarity(title, $1), similarity(description, $1)) DESC
      LIMIT 20`,
      [searchText.trim()]
    );
    */
    // this code below is for case insensitive exact word search. 
    //we will limit result by 20 records. No need to bring all records. Also, newest one comes first. 
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY id DESC LIMIT 20`,
      [`%${searchText.trim()}%`]
    );


    if (result.rows.length < 1) {
      return res.status(200).json({
        //Frontend is expecting these reply fields. So even if backend reply is negative,
        //it should still contain these false and 0 values to prevent errors on the frontend.
        responseStatus: false, //false mean search failed, it brought zero result.
        responseMessage: "Nav sludinājumu ar šo vārdu",
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
      responseMessage: "Datu bāzes savienojuma kļūda",
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

app.post("/api/post/save-comment", checkCooldown, authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

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

  if (trimmedText.length < 10 || trimmedText.length > 800) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Comment length must be between 10 and 800 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 3 || trimmedName.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 3 and 40 characters",
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
app.post("/api/post/save-reply", checkCooldown, authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

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

  if (trimmedName.length < 3 || trimmedName.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 3 and 40 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(replierNum2) || replierNum2 <= 0 || replierNum2 > 1000000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(replyReceiverNum2) || replyReceiverNum2 <= 0 || replyReceiverNum2 > 1000000) {
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
app.post("/api/post/save-review", checkCooldown, authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

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

  if (trimmedText.length < 10 || trimmedText.length > 800) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Review length must be between 10 and 800 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 3 || trimmedName.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 3 and 40 characters",
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
app.post("/api/post/save-review-reply", checkCooldown, authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

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

  if (trimmedReply.length < 5 || trimmedReply.length > 300) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Reply length must be between 5 and 300 characters",
      resErrorCode: 3
    });
  }

  if (trimmedName.length < 3 || trimmedName.length > 40) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Name length must be between 3 and 40 characters",
      resErrorCode: 4
    });
  }

  if (!Number.isInteger(replierNum2) || replierNum2 <= 0 || replierNum2 > 1000000) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Invalid user ID",
      resErrorCode: 5
    });
  }

  if (!Number.isInteger(replyReceiverNum2) || replyReceiverNum2 <= 0 || replyReceiverNum2 > 1000000) {
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
app.get("/api/get/like-item/:itemId", rateLimiter, blockBannedIPs, async (req, res) => {

  const { itemId } = req.params;
  const itemId2 = Number(itemId);
  const visitorId2 = req.query.visitorId;
  const visitorId3 = Number(visitorId2);

  let client;
  
  if(!itemId2) {
    return res.status(404).json({
      resMessage: "no item id detected on endpoint route",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 1
    });
  }
  if (itemId2 < 1) {
    return res.status(404).json({
      resMessage: "item id is wrong",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 2
    });
  }
 
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_likes WHERE ad_id = $1`,
      [itemId2]
    );

    if (result.rows.length < 1) { 
      //Item does not exist. It means item has not received any like yet.
      //But we are sending ok message because visitor can leave a first like for the item. The heart should be empty.
      return res.status(200).json({
        resMessage: "No one has liked this item yet",
        resLikeCount: 0,
        resVisitorIncluded: false,
        resOkCode: 1
      });
    }

    let likers = [];
    try {
      likers = Array.isArray(result.rows[0].likers)
        ? result.rows[0].likers
        : JSON.parse(result.rows[0].likers || "[]");
    } catch {
      likers = [];
    }

    if (likers.includes(visitorId3)) {
      //Item exists, and there is likers array. And visitor is also in the array.
      //Return true and liker array length and the heart should be filled.
      return res.status(200).json({
        resMessage: "Visitor has liked before, full heart",
        resLikeCount: likers.length,
        resVisitorIncluded: true,
        resOkCode: 2
      });
    }
    return res.status(200).json({
      //Item exists, and there is likers array. But the visitor has not liked yet.
      //Return false and liker array length and the heart should be empty.
      resMessage: "Visitor has not liked this item yet, empty heart",
      resLikeCount: likers.length,
      resVisitorIncluded: false,
      resOkCode: 3
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({
      resMessage: "Something went wrong while getting like data",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 3
    })
  } finally {
    if (client) client.release();
  } 
});
app.get("/api/get/like-seller/:sellerId", rateLimiter, blockBannedIPs, async (req, res) => {

  const { sellerId } = req.params;
  const sellerId2 = Number(sellerId);
  const visitorId2 = req.query.visitorId;
  const visitorId3 = Number(visitorId2);

  let client;
  
  if(!sellerId2) {
    return res.status(404).json({
      resMessage: "no seller id detected on endpoint route",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 1
    });
  }
  if (sellerId2 < 1) {
    return res.status(404).json({
      resMessage: "seller id is wrong",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 2
    });
  }
 
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_likes WHERE seller_id = $1`,
      [sellerId2]
    );

    if (result.rows.length < 1) { 
      //Seller does not exist. It means seller has not received any like yet.
      //But we are sending ok message because visitor can leave a first like for the seller. The heart should be empty.
      return res.status(200).json({
        resMessage: "No one has liked this seller yet",
        resLikeCount: 0,
        resVisitorIncluded: false,
        resOkCode: 1
      });
    }

    let likers = [];
    try {
      likers = Array.isArray(result.rows[0].likers)
        ? result.rows[0].likers
        : JSON.parse(result.rows[0].likers || "[]");
    } catch {
      likers = [];
    }


    if (likers.includes(visitorId3)) {
      //Seller exists, and there is likers array. And visitor is also in the array.
      //Return true and liker array length and the heart should be filled.
      return res.status(200).json({
        resMessage: "Visitor has liked before, full heart",
        resLikeCount: likers.length,
        resVisitorIncluded: true,
        resOkCode: 2
      });
    }
    return res.status(200).json({
      //Seller exists, and there is likers array. But the visitor has not liked yet.
      //Return false and liker array length and the heart should be empty.
      resMessage: "Visitor has not liked this seller yet, empty heart",
      resLikeCount: likers.length,
      resVisitorIncluded: false,
      resOkCode: 3
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({
      resMessage: "Something went wrong while getting like data",
      resLikeCount: 0,
      resVisitorIncluded: false,
      resErrorCode: 3
    })
  } finally {
    if (client) client.release();
  } 
})
app.post("/api/post/save-like-seller", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

  let client;
  const { likerId, likedSeller, likeOldStatus, likeNewStatus, likeIsFirst, likersArrayLength } = req.body;
  const likedSeller2 = Number(likedSeller); 
  const likerId2 = Number(likerId);
  
  // === Simple input validations ===
  if (!likerId || !likedSeller || typeof likeNewStatus !== "boolean") {
    return res.status(400).json({
      resStatus: false,
      resMessage: "One of like data is missing",
      resErrorCode: 1
    });
  }
  if (likerId2 < 1 || likedSeller2 < 1 ) {
    return res.status(400).json({ 
      resStatus: false,
      resMessage: "Invalid seller or liker id",
      resErrorCode: 2
    });
  } 
  // === Ok status ===
  try {
    client = await pool.connect();
    if (likeIsFirst === true && likeNewStatus === false) {
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Seller does not exist, Visitor has sent an unlike, nothing to do here.",
        resOkCode: 1
      });
    }
    if (likeIsFirst === false && likeOldStatus === likeNewStatus) {
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Seller exists, old and new like status are the same. Nothing changes, nothing to do",
        resOkCode: 2
      });
    }

    if (likeIsFirst === true && likeNewStatus === true) {
      //Everytime we save a like to likers field, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray = [likerId2];
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes (seller_id, likers) VALUES ($1, $2)`,
        [likedSeller2, newArray2]
      );
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Seller does not exist, create an array and add visitor to empty array",
        resOkCode: 3
      });
    }


    if (likeOldStatus === false && likeNewStatus === true) {
      const result = await client.query(`SELECT * FROM livorent_likes WHERE seller_id = $1`, [likedSeller2]);
      const existingSeller = result.rows[0];
      if (!existingSeller) {
        return res.status(400).json({ 
          resStatus: false,
          resMessage: "Invalid seller id",
          resErrorCode: 3
        });
      }
      let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
      let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
      if (existingSeller) {
        // 1) if likers is already a JS array then we can use it as it is. 
        //If not, we need to convert/parse it to JS array.
        //2) NULL check below is only an extra step to prevent errors. 
        if (existingSeller.likers === null) {
          existingArray = [];
        } else {
          existingArray = Array.isArray(existingSeller.likers)
          ? existingSeller.likers
          : JSON.parse(existingSeller.likers);
        }
        existingLike = existingArray.includes(likerId2);
      }
      if (existingLike === false) {
        existingArray.push(likerId2);
      }
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(existingArray);
      const result2 = await client.query(`UPDATE livorent_likes SET likers = $2 WHERE seller_id = $1`,
        [likedSeller2, newArray2]);
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Visitor has not liked before. Add visitor to likers array",
        resOkCode: 4
      });
    }


    if (likeOldStatus === true && likeNewStatus === false) {
      const result = await client.query(`SELECT * FROM livorent_likes WHERE seller_id = $1`, [likedSeller2]);
      const existingSeller = result.rows[0];
      let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
      let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
      if (existingSeller) {
        // 1) if likers is already a JS array then we can use it as it is. 
        //If not, we need to convert/parse it to JS array.
        //2) NULL check below is only an extra step to prevent errors. 
        if (existingSeller.likers === null) {
          existingArray = [];
        } else {
          existingArray = Array.isArray(existingSeller.likers)
          ? existingSeller.likers
          : JSON.parse(existingSeller.likers);
        }
        existingLike = existingArray.includes(likerId2);
      }
      const newArray = existingArray.filter(likerNum => likerNum !== likerId2);
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result2 = await client.query(`UPDATE livorent_likes SET likers = $2 WHERE seller_id = $1`,
        [likedSeller2, newArray2]);
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Visitor has liked before. Remove visitor from likers array",
        resOkCode: 5
      });
    }


  } catch (error) {
    return res.status(500).json({
      resStatus: false,
      resMessage: "Server error",
      resErrorCode: 3,
    });
  } finally {
    if (client) client.release();
  }
});
app.post("/api/post/save-like-item", authenticateToken, rateLimiter, blockBannedIPs, async (req, res) => {

  let client;
  const { likerId, likedItem, likeOldStatus, likeNewStatus, likeIsFirst, likersArrayLength } = req.body;
  const likedItem2 = Number(likedItem); 
  const likerId2 = Number(likerId);
  
  // === Simple input validations ===
  if (!likerId || !likedItem || typeof likeNewStatus !== "boolean") {
    return res.status(400).json({
      resStatus: false,
      resMessage: "One of like data is missing",
      resErrorCode: 1
    });
  }
  if (likerId2 < 1 || likedItem2 < 1 ) {
    return res.status(400).json({ 
      resStatus: false,
      resMessage: "Invalid item or liker id",
      resErrorCode: 2
    });
  } 
  // === Ok status ===
  try {
    client = await pool.connect();
    if (likeIsFirst === true && likeNewStatus === false) {
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Item does not exist, Visitor has sent an unlike, nothing to do here.",
        resOkCode: 1
      });
    }
    if (likeIsFirst === false && likeOldStatus === likeNewStatus) {
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Item exists, old and new like status are the same. Nothing changes, nothing to do",
        resOkCode: 2
      });
    }

    if (likeIsFirst === true && likeNewStatus === true) {
      //Everytime we save a like to likers field, we need to make sure we are saving an array not a number.
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray = [likerId2];
      const newArray2 = JSON.stringify(newArray);
      const result = await client.query(`INSERT INTO livorent_likes (ad_id, likers) VALUES ($1, $2)`,
        [likedItem2, newArray2]
      );
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Item does not exist, create an array and add visitor to empty array",
        resOkCode: 3
      });
    }


    if (likeOldStatus === false && likeNewStatus === true) {
      const result = await client.query(`SELECT * FROM livorent_likes WHERE ad_id = $1`, [likedItem2]);
      const existingItem = result.rows[0];
      if (!existingItem) {
        return res.status(400).json({ 
          resStatus: false,
          resMessage: "Invalid item id",
          resErrorCode: 3
        });
      }
      let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
      let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
      if (existingItem) {
        // 1) if likers is already a JS array then we can use it as it is. 
        //If not, we need to convert/parse it to JS array.
        //2) NULL check below is only an extra step to prevent errors. 
        if (existingItem.likers === null) {
          existingArray = [];
        } else {
          existingArray = Array.isArray(existingItem.likers)
          ? existingItem.likers
          : JSON.parse(existingItem.likers);
        }
        existingLike = existingArray.includes(likerId2);
      }
      if (existingLike === false) {
        existingArray.push(likerId2);
      }
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(existingArray);
      const result2 = await client.query(`UPDATE livorent_likes SET likers = $2 WHERE ad_id = $1`,
        [likedItem2, newArray2]);
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Visitor has not liked before. Add visitor to likers array",
        resOkCode: 4
      });
    }


    if (likeOldStatus === true && likeNewStatus === false) {
      const result = await client.query(`SELECT * FROM livorent_likes WHERE ad_id = $1`, [likedItem2]);
      const existingItem = result.rows[0];
      let existingLike = false;//default is false to prevent errors in case if statement below fails to update its value.
      let existingArray = [];//default is empty to prevent errors if statement below fails to update its value.
      if (existingItem) {
        // 1) if likers is already a JS array then we can use it as it is. 
        //If not, we need to convert/parse it to JS array.
        //2) NULL check below is only an extra step to prevent errors. 
        if (existingItem.likers === null) {
          existingArray = [];
        } else {
          existingArray = Array.isArray(existingItem.likers)
          ? existingItem.likers
          : JSON.parse(existingItem.likers);
        }
        existingLike = existingArray.includes(likerId2);
      }
      const newArray = existingArray.filter(likerNum => likerNum !== likerId2);
      //And we cannot save an array directly in postgresql, we need to stringfy it.
      const newArray2 = JSON.stringify(newArray);
      const result2 = await client.query(`UPDATE livorent_likes SET likers = $2 WHERE ad_id = $1`,
        [likedItem2, newArray2]);
      return res.status(200).json({ 
        resStatus: false,
        resMessage: "Visitor has liked before. Remove visitor from likers array",
        resOkCode: 5
      });
    }


  } catch (error) {
    return res.status(500).json({
      resStatus: false,
      resMessage: "Server error",
      resErrorCode: 3,
    });
  } finally {
    if (client) client.release();
  }
})

// Instead of using: const ipCache2 = {}
// we are using the map logic below to prevent memory bloat in case website receives thousands of visitors at the same time
const ipCache = new Map();
function setIpCache(ip) {
  ipCache.set(ip, Date.now());
  setTimeout(() => ipCache.delete(ip), 38 * 1000); // auto-delete after 38s to ensure a single visit per IP every 20 seconds
}
app.post("/api/post/visitor/seller", blockBannedIPs, async (req, res) => {
  //Here we could basically say "const ipVisitor = req.ip" but my app is running on Render platform
  //and Render is using proxies or load balancers. Because of that I will see "::1" as ip data if I not use
  //this line below
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  
  // ⏱ Limit same IP to one visit per 38 seconds
  if (ipCache.has(ipVisitor)) {
    return res.status(200).json({
      resStatus: false,
      resMessage: "Too many request from same ip",
      resOkCode: 1
    });
  }
  setIpCache(ipVisitor); // Save to cache with auto-cleanup
  
  const userAgentString = req.get('User-Agent');
  const agent = useragent.parse(userAgentString);
  
  let client;
  const { visitedSeller } = req.body;

  if (!visitedSeller || visitedSeller < 1) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Seller id is not valid",
      resErrorCode: 1
    });
  }
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
      `INSERT INTO livorent_visits (seller_id, ip, op, browser, date) 
      VALUES ($1, $2, $3, $4, $5)`, [visitedSeller, visitorData.ip, visitorData.os, visitorData.browser, visitorData.visitDate]
    );
    return res.status(200).json({
      resStatus: true,
      resMessage: "Visit registered",
      resOkCode: 2
    });
  } catch (error) {
    console.error('Error logging visit:', error);
    return res.status(500).json({
      resStatus: false,
      resMessage: "Database connection error",
      resErrorCode: 2
    });
  } finally {
    if(client) client.release();
  }
})
app.get("/api/get/visits/seller/:sellerId", rateLimiter, blockBannedIPs, async (req, res) => {

  const { sellerId } = req.params;
  const sellerId2 = Number(sellerId);

  let client;
  
  if(!sellerId2 || sellerId2 < 1) {
    return res.status(400).json({
      resMessage: "invalid seller id",
      resVisitCount: 0,
      resErrorCode: 1
    });
  }
 
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT COUNT(*) FROM livorent_visits WHERE seller_id = $1`,
      [sellerId2]
    );
    const count = Number(result.rows[0].count);

    if (count < 1) { 
      //Seller does not exist. It means first visit for that seller. Sending ok message.
      return res.status(200).json({
        resMessage: "No one has visited this seller yet",
        resVisitCount: 0,
        resOkCode: 1
      });
    }
    return res.status(200).json({
      //Seller exists and has been visited before. Sending ok message.
      resMessage: "Seller exists and has been visited before",
      resVisitCount: count,
      resOkCode: 2
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      resMessage: "Database connection error",
      resVisitCount: 0,
      resErrorCode: 2
    })
  } finally {
    if (client) client.release();
  } 
})
// Instead of using: const ipCache2 = {}
// we are using the map logic below to prevent memory bloat in case website receives thousands of visitors at the same time
const ipCache2 = new Map();
function setIpCache2(ip) {
  ipCache2.set(ip, Date.now());
  setTimeout(() => ipCache2.delete(ip), 38 * 1000); // auto-delete after 38 seconds
}
app.post("/api/post/visitor/item", blockBannedIPs, async (req, res) => {
  //Here we could basically say "const ipVisitor = req.ip" but my app is running on Render platform
  //and Render is using proxies or load balancers. Because of that I will see "::1" as ip data if I not use
  //this line below
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  
  // ⏱ Limit same IP to one visit per 38 seconds
  if (ipCache2.has(ipVisitor)) {
    return res.status(200).json({
      resStatus: false,
      resMessage: "Too many requests from the same IP",
      resOkCode: 1
    });
  }
  setIpCache2(ipVisitor); // Save to ipCache2 with auto-cleanup
  
  const userAgentString = req.get('User-Agent');
  const agent = useragent.parse(userAgentString);
  
  let client;
  const { visitedItem, visitedMainGroup, visitedSubGroup } = req.body;
  if (!visitedItem || visitedItem < 1) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Ad id is not valid",
      resErrorCode: 1
    });
  }
  if (!visitedMainGroup || visitedMainGroup < 1 || visitedMainGroup > 10) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Main Category id is not valid",
      resErrorCode: 2
    });
  }
  if (!visitedSubGroup || visitedSubGroup < 10 || visitedSubGroup > 100) {
    return res.status(400).json({
      resStatus: false,
      resMessage: "Sub Category id is not valid",
      resErrorCode: 3
    });
  }
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
      `INSERT INTO livorent_visits (ip, op, browser, date, ad_id, main_id, section_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
      [visitorData.ip, visitorData.os, visitorData.browser, visitorData.visitDate, visitedItem, visitedMainGroup, visitedSubGroup]
    );
    return res.status(200).json({
      resStatus: true,
      resMessage: "Visit registered",
      resOkCode: 2
    });
  } catch (error) {
    console.error('Error logging visit:', error);
    return res.status(500).json({
      resStatus: false,
      resMessage: "Database connection error",
      resErrorCode: 4
    });
  } finally {
    if(client) client.release();
  }
});
app.get("/api/get/visits/item/:itemId", rateLimiter, blockBannedIPs, async (req, res) => {

  const { itemId } = req.params;
  const itemId2 = Number(itemId);

  let client;
  
  if(!itemId2 || itemId2 < 1) {
    return res.status(400).json({
      resMessage: "invalid item id",
      resVisitCount: 0,
      resErrorCode: 1
    });
  }
 
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT COUNT(*) FROM livorent_visits WHERE ad_id = $1`,
      [itemId2]
    );
    const count = Number(result.rows[0].count);
    if (count < 1) { 
      //Item does not exist. It means first visit for that item. Sending ok message.
      return res.status(200).json({
        resMessage: "No one has visited this item yet",
        resVisitCount: 0,
        resOkCode: 1
      });
    }
    
    return res.status(200).json({
      //Item exists and has been visited before. Sending ok message.
      resMessage: "Item exists and has been visited before",
      resVisitCount: count,
      resOkCode: 2
    });
    
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      resMessage: "Database connection error",
      resVisitCount: 0,
      resErrorCode: 2
    })
  } finally {
    if (client) client.release();
  } 
})
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
add security check for repetitive wrong login attempt
Only last 10 records will be uploaded to the main pages. How to add a button to add another 10 when user clicks?
And another 10 if user clicks again and so on?
Add date column to ads
Add a paging system
Add small screen style
Add returning to all db requests to prevent data leak
Fix margin left of all resultArea and errorFrontend areas 
Check each endpoint and component with chatgpt to see if any mistake or sth to fix
convert all error, success and alert messages to Latvian, also buttons and any other text
change all xxxxx things in the footer component 
create or remove kontakti component

BEFORE DEPLOYING:
  Delete images from storage too   
  change 1000 to 3600000 in the time limit of serversavevisitor endpoint
  change 1000 to 60000 in the serversavecomment endpoint
  change 1000 to 60000 in the serversavecommentreply endpoint
  remove console.log statements from all components and server.js
  also check server file to uncomment relevant code
  remove all localhost words from api endpoints in frontend


DEFERRED:
Fuzzy search

DONE
add useRef logic to all components and add dynamic text display if needed
all password inputs hidden with *
Add password renewal logic
Add comment system
Add visit counter to each ad page
update the endpoints for expanded responses
Add like logic
isSaving.current-useRef added to all relevant components to display dynamic button text
Remove ipVisitor data from endpoints if not used.

*Security: button disabled attribute tied to a tracking variable to prevent duplicates
*Security: Input validations check on both frontend and backend
*Security: each ip can upload once in 10 minutes
*Security: wait time middleware added to upload and other important endpoints to prevent spam
*Security: verify token middleware: backend
*Security: input sanitization: backend
*Security: rate limiter: backend
*Security: password reset: done with token version update
*Security: token version added to password reset but not to password change
*Security: password change: token version remains the same 

*/


