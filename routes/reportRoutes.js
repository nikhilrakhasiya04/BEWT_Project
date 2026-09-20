const express = require("express");
const controller = require("../controllers/reportController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Corporate Financial Dashboard Analytics (Administrator Only)
router.use(authenticate, authorize("Administrator"));

// GET /api/reports/daily-revenue - Computes summarized operational income metrics for current business date
router.get("/daily-revenue", controller.getDailyRevenue);

// GET /api/reports/monthly-revenue - Computes income performance distributions across active fiscal terms
router.get("/monthly-revenue", controller.getMonthlyRevenue);

// GET /api/reports/top-services - Rank-orders standard menu options by total purchase volume to pinpoint high-margin items
router.get("/top-services", controller.getTopServices);

// GET /api/reports/barber-performance - Summarizes appointment tracking metrics, total hours worked, and accumulated sales commissions
router.get("/barber-performance", controller.getBarberPerformance);

// GET /api/reports/customer-visits - Analyzes customer return rates and tracks client retention frequencies
router.get("/customer-visits", controller.getCustomerVisits);

module.exports = router;
