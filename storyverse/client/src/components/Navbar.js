import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css';
import { Container, Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4 py-2">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="me-auto">
          StoryVerse
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/stories">
              Stories
            </Nav.Link>
            <Nav.Link as={NavLink} to="/guidelines">
              Guidelines
            </Nav.Link>
            {user ? (
              <>
                {user.isAdmin && (
                  <Nav.Link as={NavLink} to="/admin">
                    Admin Panel
                  </Nav.Link>
                )}
                <Nav.Link as={NavLink} to="/mystories">
                  My Stories
                </Nav.Link>
                <Nav.Link as={NavLink} to="/create">
                  Create Story
                </Nav.Link>
                <Nav.Link as={NavLink} to="/profile">
                  Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout} className="ms-2">
                  Logout
                </Button>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login">
                Login/Register
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
