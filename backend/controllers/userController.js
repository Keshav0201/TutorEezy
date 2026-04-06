const otpGenerator = require("otp-generator");
const transporter = require("../config/mailer");
const userModel = require("../models/userModel");

let otpStore = {};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    otpStore[email] = otp;

    await transporter.sendMail({
      to: email,
      subject: "Tutoreezy Email Verification",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === otp) {
    delete otpStore[email];

    return res.json({
      message: "Email verified successfully",
    });
  }

  return res.json({
    message: "Invalid OTP",
  });
};

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters",
    });
  }

  userModel.signup({ name, email, password }, (err, result) => {
    if (err) {
      if (err.type === "AUTH_ERROR") {
        return res.status(401).json({ error: err.message });
      }

      if (err.type === "DUPLICATE_ERROR") {
        return res.status(409).json({ error: err.message });
      }

      console.error(err);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }

    res.json({
      success: true,
      result,
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  userModel.login({ email, password }, (err, user) => {
    if (err) {
      if (err.type === "AUTH_ERROR") {
        return res.status(401).json({ error: err.message });
      }

      console.error(err);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }

    res.json({
      success: true,
      user,
    });
  });
};

exports.getCurrentUser = (req,res) => {
  const user_id = req.user.id;
  userModel.getCurrentUser(user_id, (err,user) => {
    if(err){
      console.error(err);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }

    res.json({
      success: true,
      user
    })
  })
}