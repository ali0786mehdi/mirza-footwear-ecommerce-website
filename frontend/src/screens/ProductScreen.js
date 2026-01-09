import React, { useState, useEffect, useContext } from 'react'; // <--- Import useContext
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { CartContext } from '../context/CartContext'; // <--- Import Context

const ProductScreen = () => {
  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1); // State for Quantity
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get the addToCart function from Context
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`https://mirza-backend-123p.onrender.com/api/products${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    addToCart(product, qty); // <--- Call the function
    navigate('/cart'); // <--- Go to Cart Page
  };

  return (
    <>
      <Link className="btn btn-light my-3" to="/">Go Back</Link>
      <Row>
        <Col md={6}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
            <ListGroup.Item>Price: ₹{product.price}</ListGroup.Item>
            <ListGroup.Item>Description: {product.description}</ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col><strong>₹{product.price}</strong></Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>{product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</Col>
                </Row>
              </ListGroup.Item>

              {/* QUANTITY SELECTOR */}
              {product.countInStock > 0 && (
                <ListGroup.Item>
                  <Row>
                    <Col>Qty</Col>
                    <Col>
                      <Form.Control 
                        as='select' 
                        value={qty} 
                        onChange={(e) => setQty(e.target.value)}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}

              <ListGroup.Item>
                <Button 
                  onClick={addToCartHandler} // <--- CLICK EVENT
                  className="btn-block" 
                  type="button" 
                  disabled={product.countInStock === 0}
                >
                  Add to Cart
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductScreen;