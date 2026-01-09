import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // To show password mismatch error

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // 2. Send Register Request to Backend
      const { data } = await axios.post(
        'http://localhost:5000/api/users',
        { name, email, password },
        config
      );

      // 3. Login immediately (Save Token)
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      alert('Registration Successful!');
      navigate('/'); 
      window.location.reload();
      
    } catch (error) {
      alert('Error: User likely already exists');
    }
  };

  return (
    <Container>
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          <h1 className="my-3">Sign Up</h1>
          
          {message && <div className="alert alert-danger">{message}</div>}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId='email'>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId='confirmPassword'>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='primary'>
              Register
            </Button>
          </Form>

          <Row className='py-3'>
            <Col>
              Have an Account? <Link to='/login'>Login</Link>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterScreen;