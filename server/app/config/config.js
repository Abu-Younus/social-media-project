import dotenv from "dotenv";

dotenv.config();

export const {
    PORT,
    BASE_URL,
    CLIENT_URL,
    DATABASE,
    JWT_KEY,
    JWT_EXPIRE_TIME,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURITY,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_UN_AUTH,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

export const WEB_CACHE = false
export const MAX_JSON_SIZE = "50MB"
export const URL_ENCODE = true

export const REQUEST_TIME = 20 * 60 * 1000
export const REQUEST_NUMBER = 2000
