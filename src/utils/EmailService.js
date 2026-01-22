import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


const BREVO_API_KEY = process.env.BREVO_PASS;

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: "Solvify", email: "aasimsyed398@gmail.com" }, // Must match your verified sender
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY, // Auth happens here
          'content-type': 'application/json',
        },
      }
    );

    console.log(`✅ Email sent via API to ${to}. MessageId: ${response.data.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ API Error for ${to}:`, error.response?.data || error.message);
    // Do not throw, so the loop continues for other students
    return false;
  }
};