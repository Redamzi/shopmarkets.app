import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: `"ShopMarkets" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your email',
        html: `
      <h2>Welcome to ShopMarkets!</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
    `
    };

    await transporter.sendMail(mailOptions);
};

export const send2FACode = async (email, code) => {
    const mailOptions = {
        from: `"ShopMarkets Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your 2FA Login Code',
        html: `
      <h2>Login Verification</h2>
      <p>Your 2FA code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
    };

    await transporter.sendMail(mailOptions);
};
