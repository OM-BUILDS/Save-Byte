
require("dotenv").config();
const sendMail = require("./send-mail");

function foodNotifyMail(createdFood, receiverMail) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiverMail,
    subject: `🍲 New Food Available for Pickup - ${
      createdFood.wasteFoodType === "Fresh Food" ? "NGO" : "AWC"
    } 🍲`,
    text: `Hello Team, a new ${
      createdFood.wasteFoodType === "Fresh Food" ? "fresh food" : "plate waste"
    } donation is available for pickup.`,
    html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; line-height: 1.6;">
            <div style="max-width: 600px; background-color: #fff; margin: 20px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #42ba96; text-align: center;">🍲 New Food Available for Pickup! 🍲</h2>
              <p style="font-size: 16px; color: #333;">Hello Team,</p>
              <p style="font-size: 16px; color: #333;">
                A new <strong>${
                  createdFood.wasteFoodType === "Fresh Food"
                    ? "fresh food"
                    : "plate waste"
                }</strong> donation has been added and is available for pickup.
              </p>
              
              <div style="background-color: #f1f1f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Food Details:</strong></p>
                <ul style="list-style-type: none; padding: 0;">
                  <li><strong>Vegetarian/Non-Vegetarian:</strong> ${
                    createdFood.vegType
                  }</li>
                  ${
                    createdFood.wasteFoodType === "Fresh Food"
                      ? `<li><strong>Food Name:</strong> ${createdFood.foodName}</li>`
                      : ""
                  }
                  <li><strong>Quantity:</strong> ${createdFood.quantity} kg</li>
                  <li><strong>Cooked Time:</strong> ${
                    createdFood.cookedTime
                  }</li>
                  <li><strong>Expiry Time:</strong> ${
                    createdFood.expiryTime
                  }</li>
                  <li><strong>Wastage Reason:</strong> ${
                    createdFood.wastageReason
                  }</li>
                </ul>
              </div>
      
              <p style="font-size: 16px; color: #333;">Please arrange a pickup at your earliest convenience. Let's work together to reduce food waste! 🌱</p>
      
              <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #42ba96; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 20px; text-align: center;">Go to Dashboard</a>
              
              <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">If you did not expect this notification, please ignore this email or contact us immediately.</p>  
              <hr style="border: 0; border-top: 1px solid #ccc; margin-top: 20px;">
    <p style="font-size: 12px; text-align: center; color: #999;">© 2025 Save Byte| All rights reserved.</p>
            </div>
          </div>
        `,
  };

  // Send the notification email
  sendMail(mailOptions);
}

module.exports = foodNotifyMail;
