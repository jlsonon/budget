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

      {/* 18. Official GCash (Blue background + White Official G Loop Logo) */}
      {(cleanId === 'gcash' || cleanId.includes('gcash')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#005CE6" />
          {/* Official GCash G logo loop */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C29.5 38 34.2 34.8 36.5 30.2H25.5V24.5H38C38 16.268 31.732 10 24 10ZM24 15.5C19.3056 15.5 15.5 19.3056 15.5 24C15.5 28.6944 19.3056 32.5 24 32.5C26.8 32.5 29.25 31.15 30.8 29.1H25.5V26.5H32.2V29.1C30.4 31.9 27.4 33.8 24 33.8C18.6 33.8 14.2 29.4 14.2 24C14.2 18.6 18.6 14.2 24 14.2C27.2 14.2 30 15.8 31.7 18.2L33.2 16.7C31.1 13.8 27.8 12 24 12V15.5Z"
            fill="white"
          />
        </g>
      )}

      {/* 19. Official Maya (Dark / Emerald Green + Official Folded Ribbon Logo) */}
      {(cleanId === 'maya' || cleanId.includes('maya')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#000000" />
          <path d="M12 14L20 34H26L30 24L34 34H40L32 14H26L22 24L18 14H12Z" fill="#00D68F" />
          <path d="M22 24L26 14H20L16 24L22 24Z" fill="#00A389" />
        </g>
      )}

      {/* 20. Official Jollibee (Signature Red + Official Jollibee Smiling Bee Head Logo) */}
      {(cleanId === 'jollibee' || cleanId.includes('jollibee') || cleanId.includes('chickenjoy')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#D32F2F" />
          {/* Chef Hat */}
          <path d="M18 14C18 11.8 19.8 10 22 10C23 10 23.9 10.4 24.5 11C25.1 10.4 26 10 27 10C29.2 10 31 11.8 31 14C31 14.8 30.7 15.6 30.3 16.2H18.7C18.3 15.6 18 14.8 18 14Z" fill="white" />
          {/* Face */}
          <path d="M14 26C14 19.3726 18.4772 16 24 16C29.5228 16 34 19.3726 34 26C34 32.6274 29.5228 37 24 37C18.4772 37 14 32.6274 14 26Z" fill="#FFF8E1" />
          {/* Eyes */}
          <circle cx="19.5" cy="24" r="2.5" fill="#1E293B" />
          <circle cx="28.5" cy="24" r="2.5" fill="#1E293B" />
          <circle cx="20.5" cy="23" r="0.8" fill="white" />
          <circle cx="29.5" cy="23" r="0.8" fill="white" />
          {/* Red Cheeks */}
          <circle cx="16.5" cy="27" r="2.5" fill="#D32F2F" />
          <circle cx="31.5" cy="27" r="2.5" fill="#D32F2F" />
          {/* Smile */}
          <path d="M19 29.5C21 33 27 33 29 29.5" stroke="#D32F2F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Snout */}
          <ellipse cx="24" cy="26" rx="2" ry="1.2" fill="#D32F2F" />
        </g>
      )}

      {/* 21. Official 7-Eleven (Green border + Red Bar + White 7 Numeral) */}
      {(cleanId === 'seven_eleven' || cleanId.includes('7-eleven') || cleanId.includes('7eleven')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#00843D" />
          <rect x="8" y="16" width="32" height="16" fill="white" rx="3" />
          <rect x="8" y="16" width="32" height="5" fill="#EE3124" />
          <path d="M18 24H28L21 38H26" stroke="#EE3124" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25 29H30V38" stroke="#F58220" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {/* 22. Official Meralco (Deep Blue + Orange Official Power Bolt Logo) */}
      {(cleanId === 'meralco' || cleanId.includes('meralco')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#00529B" />
          <circle cx="24" cy="24" r="14" fill="#F58220" />
          <path d="M26 12L15 26H24L21 36L33 22H24L26 12Z" fill="white" />
        </g>
      )}

      {/* 23. Official Grab (Grab Emerald Green + Interlocking Double G Ribbon) */}
      {(cleanId === 'grab' || cleanId.includes('grab')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#00B14F" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C28.2 36 31.8 33.8 33.9 30.5L30.2 28.2C28.8 30.4 26.5 31.8 24 31.8C19.7 31.8 16.2 28.3 16.2 24C16.2 19.7 19.7 16.2 24 16.2C26.5 16.2 28.8 17.6 30.2 19.8L33.9 17.5C31.8 14.2 28.2 12 24 12Z"
            fill="white"
          />
          <path d="M24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27H33V21H24Z" fill="white" />
        </g>
      )}

      {/* 24. Official Shopee (Shopee Orange + White Bag + S Curve Logo) */}
      {(cleanId === 'shopee' || cleanId.includes('shopee')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#EE4D2D" />
          <path d="M15 19H33L31.5 37H16.5L15 19Z" fill="white" />
          <path d="M20 19V15C20 12.8 21.8 11 24 11C26.2 11 28 12.8 28 15V19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M27 24.5C25.5 23.5 22.5 23.5 22.5 25.5C22.5 27.5 27 27.5 27 29.5C27 31.5 24 31.5 22.5 30.5" stroke="#EE4D2D" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 25. Official Lazada (Lazada Navy + Magenta Official Heart Ribbon L Logo) */}
      {(cleanId === 'lazada' || cleanId.includes('lazada')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#0F146D" />
          <path d="M15 14L33 24L15 34V14Z" fill="#F53400" />
          <path d="M33 14L15 24L33 34V14Z" fill="#FF007A" opacity="0.9" />
        </g>
      )}

      {/* 26. Official Jeepney (Classic Philippine Yellow & Red Metallic Grille) */}
      {(cleanId === 'jeepney' || cleanId.includes('jeepney') || cleanId.includes('commute')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#FACC15" />
          <rect x="10" y="16" width="28" height="20" rx="5" fill="#DC2626" stroke="#1E293B" strokeWidth="2.5" />
          <rect x="14" y="20" width="20" height="7" rx="2" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2" />
          <circle cx="15" cy="34" r="3.5" fill="#1E293B" stroke="white" strokeWidth="1.5" />
          <circle cx="33" cy="34" r="3.5" fill="#1E293B" stroke="white" strokeWidth="1.5" />
          <path d="M20 30H28" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 27. Official BDO Unibank (Navy & Gold BDO Wordmark) */}
      {(cleanId === 'bdo' || cleanId.includes('bdo')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#002D62" />
          <rect x="8" y="18" width="32" height="12" fill="#FFB800" rx="3" />
          <text x="24" y="27.5" textAnchor="middle" fill="#002D62" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            BDO
          </text>
        </g>
      )}

      {/* 28. Official BPI (Crimson Red & BPI Monogram Shield) */}
      {(cleanId === 'bpi' || cleanId.includes('bpi')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#B71C1C" />
          <path d="M24 10L36 15V26C36 32 24 38 24 38C24 38 12 32 12 26V15L24 10Z" fill="white" opacity="0.2" />
          <text x="24" y="28" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="sans-serif">
            BPI
          </text>
        </g>
      )}

      {/* 29. Official McDonald's (McDo Red + Golden Arches M) */}
      {(cleanId === 'mcdo' || cleanId.includes('mcdo') || cleanId.includes('mcdonald')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#DA291C" />
          <path d="M14 36V22C14 17.5 16.5 14 19 14C21.5 14 24 17.5 24 22V34M24 22C24 17.5 26.5 14 29 14C31.5 14 34 17.5 34 22V36" stroke="#FFC72C" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      )}

      {/* 30. Official Starbucks (Deep Green + White Crown Siren) */}
      {(cleanId === 'starbucks' || cleanId.includes('starbucks')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#006241" />
          <circle cx="24" cy="24" r="14" fill="#006241" stroke="white" strokeWidth="2" />
          <path d="M24 15L26 19L30 19L27 22L28 26L24 23.5L20 26L21 22L18 19L22 19L24 15Z" fill="white" />
        </g>
      )}

      {/* 31. Official Netflix (Black + Netflix Ribbon N) */}
      {(cleanId === 'netflix' || cleanId.includes('netflix')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#000000" />
          <path d="M16 10H21V38H16V10Z" fill="#E50914" />
          <path d="M27 10H32V38H27V10Z" fill="#E50914" />
          <path d="M16 10L32 38H27L16 10Z" fill="#B81D24" />
        </g>
      )}

      {/* 32. Official Spotify (Spotify Green + 3 Curved Wave Arcs) */}
      {(cleanId === 'spotify' || cleanId.includes('spotify')) && (
        <g>
          <rect width="48" height="48" rx="16" fill="#1DB954" />
          <path d="M14 21C20 19 28 20 34 23" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 26C21 24.5 27 25 32 27.5" stroke="#121212" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M17 31C21 30 26 30.5 30 32" stroke="#121212" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Default Fallback for unmatched IDs */}
      {!['utensils', 'food', 'shopping_bag', 'shopping', 'house', 'housing', 'car', 'transport', 'electric', 'bills', 'gamepad', 'entertainment', 'heart', 'health', 'graduation', 'education', 'sofa', 'personal', 'plane', 'receipt', 'briefcase', 'salary', 'laptop', 'freelance', 'piggy_bank', 'savings', 'gift_bag', 'gifts', 'vault', 'coins', 'gcash', 'maya', 'jollibee', 'seven_eleven', 'meralco', 'grab', 'shopee', 'lazada', 'jeepney', 'bdo', 'bpi', 'mcdo', 'starbucks', 'netflix', 'spotify'].some(k => cleanId.includes(k)) && (
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
