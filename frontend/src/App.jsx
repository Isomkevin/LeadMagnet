import { useState } from 'react'
import LandingPage from './components/LandingPage'
import InputForm from './components/InputForm'
import AgentPlayground from './components/AgentPlayground'
import LinkedInMessenger from './components/LinkedInMessenger'
import LinkedInPostSearch from './components/LinkedInPostSearch'

function App() {
  const [view, setView] = useState('landing')
  const [config, setConfig] = useState(null)

  const handleGetStarted = () => {
    setView('input')
  }

  const handleStart = (formData) => {
    setConfig(formData)
    setView('playground')
  }

  const handleReset = () => {
    setView('input')
    setConfig(null)
  }

  const handleBackToHome = () => {
    setView('landing')
    setConfig(null)
  }

  const handleLinkedInMessenger = () => {
    setView('linkedin-messenger')
  }

  const handleLinkedInPostSearch = () => {
    setView('linkedin-posts')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'landing' ? (
        <LandingPage
          onGetStarted={handleGetStarted}
          onLinkedInMessenger={handleLinkedInMessenger}
          onLinkedInPostSearch={handleLinkedInPostSearch}
        />
      ) : view === 'input' ? (
        <InputForm onStart={handleStart} onBack={handleBackToHome} />
      ) : view === 'playground' ? (
        <AgentPlayground config={config} onReset={handleReset} />
      ) : view === 'linkedin-messenger' ? (
        <LinkedInMessenger onBack={handleBackToHome} />
      ) : view === 'linkedin-posts' ? (
        <LinkedInPostSearch onBack={handleBackToHome} />
      ) : null}
    </div>
  )
}

export default App
