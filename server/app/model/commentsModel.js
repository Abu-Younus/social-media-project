import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        postID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'posts' },
        userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
        comment: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const commentsModel = mongoose.model('comments', CommentSchema);

export default commentsModel;