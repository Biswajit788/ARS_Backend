const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const config = require('config');
const seedAdminUser = require('./seeders/adminUserSeeder');
const port = config.get('server.port');
const host = config.get('server.host');
const { authenticateToken, authorizeRole } = require('./authMiddleware');

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt723932csc9797whjhcsc9(45900)93883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";
const mongoUrl =
  "mongodb://admin:admin123@127.0.0.1:27017/?authMechanism=DEFAULT"

//Creating Express Server
const app = express();
mongoose.Promise = global.Promise;

app.use(cors());

//Connect Mongodb Database
const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Successfully connected to MongoDB database");
    await seedAdminUser();
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1); // Exit the process with failure
  }
};

connectToDatabase();

//Convert incoming data to JSON format
app.use(bodyParser.json());

//All the Express routes
const userRoutes = require('./Routes/User.route');
const vendorRoutes = require('./Routes/Vendor.route');
const procurementRoutes = require('./Routes/Procurement.route');
const sopRoutes = require('./Routes/Sop.route');
const { exit } = require("process");

//Routes Configuration
app.use('/users', userRoutes);
app.use('/vendors', vendorRoutes);
app.use('/items', procurementRoutes);
app.use('/admin/items', procurementRoutes);
app.use('/user/items', procurementRoutes);
app.use('/sops', sopRoutes);

// Serve static files from the 'public' folder
//app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define a route for all requests
/* app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); */


//Setup Server Port
//const port = process.env.PORT || 5000;

//Starting our Express Server
const server = app.listen(port, host, function () {
  console.log(`Server is running on ${host}:${server.address().port}`);
});

//Creating or Populating User table in the Database
require("./models/userDetails");
const User = mongoose.model("users");
app.post("/register", async (req, res) => {
  try {
    const { fname, lname, email, uid, password, project, dept, role, desgn } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    const oldUser = await User.findOne({ uid });

    if (oldUser) {
      return res.status(400).json({ error: "User Already Registered", status: "error" });
    }

    await User.create({
      fname,
      lname,
      email,
      uid,
      password: encryptedPassword,
      project,
      dept,
      role,
      desgn,
    });

    res.status(201).json({ status: "ok" });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: "Internal Server Error", status: "error" });
  }
});

// Authenticating User to access application
app.post("/login-user", async (req, res) => {
  try {
    const { uid, password } = req.body;
    const user = await User.findOne({ uid });

    if (!user) {
      // User not found
      return res.status(404).json({
        status: "404",
        message: "User Not Found"
      });
    }

    if (user.status === 0 || user.status === null) {
      // User is not active
      return res.status(403).json({
        error: "User is not active",
        message: "User is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Invalid password
      return res.status(401).json({
        status: "401",
        message: "Invalid Password"
      });
    }

    // Password is valid, generate a token
    var userInfo = {
      uid: user.uid,
      fname: user.fname,
      lname: user.lname,
      desgn: user.desgn,
      email: user.email,
      project: user.project,
      dept: user.dept,
      role: user.role,
      status: user.status,
    };

    const token = jwt.sign(userInfo, JWT_SECRET);
    return res.status(200).json({
      status: "200",
      token: token,
    });
  } catch (error) {
    // Internal server error
    console.log("Server Internal Error", error);

    return res.status(500).json({
      status: "500",
      message: "Internal Server Error"
    });
  }
});

