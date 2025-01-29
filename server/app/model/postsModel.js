import mongoose from "mongoose";

const DataSchema = new mongoose.Schema(
    {
        userID : {type : mongoose.Schema.Types.ObjectId, required : true, ref: 'users'},
        postImg : { type: String},
        content: { type: String },
        likes: { type: Number, default: 0 },
        likedBy: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        ],
        dislikes: { type: Number, default: 0 },
        dislikedBy: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        ],
        shares: [
            {
                userID: { type: mongoose.Schema.Types.ObjectId, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ],
    },
    {
        timestamps : true,
        versionKey : false,
    }
);

const postsModel = mongoose.model('posts', DataSchema);

export default postsModel;