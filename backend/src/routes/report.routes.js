const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { downloadReportPdf } = require("../controllers/report.controller");

router.get("/:id/download", authMiddleware, downloadReportPdf);

module.exports = router;
