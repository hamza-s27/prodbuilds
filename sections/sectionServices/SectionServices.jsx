import React from 'react'
import "../../styles/sectionservice.css"
import Button from '@/components/Button'
import ServiceCard from './ServiceCard'

const SectionServices = () => {
  return (
    <div className='container-service-bg'>
        <div className="container-service">
            <div className="heading">
                <h2>Services and Industries We Excel In</h2>
                <p>Boost business efficiency, optimize costs, improve customer experience, reduce go-to-market timelines, and much more with our dedicated service offerings for industries.</p>
            </div>
            <div className="button-div">
                <Button className="services-buttons" title="SERVICES"></Button>
                <Button className="services-buttons" title="industries"></Button>
                <Button className="services-buttons" title="solutions"></Button>

            </div>
            
            <div className="service-card-container">
                <div className="inner-grid1">
                <ServiceCard 
                title="Enterprise Modernization" 
                content="We upgrade your legacy systems to modern tech stacks and workflows. From strategy to delivery, we take ownership of the process end-to-end. Partner with us to adopt future-ready technology."
                imgsrc="/assets/enterprise.webp" 
                alt="modern entrpise conectiviy photo" ></ServiceCard>
                
                 <ServiceCard 
                title="Enterprise Modernization" 
                content="We upgrade your legacy systems to modern tech stacks and workflows. From strategy to delivery, we take ownership of the process end-to-end. Partner with us to adopt future-ready technology."
                imgsrc="/assets/enterprise.webp" 
                alt="" ></ServiceCard>

                </div>
                
                <div className="inner-grid2">
                    <ServiceCard 
                title="Enterprise Modernization" 
                content="We upgrade your legacy systems to modern tech stacks and workflows. From strategy to delivery, we take ownership of the process end-to-end. Partner with us to adopt future-ready technology."
                imgsrc="/assets/enterprise.webp" 
                alt="" ></ServiceCard>
                <ServiceCard 
                title="Enterprise Modernization" 
                content="We upgrade your legacy systems to modern tech stacks and workflows. From strategy to delivery, we take ownership of the process end-to-end. Partner with us to adopt future-ready technology."
                imgsrc="/assets/enterprise.webp" 
                alt="" ></ServiceCard>
                <ServiceCard 
                title="Enterprise Modernization" 
                content="We upgrade your legacy systems to modern tech stacks and workflows. From strategy to delivery, we take ownership of the process end-to-end. Partner with us to adopt future-ready technology."
                imgsrc="/assets/enterprise.webp" 
                alt="" ></ServiceCard>
                </div>

                 
            </div>


        </div>
</div>
  )
}

export default SectionServices