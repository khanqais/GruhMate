import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { chef } from '../assets/images';
const API_URL = import.meta.env.VITE_API_URL;


const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP, 3: Set new password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Update this with your backend URL
  

  // Timer for OTP resend
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phoneNumber)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  };

  const validateOTP = (otpValue) => {
    const otpRegex = /^[0-9]{6}$/;
    if (!otpValue) {
      return 'OTP is required';
    }
    if (!otpRegex.test(otpValue)) {
      return 'Please enter a valid 6-digit OTP';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const phoneError = validatePhone(phone);
    
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formattedPhone = `+91${phone}`;
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        phone: formattedPhone
      });

      setLoading(false);
      setStep(2);
      setTimer(30);
      setCanResend(false);
      
      // Optional: Show success message
      console.log('Success:', response.data.message);
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrors({ phone: errorMessage });
      console.error('Phone submit error:', error);
    }
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    const otpError = validateOTP(otp);
    
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setLoading(true);
    
    
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      setErrors({});
    }, 500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    const confirmError = newPassword !== confirmPassword ? 'Passwords do not match' : '';

    if (passwordError || confirmError) {
      setErrors({ 
        newPassword: passwordError,
        confirmPassword: confirmError
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formattedPhone = `+91${phone}`;
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        phone: formattedPhone,
        code: otp,
        newPassword: newPassword
      });

      setLoading(false);
      alert(response.data.message || 'Password reset successfully! You can now login with your new password.');
      navigate('/login');
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrors({ newPassword: errorMessage });
      console.error('Password reset error:', error);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    
    try {
      const formattedPhone = `+91${phone}`;
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        phone: formattedPhone
      });

      setLoading(false);
      setTimer(30);
      setCanResend(false);
      alert('OTP has been resent to your phone');
    } catch (error) {
      setLoading(false);
      alert('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', error);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
     
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={chef} 
                alt="GruhMate Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">GruhMate</span>
            </Link>

          
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </header>

     
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">🔒</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 1 && 'Reset Your Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'Set New Password'}
              </h1>
              <p className="text-gray-600 mt-2">
                {step === 1 && 'Enter your phone number to receive OTP'}
                {step === 2 && 'Enter the 6-digit OTP sent to your phone'}
                {step === 3 && 'Create a new password for your account'}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center mb-8 relative">
              <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10"></div>
              <div 
                className={`absolute top-4 left-0 h-1 -z-10 transition-all duration-300 ${
                  step === 3 ? 'w-full bg-green-500' : step === 2 ? 'w-1/2 bg-blue-500' : 'w-0 bg-blue-500'
                }`}
              ></div>
              
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === stepNumber
                      ? 'bg-blue-600 text-white'
                      : step > stepNumber
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNumber ? '✓' : stepNumber}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {stepNumber === 1 && 'Phone'}
                    {stepNumber === 2 && 'Verify'}
                    {stepNumber === 3 && 'Reset'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Enter Phone */}
            {step === 1 && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-500">📱</div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit phone number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all ${
                    loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {step === 2 && (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-2">
                    Enter 6-digit OTP *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`flex-1 text-center text-2xl tracking-widest px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.otp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={6}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-2">{errors.otp}</p>
                  )}
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      OTP sent to: <span className="font-medium">+91 ******{phone.slice(-4)}</span>
                    </p>
                    <div className="mt-2">
                      {timer > 0 ? (
                        <p className="text-sm text-gray-500">
                          Resend OTP in <span className="font-medium">{formatTimer(timer)}</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={!canResend || loading}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all ${
                    loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                      setOtp('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-2">{errors.newPassword}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">Must be at least 6 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">💡</span>
                    <div>
                      <p className="text-sm text-green-800 font-medium">Password Tips:</p>
                      <ul className="text-xs text-green-700 mt-1 space-y-1">
                        <li>• Use at least 6 characters</li>
                        <li>• Include numbers for strength</li>
                        <li>• Avoid common words</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg transition-all ${
                    loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      setErrors({});
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Back to OTP Verification
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Need help?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-gray-400">© 2025 GruhMate. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-1">Password Recovery System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
