// import nodemailer from 'nodemailer'
// import keys from '../config/keys.config.js'

// let transporter
// let defaultFrom

// // In dev, spin up an Ethereal test account
// if (process.env.NODE_ENV !== 'production') {
//   // top-level await works in ESM
//   const testAccount = await nodemailer.createTestAccount()

//   transporter = nodemailer.createTransport({
//     host: testAccount.smtp.host,
//     port: testAccount.smtp.port,
//     secure: testAccount.smtp.secure,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   })

//   // Use the Ethereal user as the MAIL FROM
//   defaultFrom = `"TapBook (Dev)" <${testAccount.user}>`
// } else {
//   // production SMTP
//   transporter = nodemailer.createTransport({
//     host: keys.SMTP_HOST,
//     port: keys.SMTP_PORT,
//     auth: {
//       user: keys.SMTP_USER,
//       pass: keys.SMTP_PASS,
//     },
//   })

//   defaultFrom = `"TapBook" <${keys.SMTP_USER}>`
// }

// export async function sendEmail({ to, subject, text }) {
//   console.log('▶️ Sending email to', to)

//   const info = await transporter.sendMail({
//     from: defaultFrom, // ← now valid in both dev & prod
//     to,
//     subject,
//     text,
//   })

//   if (process.env.NODE_ENV !== 'production') {
//     console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info))
//   }
// }
