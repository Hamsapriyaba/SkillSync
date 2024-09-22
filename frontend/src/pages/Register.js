import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    CoalName: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const firebase = useFirebase();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!registerData.CoalName || !registerData.email || !registerData.password) {
      setMessage("All fields are required.");
      return;
    }

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(registerData.email)) {
      setMessage("Invalid email format.");
      return;
    }

    // Password validation
    if (registerData.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      const result = await firebase.addUser(registerData.CoalName, registerData.email, registerData.password);
      console.log("Successful", result);
      navigate("/");
    } catch (error) {
      // Handle specific registration errors from Firebase
      let errorMessage = 'Registration failed.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak.';
          break;
        default:
          errorMessage = 'Failed to register. Please try again.';
          break;
      }

      setMessage(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white pt-11">
      <div className="bg-white p-10 rounded-lg shadow-md border border-gray-300 max-w-md w-full relative">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#00F020]">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Name:</label>
            <input
              type="text"
              name="Name"
              placeholder="Enter Your Name"
              value={registerData.CoalName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00F020]"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00F020]"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={registerData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00F020]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#00F020] text-white py-3 rounded-md hover:bg-green-700 transition duration-200"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00F020] hover:underline">
              Login
            </Link>
          </p>
        </div>
        {message && (
          <div className="mt-4 text-center text-red-500">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;