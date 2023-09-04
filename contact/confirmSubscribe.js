const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const Subscribe = require("../models/subscribeModel"); 
const { sendEmail } = require("./sendEmail"); 

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});

module.exports.confirm = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const { email } = JSON.parse(event.body);

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0">
          <tr>
            <td align="center">
              <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 5px; box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <h1 style="color: #007BFF;">Confirm Your Subscription</h1>
                    <img src="https://cdn.freelogodesign.org/files/052ca33a10a84c5ca8234ff932b5a163/thumb/logo_200x200.png?v=638268704180000000" alt="Logo" style="max-width: 200px; margin-bottom: 20px;">
                    <p>Thank you for subscribing to our newsletter. Please confirm your subscription by clicking the button below:</p>
                    <a href="${process.env.BASE_URL}/subscribe/confirm/${email}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Confirm Subscription</a>
                    <p>If you didn't intend to subscribe, you can safely ignore this email.</p>
                    <p>Best regards,</p>
                    <p>APRICUS Team </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
      `;
    await sendEmail(email, "Apricus Books Subscription", htmlContent);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        status: "success",
        message: "Subscribed successfully!",
      }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        status: "error",
        message: "Failed to send email.",
      }),
    };
  }
};
