import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import './MyStories.css';

function MyStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMyStories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/stories/user/mystories`, {
          headers: { 'x-auth-token': token }
        });
        setStories(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my stories:', err);
        setError('Failed to fetch stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyStories();
    }
  }, [user]);

  const handleDeleteClick = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/stories/${storyId}`, {
          headers: { 'x-auth-token': token }
        });
        setStories(stories.filter(story => story._id !== storyId));
      } catch (err) {
        console.error('Error deleting story:', err);
        setError('Failed to delete story. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) return <div>Please log in to view your stories.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="my-stories">
      <h2>My Stories</h2>
      {stories.length === 0 ? (
        <p>You haven't created any stories yet.</p>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story._id} className="story-card">
              <h3 className="story-title">{story.title}</h3>
              <p className="story-date">Created on: {formatDate(story.createdAt)}</p>
              <p className="story-excerpt">{story.content.substring(0, 100)}...</p>
              <div className="story-stats">
                <span><FontAwesomeIcon icon={faHeart} /> {story.likes ? story.likes.length : 0}</span>
                <span><FontAwesomeIcon icon={faComment} /> {story.contributions ? story.contributions.length : 0}</span>
              </div>
              <div className="story-actions">
                <Link to={`/stories/${story._id}`} className="view-btn">
                  <FontAwesomeIcon icon={faEye} /> View
                </Link>
                <button onClick={() => handleDeleteClick(story._id)} className="delete-btn">
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyStories;
