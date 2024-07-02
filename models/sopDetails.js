const mongoose = require("mongoose");

const sopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    module: { type: String, required: true },
  },
  {
    timestamps: true,
  },
  {
    collection: "sops",
  }
);

module.exports = mongoose.model("sops", sopSchema);