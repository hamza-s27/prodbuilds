import React from 'react'
import '../styles/smallcard.css'

const Smallcard = (props) => {
  return (
    <div className='sc'>
        <div className='sc-icon'>
            <img src="/assets/career-goals.svg"></img>
        </div>
        <div className='sc-content'>
            <h3>{props.title}</h3>
            <p>{props.caption}</p>
        </div>
    </div>
  )
}

export default Smallcard