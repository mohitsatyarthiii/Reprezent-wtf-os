'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import {
  Sparkles,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Clock,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  AlertCircle,
  Zap,
  MessageSquare,
  Paperclip,
  Mic,
  StopCircle,
  MoreHorizontal
} from 'lucide-react'

// Quick prompts
const DIA_QUICK = [
  { id: "summary", label: "Week summary", prompt: "Give me a full agency summary for this week" },
  { id: "outreach", label: "Outreach email", prompt: "Draft a creator outreach email for a SaaS client" },
  { id: "picks", label: "Creator picks", prompt: "Shortlist top 3 creators for a B2B SaaS brand" },
  { id: "brief", label: "Campaign brief", prompt: "Write a campaign brief template for a productivity app" },
  { id: "risk", label: "At-risk items", prompt: "What campaigns or executions are at risk right now?" },
  { id: "payments", label: "Payment digest", prompt: "Summarise pending payments and flag anomalies" },
  { id: "roi", label: "ROI analysis", prompt: "Analyse campaign ROI across all active campaigns" },
  { id: "tasks", label: "Team tasks", prompt: "What should each team member prioritise this week?" },
]

// Mock responses
const DIA_REPLIES = {
  "Give me a full agency summary for this week": `**Agency Week Summary — Feb 17–23, 2025**

**Campaigns:** 2 live (Notion Q1, Vercel Dev), 1 in planning (En-Bunka). Total views delivered this week: **1.76M**. Notion × Fireship is your top performer at 1.48M views.

**Executions:** 5 active. Kevin Powell video draft received — needs review by Feb 28. Ankur Warikoo is ready for upload.

**Payments:** 2 pending approval totalling **$2,300**. Approve before end of week.

**Watch list:** Ali Abdaal × Notion deliverable due Feb 28 — no script received yet.`,

  "Draft a creator outreach email for a SaaS client": `**Subject:** Collab for [Brand] — quick one

Hi [Name],

I run influencer partnerships at Heek-E. Your recent [topic] content was strong — especially the [specific detail].

We're working with [Brand] on a campaign targeting [audience], and you're a natural fit.

→ **Deliverable:** [type]
→ **Rate range:** [range]
→ **Timeline:** [date]

**Next step:** 15-min call this week?

Best,
[Your name]`,

  "Shortlist top 3 creators for a B2B SaaS brand": `**Top 3 Creator Picks — B2B SaaS**

| Creator | Platform | Followers | ER | Best For |
|---------|----------|-----------|-----|-----------|
| Lenny Rachitsky | LinkedIn | 620K | 3.9% | Decision-makers, founders |
| Kevin Powell | YouTube | 1.1M | 7.3% | Dev-facing SaaS |
| Nikhil Kamath | YouTube | 1.8M | 5.4% | Fintech, startup SaaS |

All 3 have verified email and prior sponsorship history. Kevin Powell has the highest ER and is currently un-contracted.`,

  "Write a campaign brief template for a productivity app": `**Campaign Brief — Productivity App**

**Brand:** [Client Name]
**Goal:** Drive trial signups
**Audience:** Knowledge workers, founders, remote teams

**Talking Points:**
→ The one workflow that changed everything
→ How [Product] reduced [specific friction]
→ Quick demo of the killer feature

**DOs:** Be authentic. Show real workflow. Include CTA with discount code.
**DONTs:** No scripted reads. No competitor mentions.

**KPIs:** 10K clicks, 500 trials, CPV < $0.025
**Revisions:** 2 rounds max`,

  "What campaigns or executions are at risk right now?": `**At-Risk Items — Feb 23, 2025**

| Item | Risk | Owner |
|------|------|-------|
| Ali Abdaal × Notion | No script received, due Feb 28 | Priya |
| En-Bunka JP1 Creator | TBD — no creator confirmed yet | Tanaka |
| INV-042 Commission | Pending 3+ days, no receipt | Tanaka |

**Recommended actions:**
→ Chase Ali Abdaal team today (email + WhatsApp)
→ Confirm JP creator by Mar 1 or push go-live date
→ Approve INV-042 only after receipt received`,

  "Summarise pending payments and flag anomalies": `**Payment Digest — Feb 23, 2025**

**Pending Approval:** 2 items · $2,300 total
→ INV-042 En-Bunka commission ($700) — 3 days pending
→ INV-043 Kevin Powell advance ($1,600) — 2 days pending

**Paid This Period:** $18,900 across 3 transactions

**Flag:** INV-042 has no file attached. Request receipt before approving.

**Cashflow note:** $2,300 outgoing this week. Budget headroom across campaigns: $22,800.`,

  "Analyse campaign ROI across all active campaigns": `**Campaign ROI Analysis**

| Campaign | Spend | Views | CPV | Status |
|----------|-------|-------|-----|--------|
| Notion Q1 | $31,200 | 1,760,000 | $0.018 | On target |
| ClickUp × Ali | $18,000 | 1,720,000 | $0.010 | Excellent |
| Vercel Dev | $8,400 | — | — | In progress |

**Best performer:** ClickUp × Ali at $0.010 CPV — 2.4× better than target.
**Watch:** Notion Q1 has 2 deliverables remaining. Final CPV depends on Ali's video.
**Benchmark:** Portfolio CPV is $0.014 vs industry avg $0.022 — strong.`,

  "What should each team member prioritise this week?": `**Team Priorities — Feb 23, 2025**

**Varundeep:** Review Kevin Powell draft. Approve 2 pending payments.

**Priya:** Chase Ali Abdaal script (Notion Q1). Close Sara Dietschy deal (Figma).

**Rahul:** Brief Kevin Powell on Vercel talking points. Set up NetworkChuck contract.

**Meera:** Move Ankur Warikoo to Published. Confirm Figma deliverable spec with Sara.

**Tanaka:** Confirm Japanese creator for En-Bunka. Approve INV-042 once receipt received.`,
}

