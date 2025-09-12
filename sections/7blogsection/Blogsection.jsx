import React from 'react'
import Blogcard from './Blogcard'
import '../../styles/7blogsection.css'

const Blogsection = () => {
  return (
    <section className='sec-blog'>
        <div className='blog-container'>
            <div>
                <h2>Featured Blogs</h2>
                <p>Explore our insights, R&D findings, and comments on industry trends. How does business goals influence product development cost, what's the thin line of ethical AI usage, when is digital transformation non-negotiable — explore in detail through our insights.</p>
            </div>
            <div className='blog-cards-container'>
                <Blogcard genere="Technology" title="ChatGPT Tasks: Redefining Reminders and Productivity in the Age of Intelligent Agents" ></Blogcard>

            </div>
        </div>
    </section>
  )
}

export default Blogsection