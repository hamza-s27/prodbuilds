"use client";
import React from "react";
import Button from "./Button";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <>
       <div className="navbar-short">
        <div className="nav-logo">
        <img src="/assets/pepsi.png" alt="prodbuilds logo" width={50}></img>
        </div>
        <div className="side-bar">
          <ul className="nav-links ">
            <li>Solutions</li>
            <li>Products</li>
            <li>Pricing</li>
            <li>Resources</li>
        </ul>
        </div>
        <div className="hamburger" id="hamburger">
          &#9776;
        </div>
      </div>


    <div className="navbar">
      <div className="nav-logo">
        <img src="www.google.com" alt="prodbuilds logo"></img>
      </div>
      <div>
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
          className="prm-btn "
        ></Button>
      </div>
      
    </div>
    </>
  );
};

export default Navbar;
