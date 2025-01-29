// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import profileImage from "../assets/images/profile.png";
import { MdOutlineSearch } from "react-icons/md";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import UserStore from "../store/UserStore";

const Navbar = () => {
  const { isLogin, ProfileDetails, ProfileDetailsRequest, LogoutRequest } =
    UserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (isLogin()) {
      ProfileDetailsRequest();
    }
  }, [isLogin, ProfileDetailsRequest]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await LogoutRequest();
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow-md sticky top-0 w-full z-10">
      <div className="container flex justify-between items-center py-4">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-blue-600 flex-shrink-0"
        >
          Social Media
        </NavLink>

        {/* Search Bar (Visible on large screens) */}
        {isLogin() && (
          <div className="relative w-full max-w-lg sm:flex hidden mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pl-10 text-sm text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              />
              <MdOutlineSearch className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Profile Section (Including Search Icon for Small Screens) */}
        <div className="relative flex items-center space-x-4">
          {/* Search Icon (Visible on Small Screens Only) */}
          <div className="sm:hidden">
            <MdOutlineSearch
              className="w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => alert("Toggle search functionality")}
            />
          </div>
          {/* Profile Image */}
          <div className="relative flex items-center space-x-4">
            {/* Profile Image Dropdown (Visible on Login) */}
            {isLogin() ? (
              <div className="relative group" ref={dropdownRef}>
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-all duration-300 ease-in-out">
                  <img
                    src={
                      ProfileDetails?.profileImg ||
                      profileImage
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  />
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                    <ul className="py-2 text-gray-700">
                      <NavLink
                        to="/profile"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <FaUser className="mr-2 text-gray-500" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/setting"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <FaCog className="mr-2 text-gray-500" />
                        Settings
                      </NavLink>
                      <NavLink
                        to="/"
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="mr-2 text-gray-500" />
                        Logout
                      </NavLink>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-gray-600 hover:text-blue-600 hover:text-pretty"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
