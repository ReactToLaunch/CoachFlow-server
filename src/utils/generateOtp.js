import { Otp } from "../models/otp.model.js";
import {Resend} from "resend";
import dotenv from "dotenv";
import axios from 'axios';



dotenv.config({
   path: './.env'
})





  const generateOtp = async () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
  
};



const sendEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        
        sender: { name: "Solvify", email: "aasimsyed398@gmail.com" }, 
        
       
        to: [{ email: email }],
        
        subject: 'Verification OTP',
        
        
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Verification Code</h2>
            <p>Your OTP is:</p>
            <h1 style="color: #F97316; letter-spacing: 5px;">${otp}</h1>
            <p>This code is valid for 10 minutes.</p>
          </div>
        `
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_PASS, 
          'content-type': 'application/json',
        },
      }
    );

    console.log(`✅ OTP sent to ${email}. ID: ${response.data.messageId}`);
    return response.data;

  } catch (error) {
    console.error("❌ Email Service Error:", error.response?.data || error.message);
    return null;
  }
};





export { sendEmail, generateOtp };
