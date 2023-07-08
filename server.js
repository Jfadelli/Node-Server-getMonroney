app.get('/getMonroney/:vin', async (req, res) => {
  // Render an initial HTML response with a loading message
  const initialHTML = `
    <html>
    <head>
      <title>Download PDF</title>
    </head>
    <body>
      <h1>Your file is currently downloading. Please wait...</h1>
    </body>
    </html>
  `;

  // Send the initial HTML response to the client
  res.send(initialHTML);

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

  try {
    // Make the POST request to the endpoint to fetch the PDF
    const response = await axios.post(endpointURL, requestBody, config);

    // Decode the base64-encoded PDF data
    const decodedData = Buffer.from(response.data.base64MonroneyPDF, 'base64');

    // Set the response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monroney ${vin}.pdf"`);

    // Send the PDF data as the response
    res.send(decodedData);
  } catch (error) {
    // Handle any errors that occurred during the request
    console.log('Updating bearerToken');
    bearerToken = await fetchBearerToken();
    console.log('Bearer token updated');

    // Update the HTML response with the error message
    const errorHTML = `
      <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <h1>Error occurred. Please try again later.</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `;
    res.send(errorHTML);
  }
});
