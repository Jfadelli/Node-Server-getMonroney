const express = require('express');
const router = express.Router();
const axios = require('axios');
const { fetchBearerToken } = require('./fetchBearerToken');

// Route for the home page
router.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Enter VIN</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f4f4f4;
                    }
                    form {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    input[type="text"], button {
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 10px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                    }
                    button {
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #45a049;
                    }
                    .spinner, .overlay {
                        display: none; /* Initially hidden */
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    .spinner {
                        border: 4px solid rgba(0,0,0,.1);
                        border-radius: 50%;
                        border-left-color: #09f;
                        animation: spin 1s linear infinite;
                        width: 36px;
                        height: 36px;
                    }
                    .overlay {
                        background-color: rgba(0, 0, 0, 0.5);
                        width: 100vw;
                        height: 100vh;
                        z-index: -1;
                    }
                    @keyframes spin {
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                </style>
                <script>
                    function handleSubmit(event) {
                        event.preventDefault();
                        var vin = document.getElementById('vin').value;
                        var magicWord = document.getElementById('magicWord').value;
                        if (!vin || !magicWord) {
                            alert("Please enter both the VIN and the magic word.");
                            return;
                        }
                        document.querySelector('.spinner').style.display = 'block';
                        document.querySelector('.overlay').style.display = 'block';
                        window.location.href = '/' + encodeURIComponent(vin) + '/' + encodeURIComponent(magicWord);
                    }
                    
                </script>
            </head>
            <body>
                <form onsubmit="handleSubmit(event)">
                    <label for="vin">Enter VIN:</label><br>
                    <input type="text" id="vin" name="userInput" placeholder="VIN Number..." required><br>
                    <label for="magicWord">What's the magic word?</label><br>
                    <input type="password" id="magicWord" name="magicWord" placeholder="Enter magic word..." required><br>
                    <button type="submit">Submit</button>
                </form>
                <div class="overlay"></div>
                <div class="spinner"></div>
            </body>
        </html>
    `);
});

// Route for getting a Monroney with VIN and magic word validation
router.get('/:vin/:magicWord', async (req, res) => {
    const { vin, magicWord } = req.params;
    if (magicWord !== process.env.MAGIC_WORD) {
        res.status(403).send('Unauthorized: Incorrect magic word');
        return;
    }

    // Your existing axios request setup and logic
    const headers = { 'Content-Type': 'application/json' };
    const endpointURL = process.env.GET_MONRONEY_ENDPOINT; 
    const bearerToken = await fetchBearerToken();
    const config = {
        headers: {
            ...headers,
            Authorization: `Bearer ${bearerToken}`
        },
        responseType: 'json'
    };

    try {
        const response = await axios.post(endpointURL, { vin }, config);
        const decodedData = Buffer.from(response.data.base64MonroneyPDF, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="monroney ${vin}.pdf"`);
        res.send(decodedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
