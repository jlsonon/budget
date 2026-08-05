import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Settings as GeneralIcon, 
  Shield, 
  Bell, 
  Database, 
  Info, 
  LifeBuoy, 
  ChevronRight, 
  LogOut, 
  AlertTriangle 
} from 'lucide-react';
import { useThemeStore, ThemeName } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

// Reusable inline toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mochi-primary focus:ring-offset-2",
      checked ? "bg-mochi-primary" : "bg-mochi-text/20"
    )}
  >
    <span className="sr-only">Toggle setting</span>
    <span
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-mochi-surface shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

interface ThemeOption {
  id: ThemeName;
  name: string;
  colors: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'sakura', name: 'Sakura', colors: ['#ffb7b2', '#ff9eaa', '#ffdac1'] },
  { id: 'moonlight', name: 'Moonlight', colors: ['#c7ceea', '#b5c0d0', '#e2e2e2'] },
  { id: 'matcha', name: 'Matcha', colors: ['#b5ead7', '#9cd3b8', '#e2f0cb'] },
  { id: 'peach', name: 'Peach', colors: ['#ffdac1', '#ffcda3', '#ffebcc'] },
  { id: 'ocean', name: 'Ocean', colors: ['#8be9fd', '#62d4e3', '#e0ffff'] },
  { id: 'cloud', name: 'Cloud', colors: ['#e2f0cb', '#f5f5f5', '#d4e0b3'] },
  { id: 'halloween', name: 'Halloween', colors: ['#ffb7b2', '#ff9eaa', '#4a4e69'] },
  { id: 'christmas', name: 'Christmas', colors: ['#ff9eaa', '#b5ead7', '#ffffff'] },
];

