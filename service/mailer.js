import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  FROM_EMAIL,
} from "../config/config.js";
const SES_CONFIG = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
};

export let mailer = async (email, password) => {
  let isMailSent = true;
  const AWS_SES = new AWS.SES(SES_CONFIG);
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
            Data: `<H1>Hey from the Betsol Team!</H1>
                    <h2>Your login Credentials are given below</h2>
                    <p>Your Username: ${email}<br>
                    Your password is: ${password}</p>`,
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
