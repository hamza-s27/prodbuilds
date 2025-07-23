import Hero from "@/components/Hero";
import Image from "next/image";
import "../styles/section2.css";
import "../styles/section3.css"
import Smallcard from "@/components/Smallcard";
import Infocard from "@/components/Infocard";
import "../styles/section4.css";
import Button from "@/components/Button";

export default function Home() {
  return (
    <main>
      <section>
      <Hero></Hero>
      </section>
       <section className="sec2-bg">
        <div className="sec2-main">
          <div className="sec2-content">
            <h2>
              Create a mobile app for your company in just three easy steps
            </h2>
            <Smallcard 
            title="Get Started" 
            caption="Sign up, choose a template, and give your app a name."
            ></Smallcard>
            <Smallcard 
            title="Get Started" 
            caption="Sign up, choose a template, and give your app a name."
            ></Smallcard>
            <Smallcard 
            title="Get Started" 
            caption="Sign up, choose a template, and give your app a name."
            ></Smallcard>


          </div>
          <div className="sec2-image">

            <img src="../assets/iphonemockup.png"></img>

          </div>
        </div>
       </section>

       <section className="sec3-bg">
        <div className="sec3-content">
          <div className="sec3-heading">
            <h2>hello how are you</h2>
          </div>
          <div className="sec3-mainImg">
            <img src="/assets/app-screen.png" alt="image desctiption"></img>
          </div>
          <div className="sec3-img">
            <img src="/assets/timeline.svg" alt="timeline image"></img>
          </div>
          <div className="sec3-cards">
          <Infocard icon ="/assets/rapid-prototype.svg" heading="Unlike any other app builder or low-code development platform" para1 ="You’re often faced with the choice of cookie cutter app builders that only offer limited functionality and no way to build custom features, or expensive, enterprise low-code development platforms that require a great deal of technical expertise." para2="With Buildfire we combine the simplicity of DIY app development with all the power of fully custom app development." ></Infocard>
          <Infocard icon ="/assets/rapid-prototype.svg" heading="Unlike any other app builder or low-code development platform" para1 ="You’re often faced with the choice of cookie cutter app builders that only offer limited functionality and no way to build custom features, or expensive, enterprise low-code development platforms that require a great deal of technical expertise." para2="With Buildfire we combine the simplicity of DIY app development with all the power of fully custom app development." ></Infocard>
          <Infocard icon ="/assets/rapid-prototype.svg" heading="Unlike any other app builder or low-code development platform" para1 ="You’re often faced with the choice of cookie cutter app builders that only offer limited functionality and no way to build custom features, or expensive, enterprise low-code development platforms that require a great deal of technical expertise." para2="With Buildfire we combine the simplicity of DIY app development with all the power of fully custom app development." ></Infocard>
          <Infocard icon ="/assets/rapid-prototype.svg" heading="Unlike any other app builder or low-code development platform" para1 ="You’re often faced with the choice of cookie cutter app builders that only offer limited functionality and no way to build custom features, or expensive, enterprise low-code development platforms that require a great deal of technical expertise." para2="With Buildfire we combine the simplicity of DIY app development with all the power of fully custom app development." ></Infocard>
          </div>
          
          
        </div>


       </section>

       <section className="sec4-bg">
        <div className="sec4-content">
          <div className="sec4-heading">
            <h2>Our Projects</h2>
          </div>
          <div className="sec4-img">
              <img src="/assets/phone-screens.png"></img>
          </div>
          <div className="sec4-button">
            <Button className="sec-btn" title="Get Started" ></Button>
          </div>

        </div>
       </section>
    </main>
  );
}
