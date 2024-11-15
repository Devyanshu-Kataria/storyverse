import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComments } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../contexts/AuthContext';
import './StoryList.css';

function StoryList() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/stories`);
        setStories(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to fetch stories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleLike = async (storyId) => {
    if (!user) return; // Ensure user is logged in
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/stories/${storyId}/like`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setStories(stories.map(story => 
        story._id === storyId ? { ...story, likes: res.data.likes } : story
      ));
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="stories-page">
      <h1 className="stories-title">Explore Stories</h1>
      
      <div className="stories-container">
        {stories.map((story) => (
          <div key={story._id} className="story-card">
            <h2 className="story-title">{story.title}</h2>
            <p className="story-author">by {story.author?.name || 'Unknown'}</p>
            <p className="story-excerpt">{story.content?.substring(0, 100)}...</p>
            <div className="story-stats">
              <button onClick={() => handleLike(story._id)} className="like-button">
                <FontAwesomeIcon icon={faHeart} className={user && story.likes?.includes(user._id) ? 'liked' : ''} />
                <span>{story.likes?.length || 0}</span>
              </button>
              <span><FontAwesomeIcon icon={faComments} /> {story.contributions?.length || 0}</span>
            </div>
            <Link to={`/stories/${story._id}`} className="read-more-btn">Read More</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoryList;
