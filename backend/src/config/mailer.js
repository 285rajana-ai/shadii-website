const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailTemplates = {
  welcome: (name) => ({
    subject: `Welcome to Shadii.pk — ہم قدم: ایک مکمل زندگی کا سفر 🌸`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FDF6F0, #FCE4EC); padding: 40px; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B1A4A; font-size: 28px;">🌸 Shadii.pk</h1>
          <p style="color: #9B7B8A; font-size: 14px;">ہم قدم: ایک مکمل زندگی کا سفر</p>
        </div>
        <h2 style="color: #3D1A2A;">Welcome, ${name}! 💕</h2>
        <p style="color: #5A3040; line-height: 1.8;">Your journey to finding a life partner begins here. Your first message to any profile is <strong style="color: #8B1A4A;">completely free!</strong></p>
        <p style="color: #5A3040;">Complete your profile to get better matches and consider <strong>subscribing</strong> to unlock unlimited messaging.</p>
        <a href="https://shadii.pk/app" style="display: inline-block; background: linear-gradient(135deg, #8B1A4A, #E8A4B8); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 20px 0;">Open App 🌸</a>
        <hr style="border: none; border-top: 1px solid #E8A4B8; margin: 30px 0;">
        <p style="color: #9B7B8A; font-size: 12px;">Need help? Contact us at <a href="mailto:help@shadii.pk" style="color: #8B1A4A;">help@shadii.pk</a></p>
      </div>
    `,
  }),

  otp: (name, otp) => ({
    subject: `${otp} — Your Shadii.pk OTP Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDF6F0; padding: 40px; border-radius: 20px;">
        <h1 style="color: #8B1A4A; text-align: center;">🌸 Shadii.pk</h1>
        <h2 style="color: #3D1A2A;">Hi ${name},</h2>
        <p style="color: #5A3040;">Your OTP verification code is:</p>
        <div style="background: linear-gradient(135deg, #8B1A4A, #D4AF37); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">${otp}</div>
        <p style="color: #9B7B8A; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  }),

  suspension: (name, hours = 24, reason) => ({
    subject: `Account Suspended — Shadii.pk`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDF6F0; padding: 40px; border-radius: 20px;">
        <h1 style="color: #8B1A4A; text-align: center;">🌸 Shadii.pk</h1>
        <h2 style="color: #C0392B;">Account Suspended ⚠️</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your account has been suspended for <strong>${hours} hours</strong> due to: <em>${reason}</em></p>
        <p>Our platform prohibits sharing personal contact information (phone numbers, WhatsApp, social media IDs) in chat. This protects all users' safety and privacy.</p>
        <p>If you believe this is an error, contact us at <a href="mailto:help@shadii.pk" style="color: #8B1A4A;">help@shadii.pk</a></p>
      </div>
    `,
  }),

  verificationApproved: (name) => ({
    subject: `✅ Profile Verified — Shadii.pk Blue Tick Awarded!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FDF6F0, #E8F5E9); padding: 40px; border-radius: 20px;">
        <h1 style="color: #8B1A4A; text-align: center;">🌸 Shadii.pk</h1>
        <h2 style="color: #2E7D32;">Congratulations, ${name}! ✅</h2>
        <p>Your profile has been <strong>verified</strong>. You now have a <strong>Blue Tick ✅</strong> on your profile, increasing trust and visibility!</p>
        <p style="color: #9B7B8A; font-size: 13px;">Your CNIC and live photo have been reviewed and approved by our team.</p>
      </div>
    `,
  }),

  subscriptionConfirm: (name, plan, amount) => ({
    subject: `🎉 Subscription Confirmed — Shadii.pk Premium`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDF6F0; padding: 40px; border-radius: 20px;">
        <h1 style="color: #8B1A4A; text-align: center;">🌸 Shadii.pk</h1>
        <h2 style="color: #8B1A4A;">Subscription Active! 🎉</h2>
        <p>Dear <strong>${name}</strong>, your <strong>${plan}</strong> plan is now active.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; color: #9B7B8A;">Plan</td><td style="padding: 8px; font-weight: bold; color: #3D1A2A;">${plan}</td></tr>
          <tr><td style="padding: 8px; color: #9B7B8A;">Amount Paid</td><td style="padding: 8px; font-weight: bold; color: #3D1A2A;">PKR ${amount}</td></tr>
        </table>
        <p>For billing inquiries: <a href="mailto:billing@shadii.pk" style="color: #8B1A4A;">billing@shadii.pk</a></p>
      </div>
    `,
  }),
};

const sendEmail = async (to, templateName, templateData) => {
  try {
    const template = emailTemplates[templateName](...Object.values(templateData));
    await transporter.sendMail({
      from: `"Shadii.pk" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
    console.log(`📧 Email sent to ${to}: ${templateName}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
  }
};

module.exports = { sendEmail };
