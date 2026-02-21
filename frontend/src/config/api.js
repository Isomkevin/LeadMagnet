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
  jobStatus: (jobId) => `/api/v1/leads/status/${jobId}`,
  sendEmail: '/api/v1/email/send',
  sendBulkEmail: '/api/v1/email/send-bulk',
  generateEmailContent: '/api/v1/email/generate-content',
  linkedinFindPeople: '/api/v1/linkedin/find-people',
  linkedinSearchPosts: '/api/v1/linkedin/search-posts',
}
