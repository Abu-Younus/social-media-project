/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import profileImage from "../assets/images/profile.png";
import {
  FaThumbsUp,
  FaComment,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEllipsisH,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import UserStore from "../store/UserStore";
import PostStore from "../store/PostStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { TimestampToDate } from "../utility/Utility";

const Profile = () => {
  const {
    isLogin,
    ProfileDetails,
    ProfileDetailsRequest,
    ProfileFormValue,
    ProfileFormOnChange,
    ProfileUpdateRequest
  } = UserStore();
  const {
    MyPostDetails,
    MyPostDetailsRequest,
    PostInputValue,
    PostInputOnChange,
    PostUpdateRequest,
    PostDeleteRequest,
    LikePostRequest,
    DislikePostRequest,
    isFormSubmit,
  } = PostStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [modalProfileOpen, setModalProfileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const [editingPost, setEditingPost] = useState(null);

  const MAX_IMAGE_SIZE_MB = 2;

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleProfileModal = () => {
    setModalProfileOpen(!modalProfileOpen);
    setCoverImagePreview(ProfileFormValue.coverImg);
    setProfileImagePreview(ProfileFormValue.profileImg);
  };

  const handlePostImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPostImagePreview(reader.result);
    reader.readAsDataURL(file);
    PostInputOnChange("postImg", file);
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
    ProfileFormOnChange("profileImg", file);
  };

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCoverImagePreview(reader.result);
    reader.readAsDataURL(file);
    ProfileFormOnChange("coverImg", file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const profileData = {
      fullName: ProfileFormValue.fullName,
      phone: ProfileFormValue.phone,
      bio: ProfileFormValue.bio,
      location: ProfileFormValue.location,
      website: ProfileFormValue.website,
      profileImg: ProfileFormValue.profileImg,
      coverImg: ProfileFormValue.coverImg,
    }

    const response = await ProfileUpdateRequest(profileData);
    setLoading(true);
    if (response?.status === "success") {
      toast.success(response?.message);
      setCoverImagePreview(null);
      setProfileImagePreview(null);
      toggleProfileModal();
      await ProfileDetailsRequest();
      setLoading(false);
    } else {
      setLoading(false);
      toast.error(response?.message);
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
          await MyPostDetailsRequest();
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

  const handleEdit = (post) => {
    setEditingPost(post._id);
    PostInputOnChange("content", post.content);
    setPostImagePreview(post.postImg);
    setModalOpen(true);
  };

  const toggleOptions = (postId) => {
    setShowOptions((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const handlePostUpdate = async (event) => {
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
      const response = await PostUpdateRequest({
        ...PostInputValue,
        postID: editingPost,
      });
     
      if (response?.status === "success") {
        toast.success("Post updated successfully!");
        setPostImagePreview(null);
        toggleModal();
        toggleOptions(editingPost);
        await MyPostDetailsRequest();
      } else {
        toast.error(response?.message || "Post update failed!");
      }
    } catch (err) {
      toast.error("Error updating post: " + err.message);
    }
  };

  const handleLikePost = async (postID) => {
    try {
      await LikePostRequest(postID);
      toast.success("You liked the post!");
      await MyPostDetailsRequest();
    } catch (err) {
      toast.error("Error liking post: " + err.message);
    }
  };

  const handleDislikePost = async (postID) => {
    try {
      await DislikePostRequest(postID);
      toast.success("You disliked the post!");
      await MyPostDetailsRequest();
    } catch (err) {
      toast.error("Error disliking post: " + err.message);
    }
  };

  const handleNavigatePostDetails = async (e, post) => {
    e.preventDefault();
    await navigate(`/post/details/${post._id}`);
  };

  useEffect(() => {
    if (isLogin()) {
      (async () => {
        await ProfileDetailsRequest();
        await MyPostDetailsRequest();
        setLoading(false);
      })();
    }
  }, [
    isLogin,
    ProfileDetailsRequest,
    MyPostDetailsRequest,
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
    <div className="container mx-auto p-8 flex flex-col min-h-screen bg-gray-100">
      {/* Profile Header */}
      <div className="relative w-full h-72 bg-blue-500">
        <img
          src={ProfileDetails?.coverImg || profileImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-80 absolute"
        />
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded shadow transition-all duration-300 relative float-right"
          onClick={toggleProfileModal}
        >
          <FaEdit />
        </button>
        <div className="absolute bottom-0 left-4 mb-4 flex items-center space-x-4">
          <img
            src={ProfileDetails?.profileImg || profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
          <div>
            <h3 className="text-xl sm:text-3xl font-semibold text-white">
              {ProfileDetails?.fullName}
            </h3>
            <p className="text-lg text-white">Software Engineer</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-grow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="items-center">
              <h4 className="font-semibold text-gray-800">
                {ProfileDetails?.followers.length}
              </h4>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="items-center">
              <h4 className="font-semibold text-gray-800">
                {ProfileDetails?.following.length}
              </h4>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
          <div className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-500">
              <FaFacebook className="text-xl" />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500">
              <FaTwitter className="text-xl" />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500">
              <FaInstagram className="text-xl" />
            </a>
          </div>
        </div>

        {/* Posts */}
        <section className="space-y-6">
          <h5 className="text-[18px] font-semibold mt-2 text-blue-600">
            My Posts ({MyPostDetails.length})
          </h5>
          <hr className="divide-x-0" />
          {MyPostDetails?.length > 0 ? (
            MyPostDetails.map((post, index) => (
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
                    </h3>
                    <p className="text-sm text-gray-500">
                      {TimestampToDate(post.createdAt)}
                    </p>
                  </div>
                  <button
                    className="text-gray-600 hover:text-blue-500 ml-auto"
                    onClick={() => toggleOptions(post._id)}
                  >
                    <FaEllipsisH className="text-xl" />
                  </button>
                  {showOptions[post._id] && (
                    <div className="absolute right-4 top-14 bg-white border rounded-lg shadow-lg py-2 w-32">
                      <button
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => handleEdit(post)}
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
                      post.likedBy?.includes(ProfileDetails?.userDetails?.[0]._id)
                        ? handleDislikePost(post._id)
                        : handleLikePost(post._id)
                    }
                  >
                    <FaThumbsUp
                      className={`mr-1 ${
                        post.likedBy?.includes(ProfileDetails?.userDetails?.[0]._id)
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                    ({post.likes})
                  </button>
                  <button
                    onClick={(e) => handleNavigatePostDetails(e, post)}
                    className="flex items-center font-semibold text-gray-600 hover:text-blue-500 transition duration-200"
                  >
                    <FaComment className="mr-2" />({post.commentCount})
                  </button>
                  <button className="flex items-center font-semibold text-gray-600 hover:text-blue-500 transition duration-200">
                    <FaShare className="mr-2" />({post.shares})
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No posts available.</p>
          )}
        </section>

        {/* Modal for Post Edit */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
              <h3 className="text-lg font-semibold mb-4">Update Post</h3>
              <form onSubmit={handlePostUpdate}>
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
                  onChange={handlePostImageChange}
                  accept="image/*"
                />
                {postImagePreview && (
                  <img
                    src={postImagePreview}
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
                    {isFormSubmit ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalProfileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
            <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
              <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={ProfileFormValue.fullName}
                    onChange={(e) =>
                      ProfileFormOnChange("fullName", e.target.value)
                    }
                    className="w-full border rounded-lg p-2 mb-4"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={ProfileFormValue.bio}
                    onChange={(e) => ProfileFormOnChange("bio", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-4"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={ProfileFormValue.location}
                    onChange={(e) =>
                      ProfileFormOnChange("location", e.target.value)
                    }
                    className="w-full border rounded-lg p-2 mb-4"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={ProfileFormValue.phone}
                    onChange={(e) =>
                      ProfileFormOnChange("phone", e.target.value)
                    }
                    className="w-full border rounded-lg p-2 mb-4"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="text"
                    value={ProfileFormValue.website}
                    onChange={(e) =>
                      ProfileFormOnChange("website", e.target.value)
                    }
                    className="w-full border rounded-lg p-2 mb-4"
                  />
                </div>
                <div className="form-group">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    onChange={handleCoverImageChange}
                    className="w-full mb-4"
                  />
                </div>
                {coverImagePreview && (
                  <img
                    src={coverImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <div className="form-group">
                  <label>Profile Image</label>
                  <input
                    type="file"
                    onChange={handleProfileImageChange}
                    className="w-full mb-4"
                  />
                </div>
                {profileImagePreview && (
                  <img
                    src={profileImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={toggleProfileModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Close
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
                    {isFormSubmit ? "Updating..." : "Update Profile"}
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

export default Profile;
