import { useState } from 'react'
import InputForm from './components/InputForm'
import AgentPlayground from './components/AgentPlayground'

function App() {
  const [view, setView] = useState('input') // 'input' or 'playground'
  const [config, setConfig] = useState(null)

  const handleStart = (formData) => {
    setConfig(formData)
    setView('playground')
  }

  const handleReset = () => {
    setView('input')
    setConfig(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'input' ? (
        <InputForm onStart={handleStart} />
      ) : (
        <AgentPlayground config={config} onReset={handleReset} />
      )}
    </div>
  )
}

export default App

