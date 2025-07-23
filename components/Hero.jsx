"use client";
import React from "react";
import Button from "./Button";
import "../styles/hero.css";


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
        <div className="hero-content flex flex-col items-center text-center">
          <div className="flex flex-col justify-center items-center text-center">
            <h1 className="hero-heading">
              Build beautiful native mobile applications for your business
              without coding a single thing
            </h1>

            <p className="hero-caption">
              Prodbuilds powerful and easy to use mobile app builder helps
              businesses create mobile apps for iOS & Android in a fraction of
              the time and cost.
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
      </div>
    </section>
  );
};

export default Hero;
