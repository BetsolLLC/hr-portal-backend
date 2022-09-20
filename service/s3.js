import aws from "aws-sdk";
import { AWS_BUCKET } from "../config/config.js";

let s3;
const inits3 = () => {
  s3 = new aws.S3();
};
const S3Uploadv2 = async (file, key) => {
  const param = {
    Bucket: AWS_BUCKET,
    Key: key,
    Body: file, //file.buffer
  };
  return s3.upload(param).promise();
};

const S3Download = async (key) => {
  const options = {
    Bucket: AWS_BUCKET,
    Key: key,
  };
  return s3.getObject(options).promise();
};

export { S3Uploadv2, inits3, S3Download };
