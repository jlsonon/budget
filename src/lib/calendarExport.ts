/**
 * Export a debt or subscription due date event as a standard .ics iCalendar file
 * compatible with Apple Calendar, Google Calendar, Outlook, and Android.
 */
export function exportToDeviceCalendar(event: {
  title: string
  description?: string
  date: string // YYYY-MM-DD
  amount?: number
}) {
  const cleanDate = event.date.replace(/-/g, '')
  const title = event.amount
    ? `${event.title} Due: ₱${event.amount.toLocaleString()}`
    : event.title

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mochi Money//Financial Reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${event.description || 'Financial payment reminder from Mochi Money.'}`,
    `DTSTART;VALUE=DATE:${cleanDate}`,
    `DTEND;VALUE=DATE:${cleanDate}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT9H', // 9:00 AM on due day
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_due.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Request browser native notification permission and fire notification if supported.
 */
export async function triggerNativeDeviceNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  try {
    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      })
      return true
    }
  } catch (e) {
    console.warn('Native notification error:', e)
  }
  return false
}
