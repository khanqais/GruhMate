import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chef } from '../assets/images';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // For demo purposes, just log the data
      console.log('Sign up form submitted:', formData);
      
      // Show success message and navigate to login
      alert('Account created successfully! You can now login.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-blue-50 to-blue-400 py-8">
      <div className="flex w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left side - Image/Illustration - Reduced height */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-6 animate-slideInLeft">
          <div className="text-center">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <img 
                src={chef} 
                alt="GruhMate Chef" 
                className="w-40 h-40 rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Join GruhMate</h3>
            <p className="text-sm text-gray-600">Start managing your kitchen smarter</p>
          </div>
        </div>

        {/* Right side - Sign Up Form - Reduced padding */}
        <div className="w-full md:w-1/2 p-6 md:p-8 animate-slideInRight">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 text-sm mt-1">
                Sign up to manage your kitchen inventory
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.name && (
                <p className="text-red-500 text-xs font-medium ml-3">{errors.name}</p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs font-medium ml-3">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium ml-3">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs font-medium ml-3">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions - Compact */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="terms"
                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:text-blue-800 text-xs">
                  Terms & Conditions
                </button>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm mt-4"
            >
              CREATE ACCOUNT
            </button>

            {/* Divider - Reduced spacing */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-500 text-xs">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Login to your account
              </button>
            </div>
          </form>

          {/* Back to Home Link - Smaller */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Tailwind CSS animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SignUp;