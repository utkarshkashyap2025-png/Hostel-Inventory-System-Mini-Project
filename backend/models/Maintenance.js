const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
  },

  issueType: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "Pending",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);