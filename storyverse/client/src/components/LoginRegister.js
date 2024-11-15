import React from 'react';
import { Link } from 'react-router-dom';
import './LoginRegister.css';

function LoginRegister() {
  return (
    <div className="login-register-container">
      <div className="login-register-card">
        <h2>Welcome to StoryVerse</h2>
        <p>Join our community of storytellers and readers!</p>
        <div className="auth-options">
          <a href={`${process.env.REACT_APP_API_URL}/auth/google`} className="google-auth-button">
            <img src="/google-icon.png" alt="Google Icon" className="google-icon" />
            Continue with Google
          </a>
        </div>
        <p className="terms">By continuing, you agree to StoryVerse's Terms of Service and Privacy Policy.</p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    </div>
  );
}

export default LoginRegister;
