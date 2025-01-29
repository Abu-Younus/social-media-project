// eslint-disable-next-line no-unused-vars
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserStore from "../../store/UserStore";
import ValidationHelper from "../../utility/ValidationHelper";

const Login = () => {
  const { LoginFormValue, LoginFormOnChange, LoginRequest, isFormSubmit } =
    UserStore();

  const onFormSubmit = async (event) => {
    event.preventDefault();

    if (!LoginFormValue.email) {
      toast.error("Email is required.");
      return;
    }
    // Validate email format
    if (!ValidationHelper.IsEmail(LoginFormValue.email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!LoginFormValue.password) {
      toast.error("Password is required.");
      return;
    }

    try {
      const response = await LoginRequest({...LoginFormValue});

      if (response?.status === "success") {
        toast.success("Login successfully.");
        LoginFormOnChange("email", "");
        LoginFormOnChange("password", "");
        window.location.href = "/";
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(
        `Login failed: ${error?.message || "Unexpected error occurred"}`
      );
    }
  };

  return (
    <div className="py-12 flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        <form onSubmit={onFormSubmit}>
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
              value={LoginFormValue.email}
              onChange={(event) => {
                LoginFormOnChange("email", event.target.value);
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
              value={LoginFormValue.password}
              onChange={(event) => {
                LoginFormOnChange("password", event.target.value);
              }}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-4 text-right">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isFormSubmit}
            className={`w-full py-2 rounded-md ${
              isFormSubmit ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition duration-200`}
          >
            {isFormSubmit ? "Processing..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
