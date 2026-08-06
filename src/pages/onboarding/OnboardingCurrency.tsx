import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export default function OnboardingCurrency() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('USD');

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 mt-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Choose your currency</h1>
          <p className="text-gray-600 dark:text-gray-400">You can always change this later in settings.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelected(curr.code)}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 min-h-[88px] ${
                selected === curr.code
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-white dark:bg-gray-900 shadow-sm'
              }`}
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{curr.symbol}</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{curr.code}</span>
            </button>
          ))}
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
          onClick={() => navigate('/onboarding/wallet')}
          className="flex-[2] bg-primary text-white py-4 rounded-full font-bold text-lg shadow-primary-md active:scale-95 transition-transform min-h-[56px]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
