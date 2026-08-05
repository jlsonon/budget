import React, { useState, useMemo } from 'react'
import { Search, Upload, Check } from 'lucide-react'
import Dialog from './Dialog'
import MochiIcon, { MOCHI_ICON_LIBRARY, type IconCategory } from './MochiIcons'
import { cn } from '@/lib/utils'

interface IconPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIconId?: string
  onSelectIcon: (iconId: string, color?: string, style?: 'plain' | 'rounded-badge' | 'circle' | 'sticker') => void
}

const categories: { id: IconCategory | 'all'; name: string }[] = [
  { id: 'all', name: 'All Icons' },
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transport' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'bills', name: 'Bills' },
  { id: 'savings', name: 'Savings' },
  { id: 'medical', name: 'Medical' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'education', name: 'Education' },
  { id: 'pets', name: 'Pets' },
  { id: 'home', name: 'Home' },
  { id: 'work', name: 'Work' },
  { id: 'travel', name: 'Travel' },
  { id: 'subscriptions', name: 'Subscriptions' },
  { id: 'wishlist', name: 'Wishlist' },
  { id: 'debt', name: 'Debt' },
  { id: 'reminder', name: 'Reminders' },
]

const colorOptions = [
  '#F97316', '#3B82F6', '#A855F7', '#EF4444', '#10B981',
  '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#6366F1',
]

const styles = [
  { id: 'plain', name: 'Clean' },
  { id: 'rounded-badge', name: 'Soft Badge' },
  { id: 'circle', name: 'Circle' },
  { id: 'sticker', name: 'Sticker' },
] as const

export function IconPickerModal({ open, onOpenChange, selectedIconId = 'utensils', onSelectIcon }: IconPickerModalProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<IconCategory | 'all'>('all')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [selectedStyle, setSelectedStyle] = useState<'plain' | 'rounded-badge' | 'circle' | 'sticker'>('rounded-badge')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [uploadedSvg, setUploadedSvg] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const filteredIcons = useMemo(() => {
    return MOCHI_ICON_LIBRARY.filter((icon) => {
      const matchesCategory = activeCategory === 'all' || icon.category === activeCategory
      const matchesSearch =
        search === '' ||
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('svg')) {
      setUploadError('Please select a valid SVG file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      // Simple SVG sanitization check (reject script tags)
      if (content.includes('<script') || content.includes('javascript:')) {
        setUploadError('Security check failed: SVG contains unsafe scripts.')
        return
      }
      setUploadedSvg(content)
      setUploadError(null)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Icon Customizer & Picker" size="lg">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-mochi-border">
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'library'
                ? 'border-mochi-primary text-mochi-primary'
                : 'border-transparent text-mochi-text-muted hover:text-mochi-text'
            )}
          >
            Icon Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'upload'
                ? 'border-mochi-primary text-mochi-primary'
                : 'border-transparent text-mochi-text-muted hover:text-mochi-text'
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            Custom SVG Upload
          </button>
        </div>

        {activeTab === 'library' && (
          <>
            {/* Search & Style Controls */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mochi-text-muted" />
                <input
                  type="text"
                  placeholder="Search icons (e.g. food, car, coffee, sub)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mochi-input pl-10"
                />
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <span className="text-xs text-mochi-text-muted font-medium flex-shrink-0">Color:</span>
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-6 h-6 rounded-full flex-shrink-0 transition-transform flex items-center justify-center',
                      selectedColor === color && 'ring-2 ring-mochi-primary ring-offset-2 scale-110'
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>

              {/* Style Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-mochi-text-muted font-medium flex-shrink-0">Badge Style:</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                        selectedStyle === s.id
                          ? 'bg-mochi-primary/10 border-mochi-primary text-mochi-primary'
                          : 'bg-mochi-surface border-mochi-border text-mochi-text-secondary'
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                      activeCategory === cat.id
                        ? 'bg-gradient-mochi text-white shadow-sm'
                        : 'bg-mochi-surface border border-mochi-border text-mochi-text-secondary hover:border-mochi-primary/30'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1 scrollbar-hide">
              {filteredIcons.map((icon) => {
                const isSelected = selectedIconId === icon.id
                return (
                  <button
                    key={icon.id}
                    onClick={() => {
                      onSelectIcon(icon.id, selectedColor, selectedStyle)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105',
                      isSelected
                        ? 'border-mochi-primary bg-mochi-primary/10 shadow-md'
                        : 'border-mochi-border bg-mochi-surface hover:border-mochi-primary/40'
                    )}
                  >
                    <MochiIcon
                      id={icon.id}
                      size="md"
                      style={selectedStyle}
                      badgeBg={selectedColor + '20'}
                      badgeColor={selectedColor}
                    />
                    <span className="text-[10px] text-mochi-text-secondary text-center line-clamp-1 font-medium">
                      {icon.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Custom SVG Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4 py-4 text-center">
            <div className="border-2 border-dashed border-mochi-border rounded-2xl p-8 flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-mochi-primary" />
              <div>
                <p className="text-sm font-semibold text-mochi-text">Upload Vector SVG File</p>
                <p className="text-xs text-mochi-text-muted mt-1">
                  Upload your handcrafted SVG icon. Maximum size 50KB.
                </p>
              </div>
              <input
                type="file"
                accept=".svg"
                onChange={handleFileUpload}
                className="hidden"
                id="svg-upload-input"
              />
              <label htmlFor="svg-upload-input" className="mochi-btn-primary text-xs cursor-pointer">
                Choose SVG File
              </label>
            </div>

            {uploadError && (
              <p className="text-xs text-mochi-error">{uploadError}</p>
            )}

            {uploadedSvg && (
              <div className="mochi-card flex flex-col items-center gap-3 p-4">
                <p className="text-xs text-mochi-text-muted font-medium">SVG Preview:</p>
                <div
                  className="w-12 h-12 flex items-center justify-center p-2 rounded-2xl bg-mochi-primary/10 text-mochi-primary"
                  dangerouslySetInnerHTML={{ __html: uploadedSvg }}
                />
                <button
                  onClick={() => {
                    onSelectIcon('custom_svg', selectedColor, selectedStyle)
                    onOpenChange(false)
                  }}
                  className="mochi-btn-primary text-xs"
                >
                  Use Custom SVG Icon
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default IconPickerModal
