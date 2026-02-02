import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_PASS;

/**
 * Sends an email using Brevo API 
 * @param {string} to - Recipient Email
 * @param {string} subject - Email Subject
 * @param {string} htmlContent - HTML Body
 * @param {Array} attachments - Optional: [{ name: "file.pdf", content: Buffer }]
 */
export const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    
 
    const formattedAttachments = attachments.map(file => ({
        name: file.filename,
        content: file.content.toString('base64') 
    }));

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: "Solvify", email: "aasimsyed398@gmail.com" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
        attachment: formattedAttachments 
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
      }
    );

    console.log(`✅ Email sent via API to ${to}. MessageId: ${response.data.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ API Error for ${to}:`, error.response?.data || error.message);
    return false;
  }
};