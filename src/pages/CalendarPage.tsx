import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownLeft, 
  Receipt, 
  CreditCard, 
  PiggyBank, 
  Repeat, 
  Target,
  Gift
} from 'lucide-react'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  eachDayOfInterval,
  isSameMonth, 
  isSameDay, 
  isToday,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  parseISO
} from 'date-fns'

import { CalendarEvent, CalendarEventType } from '@/types'
import { formatCurrency, cn, formatDate } from '@/lib/utils'
import Mascot from '@/components/ui/Mascot'
import Dialog from '@/components/ui/Dialog'

const generateMockEvents = (): CalendarEvent[] => {
  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const nextMonth = format(addMonths(now, 1), 'yyyy-MM')

  return [
    {
      id: '1',
      userId: 'u1',
      type: 'income',
      title: 'Salary',
      date: `${currentMonth}-05`,
      amount: 45000,
      color: 'bg-green-500'
    },
    {
      id: '2',
      userId: 'u1',
      type: 'bill',
      title: 'Electricity Bill',
      date: `${currentMonth}-10`,
      amount: 3500,
      color: 'bg-orange-500'
    },
    {
      id: '3',
      userId: 'u1',
      type: 'debt',
      title: 'Credit Card Payment',
      date: `${currentMonth}-15`,
      amount: 15000,
      color: 'bg-red-500'
    },
    {
      id: '4',
      userId: 'u1',
      type: 'subscription',
      title: 'Netflix',
      date: `${currentMonth}-18`,
      amount: 549,
      color: 'bg-purple-500'
    },
    {
      id: '5',
      userId: 'u1',
      type: 'income',
      title: 'Salary',
      date: `${currentMonth}-20`,
      amount: 45000,
      color: 'bg-green-500'
    },
    {
      id: '6',
      userId: 'u1',
      type: 'savings',
      title: 'Emergency Fund',
      date: `${currentMonth}-22`,
      amount: 5000,
      color: 'bg-blue-500'
    },
    {
      id: '7',
      userId: 'u1',
      type: 'goal',
      title: 'Japan Trip Milestone',
      date: `${currentMonth}-28`,
      amount: 2000,
      color: 'bg-pink-500'
    },
    {
      id: '8',
      userId: 'u1',
      type: 'bill',
      title: 'Water Bill',
      date: `${nextMonth}-02`,
      amount: 800,
      color: 'bg-orange-500'
    }
  ]
}

const getEventIcon = (type: CalendarEventType) => {
  switch (type) {
    case 'income': return <ArrowDownLeft className="w-4 h-4 text-white" />
    case 'bill': return <Receipt className="w-4 h-4 text-white" />
    case 'debt': return <CreditCard className="w-4 h-4 text-white" />
    case 'savings': return <PiggyBank className="w-4 h-4 text-white" />
    case 'subscription': return <Repeat className="w-4 h-4 text-white" />
    case 'goal': return <Target className="w-4 h-4 text-white" />
    case 'birthday': return <Gift className="w-4 h-4 text-white" />
    default: return <CalendarIcon className="w-4 h-4 text-white" />
  }
}

