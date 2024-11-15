const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Assuming auth middleware has already set req.user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
