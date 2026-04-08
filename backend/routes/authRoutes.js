const express = require('express');
const router = express.Router();
const auth= require('../controllers/userController');
const {verifyToken} = require('../middlewares/authMiddleware');

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOTP);
router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.get("/me",verifyToken,auth.getCurrentUser);
router.get("/verify",verifyToken,(req,res) => {
    res.json({
        success : true,
        user: req.user
    });
})

module.exports = router;