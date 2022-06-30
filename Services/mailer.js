import nodemailer from "nodemailer";
let transporter = nodemailer.createTransport({
  host: "email-smtp.us-west-2.amazonaws.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_Username, // Username
    pass: process.env.SMTP_Password, // password
  },
});
export async function mailer(email, password) {
  let testAccount = await nodemailer.createTestAccount();

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Betsol 📧" <hr_portal@b2d2c.com>', // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Hey From th Betsol Team!/n Your login Credentials are given below/n
    Your username: ${email}/n Your password is: ${password}`, // plain text body
    html: `<H1>Hey From the Betsol Team!</H1>
    <h2>Your login Credentials are given below</h2>
    <p>Your Username: ${email}<br>
    Your password is: ${password}</p>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}
