const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Story = require('../models/Story');

// Log all requests to the stories routes
router.use((req, res, next) => {
  console.log(`Stories route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Get stories by current user
router.get('/user/mystories', auth, async (req, res) => {
  console.log('Fetching user stories');
  console.log('User ID:', req.user.id);
  try {
    const stories = await Story.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    console.log('Found stories:', stories);
    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ message: 'Error fetching user stories', error: error.message });
  }
});

// Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newStory = new Story({
      title,
      content,
      author: req.user.id
    });
    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
});

// Get all stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'name')
      .populate('likes')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get a single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name')
      .populate('likes')
      .populate('contributions.author', 'name')
      .populate('contributions.likes');
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error: error.message });
  }
});

// Update a story
router.put('/:id', auth, async (req, res) => {
  console.log('Update story route accessed');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('User:', req.user);

  try {
    const { title, content } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ message: 'Story not found' });
    }

    console.log('Found story:', story);

    // Check if the user is the author of the story
    if (story.author.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(403).json({ message: 'User not authorized to edit this story' });
    }

    // Update only if title or content is provided
    if (title !== undefined) story.title = title;
    if (content !== undefined) story.content = content;

    const updatedStory = await story.save();
    console.log('Updated story:', updatedStory);
    res.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ message: 'Error updating story', error: error.message });
  }
});

// Delete a story
router.delete('/:id', auth, async (req, res) => {
  console.log('Delete story route accessed');
  console.log('Request params:', req.params);
  console.log('User:', req.user);

  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ message: 'Story not found' });
    }

    console.log('Found story:', story);

    // Check if the user is the author of the story
    if (story.author.toString() !== req.user.id) {
      console.log('User not authorized to delete');
      return res.status(403).json({ message: 'User not authorized to delete this story' });
    }

    await Story.findByIdAndDelete(req.params.id);
    console.log('Story deleted successfully');
    res.json({ message: 'Story removed' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
});

// Contribute to a story
router.post('/:id/contribute', auth, async (req, res) => {
  console.log('Contribute to story route accessed');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('User:', req.user);

  try {
    const { content } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ message: 'Story not found' });
    }

    story.contributions.push({
      content,
      author: req.user.id
    });

    const updatedStory = await story.save();
    console.log('Updated story with contribution:', updatedStory);
    res.json(updatedStory);
  } catch (error) {
    console.error('Error contributing to story:', error);
    res.status(500).json({ message: 'Error contributing to story', error: error.message });
  }
});

// Delete a contribution
router.delete('/:storyId/contributions/:contributionId', auth, async (req, res) => {
  console.log('Delete contribution route accessed');
  console.log('Story ID:', req.params.storyId);
  console.log('Contribution ID:', req.params.contributionId);
  console.log('User:', req.user);

  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const contributionIndex = story.contributions.findIndex(
      (contribution) => contribution._id.toString() === req.params.contributionId
    );

    if (contributionIndex === -1) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const contribution = story.contributions[contributionIndex];

    // Check if the user is the author of the contribution
    if (contribution.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this contribution' });
    }

    story.contributions.splice(contributionIndex, 1);
    await story.save();

    res.json(story);
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ message: 'Error deleting contribution', error: error.message });
  }
});

// Like a story
router.post('/:id/like', auth, async (req, res) => {
  console.log('Like story route accessed');
  console.log('Story ID:', req.params.id);
  console.log('User ID:', req.user.id);
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      console.log('Story not found');
      return res.status(404).json({ message: 'Story not found' });
    }

    console.log('Current likes:', story.likes);
    const index = story.likes.indexOf(req.user.id);
    if (index > -1) {
      // User has already liked, so unlike
      story.likes.splice(index, 1);
      console.log('User unliked the story');
    } else {
      // User hasn't liked, so add like
      story.likes.push(req.user.id);
      console.log('User liked the story');
    }

    await story.save();
    console.log('Updated likes:', story.likes);
    res.json(story);
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ message: 'Error liking story', error: error.message });
  }
});

// Like a contribution
router.post('/:id/contributions/:contributionId/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const contribution = story.contributions.id(req.params.contributionId);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    const index = contribution.likes.indexOf(req.user.id);
    if (index > -1) {
      // User has already liked, so unlike
      contribution.likes.splice(index, 1);
    } else {
      // User hasn't liked, so add like
      contribution.likes.push(req.user.id);
    }

    await story.save();
    res.json(story);
  } catch (error) {
    console.error('Error liking contribution:', error);
    res.status(500).json({ message: 'Error liking contribution', error: error.message });
  }
});

module.exports = router;
