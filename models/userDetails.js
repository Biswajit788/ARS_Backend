const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    uid: { type: String, unique: true },
    password: String,
    project: String,
    dept: String,
    role: String,
    desgn: String,
    status: { type: Number },
  },
  {
    timestamps: true,
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("users", UserDetailsSchema);
