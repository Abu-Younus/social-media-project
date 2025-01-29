// eslint-disable-next-line no-unused-vars
import React from "react";
import { useNavigate } from "react-router-dom";
import UserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import ValidationHelper from "../../utility/ValidationHelper";

const OTPVerification = () => {
  const navigate = useNavigate();
  const { OtpFormValue, OtpFormOnChange, VerifyOtpRequest, isFormSubmit } =
    UserStore();

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!OtpFormValue.otp) {
      toast.error("OTP is required.");
      return;
    }
    if (!ValidationHelper.IsNumber(OtpFormValue.otp)) {
      toast.error("Invalid otp format.");
      return;
    }

    try {
      const response = await VerifyOtpRequest(OtpFormValue.otp);
      if (response?.status === "success") {
        toast.success(response?.message);
        OtpFormOnChange("otp", "");
        navigate("/reset-password");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          OTP Verification
        </h2>
        <form onSubmit={handleOtpVerification}>
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-gray-700 font-medium mb-2"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={OtpFormValue.otp}
              onChange={(e) => OtpFormOnChange("otp", e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the OTP sent to your email"
            />
          </div>
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-md ${
              isFormSubmit ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            {isFormSubmit ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
