// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { chef } from "../assets/images";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/nutrition", label: "Nutrition", icon: "🥗" },
    { path: "/compare", label: "Price Compare", icon: "💰" },
    { path: "/teams", label: "Teams", icon: "👥" },
    { path: "/stockform", label: "Add Stock", icon: "➕" },
    { path: "/buylist", label: "Buy List", icon: "🛒" },
  ];

  return (
    <div className="bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Main Header */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={chef} alt="logo" className="w-8 h-8" />
              <span className="font-bold text-xl text-gray-800">GruhMate</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    isActive(link.path)
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-right cursor-pointer hover:opacity-80"
              >
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">Family Account</p>
              </Link>

              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-lg">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t">
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive(link.path)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* Mobile User Section */}
                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{currentUser?.name || "User"}</p>
                      <p className="text-xs text-gray-500">View Profile</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
