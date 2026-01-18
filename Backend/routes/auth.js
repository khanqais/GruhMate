console.log("loaded auth route")
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio SID:", process.env.TWILIO_SID);
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio Verify SID:", process.env.TWILIO_VERIFY_SERVICE_SID);




router.post("/signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
console.log("signup ",req.body);
    const formattedPhone = `+91${phone}`;
    console.log(formattedPhone)

    const existingUser = await User.findOne({ phone: formattedPhone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const user = new User({ name, phone: formattedPhone, password, verified: false });
    await user.save();

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: formattedPhone, channel: "sms" });

    res.status(201).json({ message: "User created. OTP sent via SMS." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;
    console.log("verifyOtp ",req.body);
    const formattedPhone = `+91${phone}`;

    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: formattedPhone, code });

    if (result.status === "approved") {
      const user = await User.findOne({ phone: formattedPhone });
      if (user) {
        user.verified = true;
        await user.save();
      }
      return res.json({ message: "Phone verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  console.log("in login route")
 

  try {
    const { phone, password } = req.body;
     const formattedPhone = `+91${phone}`;

    const user = await User.findOne({  phone: formattedPhone }).maxTimeMS(8000);
    console.log("pura user hai:")
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid phone or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful in auth route backend",
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,   
        teamId:user.team
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    // Check if it's a timeout error
    if (err.name === 'MongoServerSelectionError' || err.message.includes('buffering timed out')) {
      return res.status(503).json({ message: "Database connection timeout. Please try again.", error: err.message });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/forgot-password", async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found with this phone number" });

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    res.json({ message: "Password reset OTP sent via SMS" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;

    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (result.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
// console.log("loaded auth route");
// import express from "express";
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import dotenv from "dotenv";
// import nodemailer from "nodemailer";

// dotenv.config();
// const router = express.Router();

// // Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail", // or use custom SMTP
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // In-memory OTP store (for hackathon quick demo; use Redis/DB in prod)
// const otpStore = new Map();

// // Utility: generate 6-digit OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // ---------------- SIGNUP ----------------
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;
//     console.log("signup ", req.body);

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     const user = new User({ name, email, phone, password, verified: false });
//     await user.save();

//     // Generate OTP
//     const otp = generateOTP();
//     otpStore.set(email, otp);

//     // Send OTP via email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify your email",
//       text: `Your OTP code is ${otp}`,
//     });

//     res.status(201).json({ message: "User created. OTP sent via email." });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- VERIFY OTP ----------------
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, code } = req.body;
//     console.log("verifyOtp ", req.body);

//     const storedOtp = otpStore.get(email);
//     if (storedOtp && storedOtp === code) {
//       const user = await User.findOne({ email });
//       if (user) {
//         user.verified = true;
//         await user.save();
//         otpStore.delete(email);
//       }
//       return res.json({ message: "Email verified successfully" });
//     } else {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }
//   } catch (err) {
//     console.error("Verify OTP error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- LOGIN ----------------
// router.post("/login", async (req, res) => {
//   console.log("in login route");
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     if (!user.verified) {
//       return res.status(400).json({ message: "Email not verified" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         phone: user.phone,
//         name: user.name,
//         teamId: user.team,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- FORGOT PASSWORD ----------------
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found with this email" });

//     const otp = generateOTP();
//     otpStore.set(email, otp);

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset OTP",
//       text: `Your password reset OTP is ${otp}`,
//     });

//     res.json({ message: "Password reset OTP sent via email" });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ---------------- RESET PASSWORD ----------------
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email, code, newPassword } = req.body;

//     const storedOtp = otpStore.get(email);
//     if (!storedOtp || storedOtp !== code) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     user.password = newPassword;
//     await user.save();
//     otpStore.delete(email);

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset password error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// export default router;
