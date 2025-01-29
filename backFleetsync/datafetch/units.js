require('dotenv').config();
const mysql = require('mysql2/promise');



async function fetchDWHdata(query) {
    const pool = mysql.createPool({
        host: process.env.DWH_HOST,
        user: process.env.DWH_USER,
        password: process.env.DWH_PWD,
        database: process.env.DWH_DB,
      });

    const [rows] = await pool.query(query);
    return rows;
  }


module.exports = { fetchDWHdata };