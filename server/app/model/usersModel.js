import mongoose from "mongoose";

const DataSchema = mongoose.Schema(
    {
        fullName : { type: String, required: true},
        email : { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },  
        otp : { type: String},
    },
    {
        timestamps : true,
        versionKey : false,
    }
);

const usersModel = mongoose.model("users", DataSchema);

export default usersModel;