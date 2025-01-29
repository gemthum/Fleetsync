const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken'); // Install with `npm install jsonwebtoken`

const pool = mysql.createPool({
    host: process.env.DWH_HOST,
    user: process.env.DWH_USER,
    password: process.env.DWH_PWD,
    database: process.env.DWH_DB,
});

const SECRET_KEY = process.env.JWT_SECRET;

async function authenticateUser(username, password) {
  try {
    const query = 'SELECT * FROM FLEETSYNC_LOGIN WHERE USUARIO = ? AND PWD = ?';
    console.log('Punto de control auth.js dentro de la funcion authenticateUser');
    const [rows] = await pool.query(query, [username, password]);
    if (rows.length > 0) {
      const token = jwt.sign({ userId: rows[0].FLEETSYNC_ID, username: rows[0].USUARIO }, SECRET_KEY, {
        expiresIn: '1h',
      });
      return { success: true, token };
    }
    return { success: false, message: 'Invalid username or password' };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

module.exports = { authenticateUser };
