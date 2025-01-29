/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from "react";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";

const Layout = (props) => {
  return (
    <>
      <Navbar />
      {props.children}
      <ToastContainer
        position={"top-center"}
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Layout;
