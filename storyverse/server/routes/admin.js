const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const User = require('../models/User');
const Story = require('../models/Story');
const { body, param, validationResult } = require('express-validator');

// Apply both auth and isAdmin middleware to all admin routes
router.use(auth);
router.use(isAdmin);

/**
 * @route   GET /admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /admin/users/:id
 * @desc    Delete a user by ID
 * @access  Admin
 */
router.delete('/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID.')
], async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /admin/users/:id/promote
 * @desc    Promote a user to admin
 * @access  Admin
 */
router.put('/users/:id/promote', [
  param('id').isMongoId().withMessage('Invalid user ID.')
], async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'User is already an admin.' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: 'User promoted to admin successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /admin/users/:id/ban
 * @desc    Ban a user by ID (Soft Delete)
 * @access  Admin
 */
router.put('/users/:id/ban', [
  param('id').isMongoId().withMessage('Invalid user ID.')
], async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isBanned) {
      return res.status(400).json({ message: 'User is already banned.' });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: 'User has been banned successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /admin/users/:id/unban
 * @desc    Unban a user by ID
 * @access  Admin
 */
router.put('/users/:id/unban', [
  param('id').isMongoId().withMessage('Invalid user ID.')
], async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.isBanned) {
      return res.status(400).json({ message: 'User is not banned.' });
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: 'User has been unbanned successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /admin/stories
 * @desc    Get all stories
 * @access  Admin
 */
router.get('/stories', async (req, res, next) => {
  try {
    const stories = await Story.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /admin/stories/:id
 * @desc    Delete a story by ID
 * @access  Admin
 */
router.delete('/stories/:id', [
  param('id').isMongoId().withMessage('Invalid story ID.')
], async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    res.json({ message: 'Story deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
