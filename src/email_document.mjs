import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';

const RECIPIENT = 'israelkariti@gmail.com';

export async function doEmailDocument(savePath, filename) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: RECIPIENT,
    subject: `Meitav document: ${filename}`,
    text: 'Please find the requested Meitav document attached.',
    attachments: [{ filename, content: readFileSync(savePath), contentType: 'application/pdf' }],
  });

  console.log(`[email_document] Sent ${filename} to ${RECIPIENT}`);
}
