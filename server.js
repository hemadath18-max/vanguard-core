// ============================================================================
//   ASTROMIND AI - SCAM SHIELD FIREWALL INFRASTRUCTURE
//   REPOS: VANGUARD-CORE / INTEGRITY-ENGINE
// ============================================================================

const express = require('express');
const app = express();
app.use(express.json());

// A real, high-speed database memory cache of known scam indicators
// In a massive app, this connects to a live database of thousands of blocked numbers
const knownScamDatabase = {
    blockedNumbers: ['+18005550199', '+919999999999', '+442079460192'],
    phishingDomains: ['verify-your-bank-login.com', 'secure-net-scam.xyz', 'free-giftcard-claim.info']
};

/**
 * @route   POST /api/v1/shield/analyze
 * @desc    Real-time endpoint used by the mobile app to verify if an incoming item is a scam
 */
app.post('/api/v1/shield/analyze', (req, res) => {
    const { incomingPhoneNumber, incomingLink, userDeviceToken } = req.body;

    // Guardrail: Ensure the mobile app sent data to check
    if (!userDeviceToken) {
        return res.status(400).json({ status: "ERROR", message: "Unauthorized Device Request." });
    }

    let threatDetected = false;
    let threatType = "CLEAN";
    let safetyScore = 100;

    // 1. Check if the phone number is a reported scammer
    if (incomingPhoneNumber && knownScamDatabase.blockedNumbers.includes(incomingPhoneNumber)) {
        threatDetected = true;
        threatType = "KNOWN_SCAM_CALLER";
        safetyScore = 0;
    }

    // 2. Check if the link inside the SMS is a phishing scam
    if (incomingLink && knownScamDatabase.phishingDomains.some(domain => incomingLink.includes(domain))) {
        threatDetected = true;
        threatType = "PHISHING_MALWARE_LINK";
        safetyScore = 0;
    }

    // Log the threat block to our admin panel console
    if (threatDetected) {
        console.log(`[ALERT] AstroMindAI blocked a ${threatType} threat for device: ${userDeviceToken}`);
    }

    // Send the immediate blocking command back to the user's mobile phone app
    return res.status(200).json({
        status: "PROCESSED",
        threatDetected: threatDetected,
        threatClassification: threatType,
        riskScore: 100 - safetyScore,
        actionRequired: threatDetected ? "BLOCK_AND_NOTIFY_USER" : "ALLOW_TRAFFIC"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`  ASTROMIND AI - SCAM SHIELD FIREWALL ACTIVATED                  `);
    console.log(`  MONITORING AND DESTROYING SCAMMER THREATS ON PORT: ${PORT}       `);
    console.log(`================================================================`);
});
    
