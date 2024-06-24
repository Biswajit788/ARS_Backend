const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

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

UserDetailsSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("users", UserDetailsSchema);
