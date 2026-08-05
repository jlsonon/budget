import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Trash2,
  CheckCheck,
} from 'lucide-react'
import Mascot from '@/components/ui/Mascot'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'
import { cn, formatDate } from '@/lib/utils'
import type { AppNotification } from '@/types'

const notifCategoryIcons: Record<string, string> = {
  bill_reminder: 'receipt',
  debt_due: 'vault',
  credit_card: 'wallet',
  savings_milestone: 'piggy_bank',
  budget_exceeded: 'shopping_bag',
  payday: 'coins',
  goal_completed: 'vault',
  achievement: 'gift_bag',
  insight: 'utensils',
  subscription_renewal: 'electric',
}

const mockNotifications: AppNotification[] = [
  {
    id: '1',
    userId: '1',
    type: 'bill_reminder',
    title: 'Meralco Electric Bill Due Tomorrow',
    message: 'Your monthly electric bill of ₱2,500 is due tomorrow. Pay from GCash or Maya.',
    read: false,
    date: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    type: 'savings_milestone',
    title: 'Emergency Fund Milestone Saved!',
    message: 'Awesome progress! You just saved ₱5,000 toward your 6-Month Emergency Fund.',
    read: false,
    date: new Date().toISOString(),
  },
  {
    id: '3',
    userId: '1',
    type: 'insight',
    title: 'Weekly Budget Insight',
    message: 'Your Food & Dining expenses are 15% lower than last week. Keep up the momentum!',
    read: true,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    userId: '1',
    type: 'achievement',
    title: 'New Badge Unlocked!',
    message: 'You earned the "Smart Saver" badge for maintaining a 30-day streak.',
    read: true,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    userId: '1',
    type: 'subscription_renewal',
    title: 'Netflix Premium Auto-Renewal',
    message: 'Your Netflix subscription (₱549/mo) will auto-deduct from your GCash wallet in 3 days.',
    read: true,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '6',
    userId: '1',
    type: 'budget_exceeded',
    title: 'Food & Dining Budget Alert',
    message: 'You have reached 88% of your monthly Food & Dining budget.',
    read: true,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

function groupByDate(notifications: AppNotification[]) {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  const groups: { label: string; items: AppNotification[] }[] = []
  const todayItems = notifications.filter((n) => new Date(n.date).toDateString() === today)
  const yesterdayItems = notifications.filter((n) => new Date(n.date).toDateString() === yesterday)
  const earlierItems = notifications.filter((n) => {
    const d = new Date(n.date).toDateString()
    return d !== today && d !== yesterday
  })

  if (todayItems.length > 0) groups.push({ label: 'Today', items: todayItems })
  if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', items: yesterdayItems })
  if (earlierItems.length > 0) groups.push({ label: 'Earlier', items: earlierItems })

  return groups
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'bills' | 'milestones'>('all')

  const filteredNotifs = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    if (filter === 'bills') return notifications.filter((n) => ['bill_reminder', 'subscription_renewal', 'debt_due'].includes(n.type))
    if (filter === 'milestones') return notifications.filter((n) => ['savings_milestone', 'achievement', 'goal_completed'].includes(n.type))
    return notifications
  }, [notifications, filter])

  const groups = useMemo(() => groupByDate(filteredNotifs), [filteredNotifs])
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-5 pb-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-mochi-text">Activity Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-mochi-primary/15 text-mochi-primary font-black text-xs">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-mochi-text-muted font-medium mt-0.5">Stay updated on bills, savings, & budget alerts</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mochi-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-mochi-primary" />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="p-2 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Grid (100% visible, 0 horizontal scroll) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'bills', label: 'Bills & Subs' },
          { id: 'milestones', label: 'Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all text-center ${
              filter === tab.id
                ? 'bg-mochi-primary text-white shadow-xs scale-[1.02]'
                : 'bg-mochi-surface-alt text-mochi-text-muted hover:text-mochi-text border border-mochi-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifs.length === 0 ? (
        <motion.div
          className="mochi-card flex flex-col items-center justify-center py-16 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Mascot mood="happy" size="lg" />
          <h2 className="text-base font-black text-mochi-text">All Caught Up!</h2>
          <p className="text-xs text-mochi-text-muted max-w-xs">
            No active notifications in this view. Mochi will notify you when bills or milestones are ready.
          </p>
        </motion.div>
      ) : (
        /* Grouped Notification Feed */
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label} className="space-y-3">
              <h2 className="text-xs font-black text-mochi-text-muted uppercase tracking-wider px-1">
                {group.label}
              </h2>
              <div className="space-y-2.5">
                {group.items.map((notif, index) => {
                  const vectorId = notifCategoryIcons[notif.type] || 'receipt'

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => markAsRead(notif.id)}
                      className={cn(
                        'mochi-card p-4 flex items-start gap-3.5 group cursor-pointer transition-all hover:scale-[1.01]',
                        !notif.read ? 'bg-mochi-surface border-mochi-primary/40 shadow-xs' : 'bg-mochi-surface/60 opacity-80'
                      )}
                    >
                      {/* Vector SVG Icon */}
                      <div className="shrink-0 pt-0.5">
                        <MochiCategoryVectorSVG id={vectorId} size="md" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={cn('text-xs sm:text-sm truncate', !notif.read ? 'font-black text-mochi-text' : 'font-bold text-mochi-text-secondary')}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] font-bold text-mochi-text-muted shrink-0">
                            {formatDate(notif.date, 'relative')}
                          </span>
                        </div>

                        <p className="text-xs text-mochi-text-muted mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {/* Item Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notif.id)
                            }}
                            className="p-1.5 rounded-xl hover:bg-mochi-surface-alt text-mochi-primary transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notif.id)
                          }}
                          className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </motion.div>
  )
}
