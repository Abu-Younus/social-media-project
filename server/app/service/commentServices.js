import mongoose from "mongoose";
import commentsModel from "../model/commentsModel.js";

const ObjectID = mongoose.Types.ObjectId;

//Comment Post service
export const createCommentService = async (req) => {
    try {
        const postID = new ObjectID(req.body.postID);
        const userID = new ObjectID(req.headers.user_id);
        const commentText = req.body.comment;

        // Validate comment
        if (!commentText || commentText.trim().length === 0) {
            return { status: 'error', message: 'Comment is required' };
        }

        // Validate comment length (between 5 and 1000 characters)
        if (commentText.length < 10 || commentText.length > 1000) {
            return { status: 'error', message: 'Comment length should be between 10 and 1000 characters' };
        }

        const comment = new commentsModel({
            postID: postID,
            userID: userID,
            comment: commentText,
            timestamp: new Date()
        });

        // Save the comment
        const data = await comment.save();

        return { status: 'success', message: 'Comment added successfully', data: data };
    } catch (e) {
        return { status: 'error', message: e.toString() };
    }
};

// Read All Comments By Post ID service
export const readAllCommentsByPostIDService = async (req) => {
    try {
        const postID = new ObjectID(req.params.postID);

        console.log('Fetching comments for postID:', postID);

        // Use aggregation to fetch comments with user details
        const comments = await commentsModel.aggregate([
            { $match: { postID: postID } },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "profiles",
                    localField: "userID",
                    foreignField: "userID",
                    as: "profileDetails"
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "postID",
                    foreignField: "_id",
                    as: "postDetails"
                }
            },
            {
                $project: {
                    userID: 1,
                    comment: 1,
                    createdAt: 1,
                    "userDetails._id": 1,
                    "userDetails.fullName": 1,
                    "userDetails.email": 1,
                    "profileDetails.profileImg": 1,
                    "profileDetails.bio": 1,
                    "profileDetails.location": 1,
                    "profileDetails.followers": 1,
                    "profileDetails.following": 1,
                    "postDetails.content": 1,
                    "postDetails.postImg": 1,
                    "postDetails.createdAt": 1,
                    "postDetails.userID": 1,
                    "postDetails.likes": 1,
                    "postDetails.dislikes": 1,
                    "postDetails.shares": 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        console.log('Comments fetched:', comments);

        if (comments.length === 0) {
            console.warn('No comments found for postID:', postID);
            return { status: 'error', message: 'No comments found for this post' };
        }

        return { status: 'success', data: comments };
    } catch (e) {
        console.error('Error fetching comments:', e.message);
        return { status: 'error', message: `Error fetching comments: ${e.message}` };
    }
};

//Update a comment service
export const updateCommentService = async (req) => {
    try {
        const commentID = new ObjectID(req.body.commentID);
        const userID = new ObjectID(req.headers.user_id);
        const newCommentText = req.body.comment;

        // Validate input
        if (!commentID) {
            return { status: 'error', message: 'Comment ID is required' };
        }

        if (!newCommentText || newCommentText.trim().length === 0) {
            return { status: 'error', message: 'Comment is required' };
        }

        // Validate comment length (between 5 and 1000 characters)
        if (newCommentText.length < 10 || newCommentText.length > 1000) {
            return { status: 'error', message: 'Comment length should be between 10 and 1000 characters' };
        }

        // Check if the comment exists
        const comment = await commentsModel.findOne({ _id: commentID });

        if (!comment) {
            return { status: 'error', message: 'Comment not found' };
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.userID.toString() !== userID.toString()) {
            return { status: 'error', message: 'You are not authorized to update this comment' };
        }

        // Update the comment
        comment.comment = newCommentText;
        comment.timestamp = new Date();

        const updatedComment = await comment.save();

        return { status: 'success', message: 'Comment updated successfully', data: updatedComment };
    } catch (e) {
        return { status: 'error', message: e.toString() };
    }
};

// Delete a comment service
export const deleteCommentService = async (req) => {
    try {
        const commentID  = new ObjectID(req.body.commentID)
        const userID = new ObjectID(req.headers.user_id);

        if (!commentID) {
            return { status: 'error', message: 'Comment ID is required' };
        }

        const comment = await commentsModel.findOne({ _id: commentID });

        if (!comment) {
            return { status: 'error', message: 'Comment not found' };
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.userID.toString() !== userID.toString()) {
            return { status: 'error', message: 'You are not authorized to delete this comment' };
        }

        // Delete the comment
        const result = await commentsModel.deleteOne({ _id: commentID });

        if (result.deletedCount === 0) {
            return { status: 'error', message: 'Failed to delete the comment' };
        }

        return { status: 'success', message: 'Comment deleted successfully' };
    } catch (e) {
        return { status: 'error', message: e.toString() };
    }
};