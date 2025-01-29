import mongoose from "mongoose";
import usersModel from "../model/usersModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
} from "../config/config.js";
import { EncodeToken } from "../utility/tokenUtility.js";
import profilesModel from "../model/profilesModel.js";
import SendEmail from "../utility/emailUtility.js";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Helper to extract Cloudinary public ID from URL
const extractCloudinaryPublicId = (url) => {
  const regex = /\/([^/]+)\.[^/]+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const ObjectID = mongoose.Types.ObjectId;

// User Registration
export const registerService = async (req) => {
  try {
    let { fullName, email, password } = req.body;

    // Check if fullName is provided
    if (!fullName) {
      return { status: "error", message: "The full name is required!" };
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { status: "error", message: "The email is required!" };
    }
    if (!emailRegex.test(email)) {
      return { status: "error", message: "Invalid email format!" };
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      return { status: "error", message: "The password is required!" };
    }
    if (!passwordRegex.test(password)) {
      return {
        status: "error",
        message:
          "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character!",
      };
    }

    // Check if the email is already taken
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      return { status: "error", message: "Email is already taken!" };
    }

    // Hash the password
    password = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await usersModel.create({ fullName, email, password });

    // Create a profile for the user with their ID
    const newProfile = await profilesModel.create({
      userID: newUser._id,
      bio: "",
      location: "",
      phone: "",
      website: "",
      profileImg: "",
      coverImg: "",
      followers: [],
      following: [],
      posts: [],
    });

    return {
      status: "success",
      message: "User registered successfully!",
      data: {
        name: newUser.fullName,
        email: newUser.email,
        profile: newProfile,
      },
    };
  } catch (error) {
    return { status: "error", error: error.toString() };
  }
};

//login service
export const loginService = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Check if all required fields are provided
    if (!email) {
      return { status: "error", message: "The email is required!" };
    }

    if (!password) {
      return { status: "error", message: "The password is required!" };
    }

    // Find the user by email
    let user = await usersModel.findOne({ email });

    // If no user is found
    if (!user) {
      return { status: "error", message: "User not found!" };
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { status: "error", message: "Invalid email or password!" };
    }

    // If the password is valid, generate a JWT token
    let token = EncodeToken(user.email, user._id.toString());

    // Set the cookie with JWT token
    let options = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: "none",
      secure: true,
    };

    res.cookie("token", token, options);

    // Return success response with token and student data
    return {
      status: "success",
      token: token,
      data: { name: user.fullName, email: user.email },
    };
  } catch (error) {
    return { status: "error", error: error.toString() };
  }
};

//profile read service
export const readProfileService = async (req) => {
  try {
    const email = req.headers.email;

    if (!email) {
      return {
        status: "error",
        message: "Unauthorized: Email header is required",
      };
    }

    // Find user by email
    const user = await usersModel.findOne({ email });
    if (!user) {
      return { status: "error", message: "User not found" };
    }

    // Aggregate profile details
    const profile = await profilesModel.aggregate([
      { $match: { userID: user._id } },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "userID",
          foreignField: "userID",
          as: "postDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "userID",
          foreignField: "userID",
          as: "commentDetails",
        },
      },
      {
        $project: {
          phone: 1,
          profileImg: 1,
          coverImg: 1,
          bio: 1,
          website: 1,
          location: 1,
          followers: 1,
          following: 1,
          posts: 1,
          updatedAt: 1,
          "userDetails._id": 1,
          "userDetails.fullName": 1,
          "userDetails.email": 1,
          "postDetails._id": 1,
          "postDetails.content": 1,
          "postDetails.postImg": 1,
          "postDetails.likes": 1,
          "postDetails.dislikes": 1,
          "postDetails.shares": 1,
          "postDetails.createdAt": 1,
          "commentDetails._id": 1,
          "commentDetails.userID": 1,
          "commentDetails.comment": 1,
          "commentDetails.createdAt": 1,
        },
      },
    ]);

    if (profile.length === 0) {
      return { status: "error", message: "Profile not found" };
    }

    // Combine user and profile data
    const result = {
      email: user.email,
      fullName: user.fullName,
      ...profile[0],
    };

    return { status: "success", data: result };
  } catch (error) {
    console.error("Error reading profile:", error.message);
    return { status: "error", message: "Internal server error" };
  }
};

