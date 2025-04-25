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
app.get("/serversendhello", (req, res) => {
  res.status(200).json({myMessage: "Hello from Backend"});
})

// List of IPs to ignore (server centers, ad bots, my ip etc) 
const ignoredIPs = ["66.249.68.5", "66.249.68.4", "66.249.88.2", "66.249.89.2", "66.249.65.32", "66.249.88.3", 
  "209.85.238.224", "80.89.77.205", "212.3.197.186", "80.89.74.90", "80.89.79.74", "80.89.77.116", "80.89.73.22", 
  "66.249.64.10", "66.249.64.6", "66.249.64.5", "66.249.66.169", "66.249.66.160", "212.3.194.116", "212.3.194.116", 
  "66.249.73.233", "66.249.73.234", "62.103.210.169", "66.249.66.161", "66.249.69.65", "66.249.68.33", "66.249.68.37",
  "66.249.68.38", "66.249.68.34", "40.77.189.152", "17.246.15.253", "17.246.15.253", "152.39.239.250", "45.114.243.179", 
  "66.249.73.197", "66.249.73.202", "205.169.39.19", "209.85.238.225", "205.169.39.232"];

//A temporary cache to save ip addresses and it will prevent spam comments and replies for 1 minute.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
const ipCache3 = {}
app.post("/serversavead", upload.array("images", 4), async (req, res) => {
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last comment was less than 1 minute ago
  if (ipCache3[ipVisitor] && Date.now() - ipCache3[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many uploads from this visitor'});
  }
  ipCache3[ipVisitor] = Date.now();//save visitor ip to ipCache3

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned'}); 
  }

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
app.post("/api/register", async (req, res) => {
  //preventing spam signups
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last signup was less than 1 minute ago
  if (ipCache4[ipVisitor] && Date.now() - ipCache4[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many signup attempts from this visitor'});
  }
  ipCache4[ipVisitor] = Date.now();//save visitor ip to ipCache4

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned'}); 
  }
  console.log("hi connection is fine");

  let client;
  const registerObject = req.body;
  const registerLoad = {
    name1: registerObject.registerName.trim(),
    telephone1: registerObject.registerTelephone.trim(),     // Ensure text values are trimmed
    email1: registerObject.registerEmail.trim(),     // Ensure date is trimmed (still stored as text in DB),
    passtext1: registerObject.registerPasstext.trim()
  };
  const visitorData = {
    ip: ipVisitor,
    visitDate: new Date().toLocaleDateString('en-GB')
  };

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(registerLoad.passtext1, SALT_ROUNDS);

    client = await pool.connect();
    const { rows: newUser } = await client.query(
      `INSERT INTO livorent_users (name, telephone, email, passtext, ip, date) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [registerLoad.name1, registerLoad.telephone1, registerLoad.email1, hashedPassword, visitorData.ip, visitorData.visitDate]
    );

    // Generate a JWT for the new user and send it to frontend
    const token = jwt.sign({ userId: newUser[0].id }, JWT_SEC, { expiresIn: '100d' });
    res.status(201).json({ myMessage: 'Profile created', visitorNumber:newUser[0].id, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while creating the profile"})
  } finally {
    client.release();
  } 

});

app.post("/api/login", async (req, res) => {
  //preventing spam logins
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last login was less than 1 minute ago
  if (ipCache4[ipVisitor] && Date.now() - ipCache4[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many login attempts from this visitor'});
  }
  ipCache4[ipVisitor] = Date.now();//save visitor ip to ipCache4

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned.'}); 
  }
  console.log("hi connection is fine");

  let client; 
  const loginObject = req.body;
  const loginLoad = {
    email1: loginObject.loginEmail.trim(),     // Ensure date is trimmed, now whitespace,
    passtext1: loginObject.loginPasstext.trim()
  };
  console.log("loginObject: ", loginObject);
  console.log("loginLoad: ", loginLoad);
  try {
    client = await pool.connect();
    //find user by email
    const { rows: users } = await client.query(
      `SELECT id, passtext FROM livorent_users WHERE email = $1`, [loginLoad.email1]
    )
    if(users.length === 0) {
      return res.status(401).json({ error: "Wrong e-mail or password"});
    }
    const user = users[0];
    console.log("user: ", user);
    //comparing password. Bcrypt will know from hashed password the number of salt rounds
    const passwordMatch = await bcrypt.compare(loginLoad.passtext1, user.passtext);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Wrong password or e-mail"});
    }
    //generating JWT for authenticated users
    const token = jwt.sign({ userId: user.id}, JWT_SEC, { expiresIn: "100d" });
    res.status(200).json({
      message: "Login successful",
      visitorNumber: user.id,
      token
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while login"})
  } finally {
    client.release();
  } 

});

app.get("/api/get/adsbycategory/:idcategory", async (req, res) => {
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

app.get("/api/get/adsbysubsection/:sectionNumber", async (req, res) => {
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

app.get("/api/get/adsbyuser/:iduser", async (req, res) => {
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

app.get("/api/get/userdata/:iduser", async (req, res) => {
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

app.get("/api/get/item/:itemNumber", async (req, res) => {
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
 
app.post("/api/update", async (req, res) => {
  //preventing spam signups
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last signup was less than 1 minute ago
  if (ipCache4[ipVisitor] && Date.now() - ipCache4[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many attempts from this visitor'});
  }
  ipCache4[ipVisitor] = Date.now();//save visitor ip to ipCache4

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned'}); 
  }

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
      RETURNING id`,
      [updateLoad.name1, updateLoad.telephone1, updateLoad.email1, hashedPassword, updateLoad.id1]
    );

    // Generate a JWT for the new user and send it to frontend
    const token = jwt.sign({ userId: updatedUser[0].id }, JWT_SEC, { expiresIn: '100d' });
    res.status(201).json({ myMessage: 'Profile updated', visitorNumber:updatedUser[0].id, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while updating the profile"})
  } finally {
    client.release();
  } 
});
app.delete("/api/delete/item/:itemNumber", async (req, res) => {
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
app.patch("/api/profile/update-ad", upload.array("adUpdateImages", 5), async (req, res) => { 
  //preventing spam comments
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last comment was less than 1 minute ago
  if (ipCache3[ipVisitor] && Date.now() - ipCache3[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many uploads from this visitor'});
  }
  ipCache3[ipVisitor] = Date.now();//save visitor ip to ipCache3

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned'}); 
  }
 
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
app.post("/api/like/sellers", async (req, res) => {
  //preventing spam likes
  const ipVisitor = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress || req.ip;
  // Check if IP exists in cache and if last signup was less than 1 minute ago
  if (ipCache4[ipVisitor] && Date.now() - ipCache4[ipVisitor] < 1000) {
    return res.status(429).json({myMessage: 'Too many attempts from this visitor'});
  }
  ipCache4[ipVisitor] = Date.now();//save visitor ip to ipCache4

  // Check if the IP is in the ignored list
  if (ignoredIPs.includes(ipVisitor)) {
    return res.status(429).json({myMessage: 'Visitor is banned'}); 
  }

  let client;
  const { likeStatus, likedId, userId } = req.body;
  const likedId2 = Number(likedId);
  const userId2 = Number(userId);

  try {
    client = await pool.connect();
    // 1. We check if user exists
    // 2. Then we check like exists
    // 3. Then we save like or remove depending like/unlike info coming from frontend.
    //Everytime we save a like to liked_sellers, we need to make sure we are saving an array not a number.
    //And we cannot save an array directly in postgresql, we need to stringfy it.
    const result = await client.query(`SELECT * FROM livorent_likes_users WHERE user_id = $1`, [userId2]);
    const existingUser = result.rows[0];
    const existingLike = JSON.parse(existingUser.liked_sellers).includes(likedId2);

    if (likeStatus === false && !existingUser) {
      console.log("No user. No like. Nothing to do.");
      return res.json({myMessage: "No user. No like. Nothing to do."})
    }

    if (likeStatus === true && !existingUser) {
      const newArray = JSON.stringify([likedId2]);
      const result = await client.query(`INSERT INTO livorent_likes_users (user_id, liked_sellers)
        VALUES ($1, $2)`, [userId2, newArray]);
      console.log("No user. First like. Create a profile Go to create a profile");
      return res.json({myMessage: "No user. Go to create a profile "})
    }

    if (likeStatus === false && existingUser) {
      console.log("User exists. Check if the unliked seller is in the liked array.");
      console.log("If yes remove seller. If no nothing to do.");
      return res.json({myMessage: "User exists. Check if unliked seller is in liked array."})
    }

    if (likeStatus === true && existingUser) {
      console.log("User exists. Check if the liked seller is in the liked array.");
      console.log("If yes, nothing to do. If no add seller to the liked array.");
      return res.json({myMessage: "User exists. Check if liked seller is in liked array."})
    }
    
/*     if (result.rows.length > 0) {
            // Parse liked_sellers to array safely
            let likedSellersArray;
            try {
              likedSellersArray = JSON.parse(existingUser.liked_sellers || "[]");
              if (!Array.isArray(likedSellersArray)) likedSellersArray = [];
            } catch (e) {
              console.error("Failed to parse liked_sellers:", existingUser.liked_sellers);
              likedSellersArray = [];
            }
      
            const existingLike = likedSellersArray.includes(likedId2);
      if (existingLike === true && likeStatus === true) {
        return res.status(200).json({myMessage: "You have already liked this seller"});
      } else if (existingLike === true && likeStatus === false) {
        const newArray = existingUser.liked_sellers.filter(sellerNum => sellerNum !== likedId2);
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`      
          UPDATE livorent_likes_users SET liked_sellers = $2 WHERE user_id = $1`,
          [userId2, newArray2]);
        return res.status(201).json({myMessage: "like removed"});
      } else if(existingLike === false && likeStatus === true) {
        const existingArray = existingUser.liked_sellers;
        const newArray = existingArray.push(likedId2);
        const newArray2 = JSON.stringify(newArray);
        const result = await client.query(`      
          UPDATE livorent_likes_users SET liked_sellers = $2 WHERE user_id = $1`,
          [userId2, newArray2]);
        return res.status(201).json({myMessage: "like added"});
      } else if (existingLike === false && likeStatus === false) {
        return res.status(200).json({myMessage: "To unlike you first need to like"});
      } else {
        return res.status(404).json({myMessage: "User found, but probably error with the liked_sellers array"})
      }

    } else {
      if (likeStatus === false) {
        return res.status(200).json({myMessage: "First like cannot be an unlike"});
      }
      const newArray = JSON.stringify([likedId2])
      const result = await client.query(`INSERT INTO livorent_likes_users (user_id, liked_sellers)
        VALUES ($1, $2)`, [userId2, newArray]);
      return res.status(201).json({myMessage: "first like registered"});
    }
      */
  } catch (error) {
    console.error("Database error:", error);
    return res.status(404).json({myMessage: "Something went wrong while getting basic user data"})
  } finally {
    if (client) client.release();
  } 

});

//This line must be under all server routes. Otherwise you will have like not being able to fetch comments etc.
//This code helps with managing routes that are not defined on react frontend. If you dont add, only index 
//route will be visible.
//this line can be commented out during development.
/* app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
}); */

/*
UNCOMMENT THIS IN SERVER.JS: app.use(express.static(path.join(__dirname, 'client/build'))); 
*/


const PORT = process.env.PORT ||5000;
app.listen(PORT, () => {
  console.log("Port is open on " + PORT);
})

//remove "build" from gitignore before production deployment
//create "build" folder-- npm run build in client folder
//You may remove cors before production
//Fix server api routes before production, remove "localhost" part
//add environment variables
/*Also add this otherwise only index route will be visible when you deploy app to production
add "::1", to the ignored ip list


  /* 
Delete images from storage too   
change 1000 to 3600000 in the time limit of serversavevisitor endpoint
change 1000 to 60000 in the serversavecomment endpoint
change 1000 to 60000 in the serversavecommentreply endpoint
change all xxxxx things in the footer component 
create a component for company set up
Add limits for contact form inputs and textarea
add how to become a citizen section, reference immigrant invest
add two more comment section to each part
add car rental page with pictures
before creating a new profile, a check on emails to make sure user does exist
password forget remind
check time limits on post routes . They are not 1 minute, if so, convert them to 1 minute
ip check to make sure same ip can upload once in 5 minutes and twice in 24 hour 
also create a signout option to allow a new user to sign in from the same computer. 
//make sure only the profile owner can update
*/
//Add a like and comment system
//Currently I can enter into any profile. Prevent that. Registered people should only their profile, not any.
//When deleting an ad, make sure its images are also deleted
//remove console.log statements from all components and server.js
//convert all error, success and alert messages to Latvian, also buttons and any other text
//add a password renewal in case of repetitive wrong login attemps
//update and delete functionality on user page for the ads he added
//integrate a comment section and a visit counter to each advertisement
//Only last 10 records will be uploaded to the main pages. How to add a button to add another 10 when user clicks?
//And another 10 if user clicks again and so on?
//upload component has hard coded css style. Maybe I can remove it?
//prevent spam uploads by putting a time limit
//put a limit on inputs on upload component
//Also input checks on upload and signup and login components
//In the list display of ads, limit the number of characters displayed. Otherwise some ads might have 
//too long texts and it will overflow list. Also limit the number of inputs. People should not upload
//many images and information inputs
//before signingup a new user, make sure the email does not exist already.
// fix "encountered the same children witht he same key" error when displaying the table of ads, it happens in all components
// Also add a password update section in cases forgetting
// convert all alerts and backend messages to Latvian, you can components and server file line by line
//Add a loading circle when uploading an ad and waiting for reply if ad is saved
/* //Then go to server.js file and make sure you serve static files from build directory:
app.use(express.static(path.join(__dirname, 'client/build'))); */

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

//A temporary cache to save ip addresses and it will prevent saving same ip addresses for 1 hour.
//I can do that by checking each ip with database ip addresses but then it will be too many requests to db
//We will save each visitor data to database. 
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

/*
app.patch("/api/profile/delete-image", async (req, res) => {
  const { imageLink, adNumber } = req.body;
  let client;

  const adNumber2 = Number(adNumber);
  if(!adNumber2) {
    return res.status(404).json({myMessage: "Ad number is missing"});
  }
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE id = $1`,
      [adNumber2]
    );
    if (result.rows.length > 0) {
      const existingImageList = result.rows[0].image_url;

      // Filter out the matching imageLink
      const updatedImageList = existingImageList.filter(
        existingImg => existingImg !== imageLink
      );

      res.status(200).json({myMessage: "Image uploaded"});
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
*/