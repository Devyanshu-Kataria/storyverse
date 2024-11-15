import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './CreateStory.css';

function CreateStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/stories`, 
        { title, content },
        { headers: { 'x-auth-token': token } }
      );
      navigate('/stories');
    } catch (err) {
      console.error('Error creating story:', err.response ? err.response.data : err.message);
    }
  };

  if (!user) return <div>Please log in to create a story.</div>;

  return (
    <div className="create-story-container">
      <h1>Create a New Story</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Story Title" 
          className="story-title-input"
          required 
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your story here..."
          className="story-content-editor"
          required
        />
        <button type="submit" className="create-story-btn">Create Story</button>
      </form>
      <p className="guidelines-note">
        Before you start, please make sure to read our <Link to="/guidelines" className="guidelines-link">community guidelines</Link>.
      </p>
    </div>
  );
}

export default CreateStory;
