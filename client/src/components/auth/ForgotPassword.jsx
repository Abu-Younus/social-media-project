// eslint-disable-next-line no-unused-vars
import React from "react";
import { useNavigate } from "react-router-dom";
import UserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import ValidationHelper from "../../utility/ValidationHelper";
import { setEmail } from "../../utility/Utility";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    ForgotPasswordFormValue,
    ForgotPasswordFormOnChange,
    ForgotPasswordRequest,
    isFormSubmit,
  } = UserStore();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!ForgotPasswordFormValue.email) {
      toast.error("Email is required.");
      return;
    }

    if (!ValidationHelper.IsEmail(ForgotPasswordFormValue.email)) {
      toast.error("Invalid email format.");
      return;
    }

    try {
      const response = await ForgotPasswordRequest({
        ...ForgotPasswordFormValue,
      });
      if (response?.status === "success") {
        setEmail(ForgotPasswordFormValue.email);
        toast.success(response?.message);
        ForgotPasswordFormOnChange("email", "");
        navigate("/otp-verification");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error during forgot password process:", error);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Forgot Password
        </h2>
        <form onSubmit={handleForgotPassword}>
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
              value={ForgotPasswordFormValue.email}
              onChange={(e) => {
                ForgotPasswordFormOnChange("email", e.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your registered email"
            />
          </div>
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-md ${
              isFormSubmit ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            {isFormSubmit ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
