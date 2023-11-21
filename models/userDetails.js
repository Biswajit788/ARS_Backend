const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    uid: {type: Number, unique: true},
    password: String,
    project: String,
    dept: String,
    role: String,
    desgn: String
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("users", UserDetailsSchema);
