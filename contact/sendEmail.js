
const nodemailer = require('nodemailer');
require("dotenv").config();

// Function to send an email using Nodemailer
const sendEmail = async (to, subject, htmlContent) => {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; 
  }
};

module.exports = { sendEmail };
