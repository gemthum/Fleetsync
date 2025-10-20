const Firebird = require('node-firebird');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


  
  async function fetchZeusData() {
    const firebirdOptions = {
        host: process.env.FIREBIRD_HOST,
        port: process.env.FIREBIRD_PORT,
        database: process.env.FIREBIRD_DB_PATH,
        user: process.env.FIREBIRD_USER,
        password: process.env.FIREBIRD_PASSWORD,
      };
    const query = fs.readFileSync(path.join(__dirname, 'zeusq.sql'), 'utf-8');
    // const query = process.env.FIREBIRD_QUERY;
    return new Promise((resolve, reject) => {
      Firebird.attach(firebirdOptions, (err, db) => {
        if (err) {
          return reject(err);
        }
  
        db.query(query, (err, result) => {
          db.detach();
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
    });
  }

  module.exports = { fetchZeusData }
