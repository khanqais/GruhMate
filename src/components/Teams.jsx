import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Teams = () => {
  const { currentUser, login } = useAuth(); 
  const loggedInUserId = currentUser?._id;
  
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [message, setMessage] = useState("");
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); 
  const navigate = useNavigate();

  const refreshUserData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/${loggedInUserId}`);
      const userData = await res.json();
      
      if (res.ok && userData) {
        const token = localStorage.getItem('token');
        login(userData, token); 
        return userData; 
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
      return null;
    }
  };

  const fetchMyTeam = async (userTeamId) => {
    try {
      if (!userTeamId) {
        setMyTeam(null);
        return;
      }

      const teamRes = await fetch(`http://localhost:5000/api/team/${userTeamId}`);
      const teamData = await teamRes.json();
      
      if (teamRes.ok && teamData.team) {
        setMyTeam(teamData.team);
      } else {
        setMyTeam(null);
      }
    } catch (err) {
      console.error("Error fetching my team:", err);
      setMyTeam(null);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      if (!loggedInUserId) {
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      
      const freshUserData = await refreshUserData();
      
      if (freshUserData?.team) {
        await fetchMyTeam(freshUserData.team);
      } else {
        setMyTeam(null);
      }
      
      setPageLoading(false);
    };

    initializePage();
  }, [loggedInUserId]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setMessage("Team name is required");
      return;
    }

    if (!loggedInUserId) {
      setMessage("Missing userId. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loggedInUserId, teamName }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.teamCode);
        setMessage(`Team "${teamName}" created successfully!`);
        setTeamName("");
        
        const freshUserData = await refreshUserData();
        if (freshUserData?.team) {
          await fetchMyTeam(freshUserData.team);
        }
      } else {
        setMessage(data.error || "Failed to create team");
      }
    } catch (err) {
      setMessage("Server error while creating team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      setMessage("Team code is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loggedInUserId, teamCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTeamCode("");
        
        await refreshUserData();
      } else {
        setMessage(data.error || "Failed to join team");
      }
    } catch (err) {
      setMessage("Server error while joining team");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  const handleDeleteMyTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete your team? This cannot be undone!")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/team/${teamId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: loggedInUserId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Team deleted successfully");
        
        await refreshUserData();
        setMyTeam(null);
      } else {
        setMessage(data.error || "Failed to delete team");
      }
    } catch (err) {
      setMessage("Server error while deleting team");
      console.error(err);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Team Management
        </h1>

        {myTeam && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Team</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-indigo-600">
                  {myTeam.name}
                </h3>
                <p className="text-gray-600 mt-2">
                  Code: <span className="font-mono font-bold text-lg">{myTeam.code}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  👥 {myTeam.members?.length || 0} member(s)
                </p>
                {myTeam.admin?._id === loggedInUserId && (
                  <p className="text-sm text-yellow-600 mt-1 font-semibold">
                    👑 You are the admin
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewTeam(myTeam._id)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
                >
                  View Details
                </button>
                {myTeam.admin?._id === loggedInUserId && (
                  <button
                    onClick={() => handleDeleteMyTeam(myTeam._id)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
                  >
                    🗑️ Delete Team
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!myTeam && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-800 font-semibold">
                You're not part of any team yet. Create a new team or join an existing one!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Create Team
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Start your own team</p>
                </div>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                />
                <button
                  onClick={handleCreateTeam}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
                >
                  {loading ? "Creating..." : "Create Team"}
                </button>
                {generatedCode && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 text-center">
                      Share this code:{" "}
                      <span className="font-mono font-bold text-lg block mt-2">
                        {generatedCode}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🤝</div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Join Team
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Enter team code to join</p>
                </div>
                <input
                  type="text"
                  placeholder="Enter team code"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 text-center font-mono text-lg"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinTeam}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 shadow-md"
                >
                  {loading ? "Sending Request..." : "Send Join Request"}
                </button>
              </div>
            </div>
          </>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 text-center">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ How it works</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">1.</span>
              <span><strong>Create a team</strong> if you want to be the admin, or <strong>join an existing team</strong> using a team code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">2.</span>
              <span>Team admins can <strong>accept/reject join requests</strong> and manage members</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">3.</span>
              <span>All team members get <strong>WhatsApp notifications</strong> for stock updates and team activities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold">4.</span>
              <span>You can only be part of <strong>one team at a time</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Teams;
