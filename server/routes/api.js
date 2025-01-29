import express from "express";
import * as UserController from '../app/controllers/UserController.js';
import * as PostController from '../app/controllers/PostController.js';
import * as CommentController from '../app/controllers/CommentController.js';
import AuthMiddleware from '../app/middlewares/AuthMiddleware.js';

const router = express.Router();

//User route
router.post('/registration', UserController.Registration);
router.post('/login', UserController.Login);
router.get('/profile-read', AuthMiddleware, UserController.ReadProfile);
router.post('/update-profile', AuthMiddleware, UserController.UpdateProfile);
router.post('/follow-user', AuthMiddleware, UserController.FollowUser);
router.post('/unfollow-user', AuthMiddleware, UserController.UnfollowUser);
router.get('/logout', AuthMiddleware, UserController.Logout);
router.post('/forgot-password', UserController.ForgotPassword);
router.post('/verify-otp', UserController.OTPVerification);
router.post('/reset-password', UserController.ResetPassword);
router.delete('/account-delete', AuthMiddleware, UserController.DeleteAccount);

//Post route
router.post('/create-post', AuthMiddleware, PostController.CreatePost);
router.get('/read-post-by-userID', AuthMiddleware, PostController.ReadPostByUserID);
router.post('/update-post', AuthMiddleware, PostController.UpdatePost);
router.delete('/delete-post', AuthMiddleware, PostController.DeletePost);

router.get('/read-all-post', AuthMiddleware, PostController.ReadAllPost);
router.get('/read-post-by-id/:postID', AuthMiddleware, PostController.ReadPostById);

router.post('/like-post', AuthMiddleware, PostController.LikePost);
router.post('/dislike-post', AuthMiddleware, PostController.DislikePost);
router.post('/share-post', AuthMiddleware, PostController.SharePost);

//Comment route
router.post('/create-comment', AuthMiddleware, CommentController.CreateComment);
router.get('/read-comments-by-postID/:postID', AuthMiddleware, CommentController.ReadAllCommentsByPostId);
router.post('/update-comment', AuthMiddleware, CommentController.UpdateComment);
router.delete('/delete-comment', AuthMiddleware, CommentController.DeleteComment);

export default router;