import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, X, Mail, Sparkles, CheckCircle2,
  AlertCircle, Users, Loader2, FileText, ChevronDown, ChevronUp
} from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

function collectAllEmails(companies) {
  const emailSet = new Set()
  for (const company of companies) {
    if (company.contact_email) emailSet.add(company.contact_email)
    if (company.additional_emails) {
      company.additional_emails.forEach(e => emailSet.add(e))
    }
  }
  return Array.from(emailSet)
}

export default function BulkEmailPanel({ results, onClose }) {
  const companies = results?.data?.companies || []
  const allEmails = collectAllEmails(companies)

  const [fromEmail, setFromEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 })
  const [sendResults, setSendResults] = useState(null)
  const [showRecipients, setShowRecipients] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState(new Set(allEmails))
  const fileInputRef = useRef(null)

  useEffect(() => {
    setSelectedEmails(new Set(allEmails))
  }, [results])

  const toggleEmail = (email) => {
    setSelectedEmails(prev => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    const MAX_FILE_SIZE = 10 * 1024 * 1024

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        setAttachments(prev => [...prev, {
          filename: file.name,
          content: base64.split(',')[1],
          mimetype: file.type || 'application/octet-stream',
          size: file.size
        }])
      } catch (error) {
        console.error('Error reading file:', error)
        alert(`Failed to read file: ${file.name}`)
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSendAll = async () => {
    const recipients = Array.from(selectedEmails)
    if (!fromEmail || recipients.length === 0 || !subject || !body) {
      alert('Please fill in all required fields and select at least one recipient.')
      return
    }

    setSending(true)
    setSendProgress({ sent: 0, failed: 0, total: recipients.length })
    setSendResults(null)

    try {
      const payload = {
        from_email: fromEmail,
        to_emails: recipients,
        subject,
        body,
        attachments: attachments.length > 0 ? attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          mimetype: att.mimetype
        })) : null
      }

      const apiUrl = API_BASE_URL + API_ENDPOINTS.sendBulkEmail
      const response = await axios.post(apiUrl, payload, { timeout: 600000 })

      setSendResults(response.data)
      setSendProgress({
        sent: response.data.successful || 0,
        failed: response.data.failed || 0,
        total: recipients.length
      })
    } catch (error) {
      console.error('Bulk email error:', error)
      const msg = error.response?.data?.detail || error.message || 'Unknown error'
      setSendResults({ success: false, message: msg })
    } finally {
      setSending(false)
    }
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Email Campaign</h2>
            <p className="text-sm text-gray-500">
              Send to {selectedEmails.size} of {allEmails.length} discovered emails
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          {/* Recipients Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <button
              onClick={() => setShowRecipients(!showRecipients)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Recipients ({selectedEmails.size} selected)
                </span>
              </div>
              {showRecipients ? (
                <ChevronUp className="w-5 h-5 text-blue-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-600" />
              )}
            </button>

            <AnimatePresence>
              {showRecipients && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setSelectedEmails(new Set(allEmails))}
                        className="text-xs text-blue-700 hover:underline font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedEmails(new Set())}
                        className="text-xs text-blue-700 hover:underline font-medium"
                      >
                        Deselect All
                      </button>
                    </div>
                    {allEmails.map((email) => {
                      const company = companies.find(c =>
                        c.contact_email === email ||
                        c.additional_emails?.includes(email)
                      )
                      return (
                        <label
                          key={email}
                          className="flex items-center space-x-3 px-3 py-2 bg-white rounded-lg border border-blue-100 cursor-pointer hover:border-blue-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(email)}
                            onChange={() => toggleEmail(email)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{email}</div>
                            {company && (
                              <div className="text-xs text-gray-500 truncate">{company.company_name}</div>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* From Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From (Your Email)</label>
            <div className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="flex-1 outline-none text-gray-900 bg-transparent"
                required
              />
            </div>
            <p className="text-xs text-blue-600 mt-1.5 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>A copy of each email will be sent to your inbox</span>
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              placeholder="Email subject for all recipients..."
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
              <ReactQuill
                value={body}
                onChange={setBody}
                modules={modules}
                placeholder="Write your email message here..."
                className="h-56"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Attachments {attachments.length > 0 && `(${attachments.length})`}
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
                <span>Add Files</span>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept="*/*"
              />
            </div>

            {attachments.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
              >
                <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to attach files or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{att.filename}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(att.size)}</div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeAttachment(index)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Send Progress */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary-50 border border-primary-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                <span className="font-medium text-primary-900">Sending emails...</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((sendProgress.sent + sendProgress.failed) / Math.max(sendProgress.total, 1)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-primary-700">
                <span>{sendProgress.sent + sendProgress.failed} / {sendProgress.total}</span>
                <span>{sendProgress.sent} sent, {sendProgress.failed} failed</span>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {sendResults && !sending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 border ${
                sendResults.success !== false
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {sendResults.success !== false ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  sendResults.success !== false ? 'text-green-900' : 'text-red-900'
                }`}>
                  {sendResults.success !== false
                    ? `Campaign complete! ${sendResults.successful || 0} emails sent.`
                    : `Error: ${sendResults.message}`
                  }
                </span>
              </div>
              {sendResults.failed > 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  {sendResults.failed} email(s) failed to send.
                </p>
              )}
              {sendResults.failed_details && sendResults.failed_details.length > 0 && (
                <div className="mt-2 space-y-1">
                  {sendResults.failed_details.map((detail, i) => (
                    <div key={i} className="text-xs text-red-700">
                      {detail.email}: {detail.error}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {selectedEmails.size} recipient{selectedEmails.size !== 1 ? 's' : ''} selected
          {attachments.length > 0 && ` • ${attachments.length} file${attachments.length !== 1 ? 's' : ''} attached`}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendAll}
          disabled={sending || selectedEmails.size === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send to All ({selectedEmails.size})</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
