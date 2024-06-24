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

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt723932csc9797whjhcsc9(45900)93883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";
const mongoUrl =
  "mongodb://0.0.0.0:27017/EPDS"

//Creating Express Server
const app = express();
mongoose.Promise = global.Promise;


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


//All the Express routes
const userRoutes = require('./Routes/User.route');
const vendorRoutes = require('./Routes/Vendor.route');
const procurementRoutes = require('./Routes/Procurement.route');
const { exit } = require("process");

//Convert incoming data to JSON format
app.use(bodyParser.json());

//Enable CORS
app.use(cors());

//Setup Server Port
//const port = process.env.PORT || 5000;

//Routes Configuration
app.use('/users', userRoutes);
app.use('/vendors', vendorRoutes);
app.use('/items', procurementRoutes);
app.use('/admin/items', procurementRoutes);
app.use('/user/items', procurementRoutes);

//Starting our Express Server
const server = app.listen(port, host, function () {
  console.log(`Server is running on ${host}:${server.address().port}`);
});

//Creating or Populating User table in the Database
require("./models/userDetails");
const User = mongoose.model("users");
app.post("/register", async (req, res) => {
  const { fname, lname, email, uid, password, project, dept, role, desgn } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ uid });

    if (oldUser) {
      return res.json({ error: "User Already Registered", status: "error" });
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

    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

// Authenticating User to access application
app.post("/login-user", async (req, res) => {
  try {
    const { uid, password } = req.body;
    const user = await User.findOne({ uid });

    if (!user) {
      return res.json({
        error: "User Not found",
        status: "invalid"
      });
    }
    if (user.status === 0 || user.status === null) {
      return res.json({
        error: "User is not active",
        status: "inactive",
      });
    } else if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET);
      return res.json({
        status: "ok",
        tokenAssign: token,
        fname: user.fname,
        lname: user.lname,
        desgn: user.desgn,
        email: user.email,
        role: user.role,
        project: user.project,
        dept: user.dept,
        uid: user.uid,
        flag: user.status,
      });
    } else {
      return res.json({
        error: "Invalid Password",
        status: "error"
      });
    }
  } catch (error) {
    console.log("Server Internal Error", error);
  }
});
