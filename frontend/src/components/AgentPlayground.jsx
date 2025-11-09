import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, FileJson, FileText, Zap } from 'lucide-react'
import ProcessCanvas from './ProcessCanvas'
import ResultsPanel from './ResultsPanel'
import axios from 'axios'

export default function AgentPlayground({ config, onReset }) {
  const [currentStage, setCurrentStage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [stageData, setStageData] = useState({})
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)

  const stages = [
    { id: 1, name: 'Initializing', description: 'Preparing AI agent' },
    { id: 2, name: 'AI Generation', description: 'Generating company data' },
    { id: 3, name: 'Web Scraping', description: 'Extracting contact info', skip: !config.enable_web_scraping },
    { id: 4, name: 'Data Consolidation', description: 'Merging results' },
    { id: 5, name: 'Completed', description: 'Leads ready' }
  ]

  const activeStages = stages.filter(s => !s.skip)

  useEffect(() => {
    startGeneration()
  }, [])

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const exportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads_${config.industry.replace(/\s+/g, '_')}_${Date.now()}.json`
    link.click()
    setShowExportMenu(false)
  }

  const exportTXT = () => {
    const companies = results?.data?.companies || []
    let txtContent = `LEAD GENERATION RESULTS\n`
    txtContent += `${'='.repeat(80)}\n\n`
    txtContent += `Industry: ${config.industry}\n`
    txtContent += `Country: ${config.country}\n`
    txtContent += `Total Companies: ${companies.length}\n`
    txtContent += `Generated: ${new Date().toLocaleString()}\n\n`
    txtContent += `${'='.repeat(80)}\n\n`

    companies.forEach((company, index) => {
      txtContent += `${index + 1}. ${company.company_name}\n`
      txtContent += `${'-'.repeat(80)}\n`
      if (company.website_url) txtContent += `Website: ${company.website_url}\n`
      if (company.contact_email) txtContent += `Email: ${company.contact_email}\n`
      if (company.headquarters_location) txtContent += `Location: ${company.headquarters_location}\n`
      if (company.company_size) txtContent += `Size: ${company.company_size}\n`
      if (company.revenue_market_cap) txtContent += `Revenue: ${company.revenue_market_cap}\n`
      txtContent += `\n`
    })

    const dataBlob = new Blob([txtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads_${config.industry.replace(/\s+/g, '_')}_${Date.now()}.txt`
    link.click()
    setShowExportMenu(false)
  }

  const startGeneration = async () => {
    setIsProcessing(true)
    setCurrentStage(0)

    try {
      // Stage 1: Initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStage(1)

      // Stage 2: AI Generation
      if (config.enable_web_scraping) {
        // Use async endpoint for web scraping
        const response = await axios.post('/api/v1/leads/generate-async', config)
        setJobId(response.data.job_id)
        setCurrentStage(2)

        // Poll for results
        pollJobStatus(response.data.job_id)
      } else {
        // Use sync endpoint
        setCurrentStage(2)
        const response = await axios.post('/api/v1/leads/generate', config)
        
        // Move through stages quickly
        await new Promise(resolve => setTimeout(resolve, 1500))
        setCurrentStage(3)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        setCurrentStage(4)
        
        setResults(response.data)
        setIsProcessing(false)
      }

    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      setIsProcessing(false)
    }
  }

  const pollJobStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/v1/leads/status/${jobId}`)
        const status = response.data.status

        if (status === 'processing' && currentStage < 3) {
          setCurrentStage(3) // Web scraping stage
        }

        if (status === 'completed') {
          clearInterval(pollInterval)
          setCurrentStage(4)
          setResults({ data: response.data.result, success: true })
          setIsProcessing(false)
        } else if (status === 'failed') {
          clearInterval(pollInterval)
          setError(response.data.error)
          setIsProcessing(false)
        }
      } catch (err) {
        clearInterval(pollInterval)
        setError('Failed to check job status')
        setIsProcessing(false)
      }
    }, 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header - Miro Style */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-500" />
            <h1 className="text-lg font-semibold">Lead Generator Agent</h1>
          </div>
          
          <div className="text-sm text-gray-500">
            {config.industry} • {config.number} companies • {config.country}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {results && (
            <div className="relative" ref={exportMenuRef}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  <button
                    onClick={exportJSON}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <FileJson className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Export as JSON</div>
                      <div className="text-xs text-gray-500">Structured data</div>
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-100"></div>
                  
                  <button
                    onClick={exportTXT}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">Export as TXT</div>
                      <div className="text-xs text-gray-500">Human-readable</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {isProcessing ? 'Processing' : 'Ready'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas - Full Width */}
        <div className="flex-1 relative overflow-auto grid-pattern">
          <ProcessCanvas 
            stages={activeStages}
            currentStage={currentStage}
            isProcessing={isProcessing}
            config={config}
            results={results}
          />
        </div>

        {/* Right Results Panel */}
        <AnimatePresence>
          {results && (
            <ResultsPanel results={results} config={config} />
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md"
        >
          <div className="font-semibold text-red-800">Error</div>
          <div className="text-sm text-red-600 mt-1">{error}</div>
        </motion.div>
      )}
    </div>
  )
}

