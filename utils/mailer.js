const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

/**
 * Send a generic email
 */
const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"RideEasy Bikes" <${process.env.MAIL_FROM}>`,
    to, subject, html
  });
};

/**
 * Send OTP verification email
 */
exports.sendOTP = async (to, otp) => {
  await sendMail({
    to,
    subject: '🔐 Your RideEasy Login OTP',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <h2 style="color:#ff6b35">RideEasy Bikes</h2>
        <p>Your one-time password is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1a1a2e;text-align:center;padding:20px;background:#fff;border-radius:8px;margin:20px 0">${otp}</div>
        <p style="color:#666">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#999;font-size:12px">If you did not request this, please ignore this email.</p>
      </div>`
  });
};

/**
 * Send booking confirmation email
 */
exports.sendBookingConfirmation = async (to, booking, bike, user) => {
  await sendMail({
    to,
    subject: `✅ Booking Confirmed – ${booking.bookingId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <h2 style="color:#ff6b35">🚲 Booking Confirmed!</h2>
        <p>Hi <strong>${user.name}</strong>, your booking is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px;font-weight:bold;color:#555">Booking ID</td><td style="padding:8px">${booking.bookingId}</td></tr>
          <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#555">Bike</td><td style="padding:8px">${bike.name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">From</td><td style="padding:8px">${new Date(booking.startDate).toLocaleString()}</td></tr>
          <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#555">To</td><td style="padding:8px">${new Date(booking.endDate).toLocaleString()}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Amount</td><td style="padding:8px;color:#ff6b35;font-weight:bold">₹${booking.totalAmount}</td></tr>
        </table>
        <p style="margin-top:24px;color:#666">Thank you for choosing RideEasy. Happy riding! 🎉</p>
      </div>`
  });
};

exports.sendMail = sendMail;
