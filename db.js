require("dotenv").config();
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Supabase Storage Connection
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Multer Configuration (File Upload Middleware)
const storage = multer.memoryStorage(); // Store in memory before uploading to Supabase
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 3 * 1024 * 1024, // Max 3MB per file
        files: 5 // Max 4 files allowed
    }
});

module.exports = { pool, supabase, upload };
