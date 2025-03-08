const express = require("express");
const app = express();
const path = require("path");

const { pool, supabase, upload } = require("./db"); // Import configurations
const useragent = require("useragent");

const cors = require("cors");
app.use(cors()); //frontend and backend will run on different ports when in development. We need this to overcome 
//issues arising because of this.
app.use(express.json()); //we need this to send data from frontend to backend in req.body

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
    return res.status(429).json({myMessage: 'This visitor is banned to upload or cannot upload'}); 
  }

  let client;
  const adData = JSON.parse(req.body.adData);  // ✅ Parse the JSON string
  const { adTitle, adDescription, adPrice, adCity, adName, adTelephone, adCategory } = adData;

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
  const stringNum = adCategory.toString(); // Convert number to string
  const numPart1 = parseInt(stringNum[0], 10); // Convert first character back to number
  const numPart2 = parseInt(stringNum[1], 10); // Convert second character back to number

  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO livorent_ads (title, description, price, city, name, telephone, ip, date, image_url, main_group, sub_group) 
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [adTitle, adDescription, adPrice, adCity, adName, adTelephone, visitorData.ip, 
        visitorData.visitDate, JSON.stringify(uploadedImageUrls), numPart1, numPart2]
    );
    res.status(201).json({myMessage: "Ad saved"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({myMessage: "Error while saving ad"})
  } finally {
    client.release();
  }

})

app.get("/api/get/adsbycategory/:idcategory", async (req, res) => {
  const { idcategory } = req.params;
  let client;
  if(!idcategory) {
    return res.status(404).json({message: "No category detected"});
  }

  try {
    /*
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM livorent_ads WHERE main_group = $1`, [idcategory]
    );
    const categoryDetails = await result.rows[0];
    if(!categoryDetails) {
      return res.status(404).json({ message: "Category details not found although category id is correct"})
    }
    */
    res.status(200).json({apple: 2});
    console.log("all good from backend")
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: "Error at the Backend: Couldnt fetch category details"})
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

change 1000 to 3600000 in the time limit of serversavevisitor endpoint
change 1000 to 60000 in the serversavecomment endpoint
change 1000 to 60000 in the serversavecommentreply endpoint
change all xxxxx things in the footer component 
create a component for company set up
Add limits for contact form inputs and textarea
add how to become a citizen section, reference immigrant invest
add two more comment section to each part
add car rental page with pictures

ip check to make sure same ip can upload once in 5 minutes and twice in 24 hour 
*/



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

