"use client"
import React, { useRef } from 'react'
import Resultcard from './Resultcard'
import "../../styles/sectionresults.css"

const SectionResults = () => {
  const containerRef = useRef(null);
  const CARD_WIDTH = 358 + 20; // card min-width + gap

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
    }
  };

  return (
    <div className='sec-result'>
      <div className='container-results'>
        <h2>Results We Made Possible</h2>
        <div className='container no-scrollbar' ref={containerRef}>
          <Resultcard 
            heading="5,000+" 
            text="Hours saved in creation of an iframe Widget with multimedia features." 
            title="SAAS INDUSTARY LEADERS" 
            cap1="Customer Experience" 
            cap2="Website Widget and Applications"></Resultcard>
          <Resultcard 
            heading="5,000+" 
            text="Hours saved in creation of an iframe Widget with multimedia features." 
            title="SAAS INDUSTARY LEADERS" 
            cap1="Customer Experience" 
            cap2="Website Widget and Applications"></Resultcard>
          <Resultcard 
            heading="5,000+" 
            text="Hours saved in creation of an iframe Widget with multimedia features." 
            title="SAAS INDUSTARY LEADERS" 
            cap1="Customer Experience" 
            cap2="Website Widget and Applications"></Resultcard>
          <Resultcard 
            heading="5,000+" 
            text="Hours saved in creation of an iframe Widget with multimedia features." 
            title="SAAS INDUSTARY LEADERS" 
            cap1="Customer Experience" 
            cap2="Website Widget and Applications"></Resultcard>
          <Resultcard 
            heading="5,000+" 
            text="Hours saved in creation of an iframe Widget with multimedia features." 
            title="SAAS INDUSTARY LEADERS" 
            cap1="Customer Experience" 
            cap2="Website Widget and Applications"></Resultcard>
        </div>
        <div className="arrow-controls">
          <button className="arrow-btn left" onClick={scrollLeft} aria-label="Scroll Left">&#8592;</button>
          <button className="arrow-btn right" onClick={scrollRight} aria-label="Scroll Right">&#8594;</button>
        </div>
      </div>
    </div>
  )
}

export default SectionResults