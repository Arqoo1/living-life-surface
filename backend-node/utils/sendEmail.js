import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gioarqania84@gmail.com",
      pass: "txll bvbz cliw lwgb", 
    },
  });

  const mailOptions = {
    from: '"Living Life Support" <gioarqania84@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: `
    <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px; max-width: 500px; margin: auto;">
      <h2 style="color: #333; text-align: center;">Password Reset</h2>
      <p style="color: #666;">You requested a password reset. Use the code below to proceed:</p>
      <div style="background: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px;">
        <h1 style="color: #4b5563; letter-spacing: 5px; margin: 0;">${
          options.message.match(/\d+/)[0]
        }</h1>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
        This code expires in 10 minutes. If you didn't request this, please ignore this email.
      </p>
    </div>
  `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log("✅ Email sent successfully to your real Gmail!");
  } catch (error) {
    console.error("❌ Gmail Send Error:", error.message);
    throw new Error("Email service failed");
  }
};
