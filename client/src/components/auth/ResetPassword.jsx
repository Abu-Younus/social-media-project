// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import ValidationHelper from "../../utility/ValidationHelper";

const ResetPassword = () => {
  const navigate = useNavigate();
  const {
    ResetPasswordFormValue,
    ResetPasswordFormOnChange,
    ResetPasswordRequest,
    isFormSubmit,
  } = UserStore();

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!ResetPasswordFormValue.password) {
      toast.error("New Password is required.");
      return;
    }
    if (!ValidationHelper.IsPassword(ResetPasswordFormValue.password)) {
      toast.error(
        "The new password must be at least 8 characters, including 1 uppercase, 1 lowercase, 1 digit, and 1 special character!"
      );
      return;
    }
    if (ResetPasswordFormValue.password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await ResetPasswordRequest(
        ResetPasswordFormValue.password
      );
      if (response?.status === "success") {
        toast.success(response?.message);
        ResetPasswordFormOnChange("password", "");
        setConfirmPassword("");
        navigate("/login");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Reset Password
        </h2>
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={ResetPasswordFormValue.password}
              onChange={(e) =>
                ResetPasswordFormOnChange("password", e.target.value)
              }
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-md ${
              isFormSubmit ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            {isFormSubmit ? "Processing..." : "Reset Password"}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-center">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
