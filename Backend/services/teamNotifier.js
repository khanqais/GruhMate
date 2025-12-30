import Team from "../models/Team.js";
import User from "../models/user.js";
import { sendWhatsApp } from "./whatsappService.js";

export const notifyTeam = async (teamId, message) => {
  try {
    console.log("🔔 Attempting to notify team:", teamId);
    
    const team = await Team.findById(teamId).populate("members");
    
    if (!team) {
      console.log("❌ Team not found!");
      return;
    }
    
    console.log(`✅ Team found: ${team.name} with ${team.members.length} members`);
    
    for (const member of team.members) {
      if (member.phone) {
        try {
          console.log(`📞 Sending to ${member.name} (${member.phone})`);
          await sendWhatsApp(member.phone, message);
        } catch (err) {
          console.error(`❌ Failed to send to ${member.name}:`, err.message);
          
        }
      } else {
        console.log(`⚠️ ${member.name} has no phone number`);
      }
    }
    
    console.log("✅ Notification process completed!");
  } catch (err) {
    console.error("❌ notifyTeam error:", err.message);
    throw err; // Re-throw so the route can handle it
  }
};
