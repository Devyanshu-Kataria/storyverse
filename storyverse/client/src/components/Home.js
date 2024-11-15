import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <Container className="home-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Welcome to StoryVerse</Card.Title>
              <Card.Text>
                Collaborate, create, and share your stories with a vibrant community.
              </Card.Text>
              <Button variant="primary" as={Link} to="/stories">
                Explore Stories
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
