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
      {id === 'utensils' && (
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
      {id === 'shopping_bag' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E2F0CB" />
          <path d="M14 18H34L32 38H16L14 18Z" fill="#B5EAD7" stroke="#52B788" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 18V14C19 11.2386 21.2386 9 24 9C26.7614 9 29 11.2386 29 14V18" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 26C25.5 24.5 28 25.5 28 27.5C28 29.5 24 32 24 32C24 32 20 29.5 20 27.5C20 25.5 22.5 24.5 24 26Z" fill="#FF85A1" />
        </g>
      )}

      {/* 3. Housing & Rent */}
      {id === 'house' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E0AAFF" />
          <path d="M12 22L24 11L36 22V37C36 38.1046 35.1046 39 34 39H14C12.8954 39 12 38.1046 12 37V22Z" fill="#C77DFF" stroke="#7B2CBF" strokeWidth="2.5" />
          <rect x="20" y="28" width="8" height="11" rx="2" fill="#FFE5EC" stroke="#7B2CBF" strokeWidth="2" />
          <circle cx="24" cy="18" r="3" fill="#FFE5EC" />
        </g>
      )}

      {/* 4. Transportation */}
      {id === 'car' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#C7CEEA" />
          <path d="M10 26C10 23.5 12 20 16 18L20 13H28L32 18C36 20 38 23.5 38 26V31H10V26Z" fill="#9BF6FF" stroke="#3A86FF" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="16" cy="33" r="4" fill="#3A86FF" stroke="white" strokeWidth="2" />
          <circle cx="32" cy="33" r="4" fill="#3A86FF" stroke="white" strokeWidth="2" />
          <path d="M18 18H30" stroke="#3A86FF" strokeWidth="2" />
        </g>
      )}

      {/* 5. Bills & Utilities */}
      {id === 'electric' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFDAC1" />
          <path d="M26 10L14 26H24L22 38L34 22H24L26 10Z" fill="#FFB5A7" stroke="#F77F00" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}

      {/* 6. Entertainment */}
      {id === 'gamepad' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFD6A5" />
          <rect x="10" y="16" width="28" height="18" rx="9" fill="#FF9EAA" stroke="#FF0054" strokeWidth="2.5" />
          <path d="M15 25H21M18 22V28" stroke="#FF0054" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="30" cy="23" r="1.5" fill="#FF0054" />
          <circle cx="33" cy="26" r="1.5" fill="#FF0054" />
        </g>
      )}

      {/* 7. Healthcare & Wellness */}
      {id === 'heart' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFCCD5" />
          <path d="M24 37C24 37 10 27 10 18C10 13.5 13.5 10 18 10C21 10 23.5 12.5 24 14C24.5 12.5 27 10 30 10C34.5 10 38 13.5 38 18C38 27 24 37 24 37Z" fill="#FF4D6D" stroke="#C9184A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 18V26M20 22H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 8. Education & Courses */}
      {id === 'graduation' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#B9FBC0" />
          <path d="M24 12L8 20L24 28L40 20L24 12Z" fill="#74C69D" stroke="#2D6A4F" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M14 23.5V32C14 35 19 37 24 37C29 37 34 35 34 32V23.5" stroke="#2D6A4F" strokeWidth="2.5" />
          <path d="M36 21V32" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 9. Personal Care */}
      {id === 'sofa' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FDE2E4" />
          <rect x="12" y="20" width="24" height="14" rx="4" fill="#FFCAD4" stroke="#B5E2FA" strokeWidth="2.5" />
          <path d="M10 24V32M38 24V32" stroke="#FF4D6D" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 12L25 15L28 16L25 17L24 20L23 17L20 16L23 15L24 12Z" fill="#FFB5A7" />
        </g>
      )}

      {/* 10. Travel & Trips */}
      {id === 'plane' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#A0C4FF" />
          <path d="M10 26L38 12L28 38L23 27L10 26Z" fill="#9BF6FF" stroke="#0077B6" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M23 27L38 12" stroke="#0077B6" strokeWidth="2" strokeDasharray="2 2" />
        </g>
      )}

      {/* 11. Other Expense */}
      {id === 'receipt' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E2E2E2" />
          <path d="M14 10H34V38L30 35L26 38L22 35L18 38L14 35V10Z" fill="#F8F9FA" stroke="#6C757D" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 18H29M19 24H27M19 30H24" stroke="#6C757D" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 12. Salary & Wages */}
      {id === 'briefcase' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D8F3DC" />
          <rect x="10" y="18" width="28" height="20" rx="4" fill="#74C69D" stroke="#1B4332" strokeWidth="2.5" />
          <path d="M18 18V14C18 12.5 19.5 11 21 11H27C28.5 11 30 12.5 30 14V18" stroke="#1B4332" strokeWidth="2.5" />
          <circle cx="24" cy="28" r="4" fill="#FFD166" stroke="#1B4332" strokeWidth="2" />
        </g>
      )}

      {/* 13. Freelance & Side Gig */}
      {id === 'laptop' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#CBF3F0" />
          <rect x="13" y="14" width="22" height="16" rx="3" fill="#2EC4B6" stroke="#0F4C5C" strokeWidth="2.5" />
          <path d="M8 34H40C40 34 38 30 35 30H13C10 30 8 34 8 34Z" fill="#FFBF69" stroke="#0F4C5C" strokeWidth="2.5" />
          <circle cx="24" cy="22" r="2.5" fill="white" />
        </g>
      )}

      {/* 14. Investments & Dividends */}
      {id === 'piggy_bank' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFE5EC" />
          <path d="M36 24C36 30 30 35 23 35C16 35 11 30 11 24C11 18 16 13 23 13C30 13 36 18 36 24Z" fill="#FF85A1" stroke="#C9184A" strokeWidth="2.5" />
          <circle cx="16" cy="21" r="1.5" fill="#C9184A" />
          <rect x="20" y="10" width="6" height="3" rx="1.5" fill="#FFD166" stroke="#C9184A" strokeWidth="1.5" />
          <path d="M14 34L12 38M31 34L33 38" stroke="#C9184A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 15. Gifts & Allowances */}
      {id === 'gift_bag' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#F0EF66" />
          <rect x="11" y="20" width="26" height="18" rx="3" fill="#FF9F1C" stroke="#E71D36" strokeWidth="2.5" />
          <path d="M24 20V38M11 28H37" stroke="#E71D36" strokeWidth="2.5" />
          <path d="M17 15C15 12 18 10 20 13L24 20L28 13C30 10 33 12 31 15L24 20L17 15Z" fill="#E71D36" />
        </g>
      )}

      {/* 16. Sales & Business */}
      {id === 'vault' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#E0C3FC" />
          <rect x="11" y="12" width="26" height="26" rx="5" fill="#8E94F2" stroke="#3D348B" strokeWidth="2.5" />
          <circle cx="24" cy="25" r="6" fill="#F72585" stroke="#3D348B" strokeWidth="2" />
          <circle cx="24" cy="25" r="2" fill="white" />
        </g>
      )}

      {/* 17. Other Income */}
      {id === 'coins' && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FFF3B0" />
          <ellipse cx="24" cy="18" rx="12" ry="5" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
          <path d="M12 18V24C12 26.7614 17.3726 29 24 29C30.6274 29 36 26.7614 36 24V18" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
          <path d="M12 24V30C12 32.7614 17.3726 35 24 35C30.6274 35 36 32.7614 36 30V24" fill="#FFD166" stroke="#E07A5F" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}

export default MochiCategoryVectorSVG
