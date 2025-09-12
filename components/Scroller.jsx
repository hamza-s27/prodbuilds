import React from 'react'
import '../styles/scroller.css'
const Scroller = () => {
  return (
     <div class="logo-scroller-container">
        {/* <div class="scroller-header">
            <h2>Trusted by Leading Companies</h2>
            <p>Join thousands of satisfied clients worldwide</p>
        </div> */}
        
        <div class="logo-scroller">
            <div class="logo-track">
                {/* <!-- Original set of logos --> */}
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <img src="../assets/pepsi.svg" alt="" />
                        {/* <rect width="120" height="40" rx="8" fill="#1976d2"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">COMPANY</text> */}
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#388e3c"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">BRAND A</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#f57c00"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">CLIENT B</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#7b1fa2"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">PARTNER</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#d32f2f"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">TECH CO</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#303f9f"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">GLOBAL</text>
                    </svg>
                </div>
                
                {/* <!-- Duplicate set for seamless loop --> */}
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#1976d2"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">COMPANY</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#388e3c"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">BRAND A</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#f57c00"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">CLIENT B</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#7b1fa2"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">PARTNER</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#d32f2f"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">TECH CO</text>
                    </svg>
                </div>
                
                <div class="logo-item">
                    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                        <rect width="120" height="40" rx="8" fill="#303f9f"/>
                        <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">GLOBAL</text>
                    </svg>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Scroller