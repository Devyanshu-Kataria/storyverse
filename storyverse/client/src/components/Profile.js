import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { user, loading } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user && !loading) {
      setError('Please log in to view your profile.');
    }
  }, [user, loading]);

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return null;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
}

export default Profile;
