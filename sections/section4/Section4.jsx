import React from 'react'
import "../../styles/section4.css"

const Section4 = () => {
  return (
    <div>

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
    </div>
  )
}

export default Section4