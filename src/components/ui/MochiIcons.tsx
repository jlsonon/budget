import React from 'react'
import {
  Utensils,
  Coffee,
  Soup,
  Car,
  Bus,
  TrainTrack,
  ShoppingBag,
  Gift,
  ShoppingBasket,
  Receipt,
  FileText,
  Zap,
  PiggyBank,
  Wallet,
  Vault,
  Heart,
  Pill,
  Gamepad2,
  Ticket,
  Music,
  Camera,
  BookOpen,
  GraduationCap,
  Cat,
  Dog,
  Home,
  Sofa,
  Sprout,
  Laptop,
  Briefcase,
  Plane,
  Palmtree,
  Mountain,
  Repeat,
  CreditCard,
  Cloud,
  Star,
  Shield,
  Coins,
  Bell,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MochiCategoryVectorSVG from '@/components/ui/MochiCategoryVectorSVG'

export type IconCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'savings'
  | 'medical'
  | 'entertainment'
  | 'education'
  | 'pets'
  | 'home'
  | 'work'
  | 'travel'
  | 'subscriptions'
  | 'wishlist'
  | 'debt'
  | 'reminder'

export interface MochiIconDefinition {
  id: string
  name: string
  category: IconCategory
  icon: React.ComponentType<{ className?: string }>
  tags: string[]
}

export const MOCHI_ICON_LIBRARY: MochiIconDefinition[] = [
  // Food
  { id: 'utensils', name: 'Dining', category: 'food', icon: Utensils, tags: ['food', 'dining', 'restaurant', 'eat'] },
  { id: 'coffee', name: 'Coffee Cup', category: 'food', icon: Coffee, tags: ['coffee', 'cafe', 'drink', 'latte'] },
  { id: 'soup', name: 'Bowl / Ramen', category: 'food', icon: Soup, tags: ['soup', 'ramen', 'noodle', 'bowl'] },

  // Transport
  { id: 'car', name: 'Car / Drive', category: 'transport', icon: Car, tags: ['car', 'ride', 'gas', 'taxi'] },
  { id: 'bus', name: 'Bus / Commute', category: 'transport', icon: Bus, tags: ['bus', 'transit', 'fare'] },
  { id: 'train', name: 'Train / Railway', category: 'transport', icon: TrainTrack, tags: ['train', 'subway', 'rail'] },

  // Shopping
  { id: 'shopping_bag', name: 'Shopping Bag', category: 'shopping', icon: ShoppingBag, tags: ['shopping', 'clothes', 'mall'] },
  { id: 'gift_bag', name: 'Gift Box', category: 'shopping', icon: Gift, tags: ['gift', 'present', 'birthday'] },
  { id: 'basket', name: 'Groceries Basket', category: 'shopping', icon: ShoppingBasket, tags: ['groceries', 'supermarket', 'basket'] },

  // Bills
  { id: 'receipt', name: 'Receipt', category: 'bills', icon: Receipt, tags: ['receipt', 'bill', 'statement'] },
  { id: 'invoice', name: 'Document / Invoice', category: 'bills', icon: FileText, tags: ['invoice', 'paper', 'utility'] },
  { id: 'electric', name: 'Electricity', category: 'bills', icon: Zap, tags: ['electric', 'power', 'utility', 'energy'] },

  // Savings
  { id: 'piggy_bank', name: 'Piggy Bank', category: 'savings', icon: PiggyBank, tags: ['savings', 'piggy', 'bank', 'invest'] },
  { id: 'wallet', name: 'Wallet / Cash', category: 'savings', icon: Wallet, tags: ['wallet', 'pouch', 'money'] },
  { id: 'vault', name: 'Safe Vault', category: 'savings', icon: Vault, tags: ['safe', 'vault', 'emergency', 'security'] },

  // Medical
  { id: 'heart', name: 'Health & Wellness', category: 'medical', icon: Heart, tags: ['health', 'medical', 'fitness', 'wellness'] },
  { id: 'pill', name: 'Pharmacy / Medicine', category: 'medical', icon: Pill, tags: ['medicine', 'pharma', 'pill', 'doctor'] },

  // Entertainment
  { id: 'gamepad', name: 'Gaming', category: 'entertainment', icon: Gamepad2, tags: ['game', 'gaming', 'play', 'console'] },
  { id: 'ticket', name: 'Movie Ticket', category: 'entertainment', icon: Ticket, tags: ['movie', 'cinema', 'show', 'ticket'] },
  { id: 'music', name: 'Music', category: 'entertainment', icon: Music, tags: ['music', 'audio', 'concert', 'song'] },
  { id: 'camera', name: 'Camera / Photo', category: 'entertainment', icon: Camera, tags: ['camera', 'photo', 'hobby'] },

  // Education
  { id: 'books', name: 'Books', category: 'education', icon: BookOpen, tags: ['books', 'study', 'school', 'course'] },
  { id: 'graduation', name: 'Graduation', category: 'education', icon: GraduationCap, tags: ['college', 'degree', 'tuition'] },

  // Pets
  { id: 'cat', name: 'Pet Cat', category: 'pets', icon: Cat, tags: ['cat', 'pet', 'vet', 'kitten'] },
  { id: 'dog', name: 'Pet Dog', category: 'pets', icon: Dog, tags: ['dog', 'pet', 'canine', 'puppy'] },

  // Home
  { id: 'house', name: 'House / Rent', category: 'home', icon: Home, tags: ['house', 'rent', 'mortgage', 'home'] },
  { id: 'sofa', name: 'Furniture / Living', category: 'home', icon: Sofa, tags: ['sofa', 'furniture', 'decor'] },
  { id: 'plant', name: 'Plant / Garden', category: 'home', icon: Sprout, tags: ['plant', 'garden', 'nature'] },

  // Work
  { id: 'laptop', name: 'Laptop / Tech', category: 'work', icon: Laptop, tags: ['laptop', 'computer', 'freelance', 'work'] },
  { id: 'briefcase', name: 'Salary / Office', category: 'work', icon: Briefcase, tags: ['work', 'job', 'salary', 'career'] },

  // Travel
  { id: 'plane', name: 'Flight / Flight', category: 'travel', icon: Plane, tags: ['flight', 'plane', 'airline', 'vacation'] },
  { id: 'palmtree', name: 'Beach / Vacation', category: 'travel', icon: Palmtree, tags: ['beach', 'resort', 'vacation', 'holiday'] },
  { id: 'mountain', name: 'Mountain Hike', category: 'travel', icon: Mountain, tags: ['hike', 'nature', 'adventure'] },

  // Subscriptions
  { id: 'repeat', name: 'Recurring Sub', category: 'subscriptions', icon: Repeat, tags: ['sub', 'recurring', 'autopay'] },
  { id: 'card', name: 'Payment Card', category: 'subscriptions', icon: CreditCard, tags: ['card', 'debit', 'credit'] },
  { id: 'cloud', name: 'Cloud Storage', category: 'subscriptions', icon: Cloud, tags: ['cloud', 'storage', 'saas'] },

  // Wishlist
  { id: 'star', name: 'Wish / Favorite', category: 'wishlist', icon: Star, tags: ['wish', 'star', 'favorite', 'want'] },
  { id: 'sparkles', name: 'Sparkle Item', category: 'wishlist', icon: Sparkles, tags: ['sparkle', 'luxury', 'treat'] },

  // Debt
  { id: 'shield', name: 'Shield Defense', category: 'debt', icon: Shield, tags: ['shield', 'debt', 'payoff', 'protect'] },
  { id: 'coins', name: 'Coins Stack', category: 'debt', icon: Coins, tags: ['coins', 'interest', 'payment'] },

  // Reminder
  { id: 'bell', name: 'Reminder Bell', category: 'reminder', icon: Bell, tags: ['bell', 'alarm', 'notice'] },
  { id: 'clock', name: 'Clock Timer', category: 'reminder', icon: Clock, tags: ['clock', 'time', 'due'] },
  { id: 'calendar', name: 'Calendar Date', category: 'reminder', icon: Calendar, tags: ['calendar', 'date', 'schedule'] },
]

interface MochiIconProps {
  id?: string
  name?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  badgeBg?: string
  badgeColor?: string
  style?: 'plain' | 'rounded-badge' | 'circle' | 'sticker'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

const badgeSizeClasses = {
  sm: 'w-7 h-7 p-1.5',
  md: 'w-10 h-10 p-2.5',
  lg: 'w-12 h-12 p-3',
  xl: 'w-16 h-16 p-4',
}

export function MochiIcon({
  id = 'utensils',
  className,
  size = 'md',
  badgeBg,
  badgeColor,
  style = 'plain',
}: MochiIconProps) {
  const vectorCategoryIds = [
    'utensils', 'shopping_bag', 'house', 'car', 'electric', 'gamepad',
    'heart', 'graduation', 'sofa', 'plane', 'receipt', 'briefcase',
    'laptop', 'piggy_bank', 'gift_bag', 'vault', 'coins', 'wallet'
  ]

  // If a bespoke vector SVG exists for this ID, use it for rich branding
  if (vectorCategoryIds.includes(id)) {
    return <MochiCategoryVectorSVG id={id} size={size} className={className} />
  }

  const iconDef = MOCHI_ICON_LIBRARY.find((item) => item.id === id) || MOCHI_ICON_LIBRARY[0]
  const IconComponent = iconDef.icon

  if (style === 'plain') {
    return <IconComponent className={cn(sizeClasses[size], className)} />
  }

  const bgStyle = badgeBg ? { backgroundColor: badgeBg } : {}
  const textStyle = badgeColor ? { color: badgeColor } : {}

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0 transition-transform active:scale-95',
        style === 'rounded-badge' && 'rounded-2xl bg-mochi-primary/10 text-mochi-primary',
        style === 'circle' && 'rounded-full bg-mochi-surface border border-mochi-border text-mochi-text',
        style === 'sticker' && 'rounded-2xl bg-white shadow-md border-2 border-mochi-primary/20 text-mochi-primary rotate-1',
        badgeSizeClasses[size],
        className
      )}
      style={{ ...bgStyle, ...textStyle }}
    >
      <IconComponent className={sizeClasses[size]} />
    </div>
  )
}

export default MochiIcon
