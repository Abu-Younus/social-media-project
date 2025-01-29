import { DecodeToken } from "../utility/tokenUtility.js";

export default (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token || req.headers.token;
        if (!token) {
            return res.status(401).json({ status: "fail", message: "Unauthorized: Token not found" });
        }

        // Decode the token
        const decoded = DecodeToken(token);
        if (!decoded) {
            return res.status(401).json({ status: "fail", message: "Unauthorized: Invalid token" });
        }

        // Generate a new refresh token
        const refreshToken = decoded.refreshToken;

        // Set cookie for refresh token
        const options = {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: "none",
            secure: true
        };
        res.cookie("Token", refreshToken, options);

        // Add decoded data to request headers
        req.headers.email = decoded.email;
        req.headers.user_id = decoded.user_id;

        // Call the next middleware
        next();
    } catch (err) {
        console.error("Authentication middleware error:", err.message);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