type ViewMode = 'month' | 'week' | 'agenda'

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        setEvents(generateMockEvents())
      } catch (err) {
        setError('Failed to load events. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [])

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="mochi-skeleton w-32 h-6 rounded"></div>
        <div className="flex gap-2">
          <div className="mochi-skeleton w-8 h-8 rounded-full"></div>
          <div className="mochi-skeleton w-8 h-8 rounded-full"></div>
        </div>
      </div>
      <div className="mochi-skeleton w-full h-[300px] rounded-xl"></div>
      <div className="space-y-3 mt-6">
        <div className="mochi-skeleton w-full h-16 rounded-xl"></div>
        <div className="mochi-skeleton w-full h-16 rounded-xl"></div>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-mochi-surface rounded-2xl border border-mochi-border/50 shadow-sm text-center">
      <Mascot mood="sad" size="lg" className="mb-4 drop-shadow-md" />
      <h3 className="text-lg font-bold text-mochi-text mb-2">Oops! Something went wrong.</h3>
      <p className="text-sm text-mochi-text-secondary mb-6">{error}</p>
      <button 
        className="mochi-btn-primary px-8"
        onClick={() => {
          setIsLoading(true)
          setError(null)
          setTimeout(() => {
            setEvents(generateMockEvents())
            setIsLoading(false)
          }, 800)
        }}
      >
        Try Again
      </button>
    </div>
  )

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-mochi-surface rounded-2xl border border-mochi-border/50 shadow-sm text-center mt-8">
      <Mascot mood="neutral" size="lg" className="mb-4 drop-shadow-md" />
      <h3 className="text-lg font-bold text-mochi-text mb-2">No events found.</h3>
      <p className="text-sm text-mochi-text-secondary">Your calendar is completely clear!</p>
    </div>
  )

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    
    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, 41) // 6 weeks grid
    })

    const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const selectedDateEvents = events.filter(e => isSameDay(parseISO(e.date), selectedDate))

    return (
      <div className="space-y-6">
        <div className="mochi-card p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-mochi-text">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full bg-mochi-background hover:bg-mochi-primary/10 transition-colors text-mochi-text">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full bg-mochi-background hover:bg-mochi-primary/10 transition-colors text-mochi-text">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysInWeek.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-mochi-text-secondary uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              
              const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day))

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-12 w-full flex flex-col items-center p-1 rounded-lg transition-colors relative",
                    !isCurrentMonth && "opacity-40",
                    isSelected && "bg-mochi-primary/10 outline outline-1 outline-mochi-primary",
                    !isSelected && "hover:bg-mochi-background"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isTodayDate ? "bg-mochi-primary text-white shadow-sm" : "text-mochi-text"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex gap-0.5 mt-auto pb-0.5 max-w-full overflow-hidden justify-center w-full px-1">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div key={j} className={cn("w-1.5 h-1.5 rounded-full shrink-0", e.color)} />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-mochi-text-secondary" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-mochi-text text-lg px-1 flex items-center gap-2">
            Events for {format(selectedDate, 'MMM d, yyyy')}
            {isToday(selectedDate) && <span className="text-xs bg-mochi-primary/10 text-mochi-primary px-2 py-0.5 rounded-full">Today</span>}
          </h3>
          
          <AnimatePresence mode="popLayout">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mochi-card flex items-center p-4 gap-4 cursor-pointer hover:border-mochi-primary/50 transition-colors"
                  onClick={() => {
                    setSelectedEvent(event)
                    setIsEventModalOpen(true)
                  }}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", event.color)}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-mochi-text truncate">{event.title}</p>
                    <p className="text-xs text-mochi-text-secondary capitalize">{event.type}</p>
                  </div>
                  {event.amount !== undefined && (
                    <div className={cn(
                      "font-bold text-sm whitespace-nowrap",
                      event.type === 'income' ? 'text-green-500' :
                      event.type === 'bill' || event.type === 'debt' ? 'text-red-500' :
                      'text-mochi-text'
                    )}>
                      {event.type === 'income' ? '+' : '-'} {formatCurrency(event.amount)}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6 bg-mochi-surface rounded-xl border border-dashed border-mochi-border"
              >
                <p className="text-mochi-text-secondary text-sm">No events on this day.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-mochi-surface p-4 rounded-xl border border-mochi-border/30 shadow-sm">
          <h2 className="text-sm font-bold text-mochi-text">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevWeek} className="p-1.5 rounded-full bg-mochi-background hover:bg-mochi-primary/10 transition-colors text-mochi-text">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextWeek} className="p-1.5 rounded-full bg-mochi-background hover:bg-mochi-primary/10 transition-colors text-mochi-text">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {weekDays.map((day, i) => {
            const isTodayDate = isToday(day)
            const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day))

            return (
              <div key={i} className={cn(
                "mochi-card p-4 overflow-hidden relative",
                isTodayDate && "border-mochi-primary/50 shadow-sm ring-1 ring-mochi-primary/20"
              )}>
                {isTodayDate && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-mochi-primary/5 rounded-bl-full -z-10" />
                )}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-12 shrink-0">
                    <span className="text-xs font-semibold text-mochi-text-secondary uppercase">
                      {format(day, 'EEE')}
                    </span>
                    <span className={cn(
                      "text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full mt-1",
                      isTodayDate ? "bg-mochi-primary text-white shadow-sm" : "text-mochi-text"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2 border-l border-mochi-border/30 pl-4 py-1">
                    {dayEvents.length > 0 ? (
                      dayEvents.map((event, j) => (
                        <div 
                          key={j} 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            setSelectedEvent(event)
                            setIsEventModalOpen(true)
                          }}
                        >
                          <div className={cn("w-2 h-2 rounded-full shrink-0", event.color)} />
                          <div className="flex-1 min-w-0 flex justify-between items-center">
                            <p className="text-sm font-medium text-mochi-text truncate group-hover:text-mochi-primary transition-colors">
                              {event.title}
                            </p>
                            {event.amount !== undefined && (
                              <span className={cn(
                                "text-xs font-bold shrink-0 ml-2",
                                event.type === 'income' ? 'text-green-500' :
                                event.type === 'bill' || event.type === 'debt' ? 'text-red-500' :
                                'text-mochi-text'
                              )}>
                                {formatCurrency(event.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-mochi-text-secondary py-1 italic">No events</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    
    if (sortedEvents.length === 0) return renderEmptyState()

    const groupedEvents: Record<string, CalendarEvent[]> = {}
    sortedEvents.forEach(e => {
      if (!groupedEvents[e.date]) {
        groupedEvents[e.date] = []
      }
      groupedEvents[e.date].push(e)
    })

    return (
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([dateStr, dateEvents]) => {
          const dateObj = parseISO(dateStr)
          const isTodayDate = isToday(dateObj)
          
          return (
            <div key={dateStr} className="space-y-3">
              <h3 className="font-bold text-mochi-text text-sm flex items-center gap-2 border-b border-mochi-border/30 pb-2">
                {formatDate(dateStr)}
                {isTodayDate && <span className="text-[10px] uppercase font-bold bg-mochi-primary/10 text-mochi-primary px-2 py-0.5 rounded-full">Today</span>}
              </h3>
              
              <div className="space-y-3">
                {dateEvents.map(event => (
                  <div
                    key={event.id}
                    className="mochi-card flex items-center p-4 gap-4 cursor-pointer hover:border-mochi-primary/50 transition-colors"
                    onClick={() => {
                      setSelectedEvent(event)
                      setIsEventModalOpen(true)
                    }}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", event.color)}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-mochi-text truncate">{event.title}</p>
                      <p className="text-xs text-mochi-text-secondary capitalize">{event.type}</p>
                    </div>
                    {event.amount !== undefined && (
                      <div className={cn(
                        "font-bold text-sm whitespace-nowrap",
                        event.type === 'income' ? 'text-green-500' :
                        event.type === 'bill' || event.type === 'debt' ? 'text-red-500' :
                        'text-mochi-text'
                      )}>
                        {event.type === 'income' ? '+' : '-'} {formatCurrency(event.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 max-w-lg mx-auto w-full min-h-screen p-4 flex flex-col space-y-6"
    >
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-mochi-text flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-mochi-primary" />
          Calendar
        </h1>
      </header>

      <div className="flex bg-mochi-surface p-1 rounded-xl border border-mochi-border/30 shadow-sm">
        {(['month', 'week', 'agenda'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors duration-200",
              viewMode === mode 
                ? "bg-mochi-primary text-white shadow-sm" 
                : "text-mochi-text-secondary hover:text-mochi-text hover:bg-mochi-background/50"
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        renderError()
      ) : (
        <>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'agenda' && renderAgendaView()}
        </>
      )}

      <Dialog 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)}
        title="Event Details"
      >
        {selectedEvent && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm", selectedEvent.color)}>
                {getEventIcon(selectedEvent.type)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-mochi-text">{selectedEvent.title}</h3>
                <p className="text-sm text-mochi-text-secondary capitalize">{selectedEvent.type}</p>
              </div>
            </div>
            
            <div className="bg-mochi-surface p-4 rounded-xl border border-mochi-border/30 space-y-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-mochi-text-secondary">Date</span>
                <span className="font-medium text-mochi-text">
                  {formatDate(selectedEvent.date)}
                </span>
              </div>
              
              {selectedEvent.amount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-mochi-text-secondary">Amount</span>
                  <span className={cn(
                    "font-bold",
                    selectedEvent.type === 'income' ? 'text-green-500' :
                    selectedEvent.type === 'bill' || selectedEvent.type === 'debt' ? 'text-red-500' :
                    'text-mochi-text'
                  )}>
                    {selectedEvent.type === 'income' ? '+' : '-'} {formatCurrency(selectedEvent.amount)}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              className="mochi-btn-primary mt-4 w-full"
              onClick={() => setIsEventModalOpen(false)}
            >
              Close
            </button>
          </div>
        )}
      </Dialog>
    </motion.div>
  )
}
