import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import Footer from "./Footer";

const NutritionDashboard = () => {
  const { currentUser } = useAuth();
  const [vitality, setVitality] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const teamId = currentUser?.team;

  useEffect(() => {
    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [vitalityRes, recsRes, analyticsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/nutrition/vitality/${teamId}`),
        axios.get(`http://localhost:5000/api/nutrition/recommendations/${teamId}`),
        axios.get(`http://localhost:5000/api/nutrition/analytics/${teamId}`)
      ]);
      
      setVitality(vitalityRes.data);
      setRecommendations(recsRes.data.recommendations || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Error fetching nutrition data:", err);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    try {
      await axios.post(`http://localhost:5000/api/nutrition/vitality/${teamId}/calculate`);
      fetchData();
      alert("✅ Vitality score recalculated!");
    } catch (err) {
      alert("Failed to recalculate");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return "📈";
    if (trend === 'declining') return "📉";
    return "➡️";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nutrition Analytics</h1>
            <p className="text-gray-600 mt-2">Your household's health intelligence dashboard</p>
          </div>
          <button 
            onClick={recalculate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Recalculate</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading nutrition data...</p>
            </div>
          </div>
        ) : !vitality ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-yellow-800">No Nutrition Data Yet</h3>
            <p className="text-yellow-700 mt-2">Start adding items to track your household's nutrition!</p>
          </div>
        ) : (
          <>
            {/* Vitality Score Card */}
            <div className={`rounded-xl p-8 mb-8 ${getScoreColor(vitality.currentScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-wide mb-2">
                    Household Vitality Score
                  </h2>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold">{vitality.currentScore}</span>
                    <span className="text-2xl ml-2">/100</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl">{getTrendIcon(vitality.trend)}</span>
                    <span className="text-lg capitalize font-medium">{vitality.trend}</span>
                  </div>
                </div>
                <div className="text-8xl opacity-20">🏥</div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                ['Fresh Food', vitality.breakdown.freshFoodScore, 25, '🥗'],
                ['Balance', vitality.breakdown.nutritionBalanceScore, 25, '⚖️'],
                ['Variety', vitality.breakdown.varietyScore, 25, '🌈'],
                ['Micronutrients', vitality.breakdown.micronutrientScore, 25, '💊']
              ].map(([title, score, max, icon]) => (
                <div key={title} className="bg-white rounded-lg p-6 border shadow-sm">
                  <div className="text-3xl mb-2">{icon}</div>
                  <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
                  <div className="flex items-baseline mt-2">
                    <span className="text-3xl font-bold">{score}</span>
                    <span className="text-gray-500 ml-1">/{max}</span>
                  </div>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(score / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">💡 Smart Recommendations</h2>
                <div className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <div 
                      key={i}
                      className={`rounded-lg p-6 border-l-4 ${
                        rec.priority === 'urgent' ? 'bg-red-50 border-red-500' :
                        rec.priority === 'normal' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{rec.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                          <p className="text-gray-700 mb-3">{rec.message}</p>
                          {rec.suggestedItems && rec.suggestedItems.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Suggested items:</p>
                              <div className="flex flex-wrap gap-2">
                                {rec.suggestedItems.map((item, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-3 py-1 bg-white rounded-full text-sm border"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Distribution */}
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <h2 className="text-2xl font-bold mb-4">📊 Food Category Distribution</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(vitality.categoryDistribution)
                  .filter(([_, value]) => value > 0)
                  .map(([category, percentage]) => (
                    <div key={category} className="text-center">
                      <div className="text-3xl mb-2">
                        {category === 'vegetables' ? '🥬' :
                         category === 'fruits' ? '🍎' :
                         category === 'protein' ? '🥚' :
                         category === 'dairy' ? '🥛' :
                         category === 'grains' ? '🌾' :
                         category === 'processed' ? '📦' :
                         category === 'snacks' ? '🍿' : '🍽️'}
                      </div>
                      <div className="text-2xl font-bold">{percentage}%</div>
                      <div className="text-sm text-gray-600 capitalize">{category}</div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NutritionDashboard;
