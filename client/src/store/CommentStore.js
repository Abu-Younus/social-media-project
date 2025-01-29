import axios from "axios";
import { create } from "zustand";
import Cookies from "js-cookie";
import { BaseURL } from "../utility/BaseURL";

const CommentStore = create((set) => ({
  isFormSubmit: false,

  //Comment create
  CommentInputValue: { comment: "" },
  errors: { comment: "" },

  CommentInputOnChange: (name, value) =>
    set((state) => ({
      CommentInputValue: { ...state.CommentInputValue, [name]: value },
      errors: { ...state.errors, [name]: "" },
    })),

  CommentCreateRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.post(
        `${BaseURL}/api/create-comment`,
        postBody,
        {
          headers: { token },
        }
      );

      set({ isFormSubmit: false });
      return response.data;
    } catch (err) {
      console.error(
        "Comment creation error:",
        err.response?.data || err.message
      );
      set({ isFormSubmit: false });
      throw err;
    }
  },

  //Comment update
  CommentUpdateInputValue: { comment: "" },
  updateErrors: { comment: "" },

  CommentUpdateInputOnChange: (name, value) =>
    set((state) => ({
      CommentUpdateInputValue: { ...state.CommentUpdateInputValue, [name]: value },
      updateErrors: { ...state.errors, [name]: "" },
    })),

  CommentUpdateRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.post(
        `${BaseURL}/api/update-comment`,
        postBody,
        {
          headers: { token },
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

  //All comment details
  AllCommentDetails: [],
  AllCommentDetailsRequest: async (postID) => {
    try {
      const response = await axios.get(
        `${BaseURL}/api/read-comments-by-postID/${postID}`,
        {
          headers: { token: Cookies.get("token") },
        }
      );
      set({ AllCommentDetails: response.data.data || [] });
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  },

  //Comment delete
  CommentDeleteRequest: async (commentID) => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found. User may not be logged in.");
      }

      const response = await axios.delete(`${BaseURL}/api/delete-comment`, {
        headers: { token },
        data: { commentID },
      });

      return response.data;
    } catch (err) {
      console.error("Post deletion error:", err.response?.data || err.message);
      throw err;
    }
  },
}));

export default CommentStore;
