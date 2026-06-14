const express = require("express");
const router = express.Router();

const {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
} = require("../controllers/maintenanceController");

router.post("/", createMaintenanceRequest);
router.get("/", getAllMaintenanceRequests);
router.put("/:id", updateMaintenanceStatus);
router.delete("/:id", deleteMaintenanceRequest);

module.exports = router;