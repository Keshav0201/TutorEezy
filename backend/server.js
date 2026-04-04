const express = require('express');
const app = express();
require("dotenv").config();
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const slotRoutes = require('./routes/slotRoutes');
const classRoutes = require('./routes/classRoutes');


const PORT = process.env.PORT || 3016;

app.use(express.json());

app.get("/",(req,res) => {
    res.send("Server running");
});

app.use("/api/auth", authRoutes);
app.use("/api/teachers",teacherRoutes);
app.use("/api/slots",slotRoutes);
app.use("/api/classes",classRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})