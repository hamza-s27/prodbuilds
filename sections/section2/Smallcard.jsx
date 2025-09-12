import React from 'react'
import '../../styles/smallcard.css'
import '../../styles/section2.css'


const Smallcard = (props) => {
  return (
    
    <>
    <div className="sec2-main">
          <h2>What We Deliver</h2>
     <div className="sec2-container">
          <div className="sec2-image">
            <img src={props.src}></img>
          </div>
    <div className="sec2-content">
      <div>
              <h4>
              SERVICES
            </h4>
        <div className='sc'>
        
            <div className='sc-content'>
            <h3>{props.title}</h3>
            <p>{props.caption}</p>
            </div>
        </div>
    </div> 

    <div className='scroll-arrow'>
              <p>dsada</p>
            </div>          
    </div>
          
    </div>
        </div>
    </>
  )
}

export default Smallcard
