import React from 'react'

const ServiceCard = (props) => {
  return (
    <div className='serviceCard'>
     <div className='service-container'>
        <div className="service-header">
            <h4>{props.title}</h4>
        </div>
        <div className="service-content">    
            <p>{props.content}</p>
        </div>
        <div className="service-image">
            
             <img src={props.imgsrc} alt={props.alt} /> 
        </div>
     </div>
    </div>
  )
}

export default ServiceCard


