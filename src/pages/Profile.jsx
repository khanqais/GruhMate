import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { currentUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!currentUser?.team) return;

        const res = await axios.get(
          `http://localhost:5000/api/team/${currentUser.team}`
        );

        setTeamMembers(res.data.team.members);
      } catch (err) {
        console.error(" Fetch team error:", err);
      }
    };

    fetchTeam();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      <div className="mb-6">
        <p><strong>Name:</strong> {currentUser?.name}</p>
        <p><strong>Email:</strong> {currentUser?.email}</p>
        <p><strong>Phone:</strong> {currentUser?.phone}</p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Team Members</h3>

      <ul className="list-disc pl-6">
        {teamMembers.map((member) => (
          <li key={member._id}>
            {member.name} ({member.phone})
          </li>
        ))}
      </ul>
    </div>
  );
}
