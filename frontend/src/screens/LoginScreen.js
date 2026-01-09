import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Send Request to Backend
      const { data } = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password },
        config
      );

      // Save the "Wristband" (Token) in Browser Storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      alert('Login Successful!');
      navigate('/'); // Go to Home Page
      window.location.reload(); // Refresh to update Header
      
    } catch (error) {
      alert('Invalid Email or Password');
    }
  };

  return (
    <Container>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          <h1 className="my-3">Sign In</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='primary'>
              Sign In
            </Button>
          </Form>

          <Row className='py-3'>
            <Col>
              New Customer? <Link to='/register'>Register Here</Link>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;