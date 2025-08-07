const sendMail = require("./send-mail");
require("dotenv").config();

function donorVerifyOtpMail(donorMail) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: donorMail,
    subject: "✅ Food Pickup Successful – Thank You!",
    text: `Hello, 

Your food donation has been successfully picked up and verified. 

Thank you for your generous contribution! Your support helps ensure food reaches those in need.

If you have any questions, feel free to contact us.

Best regards,  
Save Byte Team`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; background-color: #fff; margin: 20px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; text-align: center;">✅ Food Pickup Successful</h2>
          <p style="font-size: 16px; color: #333;">Dear Donor,</p>
          <p style="font-size: 16px; color: #333;">
            We’re pleased to inform you that your food donation has been successfully picked up and verified.
          </p>

          <div style="text-align: center; background-color: #e6ffe6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #28a745;">Thank you for your generosity!</p>
          </div>

          <p style="font-size: 16px; color: #333;">Your support helps reduce food waste and feed those in need. We truly appreciate your kindness.</p>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you have any questions, feel free to <a href="mailto:support@savebyte.com" style="color: #28a745;">contact our support team</a>.
          </p>  
          <hr style="border: 0; border-top: 1px solid #ccc; margin-top: 20px;">
          <p style="font-size: 12px; text-align: center; color: #999;">© 2025 Save Byte | All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // Send the confirmation email
  sendMail(mailOptions);
}

module.exports = donorVerifyOtpMail;
