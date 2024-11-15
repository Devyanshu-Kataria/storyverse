import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEdit, faTrash, faPaperPlane, faComment } from '@fortawesome/free-solid-svg-icons';
import './StoryDetail.css';

function StoryDetail() {
  const [story, setStory] = useState(null);
  const [newContribution, setNewContribution] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/stories/${id}`);
        setStory(res.data);
        setEditedContent(res.data.content);
      } catch (err) {
        console.error('Error fetching story:', err);
      }
    };
    fetchStory();
  }, [id]);

  const handleLike = async (type, itemId) => {
    if (!user) return;
    try {
      const endpoint = type === 'story' 
        ? `${process.env.REACT_APP_API_URL}/stories/${id}/like`
        : `${process.env.REACT_APP_API_URL}/stories/${id}/contributions/${itemId}/like`;
      await axios.post(endpoint, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const updatedStory = await axios.get(`${process.env.REACT_APP_API_URL}/stories/${id}`);
      setStory(updatedStory.data);
    } catch (err) {
      console.error('Error liking item:', err);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/stories/${id}`,
        { title: story.title, content: editedContent },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setIsEditing(false);
      const updatedStory = await axios.get(`${process.env.REACT_APP_API_URL}/stories/${id}`);
      setStory(updatedStory.data);
      // Add a success notification here if you have a notification system
    } catch (err) {
      console.error('Error editing story:', err.response ? err.response.data : err);
      // Display an error message to the user
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/stories/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        navigate('/stories');
      } catch (err) {
        console.error('Error deleting story:', err);
      }
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/stories/${id}/contribute`,
        { content: newContribution },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setNewContribution('');
      const updatedStory = await axios.get(`${process.env.REACT_APP_API_URL}/stories/${id}`);
      setStory(updatedStory.data);
    } catch (err) {
      console.error('Error contributing to story:', err);
    }
  };

  const handleDeleteContribution = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/stories/${id}/contributions/${contributionId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const updatedStory = await axios.get(`${process.env.REACT_APP_API_URL}/stories/${id}`);
        setStory(updatedStory.data);
      } catch (err) {
        console.error('Error deleting contribution:', err);
      }
    }
  };

  if (!story) return <div className="loading">Loading...</div>;

  return (
    <div className="story-detail">
      <div className="story-card">
        <div className="story-header">
          <img src={`https://ui-avatars.com/api/?name=${story.author.name}&background=random`} alt={story.author.name} className="author-avatar" />
          <div className="story-info">
            <h2>{story.title}</h2>
            <p>By {story.author.name} • {new Date(story.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="story-content">
          {isEditing ? (
            <textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)}
              className="edit-content"
            />
          ) : (
            <p>{story.content}</p>
          )}
        </div>
        <div className="story-actions">
          <button onClick={() => handleLike('story', story._id)} className={`action-button ${story.likes.includes(user?._id) ? 'liked' : ''}`}>
            <FontAwesomeIcon icon={faHeart} /> {story.likes.length}
          </button>
          <button className="action-button">
            <FontAwesomeIcon icon={faComment} /> {story.contributions.length}
          </button>
          {user && user._id === story.author._id && (
            <>
              {isEditing ? (
                <>
                  <button onClick={handleEdit} className="action-button">Save</button>
                  <button onClick={() => setIsEditing(false)} className="action-button">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="action-button">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button onClick={handleDelete} className="action-button">
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="contributions-section">
        <h3>Contributions</h3>
        {story.contributions.map((contribution) => (
          <div key={contribution._id} className="contribution-card">
            <div className="contribution-header">
              <img src={`https://ui-avatars.com/api/?name=${contribution.author.name}&background=random`} alt={contribution.author.name} className="author-avatar" />
              <div className="contribution-info">
                <p className="author-name">{contribution.author.name}</p>
                <p className="contribution-date">{new Date(contribution.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="contribution-content">{contribution.content}</p>
            <div className="contribution-actions">
              <button onClick={() => handleLike('contribution', contribution._id)} className={`action-button ${contribution.likes.includes(user?._id) ? 'liked' : ''}`}>
                <FontAwesomeIcon icon={faHeart} /> {contribution.likes.length}
              </button>
              {user && user._id === contribution.author._id && (
                <button onClick={() => handleDeleteContribution(contribution._id)} className="action-button">
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleContribute} className="contribute-form">
          <textarea 
            value={newContribution} 
            onChange={(e) => setNewContribution(e.target.value)}
            placeholder="Write a contribution..."
            className="contribute-input"
          />
          <button type="submit" className="submit-contribution">
            <FontAwesomeIcon icon={faPaperPlane} /> Contribute
          </button>
        </form>
      )}
    </div>
  );
}

export default StoryDetail;
