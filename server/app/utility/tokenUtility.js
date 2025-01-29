import { JWT_EXPIRE_TIME, JWT_KEY } from "../config/config.js";
import jwt from "jsonwebtoken";

// Encode token
export const EncodeToken = (email, user_id) => {
    const payload = { email, user_id };
    return jwt.sign(payload, JWT_KEY, { expiresIn: JWT_EXPIRE_TIME });
};

// Decode token
export const DecodeToken = (token) => {
    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_KEY);

        // Generate a refresh token if the decoded token is valid
        const { email, user_id } = decoded;
        const refreshToken = jwt.sign({ email, user_id }, JWT_KEY, { expiresIn: JWT_EXPIRE_TIME });

        return { refreshToken, email, user_id };
    } catch (err) {
        console.error("Token decoding failed:", err.message);
        return null;
    }
};
