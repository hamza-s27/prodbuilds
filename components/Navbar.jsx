"use client";
import React from "react";
import Button from "./Button";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src="www.google.com" alt="prodbuilds logo"></img>
        <ul className="nav-links">
          <li>Solutions</li>
          <li>Products</li>
          <li>Pricing</li>
          <li>Resources</li>
        </ul>
      </div>
      <div className="nav-links">
        <ul>
          <li>Login</li>
        </ul>
        <Button
          title="Get Started"
          type="submit"
          className="prm-btn rounded-full "
        ></Button>
      </div>
    </div>
  );
};

export default Navbar;
