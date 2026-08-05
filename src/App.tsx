import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useAppStore } from './store/appStore'
import { startRealtimeSync } from './services/cloudSync'
import { initOfflineQueueListener } from './services/offlineQueue'

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
import CalendarPage from './pages/CalendarPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'
import CirclesPage from './pages/CirclesPage'
import WalletsPage from './pages/WalletsPage'

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
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              }
            />
            <Route
              path="/transactions"
              element={
                <PageTransition>
                  <TransactionsPage />
                </PageTransition>
              }
            />
            <Route
              path="/transactions/new"
              element={
                <PageTransition>
                  <TransactionsPage mode="add" />
                </PageTransition>
              }
            />
            <Route
              path="/budget"
              element={
                <PageTransition>
                  <BudgetPage />
                </PageTransition>
              }
            />
            <Route
              path="/savings"
              element={
                <PageTransition>
                  <SavingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/circles"
              element={
                <PageTransition>
                  <CirclesPage />
                </PageTransition>
              }
            />
            <Route
              path="/debts"
              element={
                <PageTransition>
                  <DebtPage />
                </PageTransition>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <PageTransition>
                  <SubscriptionsPage />
                </PageTransition>
              }
            />
            <Route
              path="/calendar"
              element={
                <PageTransition>
                  <CalendarPage />
                </PageTransition>
              }
            />
            <Route
              path="/reports"
              element={
                <PageTransition>
                  <ReportsPage />
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              }
            />
            <Route
              path="/settings"
              element={
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/wallets"
              element={
                <PageTransition>
                  <WalletsPage />
                </PageTransition>
              }
            />
            <Route
              path="/notifications"
              element={
                <PageTransition>
                  <NotificationsPage />
                </PageTransition>
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
    processDueRecurring()
  }, [processDueRecurring])

  useEffect(() => {
    if (user?.id) {
      const unsub = startRealtimeSync(user.id)
      return () => unsub()
    }
  }, [user?.id])

  return <AnimatedRoutes />
}
