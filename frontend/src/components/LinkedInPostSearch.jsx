import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, Send, Linkedin, Paperclip, X, Loader2,
  CheckCircle2, AlertCircle, MessageSquare, Heart, MessageCircle,
  Repeat2, Clock, FileText, User, Reply, Lock, Mail, Eye, EyeOff
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

export default function LinkedInPostSearch({ onBack }) {
  const [linkedinEmail, setLinkedinEmail] = useState('')
  const [linkedinPassword, setLinkedinPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(10)
  const [messageToAuthor, setMessageToAuthor] = useState('')
  const [replyToPost, setReplyToPost] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [posts, setPosts] = useState(null)
  const [interactionResult, setInteractionResult] = useState(null)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('setup')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAttachment({
        name: file.name,
        content: reader.result.split(',')[1],
        size: file.size,
      })
    }
    reader.readAsDataURL(file)
  }

  const canSubmit = linkedinEmail.trim() && linkedinPassword.trim() && query.trim() && messageToAuthor.trim() && replyToPost.trim()

  const handleSearchAndInteract = async () => {
    if (!canSubmit) return
    setIsSearching(true)
    setError(null)
    setPosts(null)
    setInteractionResult(null)

    try {
      const apiUrl = API_BASE_URL + API_ENDPOINTS.linkedinSearchPosts
      const response = await axios.post(apiUrl, {
        linkedin_email: linkedinEmail.trim(),
        linkedin_password: linkedinPassword,
        query: query.trim(),
        count,
        message_to_author: messageToAuthor.trim(),
        reply_to_post: replyToPost.trim(),
      }, { timeout: 300000 })

      if (response.data.success) {
        setPosts(response.data.posts)
        setInteractionResult(response.data.interactions)
        setStep('results')
      } else {
        setError(response.data.error || 'Failed to find posts')
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (err.response?.status === 401) {
        setError(detail || 'LinkedIn login failed. Check your email and password.')
      } else {
        setError(detail || err.message || 'Something went wrong')
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setStep('setup')
    setPosts(null)
    setInteractionResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">LinkedIn Post Search</h1>
                <p className="text-xs text-gray-500">Search posts, message authors & reply</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            {['Setup', 'Results'].map((s, i) => {
              const stepIndex = ['setup', 'results'].indexOf(step)
              const isActive = i === stepIndex
              const isDone = i < stepIndex
              return (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-orange-600 text-white shadow-lg' :
                    isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`ml-1.5 text-xs font-medium ${isActive ? 'text-orange-700' : 'text-gray-400'}`}>{s}</span>
                  {i < 1 && <div className={`w-8 h-0.5 mx-2 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Setup */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl items-center justify-center mb-4 shadow-xl"
                >
                  <Search className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Search Posts & Interact</h2>
                <p className="text-gray-600">Log in to LinkedIn, find posts about any topic, message authors and reply to posts</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
                {/* LinkedIn Credentials */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Lock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-bold text-orange-800">LinkedIn Account</span>
                    <span className="text-xs text-orange-500 ml-auto">Your credentials are never stored</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />
                      LinkedIn Email *
                    </label>
                    <input
                      type="email"
                      value={linkedinEmail}
                      onChange={(e) => setLinkedinEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <Lock className="w-3.5 h-3.5 inline mr-1" />
                      LinkedIn Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={linkedinPassword}
                        onChange={(e) => setLinkedinPassword(e.target.value)}
                        placeholder="Your LinkedIn password"
                        className="w-full px-4 py-3 pr-12 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Query */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1.5" />
                    Search Query *
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., hiring developers, ambassador program, how to cook..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Posts
                  </label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={50}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>

                {/* Message to Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1.5" />
                    Message to Post Author *
                  </label>
                  <textarea
                    value={messageToAuthor}
                    onChange={(e) => setMessageToAuthor(e.target.value)}
                    placeholder="Hi! I came across your post and would love to discuss..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors resize-none placeholder-gray-400"
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">{messageToAuthor.length}/2000</div>
                </div>

                {/* Reply to Post */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Reply className="w-4 h-4 inline mr-1.5" />
                    Reply / Comment on Post *
                  </label>
                  <textarea
                    value={replyToPost}
                    onChange={(e) => setReplyToPost(e.target.value)}
                    placeholder="Great post! I'd love to learn more about..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition-colors resize-none placeholder-gray-400"
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">{replyToPost.length}/2000</div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Paperclip className="w-4 h-4 inline mr-1.5" />
                    Attachment (Optional)
                  </label>
                  {attachment ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">{attachment.name}</span>
                        <span className="text-xs text-orange-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={() => setAttachment(null)} className="p-1 hover:bg-orange-100 rounded">
                        <X className="w-4 h-4 text-orange-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors text-gray-500 hover:text-orange-600 text-sm"
                    >
                      Click to attach a file (max 10MB)
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Start Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearchAndInteract}
                  disabled={isSearching || !canSubmit}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Logging in, searching & interacting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Search, Reply & Message</span>
                    </>
                  )}
                </motion.button>

                {isSearching && (
                  <div className="text-center text-sm text-gray-500">
                    This may take a few minutes. The bot is logging into LinkedIn, searching for posts, commenting, and messaging authors.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Results */}
          {step === 'results' && interactionResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl items-center justify-center mb-4 shadow-xl"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">All Done!</h2>
                <p className="text-gray-600">Interacted with {interactionResult.total_posts} posts</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-700">{interactionResult.total_posts}</div>
                    <div className="text-xs text-orange-500 font-medium">Posts Found</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{interactionResult.messages_queued}</div>
                    <div className="text-xs text-blue-500 font-medium">DMs Sent</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">{interactionResult.replies_queued}</div>
                    <div className="text-xs text-green-500 font-medium">Replies Sent</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-700">{interactionResult.failed}</div>
                    <div className="text-xs text-red-500 font-medium">Failed</div>
                  </div>
                </div>

                {interactionResult.results && (
                  <div className="space-y-2 mt-4">
                    <div className="text-sm font-semibold text-gray-700">Per-post status:</div>
                    {interactionResult.results.map((r, idx) => (
                      <div key={idx} className="py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm font-medium text-gray-800 truncate">{r.author}</span>
                            {r.author_linkedin_url && (
                              <a href={r.author_linkedin_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                              r.message_status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <MessageSquare className="w-3 h-3" /> <span>DM: {r.message_status}</span>
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                              r.reply_status === 'sent' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <Reply className="w-3 h-3" /> <span>Reply: {r.reply_status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {posts && posts.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-orange-600">
                      View found posts ({posts.length})
                    </summary>
                    <div className="mt-3 space-y-3">
                      {posts.map((post, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {post.author_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate">{post.author_name}</div>
                              <div className="text-xs text-gray-500 truncate">{post.author_headline}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">{post.post_content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            {post.likes != null && <span className="flex items-center space-x-1"><Heart className="w-3 h-3" /><span>{post.likes}</span></span>}
                            {post.comments != null && <span className="flex items-center space-x-1"><MessageCircle className="w-3 h-3" /><span>{post.comments}</span></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg"
                  >
                    Start New Search
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                  >
                    Back to Home
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-300 rounded-xl p-4 shadow-2xl max-w-md w-full mx-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 text-sm">Error</div>
                <div className="text-sm text-red-600">{error}</div>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
