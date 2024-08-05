import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();


  var forgetPassword = async({name,code,email})=>{

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD
      }
    });
    console.log('Recipient Email:', email);

     const mailoptions = {
    from: process.env.USER,
    to: email,
    subject: 'Reset Password Request',
    html: `
    <p>Dear ${name},</p>
    <p>We have received your request to reset the password. If you really want to reset it kindly click the button below.</p>
    <h1>${code}<h1>
    <p>You can use the verification code to reset the password. Kindly login again with the code and reset your password</p>`
 
     }
  
    await transporter.sendMail(mailoptions, function(error, info) {
    if (error) 
      console.log(error);
     else 
      console.log('Email sent: ' + info.response);
      console.log("Email sent Successfully")
    
  });

  }

  export default  {forgetPassword}