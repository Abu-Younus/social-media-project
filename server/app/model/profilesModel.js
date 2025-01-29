import mongoose from "mongoose";

const DataSchema = mongoose.Schema(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        phone : { type: String},
        profileImg : { type: String},
        coverImg : { type: String},
        bio: { type: String },
        website: { type: String },
        location: { type: String },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'posts' }]
    },
    {
        timestamps : true,
        versionKey : false,
    }
);

const profilesModel = mongoose.model("profiles", DataSchema);

export default profilesModel;