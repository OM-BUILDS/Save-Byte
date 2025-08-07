
require("dotenv").config();
const sendMail = require("./send-mail");

function otpMail(donorMail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: donorMail,
    subject: "🔐 Food Pickup Verification OTP",
    text: `Hello, your OTP for food pickup verification is: ${otp}. This OTP is valid for 1 day.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; background-color: #fff; margin: 20px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #42ba96; text-align: center;">🔐 Food Pickup OTP Verification</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">
            Your OTP for food pickup verification is:
          </p>

          <div style="text-align: center; background-color: #f1f1f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 22px; font-weight: bold; color: #333;">${otp}</p>
          </div>

          <p style="font-size: 16px; color: #333;">This OTP is valid for <strong>1 day</strong>. Please provide this OTP to complete the food pickup process.</p>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">If you did not request this, please ignore this email or contact us immediately.</p>  
          <hr style="border: 0; border-top: 1px solid #ccc; margin-top: 20px;">
          <p style="font-size: 12px; text-align: center; color: #999;">© 2025 Save Byte| All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // Send the OTP email
  sendMail(mailOptions);
}

module.exports = otpMail;
