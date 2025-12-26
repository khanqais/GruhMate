// import twilio from "twilio";

// const client = twilio(
//   process.env.TWILIO_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// export const sendWhatsApp = async (to, message) => {
//   await client.messages.create({
//     from: "whatsapp:+14155238886", // Twilio sandbox number
//     to: `whatsapp:${to}`,
//     body: message
//   });
// };
// services/whatsappService.js
export const sendWhatsApp = async (to, message) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📱 WhatsApp Message (MOCK)");
  console.log("To:", to);
  console.log("Message:");
  console.log(message);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  return Promise.resolve({ success: true });
};
