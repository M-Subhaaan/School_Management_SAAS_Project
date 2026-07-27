const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendPasswordResetEmail = async (userEmail, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: userEmail,

    subject: "Reset Your Password (VALID FOR 15 MIN)",

    html: `
            <h2>Password Reset</h2>

            <p>
                You requested to reset your password.
            </p>

            <p>
                Click the button below to reset your password.
            </p>

            <a
                href="${resetUrl}"
                style="
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                "
            >
                Reset Password
            </a>

            <p>
                This link will expire in 15 minutes.
            </p>
        `,
  });
};
