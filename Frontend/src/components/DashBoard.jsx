import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import Footer from "./Footer";
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [buyList, setBuyList] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expiringItems, setExpiringItems] = useState([]);
  
  const [vitalityScore, setVitalityScore] = useState(null);
  const [vitalityLoading, setVitalityLoading] = useState(true);

  const teamId = currentUser?.team;

  
  useEffect(() => {
    if (teamId) {
      axios
        .get(`${API_URL}/api/nutrition/vitality/${teamId}`)
        .then((res) => setVitalityScore(res.data.currentScore))
        .catch((err) => console.error("Failed to fetch vitality:", err));
    }
  }, [teamId]);

  
  const checkExpiringItems = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiring = stocks.filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate >= today && expiryDate <= threeDaysFromNow;
    });

    setExpiringItems(expiring);
  };
  const fetchVitalityScore = async () => {
  if (!teamId) return;
  
  try {
    setVitalityLoading(true);
    const res = await axios.get(
      `${API_URL}/api/nutrition/vitality/${teamId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }
    );
    setVitalityScore(res.data.currentScore);
  } catch (err) {
    console.error("Failed to fetch vitality:", err);
    setVitalityScore(null);
  } finally {
    setVitalityLoading(false);
  }
};


useEffect(() => {
  fetchVitalityScore();
}, [teamId]);


// ✅ Refetch after stock changes
useEffect(() => {
  if (stocks.length > 0) {
    // Delay to allow backend to recalculate
    const timer = setTimeout(() => {
      fetchVitalityScore();
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [stocks.length]); 


  // Fetch stock from backend
  const fetchStocks = async () => {
    try {
      setLoading(true);

      if (!teamId) {
        console.log("User has no team assigned");
        setStocks([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/stock/team/${teamId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks", err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Fetch BuyList to calculate monthly savings
  const fetchBuyList = async () => {
    try {
      if (!teamId) return;

      const res = await axios.get(
        `${API_URL}/api/stock/buylist/${teamId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBuyList(res.data);
    } catch (err) {
      console.error("Error fetching buylist:", err);
    }
  };


  useEffect(() => {
    fetchStocks();
    fetchBuyList();
  }, [refreshKey, teamId]);


  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [location.state]);


  // ✅ Check expiring items whenever stocks change
  useEffect(() => {
    if (stocks.length > 0) {
      checkExpiringItems();
    }
  }, [stocks]);


  // Status logic
  const getStatus = (quantity, requiredQuantity) => {
    if (quantity <= requiredQuantity * 0.3) return "critical";
    if (quantity <= requiredQuantity) return "low";
    return "normal";
  };


  // ✅ REAL Dashboard stats (no dummy data)
  const dashboardStats = {
    totalItems: stocks.length,
    lowStockCount: stocks.filter((s) => {
      const reqQty = s.consumptionRate || s.requiredQuantity || 0;
      return getStatus(s.quantity, reqQty) !== "normal";
    }).length,
    expiringSoon: expiringItems.length,
    monthlySavings: calculateMonthlySavings(),
  };


  // ✅ Calculate monthly savings
  function calculateMonthlySavings() {
    const estimatedSavingsPerItem = 50;
    const totalSavings = buyList.length * estimatedSavingsPerItem;

    const lowStockManaged = stocks.filter((s) => {
      const reqQty = s.consumptionRate || s.requiredQuantity || 0;
      return s.quantity > 0 && s.quantity <= reqQty;
    }).length;

    return Math.max(totalSavings, lowStockManaged * 100);
  }


  // ✅ Get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  // ✅ Handle decrease stock
  const handleDecrease = async (id, name) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/stock/${id}/decrement`,
        { userName: currentUser?.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );


      if (res.data.remove) {
        setStocks((prev) => prev.filter((s) => s._id !== id));
        alert(res.data.message);
        navigate("/buylist");
      } else {
        const updatedStock = res.data.stock;
        setStocks((prev) =>
          prev.map((s) =>
            s._id === id ? { ...s, quantity: updatedStock.quantity } : s
          )
        );
      }
    } catch (err) {
      console.error("Decrease error:", err);


      if (err.response?.status === 400) {
        alert(err.response?.data?.message || "Cannot decrease stock further");
      } else {
        alert("Failed to decrease stock");
      }
    }
  };


  // ✅ Handle increase stock
  const handleIncrease = async (id) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/stock/${id}/increment`,
        { userName: currentUser?.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );


      const updatedStock = res.data.stock;
      setStocks((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, quantity: updatedStock.quantity } : s
        )
      );
    } catch (err) {
      console.error("Increase error:", err);
      alert("Failed to increase stock");
    }
  };


  // ✅ Handle save expiry/consumption rate
  async function handleSave(item) {
    try {
      if (!item.tempExpiryDate && !item.tempConsumptionRate) {
        alert("Please fill at least one field");
        return;
      }


      const res = await axios.put(
        `${API_URL}/api/stock/${item._id}`,
        {
          expiryDate: item.tempExpiryDate,
          consumptionRate: item.tempConsumptionRate,
          userName: currentUser?.name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );


      // ✅ Update local state with the response data
      setStocks(stocks.map((s) => (s._id === item._id ? res.data : s)));


      alert("✅ Stock updated successfully!");
    } catch (err) {
      console.error("Error saving stock:", err);
      alert(err.response?.data?.error || "Update failed");
    }
  }


  // ✅ Handle delete stock
  const handleDelete = async (id, name) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${name}" from inventory?`
      );
      if (!confirmDelete) return;


      await axios.delete(`${API_URL}/api/stock/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { userName: currentUser?.name },
      });


      // Remove from state
      setStocks((prev) => prev.filter((s) => s._id !== id));
      alert(`✅ "${name}" has been deleted successfully`);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete item");
    }
  };


  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };


  if (!teamId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Team Assigned
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create or join a team first
          </p>
          <Link
            to="/teams"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Teams
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar */}

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your kitchen inventory and status
          </p>
        </div>


        {/* ✅ Expiring Items Alert Banner */}
        {expiringItems.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-bold">
                  {expiringItems.length} Item(s) Expiring Soon!
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  {expiringItems
                    .map((item) => {
                      const days = getDaysUntilExpiry(item.expiryDate);
                      return `${item.name} (${days} day${days !== 1 ? "s" : ""} left)`;
                    })
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            [
              "Total Items",
              dashboardStats.totalItems,
              "📦",
              "bg-blue-50",
              "text-blue-600",
            ],
            [
              "Low Stock Items",
              dashboardStats.lowStockCount,
              "⚠️",
              "bg-yellow-50",
              "text-yellow-600",
            ],
            [
              "Expiring Soon",
              dashboardStats.expiringSoon,
              "⏰",
              "bg-red-50",
              "text-red-600",
            ],
            [
              "Monthly Savings",
              `₹${dashboardStats.monthlySavings}`,
              "💰",
              "bg-green-50",
              "text-green-600",
            ],
          ].map(([title, value, icon, bgColor, textColor], i) => (
            <div
              key={i}
              className={`${bgColor} rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{title}</p>
                  <p className={`text-3xl font-bold mt-2 ${textColor}`}>
                    {value}
                  </p>
                </div>
                <div className="text-4xl">{icon}</div>
              </div>
            </div>
          ))}
        </div>


        {/* ✅ Nutrition Quick Link Card */}
        {/* Nutrition Quick Link Card */}
