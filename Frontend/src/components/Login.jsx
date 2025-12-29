import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chef } from '../assets/images';
import { useAuth } from '../context/AuthContext';  
const API_URL = import.meta.env.VITE_API_URL;


const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    phone: '',
    password: ''
  });
  const [inValidCredentials, setInValidCredentials] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setInValidCredentials(false);
  console.log("Login payload: login.jsx mein hu", { phone: formData.phone, password: formData.password });


  if (validateForm()) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // only phone + password
      });

      const data = await res.json();
      console.log("Login response:", data); // ✅ see token + user here

      if (res.ok) {
        // ✅ use token + user from response, not formData
        login(data.user, data.token);
        // navigate("/dashboard");
        navigate("/stockform");  
      } else {
        setInValidCredentials(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setInValidCredentials(true);
    }
  } else {
    setInValidCredentials(true);
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-blue-50 to-blue-400">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left side - Image/Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-8 animate-slideInLeft">
          <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img 
              src={chef} 
              alt="GruhMate Chef" 
              className="w-48 h-48 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 animate-slideInRight">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Login</h2>

            {/* Phone Input */}
            <div className="space-y-2">
              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-6 py-3 bg-blue-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm font-medium ml-4">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-6 py-3 bg-blue-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="text-red-500 text-sm font-medium ml-4">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/forgotpwd')}
                className="text-gray-600 hover:text-blue-700 text-sm transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              LOGIN
            </button>

            {/* Error Message */}
            {inValidCredentials && (
              <p className="text-red-500 text-center font-medium">
                Invalid phone or password
              </p>
            )}

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-500 text-sm">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create your account
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
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
          animation: slideInLeft 1s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;