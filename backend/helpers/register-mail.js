
require("dotenv").config();
const sendMail = require("./send-mail");

function registerMail(createdUser) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: createdUser.email,
    subject: "🎉 Welcome to Save Byte! 🎉",
    text: `Hello ${createdUser.organizationName}, your account has been successfully created!`, // Fallback for email clients that don't support HTML
    html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; line-height: 1.6;">
            <div style="max-width: 600px; background-color: #fff; margin: 20px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #42ba96; text-align: center;">🎉 Welcome, ${createdUser.organizationName}! 🎉</h2>
              <p style="font-size: 16px; color: #333;">Thank you for registering with <strong>We Don't Waste Food</strong>. We are excited to have you on board!</p>
              
              <div style="background-color: #f1f1f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your Details:</strong></p>
                <ul style="list-style-type: none; padding: 0;">
                <li><strong>Organization:</strong> ${createdUser.role}</li>
                  <li><strong>Organization Name:</strong> ${createdUser.organizationName}</li>
                  <li><strong>Email:</strong> ${createdUser.email}</li>
                  <li><strong>Phone:</strong> ${createdUser.phone}</li>
                   <li><strong>Address:</strong> ${createdUser.address}</li>
                </ul>
              </div>
      
              <p style="font-size: 16px; color: #333;">We look forward to making a positive impact with your help. Let's save food and make the world a better place! 🌱</p>
      
              <a href="http://localhost:3000/login" style="display: inline-block; background-color: #42ba96; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 20px; text-align: center;">Login to Your Account</a>
              
              <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">If you did not register for this account, please ignore this email or contact us immediately.</p>
              
              <hr style="border: 0; border-top: 1px solid #ccc; margin-top: 20px;">
          <p style="font-size: 12px; text-align: center; color: #999;">© 2025 Save Byte| All rights reserved.</p>
            </div>
          </div>
        `,
  };

  sendMail(mailOptions);
}
module.exports = registerMail;
