import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/homepage.css'

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="hero-section">
        <h1 className="title">Checker Masters</h1>
        <Link to="/game" className="play-button">
          Play Now
        </Link>
      </div>
    </div>
  )
}

export default Homepage