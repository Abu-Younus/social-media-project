import mongoose from "mongoose";
import postsModel from "../model/postsModel.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
} from "../config/config.js";
import { v2 as cloudinary } from "cloudinary";
import profilesModel from "../model/profilesModel.js";

const ObjectID = mongoose.Types.ObjectId;

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

//Create post service
export const createPostService = async (req) => {
  try {
    const user_id = new ObjectID(req.headers.user_id);

    // Validate user authentication
    if (!user_id) {
      return { status: "error", message: "Unauthorized!" };
    }

    const reqBody = req.body;

    // Validate content
    if (!reqBody.content) {
      return { status: "error", message: "The content is required." };
    }
    if (reqBody.content.length < 10 || reqBody.content.length > 1000) {
      return {
        status: "error",
        message: "Content length should be between 10 and 1000 characters.",
      };
    }

    // Handle post image upload
    const uploadedFiles = req.files || {};
    if (uploadedFiles.postImg) {
      try {
        // Access the file buffer
        const fileBuffer = uploadedFiles.postImg.data; // For express-fileupload
        // Convert buffer to a base64-encoded string
        const fileBase64 = `data:${
          uploadedFiles.postImg.mimetype
        };base64,${fileBuffer.toString("base64")}`;

        // Upload directly to Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(fileBase64, {
          public_id: `post_${Date.now()}`,
          folder: "posts",
        });

        // Save the Cloudinary URL to the request body
        reqBody.postImg = cloudinaryResult.secure_url;
      } catch (error) {
        return {
          status: "error",
          message: "Error uploading post image to Cloudinary",
          error: error.toString(),
        };
      }
    } else {
      reqBody.postImg = "";
    }

    // Add user ID to the post body
    reqBody.userID = user_id;

    // Create the post in the database
    const post = await postsModel.create(reqBody);

    // Update the user's profile to increment post count
    const updateResult = await profilesModel.updateOne(
      { userID: user_id },
      { $push: { posts: post._id } }
    );

    if (updateResult.nModified === 0) {
      return {
        status: "error",
        message:
          "Profile update failed. Could not link the post to the user's profile.",
      };
    }

    return {
      status: "success",
      message: "Post created successfully",
      data: post,
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};

