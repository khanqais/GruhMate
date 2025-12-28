import Stock from "../models/Stock.js";
import { notifyTeam } from "./teamNotifier.js";

export const checkExpiringItems = async () => {
  try {
    console.log("🔍 Running smart expiry check...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Today: ${today.toLocaleDateString('en-IN')}`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString('en-IN')}\n`);

    // Get ALL stock items
    const allItems = await Stock.find({}).populate('teamId');
    
    let count30Day = 0;
    let count1Day = 0;
    let countExpired = 0;

    for (const item of allItems) {
      if (!item.expiryDate) continue; // Skip items without expiry date

      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      const diffTime = expiryDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // ✅ CASE 1: EXPIRED (daysLeft < 0)
      if (daysLeft < 0 && item.lastExpiryNotification !== 'expired') {
        try {
          await notifyTeam(
            item.teamId._id,
            `❌ EXPIRED ALERT!\n\n📦 Item: ${item.name}\n⏰ Expired: ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago\n📅 Expiry Date: ${expiryDate.toLocaleDateString('en-IN')}\n📊 Quantity: ${item.quantity} ${item.unit}\n${item.brand ? `🏷️ Brand: ${item.brand}\n` : ''}\n⚠️ REMOVE IMMEDIATELY!\n🗑️ Please dispose safely and delete from inventory.`
          );
          
          item.lastExpiryNotification = 'expired';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log(`✅ Sent EXPIRED alert: ${item.name} (expired ${Math.abs(daysLeft)} days ago)`);
          countExpired++;
        } catch (err) {
          console.error(`❌ Failed to send expired notification for ${item.name}:`, err.message);
        }
      }
      
      // ✅ CASE 2: 1 DAY LEFT (daysLeft <= 1)
      else if (daysLeft >= 0 && daysLeft <= 1 && item.lastExpiryNotification !== '1day' && item.lastExpiryNotification !== 'expired') {
        try {
          let urgencyMsg;
          if (daysLeft === 0) {
            urgencyMsg = "EXPIRES TODAY!";
          } else {
            urgencyMsg = "EXPIRES TOMORROW!";
          }

          await notifyTeam(
            item.teamId._id,
            `🚨 URGENT: ${urgencyMsg}\n\n📦 Item: ${item.name}\n⏰ Expiry: ${expiryDate.toLocaleDateString('en-IN')}\n📊 Quantity: ${item.quantity} ${item.unit}\n${item.brand ? `🏷️ Brand: ${item.brand}\n` : ''}\n⚠️ USE THIS ITEM TODAY TO AVOID WASTE!`
          );
          
          item.lastExpiryNotification = '1day';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log(`✅ Sent 1-DAY alert: ${item.name} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`);
          count1Day++;
        } catch (err) {
          console.error(`❌ Failed to send 1-day notification for ${item.name}:`, err.message);
        }
      }
      
      // ✅ CASE 3: 30 DAYS LEFT (daysLeft >= 28 and <= 35, flexible range)
      else if (daysLeft >= 28 && daysLeft <= 35 && !item.lastExpiryNotification) {
        try {
          await notifyTeam(
            item.teamId._id,
            `⏰ 1 MONTH EXPIRY REMINDER\n\n📦 Item: ${item.name}\n⏰ Expires in: ${daysLeft} days\n📅 Expiry Date: ${expiryDate.toLocaleDateString('en-IN')}\n📊 Quantity: ${item.quantity} ${item.unit}\n${item.brand ? `🏷️ Brand: ${item.brand}\n` : ''}\nℹ️ Plan your usage accordingly.`
          );
          
          item.lastExpiryNotification = '30days';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log(`✅ Sent 30-DAY alert: ${item.name} (${daysLeft} days left)`);
          count30Day++;
        } catch (err) {
          console.error(`❌ Failed to send 30-day notification for ${item.name}:`, err.message);
        }
      }
    }

    // Summary
    console.log(`\n📊 Notification Summary:`);
    console.log(`   - ${countExpired} EXPIRED alerts sent`);
    console.log(`   - ${count1Day} 1-DAY alerts sent`);
    console.log(`   - ${count30Day} 30-DAY alerts sent`);
    
    const totalSent = countExpired + count1Day + count30Day;
    if (totalSent === 0) {
      console.log(`\n✅ No notifications needed - all items are safe!\n`);
    } else {
      console.log(`\n✅ Total: ${totalSent} notifications sent to team members\n`);
    }
  } catch (err) {
    console.error("❌ Expiry checker error:", err);
  }
};
