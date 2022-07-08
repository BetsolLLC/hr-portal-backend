import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  FROM_EMAIL,
  FORGOT_PASSWORD,
} from "../config/config.js";
const SES_CONFIG = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
};

export let mailer = async (name, email, token, password) => {
  let isMailSent = true;
  const AWS_SES = new AWS.SES(SES_CONFIG);
  const SET_URL =
    FORGOT_PASSWORD + `?token=${token}&oldpassword=${password}&email=${email}`;
  try {
    let params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      //ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<H1>Hey ${name},</H1>
                    <p><br>Here is the link to set up your password</p>
                    <a href=${SET_URL}>SET PASSWORD</a>`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Betsol Credentials for ${email}!`,
        },
      },
    };
    await AWS_SES.sendEmail(params).promise();
  } catch (err) {
    isMailSent = false;
  }
  return isMailSent;
};
