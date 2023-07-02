require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/getMonroney/:vin', (req, res) => {
  // Extract the VIN from the URL params
  const { vin } = req.params;

  // Define the request body with the VIN
  const requestBody = { vin };

  // Define the request headers and bearer token
  const headers = { 'Content-Type': 'application/json' };
  const bearerToken = process.env.BEARER_TOKEN; // Replace with your actual bearer token

  // Define the URL for the endpoint that returns the PDF
  const endpointURL = process.env.getMonroneyEndpoint; // Replace with the actual endpoint URL

  // Define the POST request configuration
  const config = {
    headers: {
      ...headers,
      Authorization: `Bearer ${bearerToken}`
    },
    responseType: 'json' // Set the response type to 'json'
  };

  // Make the POST request to the endpoint
  axios.post(endpointURL, requestBody, config)
    .then(response => {
      // Decode the base64-encoded PDF data
      const decodedData = Buffer.from(response.data.base64MonroneyPDF, 'base64');

      // Set the response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="monroney ${vin}.pdf"`);

      // Send the decoded data as the response
      res.send(decodedData);
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      res.status(500).json({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
