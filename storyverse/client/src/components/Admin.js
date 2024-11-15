import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './Admin.css';
import { AuthContext } from '../contexts/AuthContext';
import { Modal, Button, Spinner, Table, Alert } from 'react-bootstrap';

function Admin() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorStories, setErrorStories] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '', action: null });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
      fetchStories();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorUsers('Failed to fetch users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await axios.get('/admin/stories');
      setStories(res.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setErrorStories('Failed to fetch stories.');
    } finally {
      setLoadingStories(false);
    }
  };

  const handleDeleteUser = (id, name) => {
    setModalContent({
      title: 'Confirm Delete User',
      body: `Are you sure you want to delete the user "${name}"? This action cannot be undone.`,
      action: () => deleteUser(id),
    });
    setShowModal(true);
  };

  const handlePromoteUser = (id, name) => {
    setModalContent({
      title: 'Confirm Promote User',
      body: `Are you sure you want to promote "${name}" to Admin?`,
      action: () => promoteUser(id),
    });
    setShowModal(true);
  };

  const handleDeleteStory = (id, title) => {
    setModalContent({
      title: 'Confirm Delete Story',
      body: `Are you sure you want to delete the story "${title}"? This action cannot be undone.`,
      action: () => deleteStory(id),
    });
    setShowModal(true);
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/admin/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      alert('User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
    } finally {
      setShowModal(false);
    }
  };

  const promoteUser = async (id) => {
    try {
      await axios.put(`/admin/users/${id}/promote`);
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, isAdmin: true } : user
        )
      );
      alert('User promoted to admin successfully.');
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user.');
    } finally {
      setShowModal(false);
    }
  };

  const deleteStory = async (id) => {
    try {
      await axios.delete(`/admin/stories/${id}`);
      setStories(stories.filter((story) => story._id !== id));
      alert('Story deleted successfully.');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story.');
    } finally {
      setShowModal(false);
    }
  };

  if (!user?.isAdmin) {
    return <div className="admin-container"><h2>Access Denied</h2></div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      {/* Manage Users Section */}
      <section>
        <h2>Manage Users</h2>
        {loadingUsers ? (
          <Spinner animation="border" />
        ) : errorUsers ? (
          <Alert variant="danger">{errorUsers}</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((usr) => (
                <tr key={usr._id}>
                  <td>{usr.name}</td>
                  <td>{usr.email}</td>
                  <td>{usr.isAdmin ? 'Yes' : 'No'}</td>
                  <td>
                    {!usr.isAdmin && (
                      <Button variant="success" size="sm" onClick={() => handlePromoteUser(usr._id, usr.name)}>
                        Promote to Admin
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => handleDeleteUser(usr._id, usr.name)}>
                      Delete User
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {/* Manage Stories Section */}
      <section>
        <h2>Manage Stories</h2>
        {loadingStories ? (
          <Spinner animation="border" />
        ) : errorStories ? (
          <Alert variant="danger">{errorStories}</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story._id}>
                  <td>{story.title}</td>
                  <td>{story.author.name}</td>
                  <td>{new Date(story.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteStory(story._id, story.title)}>
                      Delete Story
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={modalContent.action}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Admin;