// Default response
const DEFAULT_REPLY = `Got it — based on your current data: **2 pending payments**, **5 active executions**, and **2 campaigns live**. Want me to dig deeper into any area?`

// Notion-style Page Header
function PageHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-muted)' }}>
        {Icon && <Icon className="w-4 h-4" style={{ color: 'var(--color-foreground)' }} />}
      </div>
      <div>
        <h1 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
        Active
      </span>
    </div>
  )
}

// Message Component
function Message({ message, isUser, profile }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render markdown-like content
  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      // Tables
      if (line.startsWith('| ')) {
        const cells = line.split('|').map(c => c.trim()).filter(Boolean)
        if (cells.length > 0) {
          const isHeader = line.includes('---') ? false : content.includes(line)
          return (
            <div
              key={i}
              className="grid gap-px rounded overflow-hidden my-2"
              style={{
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                backgroundColor: 'var(--color-border)'
              }}
            >
              {cells.map((cell, j) => (
                <div
                  key={j}
                  className="px-2 py-1 text-xs"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    color: isHeader ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                    fontWeight: isHeader ? 600 : 400
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          )
        }
      }

      // Bullet points
      if (line.startsWith('→')) {
        const rest = line.slice(1).trim()
        const parts = rest.split(/\*\*(.*?)\*\*/g)
        return (
          <div key={i} className="flex gap-2 py-0.5">
            <span className="flex-shrink-0">→</span>
            <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
              {parts.map((p, j) => 
                j % 2 === 1 ? (
                  <strong key={j} style={{ fontWeight: 600 }}>{p}</strong>
                ) : p
              )}
            </span>
          </div>
        )
      }

      // Headers
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return (
          <div key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color: 'var(--color-foreground)' }}>
            {line.slice(2, -2)}
          </div>
        )
      }

      // Empty line
      if (!line.trim()) {
        return <div key={i} className="h-2" />
      }

      // Regular text with bold
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <div key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
          {parts.map((p, j) => 
            j % 2 === 1 ? (
              <strong key={j} style={{ fontWeight: 600 }}>{p}</strong>
            ) : p
          )}
        </div>
      )
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-muted)' }}>
          <Bot className="w-3.5 h-3.5" style={{ color: 'var(--color-foreground)' }} />
        </div>
      )}

      <div className="relative group max-w-[80%]">
        <div 
          className="px-4 py-3 rounded-lg"
          style={{ 
            backgroundColor: isUser ? 'var(--color-muted)' : 'var(--color-card)',
            border: !isUser ? '1px solid var(--color-border)' : 'none'
          }}
        >
          {isUser ? (
            <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>{message}</p>
          ) : (
            <div>{renderContent(message)}</div>
          )}
        </div>

        {/* Message actions */}
        {!isUser && (
          <div className="absolute -bottom-6 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            <button className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors" style={{ color: 'var(--color-muted-foreground)' }}>
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors" style={{ color: 'var(--color-muted-foreground)' }}>
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-muted)' }}>
          <User className="w-3.5 h-3.5" style={{ color: 'var(--color-foreground)' }} />
        </div>
      )}
    </div>
  )
}

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-muted)' }}>
        <Bot className="w-3.5 h-3.5" style={{ color: 'var(--color-foreground)' }} />
      </div>
      <div className="px-4 py-3 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-foreground)', animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-foreground)', animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-foreground)', animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Quick Prompt Button
