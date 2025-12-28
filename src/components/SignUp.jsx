import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chef } from '../assets/images';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSendOtp = async () => {
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      setErrors({ ...errors, phone: 'Enter valid 10-digit phone number' });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password
        })
      });
      if (res.ok) {
        setOtpSent(true);
        alert('OTP sent to your phone!');
      } else {
        const data = await res.json();
        alert(data.message || 'Error sending OTP');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setErrors({ ...errors, otp: 'Enter OTP' });
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: formData.otp })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
        alert('OTP verified successfully!');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  const handleCreateAccount = () => {
    alert('Account created successfully! You can now login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-blue-50 to-blue-400 py-8">
      <div className="flex w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-6 animate-slideInLeft">
          <div className="text-center">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <img src={chef} alt="GruhMate Chef" className="w-40 h-40 rounded-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Join GruhMate</h3>
            <p className="text-sm text-gray-600">Start managing your kitchen smarter</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 animate-slideInRight">
          <form className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 text-sm mt-1">Sign up to manage your kitchen inventory</p>
            </div>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm"
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-full mt-4"
              >
                Send OTP
              </button>
            )}

            {otpSent && !otpVerified && (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-5 py-2.5 bg-gray-50 border border-gray-300 rounded-full text-sm text-center tracking-widest"
                />
                {errors.otp && <p className="text-red-500 text-xs">{errors.otp}</p>}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full py-2.5 bg-green-600 text-white font-bold rounded-full mt-4"
                >
                  Verify OTP
                </button>
              </>
            )}

            {otpVerified && (
              <button
                type="button"
                onClick={handleCreateAccount}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-full mt-4"
              >
                Verify & Create Account
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-xs">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
