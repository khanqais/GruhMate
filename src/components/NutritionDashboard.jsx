// NutritionDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";
import {
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import "./NutritionDashboard.css";

const COLORS = [
  "#10b981", 
  "#3b82f6", 
  "#f59e0b", 
  "#ef4444", 
];

const confidenceColors = {
  high: "#10b981",
  medium: "#f59e0b",
  low: "#ef4444"
};

const proteinSourceColors = {
  veg: "#10b981",
  vegan: "#3b82f6",
  nonveg: "#8b5cf6"
};

const NutritionDashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setData({ error: true, message: "Not authenticated" });
          return;
        }
        
        const res = await axios.get(
          "http://localhost:5000/api/nutrition/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error("Nutrition fetch failed:", err.response?.data || err.message);
        setData({ error: true, message: err.response?.data?.message || err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchNutrition();
  }, []);

  if (loading) {
    return (
      <div className="nutrition-dashboard p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse loading-skeleton">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dashboard-grid">
              <div className="h-64 bg-gray-200 rounded dashboard-card"></div>
              <div className="h-64 bg-gray-200 rounded dashboard-card"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="nutrition-dashboard p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="dashboard-card p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                  <p className="text-red-700 mt-1">{data.message || "Please try again later"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Fiber", value: data.totals.fiber, color: COLORS[0] },
    { name: "Protein", value: data.totals.protein, color: COLORS[1] },
    { name: "Vitamins", value: data.totals.vitamins, color: COLORS[2] },
    { name: "Processed", value: data.totals.processed, color: COLORS[3] }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-gray-600">Value: {payload[0].value}</p>
          <p className="text-sm text-gray-500">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value}: {pieData[index]?.value || 0}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const vitalityScoreColor = data.vitalityScore >= 80 ? "text-emerald-600" :
                           data.vitalityScore >= 60 ? "text-amber-600" :
                           "text-red-600";

  const vitalityScoreBg = data.vitalityScore >= 80 ? "bg-emerald-500" :
                         data.vitalityScore >= 60 ? "bg-amber-500" :
                         "bg-red-500";

  return (
    <>
      <div className="nutrition-dashboard p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Household Nutrition Analytics
                </h1>
              </div>
              {currentUser && (
                <div className="text-sm text-gray-600">
                  Welcome, {currentUser.name || currentUser.email}
                </div>
              )}
            </div>
            <p className="text-gray-600">Comprehensive overview of your household's nutritional health</p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 dashboard-grid">
            {/* Vitality Score Card */}
            <div className="dashboard-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                  Vitality Score
                </h2>
                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${vitalityScoreColor} mb-4`}>
                  {data.vitalityScore}
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full vitality-score-progress ${vitalityScoreBg}`}
                    style={{ width: `${data.vitalityScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {data.vitalityScore >= 80 ? "Excellent nutrition balance!" :
                   data.vitalityScore >= 60 ? "Good, with room for improvement" :
                   "Needs attention for better health"}
                </p>
              </div>
            </div>

            {/* Nutrition Distribution Card */}
            <div className="dashboard-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <HeartIcon className="h-6 w-6 text-pink-500 mr-2" />
                  Nutrition Distribution
                </h2>
                <span className="text-sm font-medium text-gray-600">
                  Total Items: {pieData.reduce((sum, item) => sum + item.value, 0)}
                </span>
              </div>
              <div className="flex flex-col lg:flex-row items-center lg:items-start">
                <div className="w-full lg:w-1/2 pie-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 mt-6 lg:mt-0 lg:pl-6">
                  <CustomLegend payload={pieData.map(item => ({
                    color: item.color,
                    value: item.name
                  }))} />
                  <div className="mt-8 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Protein Sources Breakdown
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(data.proteinSources).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: proteinSourceColors[key] }}
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key === "veg" ? "Vegetarian" : key === "nonveg" ? "Non-Vegetarian" : "Vegan"}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence & Suggestions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dashboard-grid">
            {/* Confidence Bands Card */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-2" />
                  Data Confidence Levels
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  Accuracy Assessment
                </span>
              </div>
              <div className="space-y-4">
                {Object.entries(data.confidence).map(([level, count]) => (
                  <div key={level} className="confidence-item p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: confidenceColors[level] }}
                        />
                        <div>
                          <span className="font-medium text-gray-900 capitalize">
                            {level} Confidence
                          </span>
                          <p className="text-sm text-gray-600">
                            {level === "high" ? "Accurate nutritional data" :
                             level === "medium" ? "Estimated values" :
                             "Manual entry required"}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Suggestions Card */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <LightBulbIcon className="h-6 w-6 text-amber-500 mr-2" />
                  Health Coach Suggestions
                </h3>
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                {data.suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-card p-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800">{suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 dashboard-grid">
            {pieData.map((item, index) => {
              const total = pieData.reduce((sum, i) => sum + i.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              
              return (
                <div key={item.name} className="stat-card bg-white p-4 rounded-xl shadow">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    <div className="text-sm text-gray-600">
                      {percentage}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NutritionDashboard;