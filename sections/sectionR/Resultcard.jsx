import React from 'react'
import "../../styles/sectionresults.css"
const Resultcard = (props) => {
  return (

    <div className='result-card'>
        <div className="content1">
        <h1>{props.heading}</h1>
        <p>{props.text}</p>
        </div>
        <div className="slide-up">
            <div className='slide-up-content'>
            <h4>{props.title}</h4>
            <hr />
            <p>{props.cap1}</p>
            <p>{props.cap2}</p>
            <img src="../assets/zingly.webp" alt="phone picture"  />
            <span>Know More</span>
            </div>
        </div>
    </div>
  )
}

export default Resultcard