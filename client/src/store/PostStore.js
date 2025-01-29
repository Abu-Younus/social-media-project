import axios from "axios";
import { create } from "zustand";
import { unauthorized } from "../utility/Utility";
import Cookie from "js-cookie";
import { BaseURL } from "../utility/BaseURL";

const PostStore = create((set) => ({
  isFormSubmit: false,
  PostInputValue: { postImg: "", content: "" },
  errors: { postImg: "", content: "" },

  PostInputOnChange: (name, value) =>
    set((state) => ({
      PostInputValue: { ...state.PostInputValue, [name]: value },
      errors: { ...state.errors, [name]: "" },
    })),

  PostCreateRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const token = Cookie.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.post(
        `${BaseURL}/api/create-post`,
        postBody,
        {
          headers: { token, "Content-Type": "multipart/form-data" },
        }
      );

      set({ isFormSubmit: false });
      return response.data;
    } catch (err) {
      console.error("Post creation error:", err.response?.data || err.message);
      set({ isFormSubmit: false });
      throw err;
    }
  },

  PostUpdateRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const token = Cookie.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.post(
        `${BaseURL}/api/update-post`,
        postBody,
        {
          headers: { token, "Content-Type": "multipart/form-data" },
        }
      );

      set({ isFormSubmit: false });
      return response.data;
    } catch (err) {
      console.error("Post update error:", err.response?.data || err.message);
      set({ isFormSubmit: false });
      throw err;
    }
  },

  PostDeleteRequest: async (postID) => {
    try {
      const token = Cookie.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.delete(`${BaseURL}/api/delete-post`, {
        headers: { token },
        data: { postID },
      });

      return response.data;
    } catch (err) {
      console.error("Post deletion error:", err.response?.data || err.message);
      throw err;
    }
  },

  AllPostDetails: [],
  AllPostDetailsRequest: async () => {
    try {
      const response = await axios.get(`${BaseURL}/api/read-all-post`, {
        headers: { token: Cookie.get("token") },
      });
      set({ AllPostDetails: response.data.data || [] });
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  },

  //My post details
  SinglePostDetails: null,
  SinglePostDetailsRequest: async (postID) => {
    try {
      let response = await axios.get(
        `${BaseURL}/api/read-post-by-id/${postID}`,
        {
          headers: { token: Cookie.get("token") },
        }
      );

      if (response.data.status === "success") {
        set({ SinglePostDetails: response.data.data });
      } else {
        set({ SinglePostDetails: null });
      }
    } catch (err) {
      console.error("Error fetch in single post details:", err);
      unauthorized(err.response?.status || 500);
    }
  },

  //My post details
  MyPostDetails: [],
  MyPostDetailsRequest: async () => {
    try {
      let response = await axios.get(`${BaseURL}/api/read-post-by-userID`, {
        headers: {
          token: Cookie.get("token"),
        },
      });

      if (response.data.status === "success" && response.data.data) {
        set({ MyPostDetails: response.data.data });
      } else {
        set({ MyPostDetails: [] });
      }
    } catch (err) {
      console.error("Error fetch in My Post Details:", err);
      unauthorized(err.response?.status || 500);
    }
  },

  // Like Post Request
  LikePostRequest: async (postID) => {
    try {
      const token = Cookie.get("token");
      if (!token) throw new Error("User not logged in.");

      const response = await axios.post(
        `${BaseURL}/api/like-post`,
        { postID },
        { headers: { token } }
      );

      if (response.data.status === "success") {
        set((state) => ({
          AllPostDetails: state.AllPostDetails.map((post) =>
            post._id === postID
              ? { ...post, likedBy: response.data.likedBy }
              : post
          ),
        }));
      }

      return response.data;
    } catch (err) {
      console.error("Like post error:", err.response?.data || err.message);
      unauthorized(err.response?.status || 500);
      throw err;
    }
  },

  // Dislike Post Request
  DislikePostRequest: async (postID) => {
    try {
      const token = Cookie.get("token");
      if (!token) throw new Error("User not logged in.");

      const response = await axios.post(
        `${BaseURL}/api/dislike-post`,
        { postID },
        { headers: { token } }
      );

      if (response.data.status === "success") {
        set((state) => ({
          AllPostDetails: state.AllPostDetails.map((post) =>
            post._id === postID
              ? { ...post, dislikedBy: response.data.dislikedBy }
              : post
          ),
        }));
      }

      return response.data;
    } catch (err) {
      console.error("Dislike post error:", err.response?.data || err.message);
      unauthorized(err.response?.status || 500);
      throw err;
    }
  },

  // Share Post Request
  SharePostRequest: async (postID) => {
    try {
      const token = Cookie.get("token");
      if (!token) throw new Error("User not logged in.");

      const response = await axios.post(
        `${BaseURL}/api/share-post`,
        { postID },
        { headers: { token } }
      );

      if (response.data.status === "success") {
        // Optionally, update the AllPostDetails or other store states if needed
      }

      return response.data;
    } catch (err) {
      console.error("Share post error:", err.response?.data || err.message);
      unauthorized(err.response?.status || 500);
      throw err;
    }
  },
}));

export default PostStore;
