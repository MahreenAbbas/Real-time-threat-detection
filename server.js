const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware to parse incoming JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // For handling cross-origin requests from frontend

// MongoDB connection URI (replace with your MongoDB Atlas connection string or local URI)
const mongoURI = 'mongodb://localhost:27017/defendx';  // Local MongoDB URI
// const mongoURI = 'your-mongodb-atlas-connection-string';  // Use this for Atlas

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error: ', err));

// Define the Threat Log Schema
const threatLogSchema = new mongoose.Schema({
    url: String,
    email: String,
    name: String,
    threatDetected: Boolean,
    threatType: String,
    severity: String,
    timestamp: { type: Date, default: Date.now }
});

// Create the Threat Log Model
const ThreatLog = mongoose.model('ThreatLog', threatLogSchema);

// Route to handle threat detection requests
app.post('/api/detect-threat', (req, res) => {
    const { url, email, name } = req.body;

    // Validate input fields
    if (!url || !email || !name) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate URL format
    try {
        new URL(url);  // This will throw if URL is invalid
    } catch (_) {
        return res.status(400).json({ message: 'Invalid URL format.' });
    }

    // Run the "AI-based" threat detection (random logic for now)
    const detectionResult = detectThreat({ url, email, name });

    // Save the threat detection result to MongoDB
    const newThreatLog = new ThreatLog({
        url,
        email,
        name,
        threatDetected: detectionResult.threatDetected,
        threatType: detectionResult.threatType,
        severity: detectionResult.severity
    });

    newThreatLog.save()
        .then(log => {
            res.json({
                threatDetected: detectionResult.threatDetected,
                threatType: detectionResult.threatType,
                severity: detectionResult.severity,
                email,
                url,
                name
            });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error saving threat log', error: err });
        });
});

// Mock AI detection function (random anomaly detection for demo purposes)
function detectThreat(inputData) {
    // Randomly simulate threat detection
    const threatDetected = Math.random() > 0.5;  // 50% chance of detection
    const threatType = threatDetected ? "Phishing Attack" : "Normal Activity";
    const severity = threatDetected ? (inputData.url.includes("malicious") ? "High" : "Low") : "None";

    return { threatDetected, threatType, severity };
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

