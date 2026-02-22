const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (import.meta.env.DEV) {
    return ''
  }
  
  console.error('VITE_API_URL not configured! Set it in .env.production')
  return '/api'
}

export const API_BASE_URL = getApiUrl()

export const API_ENDPOINTS = {
  health: '/health',
  generateLeads: '/api/v1/leads/generate',
  generateLeadsAsync: '/api/v1/leads/generate-async',
  analyzeLeads: '/api/v1/leads/analyze',
  generateFromWebsite: '/api/v1/leads/generate-from-website',
  jobStatus: (jobId) => `/api/v1/leads/status/${jobId}`,
  sendEmail: '/api/v1/email/send',
  sendBulkEmail: '/api/v1/email/send-bulk',
  generateEmailContent: '/api/v1/email/generate-content',
  generateVoice: '/api/v1/avatar/generate-voice',
  generateSummaryVoice: '/api/v1/avatar/generate-summary',
  getVoices: '/api/v1/avatar/voices',
  linkedinFindPeople: '/api/v1/linkedin/find-people',
  linkedinSearchPosts: '/api/v1/linkedin/search-posts',
}
