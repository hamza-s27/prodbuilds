import React from 'react'

const Blogcard = (props) => {
  return (
    <div className='blog-card'>
        <div className='blog-info'>
            <span>{props.genere}</span>
            <h3>{props.title}</h3>
        </div>

        <div>
            <p className='know-more'>Know More</p>
        </div>
        
    </div>
  )
}

export default Blogcard