const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug 
app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/leads", require("./routes/leads"));

//Test route
app.get("/test", (req, res) => {
    res.send("API is working");
});

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log(err));

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});