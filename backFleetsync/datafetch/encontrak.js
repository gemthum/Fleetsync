const axios = require('axios');
require('dotenv').config();

async function fetchGPSData() {
    const GPS_API_URL = process.env.GPS_API_URL;
    const GPS_API_USER = process.env.GPS_API_USER;
    const GPS_API_PASS = process.env.GPS_API_PASS;
  const requestBody = {
    username: GPS_API_USER,
    password: GPS_API_PASS,
  };

  try {
    const response = await axios.post(GPS_API_URL, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data; 
  } catch (error) {
    console.error('Error fetching GPS data:', error.message);
    throw error;
  }
}


module.exports = { fetchGPSData };