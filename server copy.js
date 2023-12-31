require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { fetchBearerToken } = require('./fetchBearerToken');
const app = express();
const port = process.env.PORT || 3000;
let bearerToken = process.env.BEARER_TOKEN; // Replace with your actual bearer token

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/getMonroney/:vin', async (req, res) => {
  // Extract the VIN from the URL params
  const { vin } = req.params;

  // Define the request body with the VIN
  const requestBody = { vin };

  // Define the request headers and bearer token
  const headers = { 'Content-Type': 'application/json' };

  // Define the URL for the endpoint that returns the PDF
  const endpointURL = process.env.GET_MONRONEY_ENDPOINT; // Replace with the actual endpoint URL

  // Define the POST request configuration
  const config = {
    headers: {
      ...headers,
      Authorization: `Bearer ${bearerToken}`
    },
    responseType: 'json' // Set the response type to 'json'
  };

  try {
    // Make the POST request to the endpoint
    const response = await axios.post(endpointURL, requestBody, config);

    // Decode the base64-encoded PDF data
    const decodedData = Buffer.from(response.data.base64MonroneyPDF, 'base64');

    // Set the response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monroney ${vin}.pdf"`);

    // Send the decoded data as the response
    res.send(decodedData);
  } catch (error) {
    // Check if the error is due to an authentication issue (401 Unauthorized)
    const isAuthenticationError = error.response && error.response.status === 401;

    if (isAuthenticationError) {
      try {
        // Fetch a new bearer token
        bearerToken = await fetchBearerToken();

        // Update the request headers with the new bearer token
        config.headers.Authorization = `Bearer ${bearerToken}`;

        // Retry the POST request with the updated token
        const response = await axios.post(endpointURL, requestBody, config);

        // Decode the base64-encoded PDF data
        const decodedData = Buffer.from(response.data.base64MonroneyPDF, 'base64');

        // Send the decoded data as the response
        res.send(decodedData);
      } catch (error) {
        // Handle any errors that occurred during the retry
        res.status(500).json({ error: error.message });
        console.log('Error fetching PDF:', error.message);
      }
    } else {
      // Handle other non-authentication errors
      res.status(500).json({ error: error.message });
      console.log('Error fetching PDF:', error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
