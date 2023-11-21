const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt723932csc9797whjhcsc9(45900)93883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";
const mongoUrl =
  "mongodb://localhost:27017/EPDS"

//Creating Express Server
const app = express();
mongoose.Promise = global.Promise;


//Connect Mongodb Database

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB database");
  })
  .catch((e) => console.log('There is problem when connecting database' + e));

//All the Express routes
const userRoutes = require('./Routes/User.route');
const procurementRoutes = require('./Routes/Procurement.route');

//Convert incoming data to JSON format
app.use(bodyParser.json());

//Enable CORS
app.use(cors());

//Setup Server Port
const port = process.env.PORT || 5000;

//Routes Configuration
app.use('/users', userRoutes);
app.use('/items', procurementRoutes);
app.use('/admin/items', procurementRoutes);
app.use('/user/items', procurementRoutes);

//Starting our Express Server
const server = app.listen(port, function () {
  console.log('Server listening on Port :' + port);
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

/*Creating or Populating Procurements table in the Database*/
require("./models/procurementData");

const Procurement = mongoose.model("procurements");
app.post("/create", async (req, res) => {
  const {
    project,
    dept,
    description,
    qty,
    model,
    serial,
    part_no,
    asset_id,
    additional_info,
    supplier,
    vendoradd,
    condition1,
    reg_no,
    condition2,
    condition5,
    pan,
    condition4,
    reason,
    order_no,
    order_dt,
    price,
    category,
    cate_others,
    mode,
    remarks,
    created_by
  } = req.body;
  
  try {
    const oldOrder = await Procurement.findOne({ order_no });
      if (oldOrder) {
        return res.json({ error: "Document Already Exist", status: "error", message: order_no });
      }
      await Procurement.create({
        project,
        dept,
        description,
        qty,
        model,
        serial,
        part_no,
        asset_id,
        additional_info,
        supplier,
        vendoradd,
        condition1,
        reg_no,
        condition2,
        condition5,
        pan,
        condition4,
        reason,
        order_no,
        order_dt,
        price,
        category,
        cate_others,
        mode,
        remarks,
        created_by,
      });
      res.send({ status: "Success" });
    
  } catch (error) {
    res.send({ status: "error" });
  }
});

// Authenticating User to access application

app.post("/login-user", async (req, res) => {
  const { uid, password } = req.body;
  const user = await User.findOne({ uid });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, { expiresIn: '30m' });

    if (res.status(201)) {
      return res.json({
        status: "ok",
        tokenAssign: token
      });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});

// Verifying User Token for continue access

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, function (err, user) {
      if (err) {
        console.log(err);
        console.log('Current User Session Expired');
        res.send({ status: "expired" });
      }
      else {
        //console.log(user);
        const userid = user.uid;
        User.findOne({ uid: userid })
          .then((data) => {
            res.send({ status: "ok", data: data });
          })
          .catch((error) => {
            res.send({ status: "error", data: error });
          });
      }
    });
  } catch (error) { }
});
