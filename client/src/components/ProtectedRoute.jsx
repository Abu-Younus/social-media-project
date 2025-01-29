/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react";
import UserStore from "../store/UserStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isLogin } = UserStore();

  if (isLogin()) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
