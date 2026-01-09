import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <h1 className="text-center my-4">Latest Products</h1>
      <Row>
        {products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
            <Card className="my-3 p-3 rounded">
              {/* Make the image clickable */}
              <Link to={`/product/${product._id}`}>
                <Card.Img src={product.image} variant="top" style={{ height: '200px', objectFit: 'cover' }} />
              </Link>
              <Card.Body>
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'black' }}>
                  <Card.Title as="div">
                    <strong>{product.name}</strong>
                  </Card.Title>
                </Link>
                <Card.Text as="h3">₹{product.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default HomeScreen;