function QuickPrompt({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ 
        backgroundColor: 'var(--color-muted)',
        color: 'var(--color-foreground)',
        border: '1px solid var(--color-border)'
      }}
    >
      {label}
    </button>
  )
}

export default function DiaAIPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Dia — your agency AI. Ask me anything about campaigns, creators, payments, or team priorities."
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [profile, setProfile] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  
  const supabase = createClient()
  const { theme } = useTheme()

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [supabase])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSend = (prompt) => {
    const message = prompt || input
    if (!message.trim() || typing) return

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setTyping(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Simulate AI response
    setTimeout(() => {
      const reply = DIA_REPLIES[message] || DEFAULT_REPLY
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRegenerate = () => {
    // Regenerate last AI response
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (lastUserMessage && !typing) {
      setMessages(prev => prev.slice(0, -1)) // Remove last AI response
      setTyping(true)
      setTimeout(() => {
        const reply = DIA_REPLIES[lastUserMessage.content] || DEFAULT_REPLY
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        setTyping(false)
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <PageHeader 
        title="Dia AI"
        subtitle="Agency intelligence · Powered by Claude"
        icon={Sparkles}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <Message
            key={i}
            message={msg.content}
            isUser={msg.role === 'user'}
            profile={profile}
          />
        ))}

        {typing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Regenerate Button (if last message is assistant) */}
      {messages.length > 1 && messages[messages.length - 1].role === 'assistant' && !typing && (
        <div className="flex justify-center mb-2">
          <button
            onClick={handleRegenerate}
            className="px-3 py-1.5 text-xs rounded-full flex items-center gap-1 hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate response
          </button>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="px-6 py-3 border-t overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2">
          {DIA_QUICK.map(q => (
            <QuickPrompt
              key={q.id}
              label={q.label}
              onClick={() => handleSend(q.prompt)}
              disabled={typing}
            />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Dia anything… (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={typing}
              className="w-full px-4 py-3 pr-12 text-sm rounded-lg resize-none outline-none disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)'
              }}
            />
            <button
              onClick={() => {/* Voice input */}}
              className="absolute right-3 bottom-3 p-1 rounded hover:bg-[var(--color-border)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            className="px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ 
              backgroundColor: 'var(--color-foreground)',
              color: 'var(--color-background)'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
          Dia can access your campaigns, creators, requirements, executions, and payments data
        </p>
      </div>
    </div>
  )
}