import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [codeCopied, setCodeCopied] = useState(false);

  const loggedInUserId = currentUser?._id;

  useEffect(() => {
    if (loggedInUserId) {
      fetchTeamDetails();
    }
  }, [teamId, loggedInUserId]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/team/${teamId}`);
      const data = await res.json();
      if (res.ok) {
        setTeam(data.team);
        setPendingRequests(data.pendingRequests || []);
      } else {
        setMessage(data.error || "Failed to fetch team details");
      }
    } catch (err) {
      setMessage("Server error");
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      const res = await fetch("http://localhost:5000/api/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, adminId: loggedInUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Member accepted successfully!");
        fetchTeamDetails();
      } else {
        setMessage(data.error || "Failed to accept");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };
const handleDeleteTeam = async () => {
  if (!window.confirm(`Are you sure you want to DELETE the entire team "${team.name}"? This action cannot be undone and will remove all members.`)) {
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
      
      const updatedUser = { ...currentUser, team: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => navigate("/teams"), 1500);
    } else {
      setMessage(data.error || "Failed to delete team");
    }
  } catch (err) {
    setMessage("Server error");
    console.error("Delete team error:", err);
  }
};

  const handleReject = async (inviteId) => {
    try {
      const res = await fetch("http://localhost:5000/api/team/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, adminId: loggedInUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Request rejected");
        fetchTeamDetails();
      } else {
        setMessage(data.error || "Failed to reject");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch("http://localhost:5000/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: loggedInUserId,
          memberId,
          teamId: team._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Member removed successfully");
        fetchTeamDetails();
      } else {
        setMessage(data.error || "Failed to remove member");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    try {
      const res = await fetch("http://localhost:5000/api/team/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Successfully left the team");
        setTimeout(() => navigate("/teams"), 1500);
      } else {
        setMessage(data.error || "Failed to leave team");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Team not found</div>
      </div>
    );
  }

  if (!team.admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Invalid team data - admin not found</div>
      </div>
    );
  }

  const isAdmin = team.admin._id === loggedInUserId;
  const isMember = team.members?.some((m) => m._id === loggedInUserId) || false;

  return (
    <div className="min-h-screen bg-gradient-to-from-purple-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h1>
              
              {isAdmin && (
                <div className="bg-gradient-to-from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 mt-3 max-w-md">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">
                    🔑 Team Invite Code (Share with members)
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-2xl text-indigo-600 tracking-wider">
                      {team.code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-semibold flex items-center gap-2"
                    >
                      {codeCopied ? (
                        <>
                          <span>✓</span> Copied!
                        </>
                      ) : (
                        <>
                          <span>📋</span> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

           <div className="flex gap-3">
  {isAdmin && (
    <>
      <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold h-fit">
        👑 Admin
      </span>
      <button
        onClick={handleDeleteTeam}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition h-fit font-semibold flex items-center gap-2"
      >
        🗑️ Delete Team
      </button>
    </>
  )}
  {isMember && !isAdmin && (
    <button
      onClick={handleLeaveTeam}
      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition h-fit"
    >
      Leave Team
    </button>
  )}
</div>

          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
            <span>👤 Admin: <strong>{team.admin?.name || 'Unknown'}</strong></span>
            <span>👥 <strong>{team.members?.length || 0}</strong> Member{team.members?.length !== 1 ? 's' : ''}</span>
            {team.createdAt && (
              <span>📅 Created: {new Date(team.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>ℹ️</span>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === "members"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👥 Members ({team.members?.length || 0})
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 px-6 py-4 font-semibold transition relative ${
                  activeTab === "requests"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🔔 Pending Requests 
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === "members" && (
              <div className="space-y-4">
                {!team.members || team.members.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No members yet</p>
                ) : (
                  team.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {member.name || 'Unknown'}
                            {member._id === team.admin._id && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
                                👑 Admin
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">📞 {member.phone || 'N/A'}</p>
                        </div>
                      </div>
                      {isAdmin && member._id !== team.admin._id && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-semibold"
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && isAdmin && (
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500 text-lg">No pending requests</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Share your team code to invite members
                    </p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                          {request.userId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {request.userId?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.userId?.phone || 'N/A'}
                          </p>
                          {request.createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(request.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition font-semibold shadow-md flex items-center gap-2"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition font-semibold shadow-md flex items-center gap-2"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/teams")}
          className="mt-6 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold shadow-md"
        >
          ← Back to Teams
        </button>
      </div>
    </div>
  );
};

export default TeamDetail;
