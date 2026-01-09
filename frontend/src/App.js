import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';  
import React from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Import Header
import Footer from './components/Footer'; // Import Footer
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
const App = () => {
  return (
    <>
      <Header />  {/* Sit at the top forever */}
      
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/cart" element={<CartScreen />} />
          </Routes>
        </Container>
      </main>
      
      <Footer />  {/* Sit at the bottom forever */}
    </>
  );
};

export default App;