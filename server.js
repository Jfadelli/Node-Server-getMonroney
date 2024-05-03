require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
// Import routes
const routes = require('./router');
// Use the routes
app.use('/', routes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
