/* eslint-disable no-undef */
import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import { getEmail, unauthorized } from "../utility/Utility";
import { BaseURL } from "../utility/BaseURL";
import { toast } from "react-toastify";

const UserStore = create((set) => ({
  isFormSubmit: false,

  isLogin: () => {
    return !!Cookies.get("token");
  },

  RegisterFormValue: { fullName: "", email: "", password: "" },
  RegisterFormOnChange: (name, value) => {
    set((state) => ({
      RegisterFormValue: {
        ...state.RegisterFormValue,
        [name]: value,
      },
    }));
  },

  //Register request
  RegisterRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      let response = await axios.post(`${BaseURL}/api/registration`, postBody);
      set({ isFormSubmit: false });
      return response.data;
    } catch (e) {
      set({ isFormSubmit: false });
      toast.error(e.response?.data?.message || "Something went wrong!");
      throw error;
    }
  },

  LoginFormValue: { email: "", password: "" },
  LoginFormOnChange: (name, value) => {
    set((state) => ({
      LoginFormValue: {
        ...state.LoginFormValue,
        [name]: value,
      },
    }));
  },

  //Login request
  LoginRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const response = await axios.post(`${BaseURL}/api/login`, postBody);
      Cookies.set("token", response.data.token);
      set({ isLogin: true });
      set({ isFormSubmit: false });
      return response.data;
    } catch (error) {
      set({ isFormSubmit: false });
      toast.error(error.response?.data?.message || "Login failed!");
      throw error;
    }
  },

  ProfileFormValue: {
    coverImg: "",
    profileImg: "",
    fullName: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
  },
  ProfileFormOnChange: (name, value) => {
    set((state) => ({
      ProfileFormValue: {
        ...state.ProfileFormValue,
        [name]: value,
      },
    }));
  },

  //Profile details
  ProfileDetails: null,
  ProfileDetailsRequest: async () => {
    try {
      let response = await axios.get(`${BaseURL}/api/profile-read`, {
        headers: {
          token: Cookies.get("token"),
        },
      });

      if (response.data.status === "success") {
        set({ ProfileDetails: response.data["data"] });
        set({ ProfileFormValue: response.data["data"] });
      } else {
        set({ ProfileDetails: null });
      }
    } catch (err) {
      unauthorized(err.response.status);
    }
  },

  //profile update
  ProfileUpdateRequest: async (PostBody) => {
    try {
      set({ ProfileDetails: null });
      let response = await axios.post(
        `${BaseURL}/api/update-profile`,
        PostBody,
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );
      return response.data;
    } catch (err) {
      unauthorized(err.response.status);
    }
  },

  //User Follow & Unfollow
  UserFollowRequest: async ({email, userID}) => {
    try {
      let response = await axios.post(
        `${BaseURL}/api/follow-user`,
        {email, userID},
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );
      return response.data;
    } catch (err) {
      unauthorized(err.response.status);
    }
  },

  UserUnFollowRequest: async ({email, userID}) => {
    try {
      let response = await axios.post(
        `${BaseURL}/api/unfollow-user`,
        {email, userID},
        {
          headers: {
            token: Cookies.get("token"),
          },
        }
      );
      return response.data;
    } catch (err) {
      unauthorized(err.response.status);
    }
  },

  // Forgot Password
  ForgotPasswordFormValue: { email: "" },
  ForgotPasswordFormOnChange: (name, value) => {
    set((state) => ({
      ForgotPasswordFormValue: {
        ...state.ForgotPasswordFormValue,
        [name]: value,
      },
    }));
  },

  ForgotPasswordRequest: async (postBody) => {
    try {
      set({ isFormSubmit: true });
      const response = await axios.post(
        `${BaseURL}/api/forgot-password`,
        postBody
      );
      set({ isFormSubmit: false });
      return response.data;
    } catch (error) {
      set({ isFormSubmit: false });
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    }
  },

  //OTP verification
  OtpFormValue: { otp: "" },
  OtpFormOnChange: (name, value) => {
    set((state) => ({
      OtpFormValue: {
        ...state.OtpFormValue,
        [name]: value,
      },
    }));
  },

  VerifyOtpRequest: async (otp) => {
    try {
      set({ isFormSubmit: true });
      const email = getEmail("email");
      const response = await axios.post(`${BaseURL}/api/verify-otp`, {
        email,
        otp,
      });
      set({ isFormSubmit: false });
      return response.data;
    } catch (error) {
      set({ isFormSubmit: false });
      toast.error(error.response?.data?.message || "OTP verification failed!");
    }
  },

  //Password Reset
  ResetPasswordFormValue: { email: "", password: "" },
  ResetPasswordFormOnChange: (name, value) => {
    set((state) => ({
      ResetPasswordFormValue: {
        ...state.ResetPasswordFormValue,
        [name]: value,
      },
    }));
  },

  ResetPasswordRequest: async (password) => {
    try {
      set({ isFormSubmit: true });
      const email = sessionStorage.getItem("email");
      const response = await axios.post(`${BaseURL}/api/reset-password`, {
        email,
        password,
      });
      set({ isFormSubmit: false });
      return response.data;
    } catch (error) {
      set({ isFormSubmit: false });
      toast.error(error.response?.data?.message || "Password reset failed!");
    }
  },

  LogoutRequest: async () => {
    try {
      const response = await axios.get(`${BaseURL}/api/logout`, {
        headers: {
          token: Cookies.get("token"),
        },
      });
      Cookies.remove("token");
      set({ isLogin: false });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed!");
    }
  },
}));

export default UserStore;
