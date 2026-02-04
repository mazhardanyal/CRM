import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check if Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      // 2️⃣ Extract the token
      token = req.headers.authorization.split(" ")[1];
    }

    // 3️⃣ If no token found, block access
    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Fetch user from DB (optional, exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    // Optional: check if user still exists
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 6️⃣ Token is valid, allow request to continue
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
