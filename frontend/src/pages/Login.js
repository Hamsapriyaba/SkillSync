import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [message, setMessage] = useState('');

  const firebase = useFirebase();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      setMessage("Email and password are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(loginData.email)) {
      setMessage("Invalid email format.");
      return;
    }

    try {
      const result = await firebase.signinUserWithEmailAndPassword(loginData.email, loginData.password);
      navigate("/");
      console.log("Successful", result);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";

      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }

      setMessage(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await firebase.signinWithGoogle();
      navigate("/");
      console.log("Google Sign-In Successful", result);
    } catch (error) {
      setMessage("Google Sign-In failed. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await firebase.sendPReset(loginData.email);
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Failed to send password reset email.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pt-12">
      <div className="bg-white p-10 rounded-lg shadow-md border border-gray-300 max-w-md w-full relative">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#00F020]">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginData.email}
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
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00F020]"
              required
            />
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700">Remember Me</label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[#00F020] hover:underline text-sm"
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="w-full border border-[#00F020] text-[#00F020] py-3 rounded-md hover:bg-green-600 transition duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full border border-[#00F020] text-[#00F020] py-3 rounded-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
          >
            <FcGoogle className="text-2xl mr-2" />
            Sign in with Google
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <a href="/register" className="text-[#00F020] hover:underline">
              Register
            </a>
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

export default Login;
