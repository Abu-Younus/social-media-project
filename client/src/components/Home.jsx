/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import profileImage from "../assets/images/profile.png";
import {
  FaPlus,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import PostStore from "../store/PostStore";
import Swal from "sweetalert2";
import UserStore from "../store/UserStore";
import { useNavigate } from "react-router-dom";
import { TimestampToDate } from "../utility/Utility";

const Home = () => {
  const {
    ProfileDetails,
    ProfileDetailsRequest,
    UserFollowRequest,
    UserUnFollowRequest,
  } = UserStore();
  const {
    AllPostDetails,
    AllPostDetailsRequest,
    PostInputValue,
    PostInputOnChange,
    PostCreateRequest,
    PostUpdateRequest,
    PostDeleteRequest,
    LikePostRequest,
    DislikePostRequest,
    isFormSubmit,
  } = PostStore();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [showOptions, setShowOptions] = useState({});

  const MAX_IMAGE_SIZE_MB = 2;

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setImagePreview(null);
    PostInputOnChange("content", "");
    PostInputOnChange("postImg", null);
    setCurrentEditPost(null);
  };

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  };

  const handleEditPost = (post) => {
    setCurrentEditPost(post._id);
    PostInputOnChange("content", post.content);
    setImagePreview(post.postImg);
    setEditModalOpen(true);
  };

  const toggleOptions = (postId) => {
    setShowOptions((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setImageError("Please select an image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    PostInputOnChange("postImg", file);
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    const { content, postImg } = PostInputValue;

    if (!content) {
      toast.error("Content is required!");
      return;
    }

    if (content.length < 10 || content.length > 1000) {
      toast.error("Content must be between 10 and 1000 characters.");
      return;
    }

    try {
      const response = await PostCreateRequest({ ...PostInputValue });

      if (response?.status === "success") {
        toast.success("Post created successfully!");
        PostInputOnChange("content", "");
        PostInputOnChange("postImg", "");
        setImagePreview(null);
        toggleModal();
        await ProfileDetailsRequest();
        await AllPostDetailsRequest();
      } else {
        toast.error(response?.message || "Post creation failed!");
      }
    } catch (err) {
      toast.error("Error creating post: " + err.message);
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    const { content, postImg } = PostInputValue;

    if (!content) {
      toast.error("Content is required.");
      return;
    }
    if (content.length < 10 || content.length > 1000) {
      toast.error("Content must be between 10 and 1000 characters.");
      return;
    }

    try {
      const response = await PostUpdateRequest({
        ...PostInputValue,
        postID: currentEditPost,
      });

      if (response?.status === "success") {
        toast.success("Post updated successfully!");
        toggleEditModal();
        toggleOptions(currentEditPost);
        await AllPostDetailsRequest();
      } else {
        toast.error(response?.message || "Post update failed!");
      }
    } catch (err) {
      toast.error("Error updating post: " + err.message);
    }
  };

  const handleDelete = async (postID) => {
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
        const response = await PostDeleteRequest(postID);
        if (response.status === "success") {
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
          await AllPostDetailsRequest();
        } else {
          Swal.fire(
            "Error!",
            response.message || "Post deletion failed.",
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

  const handleLikePost = async (postID) => {
    try {
      await LikePostRequest(postID);
      toast.success("You liked the post!");
      await AllPostDetailsRequest();
    } catch (err) {
      toast.error("Error liking post: " + err.message);
    }
  };

  const handleDislikePost = async (postID) => {
    try {
      await DislikePostRequest(postID);
      toast.success("You disliked the post!");
      await AllPostDetailsRequest();
    } catch (err) {
      toast.error("Error disliking post: " + err.message);
    }
  };

  const handleNavigatePostDetails = (e, post) => {
    e.preventDefault();
    navigate(`/post/details/${post._id}`);
  };

  useEffect(() => {
    (async () => {
      await ProfileDetailsRequest();
      await AllPostDetailsRequest();
      setLoading(false);
    })();
  }, [ProfileDetailsRequest, AllPostDetailsRequest]);

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
    <div>
      <div className="flex min-h-screen bg-gray-100">
        <main className="container mx-auto flex-grow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">All Posts</h2>
            <button
              onClick={toggleModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              New Post
            </button>
          </div>

          <section className="space-y-6">
            {AllPostDetails?.length > 0 ? (
              AllPostDetails.map((post, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg p-6 rounded-lg space-y-4 transition-transform hover:scale-105 transform relative"
                >
                  <div className="flex items-center">
                    <img
                      src={post.profileDetails?.[0]?.profileImg || profileImage}
                      alt="User"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-2">
                      <h3 className="font-semibold text-[15px] text-gray-800">
                        {post.userDetails?.[0]?.fullName || "Anonymous"}
                        {post.userDetails?.[0]?._id !==
                          ProfileDetails.userDetails?.[0]?._id && (
                          <button
                            onClick={() =>
                              ProfileDetails?.following.includes(
                                post.userDetails?.[0]?._id
                              )
                                ? handleUnFollowUser(
                                    ProfileDetails.userDetails?.[0]?.email,
                                    post.userDetails?.[0]?._id
                                  )
                                : handleFollowUser(
                                    ProfileDetails.userDetails?.[0]?.email,
                                    post.userDetails?.[0]?._id
                                  )
                            }
                            className={`ml-1 text-sm ${
                              ProfileDetails?.following.includes(
                                post.userDetails?.[0]?._id
                              )
                                ? "text-red-400 hover:text-red-600"
                                : "text-blue-400 hover:text-blue-600"
                            } underline`}
                          >
                            {ProfileDetails?.following.includes(
                              post.userDetails?.[0]?._id
                            )
                              ? "Unfollow"
                              : "Follow"}
                          </button>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {TimestampToDate(post.createdAt)}
                      </p>
                    </div>
                    {ProfileDetails?.posts.includes(post._id) && (
                      <div className="ml-auto">
                        <button
                          className="text-gray-600 hover:text-blue-500"
                          onClick={() => toggleOptions(post._id)}
                        >
                          <FaEllipsisH className="text-xl" />
                        </button>
                        {showOptions[post._id] && (
                          <div className="absolute right-4 top-14 bg-white border rounded-lg shadow-lg py-2 w-32">
                            <button
                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                              onClick={() => handleEditPost(post)}
                            >
                              <FaEdit className="mr-2 inline" />
                              Edit
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                              onClick={() => handleDelete(post._id)}
                            >
                              <FaTrashAlt className="mr-2 inline" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                  {post.postImg && (
                    <img
                      src={post.postImg}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-md"
                    />
                  )}
                  <div className="flex items-center space-x-6 text-gray-600">
                    <button
                      className="flex items-center text-gray-600 font-semibold hover:text-blue-600 transition duration-200"
                      onClick={() =>
                        post.likedBy?.includes(
                          ProfileDetails?.userDetails?.[0]?._id
                        )
                          ? handleDislikePost(post._id)
                          : handleLikePost(post._id)
                      }
                    >
                      <FaThumbsUp
                        className={`mr-1 ${
                          post.likedBy?.includes(
                            ProfileDetails?.userDetails?.[0]?._id
                          )
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                      ({post.likes})
                    </button>
                    <button
                      onClick={(e) => handleNavigatePostDetails(e, post)}
                      className="flex items-center text-gray-600 font-semibold hover:text-blue-600 transition duration-200"
                    >
                      <FaComment className="mr-1" />({post.commentCount})
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-blue-600 transition duration-200">
                      <FaShare className="mr-1" />({post.shares})
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No posts available.</p>
            )}
          </section>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
            <form onSubmit={handlePostSubmit}>
              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="What's on your mind?"
                value={PostInputValue.content}
                onChange={(e) => PostInputOnChange("content", e.target.value)}
                rows={4}
              ></textarea>
              <input
                type="file"
                className="w-full mb-4"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imageError && (
                <p className="text-red-500 text-sm">{imageError}</p>
              )}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
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
                  {isFormSubmit ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Post */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
            <form onSubmit={(e) => handlePostUpdate(e, currentEditPost._id)}>
              <textarea
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Update your content"
                value={PostInputValue.content}
                onChange={(e) => PostInputOnChange("content", e.target.value)}
                rows={4}
              ></textarea>
              <input
                type="file"
                className="w-full mb-4"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imageError && (
                <p className="text-red-500 text-sm">{imageError}</p>
              )}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  onClick={toggleEditModal}
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
  );
};

export default Home;
