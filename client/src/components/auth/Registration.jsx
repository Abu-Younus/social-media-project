// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import ValidationHelper from "../../utility/ValidationHelper";

const Registration = () => {
  const navigate = useNavigate();
  const {
    RegisterFormValue,
    RegisterFormOnChange,
    RegisterRequest,
    isFormSubmit,
  } = UserStore();
  const [confirmPassword, setConfirmPassword] = useState("");

  const onFormSubmit = async (event) => {
    event.preventDefault();

    if (!RegisterFormValue.fullName) {
      toast.error("Full Name is required.");
      return;
    }
    if (!ValidationHelper.IsOnlyLetters(RegisterFormValue.fullName)) {
      toast.error("Invalid full name format.");
      return;
    }
    if (!RegisterFormValue.email) {
      toast.error("Email is required.");
      return;
    }
    // Validate email format
    if (!ValidationHelper.IsEmail(RegisterFormValue.email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!RegisterFormValue.password) {
      toast.error("Password is required.");
      return;
    }
    // Validate password format
    if (!ValidationHelper.IsPassword(RegisterFormValue.password)) {
      toast.error(
        "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character."
      );
      return;
    }
    if (!confirmPassword) {
      toast.error("Confirm Password is required.");
      return;
    }
    // Check if password and confirmPassword match
    if (RegisterFormValue.password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const postBody = { ...RegisterFormValue };
    try {
      let response = await RegisterRequest(postBody);
      if (response?.status === "success") {
        toast.success(response?.message);
        // Reset the form values
        RegisterFormOnChange("fullName", "");
        RegisterFormOnChange("email", "");
        RegisterFormOnChange("password", "");
        setConfirmPassword("");
        navigate("/login");
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error("Error registering user:", err.message);
    }
  };

  return (
    <div className="py-10 flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Register
        </h2>
        <form onSubmit={onFormSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={RegisterFormValue.fullName}
              onChange={(event) => {
                RegisterFormOnChange("fullName", event.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={RegisterFormValue.email}
              onChange={(event) => {
                RegisterFormOnChange("email", event.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={RegisterFormValue.password}
              onChange={(event) => {
                RegisterFormOnChange("password", event.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-md ${
              isFormSubmit ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            {isFormSubmit ? "Processing..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
