const sendMail = require("./send-mail");
require("dotenv").config();

function receiverVerifyOtpMail(receiverMail) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiverMail,
    subject: "✅ Food Pickup Confirmed – Thank You for Your Support!",
    text: `Hello,

The food pickup has been successfully completed and verified. 

Thank you for being a part of this initiative. Your efforts help ensure food reaches those who need it the most.

If you have any questions or need assistance, feel free to reach out to us.

Best regards,  
Save Byte Team`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; background-color: #fff; margin: 20px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; text-align: center;">✅ Food Pickup Confirmed</h2>
          <p style="font-size: 16px; color: #333;">Dear Volunteer,</p>
          <p style="font-size: 16px; color: #333;">
            The food pickup has been successfully completed and verified. 
          </p>

          <div style="text-align: center; background-color: #e6ffe6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #28a745;">Thank you for your dedication!</p>
          </div>

          <p style="font-size: 16px; color: #333;">
            Your efforts ensure that surplus food reaches those in need. We appreciate your commitment to this cause.
          </p>

          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">
            If you have any questions or need support, feel free to <a href="mailto:support@savebyte.com" style="color: #28a745;">contact us</a>.
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

module.exports = receiverVerifyOtpMail;
