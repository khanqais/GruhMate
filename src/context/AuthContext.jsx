import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Function to refresh user data from backend
  const refreshUserData = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/${userId}`);
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update teamId in localStorage if exists
        if (updatedUser.team) {
          localStorage.setItem("teamId", updatedUser.team);
        }
        
        console.log("✅ User data refreshed:", updatedUser);
      }
    } catch (err) {
      console.error("❌ Failed to refresh user data:", err);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userStr && token) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      // Save teamId separately if present
      if (user.team) {
        localStorage.setItem("teamId", user.team);
      }

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      // ✅ Refresh user data from backend to get latest team info
      if (user._id) {
        refreshUserData(user._id);
      }
    }

    setLoading(false);
  }, []);

  const login = (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    setCurrentUser(user);
    
    // ✅ Refresh user data after login
    if (user._id) {
      refreshUserData(user._id);
    }
  };

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common.Authorization;
    setCurrentUser(null);
  };

  if (loading) return <h1>Loading App...</h1>;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        refreshUserData, // ✅ Expose refresh function
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
