import React, { useContext } from 'react'; // <--- Import useContext
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap'; // <--- Import Badge
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // <--- Import Context

const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // Grab the cart items from the Context Cloud
  const { cartItems } = useContext(CartContext); 

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload();
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">Mirza Footwear</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              
              {/* CART LINK WITH BADGE */}
              <Nav.Link as={Link} to="/cart">
                 <i className="fas fa-shopping-cart"></i> Cart
                 {cartItems.length > 0 && (
                   <Badge pill bg="success" style={{ marginLeft: '5px' }}>
                     {cartItems.length}
                   </Badge>
                 )}
              </Nav.Link>

              {userInfo ? (
                <NavDropdown title={userInfo.name} id='username'>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-user"></i> Sign In
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;