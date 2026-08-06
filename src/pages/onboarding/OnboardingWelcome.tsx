import { useNavigate } from 'react-router-dom';
import { Mascot } from '../../components/ui/Mascot';
import { motion } from 'framer-motion';

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center mt-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <Mascot mood="excited" size="xl" animate={true} />
        </motion.div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 dark:text-gray-100"
          >
            Welcome to Mochi!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-sm mx-auto"
          >
            Let's get your finances sorted together. It only takes a few minutes!
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pb-8"
      >
        <button
          onClick={() => navigate('/onboarding/currency')}
          className="w-full mochi-btn bg-primary text-white py-4 rounded-full font-bold text-lg shadow-primary-md active:scale-95 transition-all min-h-[56px]"
        >
          Let's Go!
        </button>
      </motion.div>
    </div>
  );
}
