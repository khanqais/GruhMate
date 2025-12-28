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

    const user = await User.findOne({  phone: formattedPhone });
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
