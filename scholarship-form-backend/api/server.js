if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.port || 5000;

app.use(cors({
    origin: 'https://scholarshipform-kyqs.vercel.app', // Allow only your frontend
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  }));

// Middleware
const backend = process.env.BACKEND;
app.use(bodyParser.json());
// app.use(cors({ origin: backend }));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection URI (Replace with your MongoDB URI)
const url = process.env.ATLASDB_URL; // Replace with your MongoDB URI
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process if MongoDB connection fails
    }
}
connectToMongoDB();

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Scholarship Form Backend!');
});

// API Endpoint to Handle Form Submission
app.post('/api/submit', async (req, res) => {
    try {
        const { fullName, email, phone, referralCode, essay } = req.body;

        // Insert data into MongoDB
        const database = client.db('scholarshipDB'); // Replace with your database name
        const collection = database.collection('applications'); // Replace with your collection name

        const result = await collection.insertOne({
            fullName,
            email,
            phone,
            referralCode,
            essay,
            timestamp: new Date(),
        });

        res.status(201).json({ message: 'Application submitted successfully!', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while submitting the application.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

