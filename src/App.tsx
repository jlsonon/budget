import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useAppStore } from './store/appStore'
import { startRealtimeSync } from './services/cloudSync'
import { initOfflineQueueListener } from './services/offlineQueue'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { checkUpcomingDueDates } from './services/dueDateNotifier'
import { useSubscriptionStore } from './store/subscriptionStore'

// Auth Pages
import SplashScreen from './pages/auth/SplashScreen'
import WelcomeScreen from './pages/auth/WelcomeScreen'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Main Pages
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetPage from './pages/BudgetPage'
import SavingsPage from './pages/SavingsPage'
import DebtPage from './pages/DebtPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import RecurringPage from './pages/RecurringPage'
import CalendarPage from './pages/CalendarPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'
import CirclesPage from './pages/CirclesPage'
import WalletsPage from './pages/WalletsPage'
import SuperadminDashboardPage from './pages/SuperadminDashboardPage'

// Layouts
import AuthLayout from './components/layout/AuthLayout'
import MainLayout from './components/layout/MainLayout'
import OnboardingLayout from './components/layout/OnboardingLayout'

// Protected Route
import ProtectedRoute from './components/auth/ProtectedRoute'

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/splash"
            element={
              <PageTransition>
                <SplashScreen />
              </PageTransition>
            }
          />
          <Route
            path="/welcome"
            element={
              <PageTransition>
                <WelcomeScreen />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
        </Route>

        {/* Onboarding Routes */}
        <Route element={<OnboardingLayout />}>
          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                !sessionStorage.getItem('mochi_splash_shown') ? (
                  <Navigate to="/splash" replace />
                ) : (
                  <ErrorBoundary>
                    <PageTransition>
                      <DashboardPage />
                    </PageTransition>
                  </ErrorBoundary>
                )
              }
            />
            <Route
              path="/transactions"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <TransactionsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/transactions/new"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <TransactionsPage mode="add" />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/budget"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <BudgetPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/savings"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <SavingsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/circles"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <CirclesPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/debts"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <DebtPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <SubscriptionsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/recurring"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <RecurringPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/calendar"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <CalendarPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/reports"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <ReportsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/profile"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <ProfilePage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/settings"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <SettingsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/wallets"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <WalletsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/notifications"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <NotificationsPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
            <Route
              path="/superadmin"
              element={
                <ErrorBoundary>
                  <PageTransition>
                    <SuperadminDashboardPage />
                  </PageTransition>
                </ErrorBoundary>
              }
            />
          </Route>
        </Route>

        {/* Catch all - redirect to splash or dashboard */}
        <Route
          path="*"
          element={
            <PageTransition>
              {isAuthenticated ? (
                <DashboardPage />
              ) : (
                <SplashScreen />
              )}
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}


export default function App() {
  const { user } = useAuthStore()
  const { processDueRecurring } = useAppStore()

  useEffect(() => {
    useThemeStore.getState().initialize()
    initOfflineQueueListener()
    
    // Hydrate useAppStore subscriptions from persistent useSubscriptionStore
    const localSubs = useSubscriptionStore.getState().subscriptions
    if (localSubs.length > 0) {
      useAppStore.setState({ subscriptions: localSubs })
    }

    processDueRecurring()
    checkUpcomingDueDates()
  }, [processDueRecurring])

  useEffect(() => {
    if (user?.id) {
      const unsub = startRealtimeSync(user.id)
      return () => unsub()
    }
  }, [user?.id])

  return <AnimatedRoutes />
}
