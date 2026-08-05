import { cn } from '@/lib/utils'

interface MochiCategoryVectorSVGProps {
  id: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizePx = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 64,
}

export function MochiCategoryVectorSVG({ id, size = 'md', className }: MochiCategoryVectorSVGProps) {
  const dimension = sizePx[size] || 36
  const cleanId = (id || '').toLowerCase()

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 drop-shadow-xs transition-transform duration-300 hover:scale-105', className)}
    >
      {/* 1. Food & Dining */}
      {(cleanId === 'utensils' || cleanId === 'food') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFE5EC" />
          <path d="M12 28C12 34 17.3726 38 24 38C30.6274 38 36 34 36 28H12Z" fill="#FF85A1" />
          <path d="M16 16C16 19 18 22 18 24M24 14C24 18 24 21 24 24M32 16C32 19 30 22 30 24" stroke="#FF0054" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 28H38" stroke="#FF0054" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="32" r="1.5" fill="white" />
          <circle cx="28" cy="32" r="1.5" fill="white" />
        </g>
      )}

      {/* 2. Shopping */}
      {(cleanId === 'shopping_bag' || cleanId === 'shopping') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E2F0CB" />
          <path d="M14 18H34L32 38H16L14 18Z" fill="#B5EAD7" stroke="#52B788" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 18V14C19 11.2386 21.2386 9 24 9C26.7614 9 29 11.2386 29 14V18" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 26C25.5 24.5 28 25.5 28 27.5C28 29.5 24 32 24 32C24 32 20 29.5 20 27.5C20 25.5 22.5 24.5 24 26Z" fill="#FF85A1" />
        </g>
      )}

      {/* 3. Housing & Rent */}
      {(cleanId === 'house' || cleanId === 'housing') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E0AAFF" />
          <path d="M12 22L24 11L36 22V37C36 38.1046 35.1046 39 34 39H14C12.8954 39 12 38.1046 12 37V22Z" fill="#C77DFF" stroke="#7B2CBF" strokeWidth="2.5" />
          <rect x="20" y="28" width="8" height="11" rx="2" fill="#FFE5EC" stroke="#7B2CBF" strokeWidth="2" />
          <circle cx="24" cy="18" r="3" fill="#FFE5EC" />
        </g>
      )}

      {/* 4. Transportation */}
      {(cleanId === 'car' || cleanId === 'transport') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#C7CEEA" />
          <path d="M10 26C10 23.5 12 20 16 18L20 13H28L32 18C36 20 38 23.5 38 26V31H10V26Z" fill="#9BF6FF" stroke="#3A86FF" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="16" cy="33" r="4" fill="#3A86FF" stroke="white" strokeWidth="2" />
          <circle cx="32" cy="33" r="4" fill="#3A86FF" stroke="white" strokeWidth="2" />
          <path d="M18 18H30" stroke="#3A86FF" strokeWidth="2" />
        </g>
      )}

      {/* 5. Bills & Utilities */}
      {(cleanId === 'electric' || cleanId === 'bills') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFDAC1" />
          <path d="M26 10L14 26H24L22 38L34 22H24L26 10Z" fill="#FFB5A7" stroke="#F77F00" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}

      {/* 6. Entertainment */}
      {(cleanId === 'gamepad' || cleanId === 'entertainment') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFD6A5" />
          <rect x="10" y="16" width="28" height="18" rx="9" fill="#FF9EAA" stroke="#FF0054" strokeWidth="2.5" />
          <path d="M15 25H21M18 22V28" stroke="#FF0054" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="23" r="1.5" fill="#FF0054" />
          <circle cx="33" cy="26" r="1.5" fill="#FF0054" />
        </g>
      )}

      {/* 7. Healthcare & Wellness */}
      {(cleanId === 'heart' || cleanId === 'health') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFCCD5" />
          <path d="M24 37C24 37 10 27 10 18C10 13.5 13.5 10 18 10C21 10 23.5 12.5 24 14C24.5 12.5 27 10 30 10C34.5 10 38 13.5 38 18C38 27 24 37 24 37Z" fill="#FF4D6D" stroke="#C9184A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 18V26M20 22H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 8. Education */}
      {(cleanId === 'graduation' || cleanId === 'education') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#B9FBC0" />
          <path d="M24 12L8 20L24 28L40 20L24 12Z" fill="#74C69D" stroke="#2D6A4F" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M14 23.5V32C14 35 19 37 24 37C29 37 34 35 34 32V23.5" stroke="#2D6A4F" strokeWidth="2.5" />
          <path d="M36 21V32" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 9. Personal Care */}
      {(cleanId === 'sofa' || cleanId === 'personal') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FDE2E4" />
          <rect x="12" y="20" width="24" height="14" rx="4" fill="#FFCAD4" stroke="#B5E2FA" strokeWidth="2.5" />
          <path d="M10 24V32M38 24V32" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 12L25 15L28 16L25 17L24 20L23 17L20 16L23 15L24 12Z" fill="#FFB5A7" />
        </g>
      )}

      {/* 10. Travel & Trips */}
      {cleanId === 'plane' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#A0C4FF" />
          <path d="M10 26L38 12L28 38L23 27L10 26Z" fill="#9BF6FF" stroke="#0077B6" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M23 27L38 12" stroke="#0077B6" strokeWidth="2" strokeDasharray="2 2" />
        </g>
      )}

      {/* 11. Receipt / Bills */}
      {cleanId === 'receipt' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E2E2E2" />
          <path d="M14 10H34V38L30 35L26 38L22 35L18 38L14 35V10Z" fill="#F8F9FA" stroke="#6C757D" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 18H29M19 24H27M19 30H24" stroke="#6C757D" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 12. Salary */}
      {(cleanId === 'briefcase' || cleanId === 'salary') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D8F3DC" />
          <rect x="10" y="18" width="28" height="20" rx="4" fill="#74C69D" stroke="#1B4332" strokeWidth="2.5" />
          <path d="M18 18V14C18 12.5 19.5 11 21 11H27C28.5 11 30 12.5 30 14V18" stroke="#1B4332" strokeWidth="2.5" />
          <circle cx="24" cy="28" r="4" fill="#FFD166" stroke="#1B4332" strokeWidth="2" />
        </g>
      )}

      {/* 13. Freelance */}
      {(cleanId === 'laptop' || cleanId === 'freelance') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#CBF3F0" />
          <rect x="13" y="14" width="22" height="16" rx="3" fill="#2EC4B6" stroke="#0F4C5C" strokeWidth="2.5" />
          <path d="M8 34H40C40 34 38 30 35 30H13C10 30 8 34 8 34Z" fill="#FFBF69" stroke="#0F4C5C" strokeWidth="2.5" />
          <circle cx="24" cy="22" r="2.5" fill="white" />
        </g>
      )}

      {/* 14. Piggy Bank / Savings */}
      {(cleanId === 'piggy_bank' || cleanId === 'savings') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFE5EC" />
          <path d="M36 24C36 30 30 35 23 35C16 35 11 30 11 24C11 18 16 13 23 13C30 13 36 18 36 24Z" fill="#FF85A1" stroke="#C9184A" strokeWidth="2.5" />
          <circle cx="16" cy="21" r="1.5" fill="#C9184A" />
          <rect x="20" y="10" width="6" height="3" rx="1.5" fill="#FFD166" stroke="#C9184A" strokeWidth="1.5" />
          <path d="M14 34L12 38M31 34L33 38" stroke="#C9184A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 15. Gifts */}
      {(cleanId === 'gift_bag' || cleanId === 'gifts') && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F0EF66" />
          <rect x="11" y="20" width="26" height="18" rx="3" fill="#FF9F1C" stroke="#E71D36" strokeWidth="2.5" />
          <path d="M24 20V38M11 28H37" stroke="#E71D36" strokeWidth="2.5" />
          <path d="M17 15C15 12 18 10 20 13L24 20L28 13C30 10 33 12 31 15L24 20L17 15Z" fill="#E71D36" />
        </g>
      )}

      {/* 16. Vault */}
      {cleanId === 'vault' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E0C3FC" />
          <rect x="11" y="12" width="26" height="26" rx="5" fill="#8E94F2" stroke="#3D348B" strokeWidth="2.5" />
          <circle cx="24" cy="25" r="6" fill="#F72585" stroke="#3D348B" strokeWidth="2" />
          <circle cx="24" cy="25" r="2" fill="white" />
        </g>
      )}

      {/* 17. Coins */}
      {cleanId === 'coins' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFF3B0" />
          <ellipse cx="24" cy="18" rx="12" ry="5" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
          <path d="M12 18V24C12 26.7614 17.3726 29 24 29C30.6274 29 36 26.7614 36 24V18" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
          <path d="M12 24V30C12 32.7614 17.3726 35 24 35C30.6274 35 36 32.7614 36 30V24" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
        </g>
      )}

      {/* ─── OFFICIAL PHILIPPINE & GLOBAL BRAND VECTOR LOGOS ─── */}

      {/* GCash */}
      {(cleanId === 'gcash' || cleanId.includes('gcash')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#005CE6" />
          <path fillRule="evenodd" clipRule="evenodd" d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C29.5 38 34.2 34.8 36.5 30.2H25.5V24.5H38C38 16.268 31.732 10 24 10ZM24 15.5C19.3056 15.5 15.5 19.3056 15.5 24C15.5 28.6944 19.3056 32.5 24 32.5C26.8 32.5 29.25 31.15 30.8 29.1H25.5V26.5H32.2V29.1C30.4 31.9 27.4 33.8 24 33.8C18.6 33.8 14.2 29.4 14.2 24C14.2 18.6 18.6 14.2 24 14.2C27.2 14.2 30 15.8 31.7 18.2L33.2 16.7C31.1 13.8 27.8 12 24 12V15.5Z" fill="white" />
        </g>
      )}

      {/* Maya */}
      {(cleanId === 'maya' || cleanId.includes('maya')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#000000" />
          <path d="M12 14L20 34H26L30 24L34 34H40L32 14H26L22 24L18 14H12Z" fill="#00D68F" />
          <path d="M22 24L26 14H20L16 24L22 24Z" fill="#00A389" />
        </g>
      )}

      {/* Foodpanda / Pandamart */}
      {(cleanId === 'foodpanda' || cleanId.includes('foodpanda') || cleanId.includes('pandamart')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D70F64" />
          <circle cx="18" cy="18" r="4" fill="white" />
          <circle cx="30" cy="18" r="4" fill="white" />
          <path d="M14 26C14 20 18 18 24 18C30 18 34 20 34 26C34 32 30 36 24 36C18 36 14 32 14 26Z" fill="white" />
          <circle cx="20" cy="25" r="2" fill="#D70F64" />
          <circle cx="28" cy="25" r="2" fill="#D70F64" />
          <ellipse cx="24" cy="29" rx="2" ry="1.5" fill="#D70F64" />
        </g>
      )}

      {/* Lalamove */}
      {(cleanId === 'lalamove' || cleanId.includes('lalamove')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F57C00" />
          <path d="M10 28L24 14L38 28H28V36H18V28H10Z" fill="white" />
          <path d="M20 20L28 20L24 26Z" fill="#F57C00" />
        </g>
      )}

      {/* Angkas / JoyRide / Move It */}
      {(cleanId === 'angkas' || cleanId.includes('angkas') || cleanId.includes('joyride') || cleanId.includes('move it') || cleanId.includes('moveit')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#00B4D8" />
          <circle cx="24" cy="22" r="9" fill="white" />
          <path d="M15 22C15 17 19 13 24 13C29 13 33 17 33 22H15Z" fill="#1E293B" />
          <path d="M12 32H36M16 36H32" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* SM Supermalls / SM Markets / Savemore */}
      {(cleanId.includes('sm ') || cleanId === 'sm' || cleanId.includes('savemore') || cleanId.includes('hypermarket')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#003580" />
          <text x="24" y="30" textAnchor="middle" fill="#FFC72C" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            SM
          </text>
        </g>
      )}

      {/* Ayala Malls */}
      {(cleanId.includes('ayala') || cleanId.includes('ayalamalls')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#046A38" />
          <path d="M24 12L34 36H28L24 26L20 36H14L24 12Z" fill="#A7D08D" />
          <circle cx="24" cy="20" r="3" fill="white" />
        </g>
      )}

      {/* Jollibee */}
      {(cleanId === 'jollibee' || cleanId.includes('jollibee') || cleanId.includes('chickenjoy')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D32F2F" />
          <path d="M18 14C18 11.8 19.8 10 22 10C23 10 23.9 10.4 24.5 11C25.1 10.4 26 10 27 10C29.2 10 31 11.8 31 14C31 14.8 30.7 15.6 30.3 16.2H18.7C18.3 15.6 18 14.8 18 14Z" fill="white" />
          <path d="M14 26C14 19.3726 18.4772 16 24 16C29.5228 16 34 19.3726 34 26C34 32.6274 29.5228 37 24 37C18.4772 37 14 32.6274 14 26Z" fill="#FFF8E1" />
          <circle cx="19.5" cy="24" r="2.5" fill="#1E293B" />
          <circle cx="28.5" cy="24" r="2.5" fill="#1E293B" />
          <circle cx="16.5" cy="27" r="2.5" fill="#D32F2F" />
          <circle cx="31.5" cy="27" r="2.5" fill="#D32F2F" />
          <path d="M19 29.5C21 33 27 33 29 29.5" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Chowking */}
      {(cleanId === 'chowking' || cleanId.includes('chowking')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#B91C1C" />
          <circle cx="24" cy="24" r="13" stroke="#FBBF24" strokeWidth="3" />
          <path d="M16 26C20 30 28 30 32 26" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 18L24 14L28 18" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* Mang Inasal */}
      {(cleanId.includes('inasal') || cleanId.includes('mang inasal')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#15803D" />
          <path d="M14 18H34V22H14V18Z" fill="#DC2626" />
          <text x="24" y="32" textAnchor="middle" fill="#FACC15" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            INASAL
          </text>
        </g>
      )}

      {/* Greenwich */}
      {(cleanId === 'greenwich' || cleanId.includes('greenwich')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#166534" />
          <path d="M14 34L24 14L34 34H14Z" fill="#DC2626" />
          <circle cx="24" cy="24" r="3" fill="#FACC15" />
        </g>
      )}

      {/* Red Ribbon */}
      {(cleanId.includes('red ribbon') || cleanId.includes('redribbon')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <path d="M18 16C15 16 13 19 16 22L24 26L32 22C35 19 33 16 30 16C27 16 24 20 24 20C24 20 21 16 18 16Z" fill="#FACC15" />
          <path d="M20 25L14 34M28 25L34 34" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Goldilocks */}
      {(cleanId.includes('goldilocks')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0284C7" />
          <path d="M14 20L19 14L24 20L29 14L34 20V32H14V20Z" fill="#FACC15" />
          <circle cx="24" cy="26" r="3" fill="#0284C7" />
        </g>
      )}

      {/* 7-Eleven */}
      {(cleanId === 'seven_eleven' || cleanId.includes('7-eleven') || cleanId.includes('7eleven')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#00843D" />
          <rect x="8" y="16" width="32" height="16" fill="white" rx="3" />
          <rect x="8" y="16" width="32" height="5" fill="#EE3124" />
          <path d="M18 24H28L21 38H26" stroke="#EE3124" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* Uncle John's / Ministop */}
      {(cleanId.includes('uncle john') || cleanId.includes('ministop')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F59E0B" />
          <rect x="8" y="16" width="32" height="16" fill="#1E3A8A" rx="3" />
          <text x="24" y="28" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            UNCLE
          </text>
        </g>
      )}

      {/* Lawson */}
      {(cleanId.includes('lawson')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0284C7" />
          <path d="M18 16H30V32H18V16Z" fill="white" rx="2" />
          <path d="M20 12H28V16H20V12Z" fill="white" />
        </g>
      )}

      {/* FamilyMart */}
      {(cleanId.includes('familymart') || cleanId.includes('family mart')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#059669" />
          <rect x="8" y="24" width="32" height="12" fill="#0284C7" />
          <text x="24" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            FamilyMart
          </text>
        </g>
      )}

      {/* Puregold */}
      {(cleanId.includes('puregold')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#EAB308" />
          <circle cx="24" cy="24" r="12" fill="#15803D" />
          <text x="24" y="28" textAnchor="middle" fill="#FACC15" fontSize="13" fontWeight="900" fontFamily="sans-serif">
            P
          </text>
        </g>
      )}

      {/* Robinsons Supermarket */}
      {(cleanId.includes('robinsons')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            R
          </text>
        </g>
      )}

      {/* WalterMart */}
      {(cleanId.includes('waltermart') || cleanId.includes('walter mart')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#2563EB" />
          <path d="M12 16L18 32L24 20L30 32L36 16" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* Landers */}
      {(cleanId.includes('landers')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#166534" />
          <text x="24" y="30" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="sans-serif">
            LANDERS
          </text>
        </g>
      )}

      {/* S&R Membership */}
      {(cleanId.includes('s&r') || cleanId.includes('snr')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#1E3A8A" />
          <rect x="8" y="22" width="32" height="6" fill="#DC2626" />
          <text x="24" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            S&R
          </text>
        </g>
      )}

      {/* MetroMart */}
      {(cleanId.includes('metromart')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#16A34A" />
          <path d="M14 18H34L31 34H17L14 18Z" fill="white" />
        </g>
      )}

      {/* McDonald's */}
      {(cleanId === 'mcdo' || cleanId.includes('mcdo') || cleanId.includes('mcdonald')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DA291C" />
          <path d="M14 36V22C14 17.5 16.5 14 19 14C21.5 14 24 17.5 24 22V34M24 22C24 17.5 26.5 14 29 14C31.5 14 34 17.5 34 22V36" stroke="#FFC72C" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      )}

      {/* KFC */}
      {(cleanId === 'kfc' || cleanId.includes('kfc')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#A3080C" />
          <rect x="18" y="10" width="12" height="28" fill="white" />
          <text x="24" y="28" textAnchor="middle" fill="#A3080C" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            KFC
          </text>
        </g>
      )}

      {/* Burger King */}
      {(cleanId.includes('burger king') || cleanId.includes('burgerking')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#005CE6" />
          <path d="M12 18H36C36 18 34 12 24 12C14 12 12 18 12 18Z" fill="#F57C00" />
          <path d="M12 30H36C36 30 34 36 24 36C14 36 12 30 12 30Z" fill="#F57C00" />
          <rect x="10" y="21" width="28" height="6" fill="#D32F2F" rx="3" />
        </g>
      )}

      {/* Wendy's */}
      {(cleanId.includes('wendy')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E11D48" />
          <circle cx="24" cy="22" r="8" fill="#FFF1F2" />
          <path d="M16 18C16 18 18 14 24 14C30 14 32 18 32 18" stroke="#E11D48" strokeWidth="2.5" />
        </g>
      )}

      {/* Popeyes */}
      {(cleanId.includes('popeye')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#EA580C" />
          <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            P
          </text>
        </g>
      )}

      {/* Subway */}
      {(cleanId.includes('subway')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#15803D" />
          <path d="M12 24H24L20 18H12V24Z" fill="#FACC15" />
          <path d="M36 24H24L28 30H36V24Z" fill="#FACC15" />
        </g>
      )}

      {/* Shakey's */}
      {(cleanId.includes('shakey')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#CA8A04" />
          <path d="M14 34L24 14L34 34H14Z" fill="#DC2626" />
        </g>
      )}

      {/* Pizza Hut */}
      {(cleanId.includes('pizza hut') || cleanId.includes('pizzahut')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <path d="M12 22L24 12L36 22H12Z" fill="#111827" />
          <rect x="16" y="22" width="16" height="10" fill="#FACC15" />
        </g>
      )}

      {/* Domino's Pizza */}
      {(cleanId.includes('domino')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0284C7" />
          <rect x="14" y="14" width="20" height="20" rx="4" fill="#E11D48" transform="rotate(45 24 24)" />
          <circle cx="20" cy="20" r="2.5" fill="white" />
          <circle cx="28" cy="28" r="2.5" fill="white" />
        </g>
      )}

      {/* Tokyo Tokyo */}
      {(cleanId.includes('tokyo')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <path d="M14 18H34M18 18V32M30 18V32M14 24H34" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {/* Marugame Udon */}
      {(cleanId.includes('marugame')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#1E293B" />
          <path d="M14 24C14 30 18 34 24 34C30 34 34 30 34 24H14Z" fill="#F59E0B" />
        </g>
      )}

      {/* BonChon Chicken */}
      {(cleanId.includes('bonchon')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#111827" />
          <text x="24" y="30" textAnchor="middle" fill="#DC2626" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            B
          </text>
        </g>
      )}

      {/* Paotsin / Master Siomai / Hen Lin */}
      {(cleanId.includes('paotsin') || cleanId.includes('siomai') || cleanId.includes('hen lin')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#15803D" />
          <ellipse cx="24" cy="26" rx="12" ry="7" fill="#FDE047" stroke="#166534" strokeWidth="2" />
          <circle cx="24" cy="22" r="4" fill="#DC2626" />
        </g>
      )}

      {/* CoCo Fresh Tea */}
      {(cleanId.includes('coco')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#EA580C" />
          <path d="M16 18L18 34H30L32 18H16Z" fill="#FFF7ED" />
          <circle cx="24" cy="26" r="3" fill="#EA580C" />
        </g>
      )}

      {/* Macao Imperial Tea */}
      {(cleanId.includes('macao')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D97706" />
          <circle cx="24" cy="22" r="8" fill="#FEF3C7" />
        </g>
      )}

      {/* Chatime */}
      {(cleanId.includes('chatime')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#7E22CE" />
          <path d="M16 18L18 34H30L32 18H16Z" fill="#FAF5FF" />
        </g>
      )}

      {/* Starbucks */}
      {(cleanId === 'starbucks' || cleanId.includes('starbucks')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#006241" />
          <circle cx="24" cy="24" r="14" fill="#006241" stroke="white" strokeWidth="2" />
          <path d="M24 15L26 19L30 19L27 22L28 26L24 23.5L20 26L21 22L18 19L22 19L24 15Z" fill="white" />
        </g>
      )}

      {/* Dunkin' */}
      {(cleanId.includes('dunkin')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#EC4899" />
          <text x="24" y="30" textAnchor="middle" fill="#F97316" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            DD
          </text>
        </g>
      )}

      {/* Mister Donut */}
      {(cleanId.includes('mister donut') || cleanId.includes('misterdonut')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F59E0B" />
          <circle cx="24" cy="24" r="10" fill="#DC2626" />
          <circle cx="24" cy="24" r="4" fill="#F59E0B" />
        </g>
      )}

      {/* PLDT Home Fibr */}
      {(cleanId.includes('pldt')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <path d="M12 34L24 14L36 34H12Z" fill="white" />
          <text x="24" y="30" textAnchor="middle" fill="#DC2626" fontSize="8" fontWeight="900" fontFamily="sans-serif">
            PLDT
          </text>
        </g>
      )}

      {/* Globe Telecom */}
      {(cleanId.includes('globe')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0284C7" />
          <circle cx="24" cy="24" r="12" fill="#0369A1" stroke="white" strokeWidth="2.5" />
          <path d="M16 24C16 24 20 18 24 18C28 18 32 24 32 24C32 24 28 30 24 30C20 30 16 24 16 24Z" stroke="white" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* Smart Communications */}
      {(cleanId.includes('smart')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#16A34A" />
          <path d="M14 34L24 14L34 34H14Z" fill="#0284C7" />
          <path d="M18 34L24 20L30 34H18Z" fill="white" />
        </g>
      )}

      {/* Converge ICT */}
      {(cleanId.includes('converge')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#7E22CE" />
          <path d="M12 24C12 17.3726 17.3726 12 24 12C30.6274 12 36 17.3726 36 24" stroke="#EA580C" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      )}

      {/* DITO Telecommunity */}
      {(cleanId.includes('dito')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <rect x="8" y="24" width="32" height="12" fill="#2563EB" />
          <text x="24" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="sans-serif">
            DITO
          </text>
        </g>
      )}

      {/* Maynilad Water */}
      {(cleanId.includes('maynilad')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0284C7" />
          <path d="M24 10C24 10 12 24 12 30C12 34.4183 17.3726 38 24 38C30.6274 38 36 34.4183 36 30C36 24 24 10 24 10Z" fill="#38BDF8" stroke="white" strokeWidth="2" />
        </g>
      )}

      {/* Manila Water */}
      {(cleanId.includes('manila water') || cleanId.includes('manilawater')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0369A1" />
          <path d="M12 26C16 22 20 30 24 26C28 22 32 30 36 26" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* PrimeWater / Laguna Water / LWUA */}
      {(cleanId.includes('primewater') || cleanId.includes('laguna water') || cleanId.includes('lwua') || cleanId.includes('water')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0EA5E9" />
          <path d="M24 12C24 12 14 24 14 29C14 33 18 36 24 36C30 36 34 33 34 29C34 24 24 12 24 12Z" fill="white" />
        </g>
      )}

      {/* Electric Cooperatives (AEC, DLPC, VECO, BENECO, FLECO, PELCO) */}
      {(cleanId.includes('aec') || cleanId.includes('dlpc') || cleanId.includes('veco') || cleanId.includes('beneco') || cleanId.includes('fleco') || cleanId.includes('pelco') || cleanId.includes('electric') || cleanId.includes('kuryente')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D97706" />
          <circle cx="24" cy="24" r="14" fill="#FBBF24" />
          <path d="M26 12L15 26H24L21 36L33 22H24L26 12Z" fill="#1E293B" />
        </g>
      )}

      {/* Sky Cable */}
      {(cleanId.includes('sky cable') || cleanId.includes('skycable') || cleanId.includes('sky')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#2563EB" />
          <rect x="8" y="20" width="32" height="8" fill="#DC2626" />
          <text x="24" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            SKY
          </text>
        </g>
      )}

      {/* Cignal TV */}
      {(cleanId.includes('cignal')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DC2626" />
          <path d="M14 24C14 18.4772 18.4772 14 24 14V34C18.4772 34 14 29.5228 14 24Z" fill="#FACC15" />
        </g>
      )}

      {/* Default Fallback for unmatched IDs */}
      {!['utensils', 'food', 'shopping_bag', 'shopping', 'house', 'housing', 'car', 'transport', 'electric', 'bills', 'gamepad', 'entertainment', 'heart', 'health', 'graduation', 'education', 'sofa', 'personal', 'plane', 'receipt', 'briefcase', 'salary', 'laptop', 'freelance', 'piggy_bank', 'savings', 'gift_bag', 'gifts', 'vault', 'coins', 'gcash', 'maya', 'jollibee', 'seven_eleven', 'meralco', 'grab', 'shopee', 'lazada', 'jeepney', 'bdo', 'bpi', 'mcdo', 'starbucks', 'netflix', 'spotify', 'foodpanda', 'pandamart', 'lalamove', 'angkas', 'joyride', 'moveit', 'sm', 'savemore', 'hypermarket', 'ayala', 'chowking', 'inasal', 'greenwich', 'red ribbon', 'goldilocks', 'binalot', 'uncle john', 'ministop', 'lawson', 'familymart', 'puregold', 'robinsons', 'waltermart', 'landers', 's&r', 'snr', 'metromart', 'kfc', 'burger king', 'wendy', 'popeye', 'subway', 'shakey', 'pizza hut', 'domino', 'tokyo', 'marugame', 'bonchon', 'paotsin', 'siomai', 'coco', 'macao', 'chatime', 'dunkin', 'mister donut', 'pldt', 'globe', 'smart', 'converge', 'dito', 'maynilad', 'manila water', 'primewater', 'laguna water', 'lwua', 'aec', 'dlpc', 'veco', 'beneco', 'fleco', 'pelco', 'sky', 'cignal'].some(k => cleanId.includes(k)) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F3F4F6" />
          <circle cx="24" cy="24" r="10" fill="#9CA3AF" />
          <path d="M20 24H28M24 20V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

export default MochiCategoryVectorSVG
