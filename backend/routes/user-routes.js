const express = require("express");
const { check } = require("express-validator");
const usersController = require("../controllers/user-controller");
const foodController = require('../controllers/food-controller');
const reportController = require('../controllers/report-controller');
const transactionController = require('../controllers/transaction-controller');
const notificationController = require('../controllers/notification-controller')
const Authenticate = require('../middlewares/check-auth');
const router = express.Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);


router.post("/donate-food", Authenticate, foodController.addFood);
router.post("/accept-food/:foodId", Authenticate, transactionController.acceptFood);


router.post("/verify-otp/:transactionId", Authenticate, transactionController.verifyOtp);



router.post("/cancel-food/:foodId", Authenticate, transactionController.rejectFood);


router.get("/get-all-donated-foods",Authenticate, foodController.getAllFoodsByHostel);


router.get("/get-all-ngo-available-foods",Authenticate, foodController.getAllAvailableFoodsByNgo);
router.get("/get-all-awc-available-foods",Authenticate, foodController.getAllAvailableFoodsByAwc);


router.get("/get-all-ngo-transactions/:ngoId",Authenticate,transactionController.getTransactionsByNGO);
router.get("/get-all-hostel-transactions/:hostelId",Authenticate,transactionController.getTransactionsByHostel);
router.get("/get-all-awc-transactions/:awcId",Authenticate,transactionController.getTransactionsByAwc);


router.put("/update-food/:foodId",Authenticate, foodController.updateFood);
router.delete("/delete-food/:foodId",Authenticate, foodController.deleteFood);


router.get("/get-all-notifications/:userId", Authenticate,notificationController.getAllNotifications);
router.put("/mark-read-notifications/:userId",Authenticate, notificationController.markNotificationsAsRead);



router.get("/get-wastage-report", Authenticate,reportController.getWastageReport);
router.get("/get-wastage-report/:startDate/:endDate", Authenticate,reportController.getWastageReport);


module.exports = router;
