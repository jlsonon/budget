import { useAppStore } from '@/store/appStore'
import { useNotificationStore } from '@/store/notificationStore'
import { formatCurrency, formatDate } from '@/lib/utils'

/**
 * Automated Bill & Debt Due Date Notifier
 * Checks all active Debts and Subscriptions for due dates:
 * - 3 days before due date
 * - 1 day before due date (tomorrow)
 * - Due today
 *
 * Generates actionable notifications with direct "Pay Now" / "Log Payment" links.
 */
export function checkUpcomingDueDates(): void {
  const { debts, subscriptions } = useAppStore.getState()
  const { notifications, addNotification } = useNotificationStore.getState()

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  // Helper to calculate difference in calendar days
  const getDaysDiff = (targetDateStr: string): number => {
    if (!targetDateStr) return 999
    const target = new Date(targetDateStr)
    target.setHours(0, 0, 0, 0)
    const diffMs = target.getTime() - todayDate.getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  }

  // 1. Check Debts
  debts.forEach((debt) => {
    if (debt.currentBalance <= 0 || !debt.dueDate) return

    const daysLeft = getDaysDiff(debt.dueDate)
    const notifKey = `notif_debt_${debt.id}_${debt.dueDate}_${daysLeft}d`

    // Check if notification already generated
    const exists = notifications.some((n) => n.id === notifKey)
    if (exists) return

    let title = ''
    let message = ''
    const debtName = debt.lender || 'Debt Bill'

    if (daysLeft === 0) {
      title = `Debt Payment Due Today!`
      message = `Your payment of ${formatCurrency(debt.minimumPayment || debt.currentBalance)} for "${debtName}" is due today (${formatDate(debt.dueDate)}).`
    } else if (daysLeft === 1) {
      title = `Debt Payment Due Tomorrow!`
      message = `Your payment of ${formatCurrency(debt.minimumPayment || debt.currentBalance)} for "${debtName}" is due tomorrow (${formatDate(debt.dueDate)}).`
    } else if (daysLeft === 3) {
      title = `Debt Payment Due in 3 Days`
      message = `Reminder: Payment of ${formatCurrency(debt.minimumPayment || debt.currentBalance)} for "${debtName}" is due on ${formatDate(debt.dueDate)}.`
    }

    if (title) {
      addNotification({
        id: notifKey,
        userId: debt.userId || 'current',
        type: 'debt_due',
        title,
        message,
        read: false,
        date: new Date().toISOString(),
        deepLink: '/debt',
        actionLabel: 'Pay Now',
        relatedId: debt.id,
        amount: debt.minimumPayment || debt.currentBalance,
      })
    }
  })

  // 2. Check Subscriptions
  subscriptions.forEach((sub) => {
    if (sub.status !== 'active' || !sub.nextBilling) return

    const daysLeft = getDaysDiff(sub.nextBilling)
    const notifKey = `notif_sub_${sub.id}_${sub.nextBilling}_${daysLeft}d`

    const exists = notifications.some((n) => n.id === notifKey)
    if (exists) return

    let title = ''
    let message = ''

    if (daysLeft === 0) {
      title = `Subscription Renewing Today!`
      message = `"${sub.name}" (${formatCurrency(sub.amount)}/${sub.frequency}) is renewing today (${formatDate(sub.nextBilling)}).`
    } else if (daysLeft === 1) {
      title = `Subscription Renewing Tomorrow!`
      message = `"${sub.name}" (${formatCurrency(sub.amount)}/${sub.frequency}) will renew tomorrow (${formatDate(sub.nextBilling)}).`
    } else if (daysLeft === 3) {
      title = `Subscription Renewing in 3 Days`
      message = `Reminder: "${sub.name}" (${formatCurrency(sub.amount)}/${sub.frequency}) renews on ${formatDate(sub.nextBilling)}.`
    }

    if (title) {
      addNotification({
        id: notifKey,
        userId: sub.userId || 'current',
        type: 'subscription_renewal',
        title,
        message,
        read: false,
        date: new Date().toISOString(),
        deepLink: '/subscriptions',
        actionLabel: 'Log Payment',
        relatedId: sub.id,
        amount: sub.amount,
      })
    }
  })
}