//Read post by user id service
export const readPostByUserIDService = async (req) => {
  try {
    const user_id = new ObjectID(req.headers.user_id);

    // Aggregation pipeline
    const data = await postsModel.aggregate([
      {
        $match: { userID: user_id },
      },
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
          from: "profiles",
          localField: "userID",
          foreignField: "userID",
          as: "profileDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postID",
          as: "comments",
        },
      },
      {
        $project: {
          postImg: 1,
          content: 1,
          likes: 1,
          dislikes: 1,
          likedBy: 1,
          dislikedBy: 1,
          shares: { $size: "$shares" },
          commentCount: { $size: "$comments" },
          createdAt: 1,
          "userDetails._id": 1,
          "userDetails.fullName": 1,
          "userDetails.email": 1,
          "profileDetails.profileImg": 1,
          "profileDetails.coverImg": 1,
          "profileDetails.bio": 1,
          "profileDetails.location": 1,
          "profileDetails.followers": 1,
          "profileDetails.following": 1,
          "profileDetails.posts": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (data.length === 0) {
      return {
        status: "success",
        data: [],
        message: "No posts found for the user.",
      };
    }

    return { status: "success", data };
  } catch (e) {
    console.error("Error in ReadPostService:", e);
    return { status: "error", message: e.message || "An error occurred." };
  }
};

//Update Post service
export const updatePostService = async (req) => {
  try {
    const user_id = new ObjectID(req.headers.user_id);
    const postID = new ObjectID(req.body.postID);
    const reqBody = req.body;
    reqBody.userID = user_id;

    // Validate content
    if (!reqBody.content) {
      return { status: "error", message: "The content is required." };
    }
    if (reqBody.content < 10 || reqBody.content > 1000) {
      return {
        status: "error",
        message: "Content length should be between 10 and 1000 characters.",
      };
    }

    // Find the post to update
    const existingPost = await postsModel.findOne({
      userID: user_id,
      _id: postID,
    });
    if (!existingPost) {
      return { status: "error", message: "Post not found or unauthorized." };
    }

    // Handle image update
    const uploadedFiles = req.files || {};
    if (uploadedFiles.postImg) {
      // If a new image is uploaded, delete the existing image from Cloudinary
      if (existingPost.postImg) {
        const publicId = extractCloudinaryPublicId(existingPost.postImg);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Access the file buffer
      const fileBuffer = uploadedFiles.postImg.data; // For express-fileupload
      // Convert buffer to a base64-encoded string
      const fileBase64 = `data:${
        uploadedFiles.postImg.mimetype
      };base64,${fileBuffer.toString("base64")}`;

      // Upload the new image to Cloudinary
      try {
        const cloudinaryResult = await cloudinary.uploader.upload(fileBase64, {
          public_id: `post_${Date.now()}`,
          folder: "posts", // Optional: Organize by folder
        });
        reqBody.postImg = cloudinaryResult.secure_url;
      } catch (error) {
        return {
          status: "error",
          message: "Error uploading new image to Cloudinary.",
          error: error.toString(),
        };
      }
    } else {
      reqBody.postImg = existingPost.postImg;
    }

    const data = await postsModel.updateOne(
      { userID: user_id, _id: postID },
      { $set: reqBody }
    );
    return { status: "success", data: data };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};

//Delete Post service
export const deletePostService = async (req) => {
  try {
    const user_id = new ObjectID(req.headers.user_id);
    const postID = new ObjectID(req.body.postID);

    // Validate required fields
    if (!user_id || !postID) {
      return { status: "error", message: "User ID and Post ID are required!" };
    }

    // Find the post to delete
    const existingPost = await postsModel.findOne({
      userID: user_id,
      _id: postID,
    });
    if (!existingPost) {
      return { status: "error", message: "Post not found or unauthorized." };
    }

    // Handle image update
    const uploadedFiles = req.files || {};
    if (uploadedFiles.postImg) {
      // If a new post is deleted, delete the existing image from Cloudinary
      if (existingPost.postImg) {
        const publicId = extractCloudinaryPublicId(existingPost.postImg);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // Delete the post from the database
    const deleteResult = await postsModel.deleteOne({
      _id: postID,
      userID: user_id,
    });

    if (deleteResult.deletedCount === 0) {
      return {
        status: "error",
        message: "Post not found or not authorized to delete this post.",
      };
    }

    // Update the user's profile to remove the post reference
    const updateResult = await profilesModel.updateOne(
      { userID: user_id },
      { $pull: { posts: postID } }
    );

    if (updateResult.nModified === 0) {
      return {
        status: "warning",
        message: "Post deleted, but profile update failed.",
      };
    }

    return { status: "success", message: "Post deleted successfully" };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
};

// Read Post by ID service
export const readPostByIDService = async (req) => {
  try {
    const postID = new ObjectID(req.params.postID);

    // Aggregation pipeline
    const data = await postsModel.aggregate([
      {
        $match: { _id: postID },
      },
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
          from: "profiles",
          localField: "userID",
          foreignField: "userID",
          as: "profileDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postID",
          as: "comments",
        },
      },
      {
        $project: {
          postImg: 1,
          content: 1,
          likes: 1,
          dislikes: 1,
          likedBy: 1,
          dislikedBy: 1,
          shares: { $size: "$shares" },
          commentCount: { $size: "$comments" },
          createdAt: 1,
          "userDetails._id": 1,
          "userDetails.fullName": 1,
          "userDetails.email": 1,
          "profileDetails.profileImg": 1,
          "profileDetails.coverImg": 1,
          "profileDetails.bio": 1,
          "profileDetails.location": 1,
          "profileDetails.followers": 1,
          "profileDetails.following": 1,
          "profileDetails.posts": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Check if post exists
    if (data.length > 0) {
      return { status: "success", data: data[0] }; // Return only the first post
    } else {
      return { status: "error", message: "Post not found" };
    }
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};

//Read All Post service
export const readAllPostService = async () => {
  try {
    let data = await postsModel.aggregate([
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
          from: "profiles",
          localField: "userID",
          foreignField: "userID",
          as: "profileDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postID",
          as: "comments",
        },
      },
      {
        $project: {
          postImg: 1,
          content: 1,
          likes: 1,
          dislikes: 1,
          likedBy: 1,
          dislikedBy: 1,
          shares: { $size: "$shares" },
          commentCount: { $size: "$comments" },
          createdAt: 1,
          "userDetails._id": 1,
          "userDetails.fullName": 1,
          "userDetails.email": 1,
          "profileDetails.profileImg": 1,
          "profileDetails.coverImg": 1,
          "profileDetails.bio": 1,
          "profileDetails.location": 1,
          "profileDetails.followers": 1,
          "profileDetails.following": 1,
          "profileDetails.posts": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (data.length === 0) {
      return { status: "success", data: [], message: "No posts found." };
    }

    return { status: "success", data };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};

// Like Post service
export const likePostService = async (req) => {
  try {
    const postID = new ObjectID(req.body.postID);
    const userID = new ObjectID(req.headers.user_id);

    const post = await postsModel.findById(postID);
    if (!post) {
      return { status: "error", message: "Post not found" };
    }

    const hasLiked = post.likedBy.includes(userID);
    const hasDisliked = post.dislikedBy.includes(userID);

    const updates = {};

    // If the user already liked the post, remove the like
    if (hasLiked) {
      updates.$inc = { likes: -1 };
      updates.$pull = { likedBy: userID };
    } else {
      // Add a like and ensure dislike is removed if previously disliked
      updates.$inc = { likes: 1 };
      updates.$addToSet = { likedBy: userID };

      if (hasDisliked) {
        updates.$inc.dislikes = -1;
        updates.$pull = { dislikedBy: userID };
      }
    }

    await postsModel.updateOne({ _id: postID }, updates);

    const updatedPost = await postsModel.aggregate([
      { $match: { _id: postID } },
      {
        $lookup: {
          from: "users",
          localField: "likedBy",
          foreignField: "_id",
          as: "likedByUsers",
        },
      },
      {
        $project: {
          likedByUsers: {
            _id: 1,
            fullName: 1,
          },
        },
      },
    ]);

    return {
      status: "success",
      message: hasLiked ? "Like withdrawn" : "Post liked",
      likedBy: updatedPost[0].likedByUsers,
    };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};

// Dislike Post service
export const disLikePostService = async (req) => {
  try {
    const postID = new ObjectID(req.body.postID);
    const userID = new ObjectID(req.headers.user_id);

    const post = await postsModel.findById(postID);
    if (!post) {
      return { status: "error", message: "Post not found" };
    }

    const hasLiked = post.likedBy.includes(userID);
    const hasDisliked = post.dislikedBy.includes(userID);

    const updates = {};

    // If the user already disliked the post, remove the dislike
    if (hasDisliked) {
      updates.$inc = { dislikes: -1 };
      updates.$pull = { dislikedBy: userID };
    } else {
      // Add a dislike and ensure like is removed if previously liked
      updates.$inc = { dislikes: 1 };
      updates.$addToSet = { dislikedBy: userID };

      if (hasLiked) {
        updates.$inc.likes = -1;
        updates.$pull = { likedBy: userID };
      }
    }

    await postsModel.updateOne({ _id: postID }, updates);

    const updatedPost = await postsModel.aggregate([
      { $match: { _id: postID } },
      {
        $lookup: {
          from: "users",
          localField: "dislikedBy",
          foreignField: "_id",
          as: "dislikedByUsers",
        },
      },
      {
        $project: {
          dislikedByUsers: {
            _id: 1,
            fullName: 1,
          },
        },
      },
    ]);

    return {
      status: "success",
      message: hasDisliked ? "Dislike withdrawn" : "Post disliked",
      dislikedBy: updatedPost[0].dislikedByUsers,
    };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};

//Share Post service
export const sharePostService = async (req) => {
  try {
    const postID = new ObjectID(req.body.postID);
    const userID = new ObjectID(req.headers.user_id);

    // Check if the user has already shared the post
    const alreadyShared = await postsModel.findOne({
      _id: postID,
      shares: { $elemMatch: { userID: userID } },
    });

    if (alreadyShared) {
      return {
        status: "error",
        message: "You have already shared this post.",
      };
    }

    // Add the share entry if not already shared
    const share = { userID: userID, timestamp: new Date() };

    const data = await postsModel.updateOne(
      { _id: postID },
      { $push: { shares: share } }
    );

    return {
      status: "success",
      message: "Post shared successfully.",
      data: data,
    };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
};
