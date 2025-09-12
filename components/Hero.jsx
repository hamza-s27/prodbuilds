"use client";
import React from "react";
import Button from "./Button";
import "../styles/hero.css";
import Scroller from "./Scroller";


const Hero = () => {
  const getStarted = () => {
    console.log("get started clicked");
  };
  const bookDemo = () => {
    console.log("book demo was clicked");
  };

  return (
    <section className="hero-bg">
      
      {/* hero section start  */}
      <div className=" hero flex flex-col justify-center items-center text-center">
        {/* hero text and buttons */}
        <div className=" flex flex-col items-center text-center">
          <div className="hero-content">
            <h1 className="hero-heading">
              Innovate.
              Collaborate.
              Build.
            </h1>

            <p className="hero-caption">
              Product development studio with an AI-driven customer-centric approach.
            </p>
          </div>
          <div className="hero-btn">
            <Button
              onClick={getStarted}
              type="submit"
              title="Get Started"
              className=" prm-btn"
            ></Button>
            <Button
              onClick={bookDemo}
              type="submit"
              title="Book a Demo"
              className="sec-btn"
            ></Button>
          </div>
        </div>
        <div className="client-logo">
          <img src="/assets/pepsi.png"></img>
          <img src="/assets/pepsi.png"></img>
          <img src="/assets/pepsi.png"></img>
          <img src="/assets/pepsi.png"></img>
          <img src="/assets/pepsi.png"></img>
          <img src="/assets/pepsi.png"></img>
          
       
        </div>
        {/* more divs below this */}
        <Scroller></Scroller>
      </div>
    </section>
  );
};

export default Hero;
