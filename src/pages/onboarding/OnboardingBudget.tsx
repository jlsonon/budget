import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingBudget() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 mt-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Set a monthly budget</h1>
          <p className="text-gray-600 dark:text-gray-400">What's your spending goal for this month?</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-500 mb-2">Monthly Budget</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-3xl font-bold rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary min-h-[64px]"
            />
          </div>
        </div>
      </div>

      <div className="pb-8 pt-4 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-full font-bold text-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-h-[56px] active:scale-95 transition-transform"
        >
          Back
        </button>
        <button
          onClick={() => navigate('/onboarding/complete')}
          className="flex-[2] bg-primary text-white py-4 rounded-full font-bold text-lg shadow-primary-md active:scale-95 transition-transform min-h-[56px]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
