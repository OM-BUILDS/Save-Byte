const Notification = require("../models/notification");
const HttpError = require("../models/http-error");


const getAllNotifications = async (req, res, next) => {
  const userId = req.params.userId;

  try {
  
    const notifications = await Notification.find({ userId ,isRead: false}).sort({ createdAt: -1 });

   
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
     console.log(unreadCount);
     console.log(notifications);
     
     
    res.status(200).json({    success: true, notifications, unreadCount });
  } catch (err) {
    return next(new HttpError("Fetching notifications failed, please try again.", 500));
  }
};


const markNotificationsAsRead = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({success: true});
  } catch (err) {
    return next(new HttpError("Marking notifications as read failed, please try again.", 500));
  }
};

module.exports = { getAllNotifications, markNotificationsAsRead };