<div className="mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    <div className="flex items-center space-x-4">
      <div className="text-5xl sm:text-6xl">🥗</div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          Household Vitality Score
        </h3>
        <p className="text-gray-600 mt-1 text-sm">
          Track your nutrition, get personalized health recommendations
        </p>
        {vitalityLoading ? (
          <div className="mt-2 text-sm text-gray-500">
            Loading score...
          </div>
        ) : vitalityScore !== null ? (
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-3xl font-bold text-green-600">
              {vitalityScore}
            </span>
            <span className="text-gray-500">/100</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                vitalityScore >= 80
                  ? "bg-green-100 text-green-700"
                  : vitalityScore >= 60
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vitalityScore >= 80
                ? "✅ Excellent"
                : vitalityScore >= 60
                ? "⚠️ Good"
                : "🚨 Needs Improvement"}
            </span>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">
            No data yet - add items to start tracking
          </div>
        )}
      </div>
    </div>
    <Link
      to="/nutrition"
      className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 shadow-sm"
    >
      <span>View Nutrition Dashboard</span>
      <span>→</span>
    </Link>
  </div>
</div>



        {/* Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-bold">Stock Items</h2>
            <Link
              to="/stockform"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center"
            >
              + Add Item
            </Link>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Item Name
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Consumption Rate
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Available Quantity
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Unit
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Expiry
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>


              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <span>Loading stock...</span>
                      </div>
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-5xl mb-3">📦</div>
                        <p className="text-lg font-medium">No stock items added yet</p>
                        <Link
                          to="/stockform"
                          className="mt-3 text-blue-600 hover:underline"
                        >
                          Add your first item
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stocks.map((item) => {
                    const status = getStatus(
                      item.quantity,
                      item.consumptionRate || item.requiredQuantity || 0
                    );
                    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                    const isExpiring =
                      daysUntilExpiry !== null && daysUntilExpiry <= 3;


                    return (
                      <tr
                        key={item._id}
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          isExpiring ? "bg-red-50" : ""
                        }`}
                      >
                        {/* Item Name */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.brand && (
                            <div className="text-xs text-gray-500 mt-1">
                              Brand: {item.brand}
                            </div>
                          )}
                        </td>


                        {/* Consumption Rate */}
                        <td className="py-3 px-4 sm:px-6">
                          {item.consumptionRate ? (
                            <span className="capitalize text-gray-700">
                              {item.consumptionRate}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 text-xs">❌ Missing</span>
                              <select
                                value={item.tempConsumptionRate || ""}
                                onChange={(e) => {
                                  item.tempConsumptionRate = e.target.value;
                                  setStocks([...stocks]);
                                }}
                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="rarely">Rarely</option>
                              </select>
                            </div>
                          )}
                        </td>


                        {/* Available Quantity */}
                        <td className="py-3 px-4 sm:px-6">
                          <span className="font-bold text-gray-900">{item.quantity}</span>
                        </td>


                        {/* Unit */}
                        <td className="py-3 px-4 sm:px-6 text-gray-700">{item.unit}</td>


                        {/* Expiry */}
                        <td className="py-3 px-4 sm:px-6">
                          {item.expiryDate ? (
                            <div>
                              <div className="text-sm text-gray-700">
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </div>
                              {daysUntilExpiry !== null && (
                                <div
                                  className={`text-xs font-semibold mt-1 ${
                                    daysUntilExpiry <= 0
                                      ? "text-red-600"
                                      : daysUntilExpiry <= 3
                                      ? "text-orange-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {daysUntilExpiry <= 0
                                    ? "⚠️ Expired!"
                                    : daysUntilExpiry === 1
                                    ? "⚠️ Expires tomorrow"
                                    : `${daysUntilExpiry} days left`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 text-xs">❌ Missing</span>
                              <input
                                type="date"
                                value={item.tempExpiryDate || ""}
                                onChange={(e) => {
                                  item.tempExpiryDate = e.target.value;
                                  setStocks([...stocks]);
                                }}
                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          )}
                        </td>


                        {/* Status */}
                        <td className="py-3 px-4 sm:px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === "critical"
                                ? "bg-red-100 text-red-800"
                                : status === "low"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {status.toUpperCase()}
                          </span>
                        </td>


                        {/* Actions */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleDecrease(item._id, item.name)}
                              disabled={item.quantity === 0}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                item.quantity === 0
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-500 text-white hover:bg-red-600"
                              }`}
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncrease(item._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition-colors"
                              title="Increase quantity"
                            >
                              +
                            </button>
                            {(!item.expiryDate || !item.consumptionRate) && (
                              <button
                                onClick={() => handleSave(item)}
                                disabled={
                                  !item.tempExpiryDate && !item.tempConsumptionRate
                                }
                                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                title="Save missing data"
                              >
                                💾
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id, item.name)}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium transition-colors"
                              title="Delete item"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                        </tr>
                      );
                    })
                  )}
              </tbody>
            </table>
          </div>


          <div className="px-4 sm:px-6 py-4 bg-gray-50 text-sm text-gray-600">
            Showing {stocks.length} {stocks.length === 1 ? "item" : "items"}
          </div>
        </div>
      </main>


      <Footer />
    </div>
  );
};


export default Dashboard;
