const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse incoming JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // For handling cross-origin requests from frontend

// Mock AI detection function (random anomaly detection for demo purposes)
function detectThreat(inputData) {
    // Randomly simulate threat detection
    const threatDetected = Math.random() > 0.5;  // 50% chance of detection
    const threatType = threatDetected ? "Phishing Attack" : "Normal Activity";
    const severity = threatDetected ? (inputData.url.includes("malicious") ? "High" : "Low") : "None";

    return { threatDetected, threatType, severity };
}

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

    // Send back the result
    res.json({
        threatDetected: detectionResult.threatDetected,
        threatType: detectionResult.threatType,
        severity: detectionResult.severity,
        email: email,
        url: url,
        name: name,
    });
});

// Serve static files from the "public" directory (for frontend)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
