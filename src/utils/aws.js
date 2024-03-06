import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../config/environment.js";
import dotenv from "dotenv";
dotenv.config();

const s3client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const generateUploadURL = async (file) => {
  const date = new Date();
  const imageName = `${uuidv4()}-${date.getTime()}.png`;
  const param = {
    Bucket: AWS_BUCKET_NAME,
    Key: imageName,
    Body: file.buffer,
  };
  await s3client.send(new PutObjectCommand(param));

  return {
    id: param.Key,
    url: `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${param.Key}`,
  };
};

const generateUploadURLs = async (files) => {
  const uploadURLs = [];

  for (const file of files) {
    const date = new Date();
    const imageName = `${uuidv4()}-${date.getTime()}.png`;
    const param = {
      Bucket: AWS_BUCKET_NAME,
      Key: imageName,
      Body: file.buffer,
    };
    await s3client.send(new PutObjectCommand(param));

    const imageURL = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${param.Key}`;
    uploadURLs.push({
      id: param.Key,
      url: imageURL,
    });
  }

  return uploadURLs;
};

const deleteFileFromS3 = async (fileUrl) => {

  const fileName = fileUrl.split("/").pop();
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileName,
  };


  await s3client.send(new DeleteObjectCommand(params));
};

export { generateUploadURL, generateUploadURLs, deleteFileFromS3 };
