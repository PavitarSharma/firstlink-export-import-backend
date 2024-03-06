import dotenv from "dotenv";
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT || 5000;

export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
export const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET;

export const CLIENT_URL = process.env.CLIENT_URL;
export const BACKEND_URL = process.env.BACKEND_URL;

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_MAIL = process.env.SMTP_MAIL;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
export const SMPT_SERVICE = process.env.SMPT_SERVICE;

export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
