const express = require('express');
const { authenticateUser } = require('../auth.js');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Ingreso a la api /login de /auth/login');
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const result = await authenticateUser(username, password);
  if (result.success) {
    res.json({ token: result.token });
  } else {
    res.status(401).json({ message: result.message });
  }
});

module.exports = router;
