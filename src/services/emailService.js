const apiInstance = require('../config/brevo');

const sendEmail = async ({ to, subject, htmlContent }) => {
  const sendSmtpEmail = {
    to: Array.isArray(to) ? to : [{ email: to }],
    sender: { email: process.env.BREVO_SENDER_EMAIL, name: 'Trespics Website' },
    subject: subject || 'No Subject',
    htmlContent,
  };

  try {
    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Email failed to send:', error);
    throw error;
  }
};

module.exports = { sendEmail };
