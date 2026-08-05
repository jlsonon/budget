import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Search,
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  CreditCard,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  User,
  Settings,
  Plus,
  Coins,
  Sparkles,
  X,
} from 'lucide-react'
import Dialog from '@/components/ui/Dialog'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenAddTransaction?: () => void
  onOpenAddGoal?: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenAddTransaction,
  onOpenAddGoal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          // triggers parent open
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const navigationCommands = [
    { id: 'dash', title: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'txns', title: 'Go to Transactions', icon: Receipt, path: '/transactions' },
    { id: 'budget', title: 'Go to Budgets', icon: PieChart, path: '/budget' },
    { id: 'savings', title: 'Go to Savings Goals', icon: Target, path: '/savings' },
    { id: 'debt', title: 'Go to Debt Snowball', icon: CreditCard, path: '/debt' },
    { id: 'subs', title: 'Go to Subscriptions', icon: CreditCard, path: '/subscriptions' },
    { id: 'circles', title: 'Go to Mochi Circles', icon: Users, path: '/circles' },
    { id: 'calendar', title: 'Go to Calendar', icon: CalendarIcon, path: '/calendar' },
    { id: 'reports', title: 'Go to Reports & Analytics', icon: BarChart3, path: '/reports' },
    { id: 'profile', title: 'Go to Profile', icon: User, path: '/profile' },
    { id: 'settings', title: 'Go to Settings', icon: Settings, path: '/settings' },
  ]

  const actionCommands = [
    {
      id: 'act-add-txn',
      title: 'Add New Transaction',
      icon: Plus,
      action: () => {
        onClose()
        if (onOpenAddTransaction) onOpenAddTransaction()
        else navigate('/transactions')
      },
    },
    {
      id: 'act-add-goal',
      title: 'Create Savings Goal',
      icon: Coins,
      action: () => {
        onClose()
        if (onOpenAddGoal) onOpenAddGoal()
        else navigate('/savings')
      },
    },
  ]

  const filteredNav = navigationCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  )

  const filteredAct = actionCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Search Bar Header */}
        <div className="relative flex items-center border-b border-mochi-border pb-3">
          <Search className="w-5 h-5 text-mochi-primary mr-2.5" />
          <input
            type="text"
            placeholder="Type a command or page name... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-mochi-text focus:outline-none placeholder:text-mochi-text-muted"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-mochi-text-muted hover:text-mochi-text rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Groups */}
        <div className="max-h-80 overflow-y-auto space-y-4 scrollbar-hide py-1">
          {/* Quick Actions */}
          {filteredAct.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-mochi-text-muted mb-2 px-2">
                Quick Actions
              </p>
              <div className="space-y-1">
                {filteredAct.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-mochi-primary/10 text-mochi-primary hover:bg-mochi-primary hover:text-white transition-all text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{cmd.title}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80">Action</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {filteredNav.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-mochi-text-muted mb-2 px-2">
                Navigation
              </p>
              <div className="space-y-1">
                {filteredNav.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        onClose()
                        navigate(cmd.path)
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-mochi-surface hover:bg-mochi-surface-alt border border-mochi-border/60 text-mochi-text transition-all text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-mochi-primary" />
                        <span>{cmd.title}</span>
                      </div>
                      <span className="text-[10px] text-mochi-text-muted font-mono">Jump</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredAct.length === 0 && (
            <div className="text-center py-6 text-xs text-mochi-text-muted">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-mochi-primary/40" />
              No matching commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between pt-2 border-t border-mochi-border text-[10px] text-mochi-text-muted">
          <span>Use ↑↓ to navigate</span>
          <span className="font-mono bg-mochi-surface-alt px-2 py-0.5 rounded-md border border-mochi-border">
            ESC to exit
          </span>
        </div>
      </div>
    </Dialog>
  )
}

export default CommandPalette