//update profile service
export const updateProfileService = async (req) => {
  try {
    const email = req.headers.email;

    if (!email) {
      return {
        status: "error",
        message: "Unauthorized: Email header is required",
      };
    }

    // Find user by email
    const user = await usersModel.findOne({ email });
    if (!user) {
      return { status: "error", message: "User not found" };
    }

    const userID = user._id;

    // Find the corresponding profile
    const profile = await profilesModel.findOne({ userID });
    if (!profile) {
      return { status: "error", message: "Profile not found" };
    }

    const uploadedFiles = req.files || {};
    const updateData = { ...req.body };

    // Handle profileImg upload
    if (uploadedFiles.profileImg) {
      // Delete existing profile image from Cloudinary
      if (profile.profileImg) {
        const publicId = extractCloudinaryPublicId(profile.profileImg);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Access the file buffer
      const fileBuffer = uploadedFiles.profileImg.data; // For express-fileupload
      // Convert buffer to a base64-encoded string
      const fileBase64 = `data:${
        uploadedFiles.profileImg.mimetype
      };base64,${fileBuffer.toString("base64")}`;

      try {
        const cloudinaryResult = await cloudinary.uploader.upload(fileBase64, {
          public_id: `profile_${Date.now()}`,
          folder: "profiles",
        });

        updateData.profileImg = cloudinaryResult.secure_url;
      } catch (error) {
        return {
          status: "error",
          message: "Error uploading profile image to Cloudinary",
          error: error.toString(),
        };
      }
    } else {
      updateData.profileImg = profile.profileImg;
    }

    // Handle coverImg upload
    if (uploadedFiles.coverImg) {
      // Delete existing cover image from Cloudinary
      if (profile.coverImg) {
        const publicId = extractCloudinaryPublicId(profile.coverImg);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Access the file buffer
      const fileBuffer = uploadedFiles.coverImg.data; // For express-fileupload
      // Convert buffer to a base64-encoded string
      const fileBase64 = `data:${
        uploadedFiles.coverImg.mimetype
      };base64,${fileBuffer.toString("base64")}`;

      try {
        const cloudinaryResult = await cloudinary.uploader.upload(fileBase64, {
          public_id: `cover_${Date.now()}`,
          folder: "covers",
        });

        updateData.coverImg = cloudinaryResult.secure_url;
      } catch (error) {
        return {
          status: "error",
          message: "Error uploading cover image to Cloudinary",
          error: error.toString(),
        };
      }
    } else {
      updateData.coverImg = profile.coverImg;
    }

    // Update the profile in the database
    const updatedProfile = await profilesModel.updateOne(
      { userID },
      { $set: updateData }
    );

    if (updatedProfile.matchedCount === 0) {
      return { status: "error", message: "Failed to update profile" };
    }

    return {
      status: "success",
      message: "Profile updated successfully",
      data: updateData,
    };
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return {
      status: "error",
      message: "Internal server error",
      error: error.toString(),
    };
  }
};

// Logout service
export const logoutService = async (res) => {
  try {
    // Clear the JWT token from the cookie
    await res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // Return a success response
    return { status: "success", message: "User logged out successfully!" };
  } catch (error) {
    return { status: "error", error: error.toString() };
  }
};

// forgot password service
export const forgotPasswordService = async (req) => {
  try {
    let email = req.body.email;
    let data = await usersModel.findOne({ email });

    if (!data) {
      return { status: "error", message: "User not found" };
    }

    let code = Math.floor(100000 + Math.random() * 900000);
    let EmailText = `Your Verification Code is ${code}`;
    let EmailSubject = "Email Verification";

    await SendEmail(email, EmailText, EmailSubject);
    await usersModel.updateOne(
      { email: email },
      { $set: { otp: code } },
      { upsert: true }
    );
    return {
      status: "success",
      message: "Your 6 Digit Code Has Been Send Successfully",
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};

// otp Verification service
export const verifyOtpService = async (req) => {
  try {
    const { email, otp } = req.body;
    const data = await usersModel.findOne({ email });

    if (!data) {
      return { status: "error", message: "User not found" };
    }

    if (data.otp !== otp) {
      return { status: "error", message: "Invalid OTP" };
    }

    await usersModel.updateOne({ email }, { $set: { otp: null } });

    return { status: "success", message: "OTP verified successfully" };
  } catch (error) {
    return { status: "error", data: error.toString() };
  }
};

// reset password service
export const resetPasswordService = async (req) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await usersModel.findOne({ email });
    if (!user) {
      return { status: "error", message: "User not found" };
    }

    await usersModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return { status: "success", message: "Password changed successfully" };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};

// user delete service
export const deleteAccountService = async (req) => {
  try {
    let email = req.headers.email;
    if (!email) {
      return { status: "error", message: "Unauthorized!" };
    }
    const result = await usersModel.deleteOne({ email });
    if (result.deletedCount > 0) {
      return { status: "success", message: "Account deleted successfully" };
    } else {
      return { status: "error", message: "Account not found" };
    }
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};

//follow user service
export const followUserService = async (req) => {
  try {
    const { email, userID } = req.body;

    if (!email || !userID) {
      return { status: "error", message: "Email and User ID are required!" };
    }

    const user = await usersModel.findOne({ email });
    if (!user) return { status: "error", message: "User not found!" };

    const targetUser = await usersModel.findById(userID);
    if (!targetUser)
      return { status: "error", message: "Target User not found!" };

    const userProfile = await profilesModel.findOneAndUpdate(
      { userID: user._id },
      { $addToSet: { following: targetUser._id } },
      { new: true }
    );

    const targetUserProfile = await profilesModel.findOneAndUpdate(
      { userID: targetUser._id },
      { $addToSet: { followers: user._id } },
      { new: true }
    );

    if (!userProfile || !targetUserProfile) {
      return {
        status: "error",
        message: "Failed to update follow relationship.",
      };
    }

    return { status: "success", message: "Successfully followed the user!" };
  } catch (error) {
    console.error("Follow User Error:", error);
    return { status: "error", message: "An unexpected error occurred." };
  }
};

//unfollow user service
export const unfollowUserService = async (req) => {
  try {
    const { email, userID } = req.body;

    if (!email || !userID) {
      return { status: "error", message: "Email and User ID are required!" };
    }

    // Find the current user by email
    const user = await usersModel.findOne({ email });
    if (!user) {
      return { status: "error", message: "User not found!" };
    }

    // Check if the target user exists
    const targetUser = await usersModel.findById(userID);
    if (!targetUser) {
      return { status: "error", message: "Target User not found!" };
    }

    // Update the current user's following list and the target user's followers list atomically
    const userProfile = await profilesModel.findOneAndUpdate(
      { userID: user._id },
      { $pull: { following: targetUser._id } }, // Remove the target user ID
      { new: true }
    );

    const targetUserProfile = await profilesModel.findOneAndUpdate(
      { userID: targetUser._id },
      { $pull: { followers: user._id } },
      { new: true }
    );

    if (!userProfile || !targetUserProfile) {
      return {
        status: "error",
        message: "Failed to update unfollow relationship.",
      };
    }

    return { status: "success", message: "Successfully unfollowed the user!" };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};
