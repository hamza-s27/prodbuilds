import React from 'react'
import "../styles/infocard.css"
const Infocard = (props) => {
  return (
    <div className='info-card'> 
       <div className='icon'>
        <img src={props.icon} alt='icon'></img>
       </div>
       <div className='heading'>
        <h3>{props.heading}</h3>
       </div>
       <div className='para'>{props.para1}</div>
       <div className='para'>{props.para2}</div> 
    </div>
  )
}

export default Infocard