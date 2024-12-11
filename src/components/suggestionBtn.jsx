import React, { useState } from 'react'
import '../styles/suggestionBtn.css'

const SuggestionBtn = ({ onGetSuggestion, disabled }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    await onGetSuggestion()
    setIsLoading(false)
  }

  return (
    <button 
      className="suggestion-btn"
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Calculating...' : 'Get Best Move'}
    </button>
  )
}

export default SuggestionBtn