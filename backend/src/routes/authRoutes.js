// authRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token");
const {
  sendEmail,
  passwordResetEmail,
  passwordResetSuccessEmail,
} = require("../utils/emailTemplates");
const crypto = require("crypto");
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("DB HASH:", user.password);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to authRoutes.js
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token to database
    await Token.create({
      userId: user._id,
      token: hashedToken,
      type: "reset",
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = passwordResetEmail(user.name, resetUrl);

    await sendEmail(email, "Password Reset Request", html);

    res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const resetToken = await Token.findOne({
      token: hashedToken,
      type: "reset",
      expiresAt: { $gt: Date.now() },
    });

    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(resetToken.userId);
    user.password = password;
    await user.save();

    // ✅ send success email
    const successHtml = passwordResetSuccessEmail(user.name);
    await sendEmail(user.email, "Password Changed Successfully", successHtml);

    await Token.deleteOne({ _id: resetToken._id });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
