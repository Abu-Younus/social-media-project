import { createPostService, deletePostService, disLikePostService, likePostService, readAllPostService, readPostByIDService, readPostByUserIDService, sharePostService, updatePostService } from "../service/postServices.js";

//Create a post 
export const CreatePost = async (req, res) => {
    let result = await createPostService(req);
    return res.json(result);
};

//Read Post by user ID
export const ReadPostByUserID = async (req, res) => {
    let result = await readPostByUserIDService(req);
    return res.json(result);
};

//Update Post
export const UpdatePost = async (req, res) => {
    let result = await updatePostService(req);
    return res.json(result);
};

//Delete Post
export const DeletePost = async (req, res) => {
    let result = await deletePostService(req);
    return res.json(result);
};

//Read All Post
export const ReadAllPost = async (req, res) => {
    let result = await readAllPostService();
    return res.json(result);
};

// Read Post By Id
export const ReadPostById = async (req, res) => {
    let result = await readPostByIDService(req);
    return res.json(result);
};

// Like Post
export const LikePost = async (req, res) => {
    let result = await likePostService(req);
    return res.json(result);
};

// Dislike Post
export const DislikePost = async (req, res) => {
    let result = await disLikePostService(req);
    return res.json(result);
};

// Share Post
export const SharePost = async (req, res) => {
    let result = await sharePostService(req);
    return res.json(result);
};