const supabase = require('../config/supabase');
const { sendEmail } = require('../services/emailService');

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Save to database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, subject, message }])
      .select();
    
    if (error) throw error;

    // Send email notification
    try {
      await sendEmail({
        to: process.env.BREVO_SENDER_EMAIL,
        subject: `New Contact Message: ${subject || 'No Subject'}`,
        htmlContent: `
          <h3>New message from your website contact form</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    } catch (emailErr) {
      console.error('Email failed to send, but message saved to DB:', emailErr);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getAllMessages
};
