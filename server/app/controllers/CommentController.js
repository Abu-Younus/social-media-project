import { createCommentService, deleteCommentService, readAllCommentsByPostIDService, updateCommentService } from "../service/commentServices.js";

//Comment Post
export const CreateComment = async (req, res) => {
    let result = await createCommentService(req);
    return res.json(result);
};

//Update Comment
export const UpdateComment = async (req, res) => {
    let result = await updateCommentService(req);
    return res.json(result);
};

//Delete Comment
export const DeleteComment = async (req, res) => {
    let result = await deleteCommentService(req);
    return res.json(result);
};

//Read All Comments by Post id
export const ReadAllCommentsByPostId = async (req, res) => {
    let result = await readAllCommentsByPostIDService(req);
    return res.json(result);
};