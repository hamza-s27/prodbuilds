import React from 'react'
import "../../styles/section3.css"

const Section3 = () => {
  return (
    <div>
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
       </section></div>
  )
}

export default Section3