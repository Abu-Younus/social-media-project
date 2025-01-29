/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import profileImage from "../assets/images/profile.png";
import { FaEllipsisH, FaEdit, FaTrashAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
import PostStore from "../store/PostStore";
import CommentStore from "../store/CommentStore";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { TimestampToDate } from "../utility/Utility";
import UserStore from "../store/UserStore";

const PostDetails = () => {
  const { postID } = useParams();
  const [loading, setLoading] = useState(true);
  const {
    ProfileDetails,
    ProfileDetailsRequest,
    UserFollowRequest,
    UserUnFollowRequest,
  } = UserStore();
  const { SinglePostDetails, SinglePostDetailsRequest } = PostStore();
  const {
    CommentInputValue,
    CommentInputOnChange,
    CommentCreateRequest,
    CommentUpdateInputValue,
    CommentUpdateInputOnChange,
    CommentUpdateRequest,
    AllCommentDetails,
    AllCommentDetailsRequest,
    CommentDeleteRequest,
    isFormSubmit,
  } = CommentStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [showOptions, setShowOptions] = useState({});

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!CommentInputValue.comment) {
      toast.error("Comment is required.");
      return;
    }

    if (
      CommentInputValue.comment.length < 10 ||
      CommentInputValue.comment.length > 1000
    ) {
      toast.error("Comment must be between 10 and 1000 characters.");
      return;
    }

    try {
      const response = await CommentCreateRequest({
        postID,
        ...CommentInputValue,
      });
      if (response?.status === "success") {
        toast.success(response?.message);
        CommentInputOnChange("comment", "");
        await ProfileDetailsRequest();
        await AllCommentDetailsRequest(postID);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error("Error creating post: " + err.message);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    CommentUpdateInputOnChange("comment", comment.comment);
    setModalOpen(true);
  };

  const toggleOptions = (commentId) => {
    setShowOptions((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCommentUpdate = async (event) => {
    event.preventDefault();

    if (!CommentUpdateInputValue.comment) {
      toast.error("Content is required!");
      return;
    }

    if (
      CommentUpdateInputValue.comment.length < 10 ||
      CommentUpdateInputValue.comment.length > 1000
    ) {
      toast.error("Content must be between 10 and 1000 characters.");
      return;
    }

    try {
      const response = await CommentUpdateRequest({
        ...CommentUpdateInputValue,
        commentID: editingComment,
      });

      if (response?.status === "success") {
        toast.success(response?.message);
        CommentUpdateInputOnChange("comment", "");
        toggleModal();
        toggleOptions(editingComment);
        await AllCommentDetailsRequest(postID);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error("Error updating post: " + err.message);
    }
  };

  const handleDelete = async (commentID) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await CommentDeleteRequest(commentID);
        if (response.status === "success") {
          Swal.fire("Deleted!", "Your comment has been deleted.", "success");
          await AllCommentDetailsRequest(postID);
        } else {
          Swal.fire(
            "Error!",
            response.message || "Comment deletion failed.",
            "error"
          );
        }
      }
    });
  };

  const handleFollowUser = async (email, userID) => {
    try {
      await UserFollowRequest({ email, userID });
      toast.success("You follow this user!");
      await ProfileDetailsRequest();
    } catch (err) {
      toast.error("Error following user: " + err.message);
    }
  };

  const handleUnFollowUser = async (email, userID) => {
    try {
      await UserUnFollowRequest({ email, userID });
      toast.success("You unfollow this user!");
      await ProfileDetailsRequest();
    } catch (err) {
      toast.error("Error unfollowing user: " + err.message);
    }
  };

  useEffect(() => {
    (async () => {
      await SinglePostDetailsRequest(postID);
      await AllCommentDetailsRequest(postID);
      await ProfileDetailsRequest();
      setLoading(false);
    })();
  }, [
    AllCommentDetailsRequest,
    SinglePostDetailsRequest,
    ProfileDetailsRequest,
    postID,
  ]);

  if (loading) {
    return (
      <div id="loading-div">
        <div id="spinner-container">
          <div id="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Post Content */}
      <div className="bg-white shadow-lg p-6 rounded-lg mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={
              SinglePostDetails.profileDetails?.[0]?.profileImg || profileImage
            }
            alt="User"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-[15px] text-gray-800">
              {SinglePostDetails.userDetails?.[0]?.fullName || "Anonymous"}
              {SinglePostDetails.userDetails?.[0]?._id !==
                ProfileDetails.userDetails?.[0]?._id && (
                <button
                  onClick={() =>
                    ProfileDetails?.following.includes(
                      SinglePostDetails.userDetails?.[0]?._id
                    )
                      ? handleUnFollowUser(
                          ProfileDetails.userDetails?.[0]?.email,
                          SinglePostDetails.userDetails?.[0]?._id
                        )
                      : handleFollowUser(
                          ProfileDetails.userDetails?.[0]?.email,
                          SinglePostDetails.userDetails?.[0]?._id
                        )
                  }
                  className={`ml-1 text-sm ${
                    ProfileDetails?.following.includes(
                      SinglePostDetails.userDetails?.[0]?._id
                    )
                      ? "text-red-400 hover:text-red-600"
                      : "text-blue-400 hover:text-blue-600"
                  } underline`}
                >
                  {ProfileDetails?.following.includes(
                    SinglePostDetails.userDetails?.[0]?._id
                  )
                    ? "Unfollow"
                    : "Follow"}
                </button>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {TimestampToDate(SinglePostDetails.createdAt)}
            </p>
          </div>
        </div>
        <p className="text-gray-700 mb-4">{SinglePostDetails.content}</p>
        {SinglePostDetails.postImg && (
          <img
            src={SinglePostDetails.postImg}
            alt="Uploaded"
            className="w-full h-64 object-cover rounded-md"
          />
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Comments ({AllCommentDetails.length})
        </h3>
        <div className=" border-gray-400 p-4 max-h-[400px] overflow-y-auto">
          {/* Render all comments */}
          {AllCommentDetails.length > 0 ? (
            AllCommentDetails.map((comment, index) => (
              <div
                key={index}
                className="p-4 border border-gray-300 rounded-md mb-4 relative"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={
                      comment.profileDetails?.[0]?.profileImg || profileImage
                    }
                    alt="User"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-2">
                    <h3 className="font-semibold text-[14px] text-gray-800">
                      {comment.userDetails?.[0]?.fullName || "Anonymous"}
                      {comment.userDetails?.[0]?._id !==
                        ProfileDetails.userDetails?.[0]?._id && (
                        <button
                          onClick={() =>
                            ProfileDetails?.following.includes(
                              comment.userDetails?.[0]?._id
                            )
                              ? handleUnFollowUser(
                                  ProfileDetails.userDetails?.[0]?.email,
                                  comment.userDetails?.[0]?._id
                                )
                              : handleFollowUser(
                                  ProfileDetails.userDetails?.[0]?.email,
                                  comment.userDetails?.[0]?._id
                                )
                          }
                          className={`ml-1 text-sm ${
                            ProfileDetails?.following.includes(
                              comment.userDetails?.[0]?._id
                            )
                              ? "text-red-400 hover:text-red-600"
                              : "text-blue-400 hover:text-blue-600"
                          } underline`}
                        >
                          {ProfileDetails?.following.includes(
                            comment.userDetails?.[0]?._id
                          )
                            ? "Unfollow"
                            : "Follow"}
                        </button>
                      )}
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      {TimestampToDate(comment.createdAt)}
                    </p>
                  </div>
                  {ProfileDetails?.userDetails?.[0]?._id.toString() ===
                    comment.userID.toString() && (
                    <div className="ml-auto">
                      <button
                        className="text-gray-600 hover:text-blue-500"
                        onClick={() => toggleOptions(comment._id)}
                      >
                        <FaEllipsisH className="text-xl" />
                      </button>
                      {showOptions[comment._id] && (
                        <div className="absolute right-4 top-12 bg-white border rounded-lg shadow-lg py-2 w-32">
                          <button
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                            onClick={() => handleEditComment(comment)}
                          >
                            <FaEdit className="mr-2 inline" />
                            Edit
                          </button>
                          <button
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                            onClick={() => handleDelete(comment._id)}
                          >
                            <FaTrashAlt className="mr-2 inline" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-gray-700">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          )}
        </div>

        {/* Add a new comment */}
        <div className="mt-6">
          <textarea
            value={CommentInputValue.comment}
            onChange={(e) => CommentInputOnChange("comment", e.target.value)}
            placeholder="Add a comment..."
            className="w-full h-24 p-4 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={(e) => handleAddComment(e)}
            disabled={isFormSubmit}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
              isFormSubmit
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            Add Comment
          </button>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
              <h3 className="text-lg font-semibold mb-4">Update Comment</h3>
              <form onSubmit={handleCommentUpdate}>
                <textarea
                  className="w-full border rounded-lg p-2 mb-4"
                  placeholder="What's on your mind?"
                  value={CommentUpdateInputValue.comment}
                  onChange={(e) =>
                    CommentUpdateInputOnChange("comment", e.target.value)
                  }
                  rows={4}
                ></textarea>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    onClick={toggleModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isFormSubmit}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
                      isFormSubmit
                        ? "bg-gray-400 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {isFormSubmit ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