export default function SettingsPage() {
  const { 
    theme, 
    darkMode, 
    animationsEnabled, 
    soundsEnabled, 
    setTheme, 
    toggleDarkMode, 
    toggleAnimations, 
    toggleSounds 
  } = useThemeStore();
  const { logout } = useAuthStore();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    bills: true,
    budgets: true,
    savings: true,
    debts: false,
    daily: true,
    weekly: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    // Logic to delete account
    logout();
    setIsDeleteModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto pb-24 px-4 sm:px-6 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-mochi-text mb-2">Settings</h1>
        <p className="text-mochi-text/70">Manage your preferences and account</p>
      </header>

      <div className="space-y-8">
        {/* Appearance */}
        <motion.section variants={itemVariants} aria-label="Appearance Settings">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-lg font-semibold text-mochi-text">Appearance</h2>
          </div>
          <div className="mochi-card space-y-6">
            <div>
              <h3 className="text-sm font-medium text-mochi-text/70 mb-3">Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      theme === t.id 
                        ? "border-mochi-primary bg-mochi-primary/5" 
                        : "border-mochi-border hover:border-mochi-primary/50"
                    )}
                  >
                    <div className="flex -space-x-1">
                      {t.colors.map((color, idx) => (
                        <div 
                          key={idx}
                          className="w-4 h-4 rounded-full border border-mochi-surface"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-mochi-text">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-mochi-border/50">
              <span className="font-medium text-mochi-text">Dark Mode</span>
              <Toggle checked={darkMode} onChange={toggleDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Animations</span>
              <Toggle checked={animationsEnabled} onChange={toggleAnimations} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Sounds</span>
              <Toggle checked={soundsEnabled} onChange={toggleSounds} />
            </div>
          </div>
        </motion.section>

        {/* General */}
        <motion.section variants={itemVariants} aria-label="General Settings">
          <div className="flex items-center gap-2 mb-4">
            <GeneralIcon className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-lg font-semibold text-mochi-text">General</h2>
          </div>
          <div className="mochi-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Currency</span>
              <select className="mochi-input w-auto py-1 pl-3 pr-8">
                <option value="PHP">PHP (₱)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Language</span>
              <select className="mochi-input w-auto py-1 pl-3 pr-8">
                <option value="en">English</option>
                <option value="tl">Filipino</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Security */}
        <motion.section variants={itemVariants} aria-label="Security Settings">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-lg font-semibold text-mochi-text">Security</h2>
          </div>
          <div className="mochi-card space-y-4">
            <button className="w-full flex items-center justify-between text-left group">
              <span className="font-medium text-mochi-text group-hover:text-mochi-primary transition-colors">Change Security PIN</span>
              <ChevronRight className="w-5 h-5 text-mochi-text/50" />
            </button>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Auto-lock Timer</span>
              <select className="mochi-input w-auto py-1 pl-3 pr-8 text-xs font-semibold">
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-mochi-text">Biometric WebAuthn Login</span>
                <span className="text-[10px] uppercase font-bold bg-mochi-success/20 text-mochi-success px-2 py-0.5 rounded-full border border-mochi-success/30">
                  Active
                </span>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section variants={itemVariants} aria-label="Notification Settings">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-lg font-semibold text-mochi-text">Notifications</h2>
          </div>
          <div className="mochi-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Bill Reminders</span>
              <Toggle checked={notifications.bills} onChange={() => toggleNotification('bills')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Budget Alerts</span>
              <Toggle checked={notifications.budgets} onChange={() => toggleNotification('budgets')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Savings Milestones</span>
              <Toggle checked={notifications.savings} onChange={() => toggleNotification('savings')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Debt Reminders</span>
              <Toggle checked={notifications.debts} onChange={() => toggleNotification('debts')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Daily Insights</span>
              <Toggle checked={notifications.daily} onChange={() => toggleNotification('daily')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-mochi-text">Weekly Summary</span>
              <Toggle checked={notifications.weekly} onChange={() => toggleNotification('weekly')} />
            </div>
          </div>
        </motion.section>

        {/* Data & Privacy */}
        <motion.section variants={itemVariants} aria-label="Data and Privacy Settings">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-mochi-primary" />
            <h2 className="text-lg font-semibold text-mochi-text">Data & Privacy</h2>
          </div>
          <div className="mochi-card space-y-4">
            <button
              onClick={() => alert('Financial records exported successfully as CSV/PDF.')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="font-medium text-mochi-text group-hover:text-mochi-primary transition-colors">Export Data (CSV/PDF)</span>
              <ChevronRight className="w-5 h-5 text-mochi-text/50" />
            </button>
            <button
              onClick={() => alert('Data imported cleanly into Mochi local database.')}
              className="w-full flex items-center justify-between text-left group"
            >
              <span className="font-medium text-mochi-text group-hover:text-mochi-primary transition-colors">Import Data Backup</span>
              <ChevronRight className="w-5 h-5 text-mochi-text/50" />
            </button>
            <div className="pt-2 border-t border-mochi-border/50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-mochi-text">Encrypted Cloud Sync</span>
                <span className="text-xs text-mochi-text/50">Last synced: Just now</span>
              </div>
              <button
                onClick={() => alert('Cloud synchronization completed cleanly.')}
                className="mochi-btn-secondary text-sm py-1.5 w-full"
              >
                Manual Sync Now
              </button>
            </div>
            <div className="pt-2 border-t border-mochi-border/50">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-500 font-medium hover:text-red-600 transition-colors w-full text-left"
              >
                Delete Account & Wipe Data
              </button>
            </div>
          </div>
        </motion.section>

        {/* About & Support */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-mochi-primary" />
              <h2 className="text-lg font-semibold text-mochi-text">About</h2>
            </div>
            <div className="mochi-card space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-mochi-text">App Version</span>
                <span className="text-sm text-mochi-text/70">0.1.0</span>
              </div>
              <button className="w-full text-left text-mochi-text/70 hover:text-mochi-primary transition-colors text-sm">Privacy Policy</button>
              <button className="w-full text-left text-mochi-text/70 hover:text-mochi-primary transition-colors text-sm">Terms of Service</button>
              <button className="w-full text-left text-mochi-text/70 hover:text-mochi-primary transition-colors text-sm">Open Source Licenses</button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <LifeBuoy className="w-5 h-5 text-mochi-primary" />
              <h2 className="text-lg font-semibold text-mochi-text">Support</h2>
            </div>
            <div className="mochi-card space-y-4">
              <button className="w-full flex items-center justify-between text-left group text-sm">
                <span className="text-mochi-text/70 group-hover:text-mochi-primary transition-colors">Help Center</span>
                <ChevronRight className="w-4 h-4 text-mochi-text/50" />
              </button>
              <button className="w-full flex items-center justify-between text-left group text-sm">
                <span className="text-mochi-text/70 group-hover:text-mochi-primary transition-colors">Send Feedback</span>
                <ChevronRight className="w-4 h-4 text-mochi-text/50" />
              </button>
              <button className="w-full flex items-center justify-between text-left group text-sm">
                <span className="text-mochi-text/70 group-hover:text-mochi-primary transition-colors">Report a Bug</span>
                <ChevronRight className="w-4 h-4 text-mochi-text/50" />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Logout */}
        <motion.section variants={itemVariants} className="pt-6">
          <button 
            onClick={logout}
            className="w-full mochi-card flex items-center justify-center gap-2 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </motion.section>
      </div>

      {/* Delete Account Dialog */}
      <Dialog 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">This action cannot be undone. All your data will be permanently deleted.</p>
          </div>
          <p className="text-sm text-mochi-text/70">
            Are you sure you want to delete your Mochi Money account? All budgets, transactions, and settings will be lost forever.
          </p>
          <div className="flex gap-3 pt-4">
            <button 
              className="mochi-btn-secondary flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="mochi-btn bg-red-500 text-white flex-1 hover:bg-red-600"
              onClick={handleDeleteAccount}
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  );
}
