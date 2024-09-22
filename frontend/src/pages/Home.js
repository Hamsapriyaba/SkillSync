// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate(); // useNavigate hook to navigate programmatically

  return (
    <div>
      <h2>Welcome to the Home Page!</h2>
      <p>This is the main landing page.</p>
      
      <div>
        <button 
          onClick={() => navigate('/register')} 
          style={{ marginRight: '10px' }}
        >
          Register
        </button>
        <button onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Home;
