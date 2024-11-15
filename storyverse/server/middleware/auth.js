const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('Received token:', token);
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = { id: decoded.id };
    console.log('Set user:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(400).json({ message: 'Token is not valid' });
  }
};
