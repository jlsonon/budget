import { create } from 'zustand'
import { MochiCircle, TravelStamp, CircleMember, CircleContribution, WishlistItem, CirclePoll } from '../types'
import { saveDocToCloud } from '../services/cloudSync'
import { FIRESTORE_COLLECTIONS } from '../services/firestoreCollections'

export interface CircleState {
  circles: MochiCircle[]
  passportStamps: TravelStamp[]
  setCircles: (circles: MochiCircle[]) => void
  addCircle: (circle: MochiCircle) => Promise<void>
  contributeToCircle: (circleId: string, amount: number, note?: string) => Promise<void>
  toggleCircleWishlist: (circleId: string, itemId: string) => Promise<void>
  voteCirclePoll: (circleId: string, pollId: string, optionId: string) => Promise<void>
  addCircleWishlistItem: (circleId: string, title: string, cost?: number) => Promise<void>
  addCirclePoll: (circleId: string, question: string, options: string[]) => Promise<void>
  addCircleBillSplit: (circleId: string, split: any) => Promise<void>
  settleCircleBillSplit: (circleId: string, splitId: string, memberId: string) => Promise<void>
}

export const useCircleStore = create<CircleState>()((set, get) => ({
  circles: [],
  passportStamps: [],
  setCircles: (circles: MochiCircle[]) => set({ circles }),
  addCircle: async (circle: MochiCircle) => {
    set((s: CircleState) => ({ circles: [circle, ...s.circles] }))
    await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...circle, userId: circle.userId || 'anon' })
  },
  contributeToCircle: async (circleId: string, amount: number, note?: string) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        const newCurrent = c.currentAmount + amount
        const newStatus = newCurrent >= c.targetAmount ? ('completed' as const) : c.status
        const updatedMembers = c.members.map((m: CircleMember) =>
          m.id === 'm1' ? { ...m, totalContributed: m.totalContributed + amount } : m
        )
        const newContrib: CircleContribution = {
          id: crypto.randomUUID(),
          memberId: 'm1',
          memberName: 'You',
          mascot: 'cat' as const,
          amount,
          date: new Date().toISOString().split('T')[0],
          note,
        }

        return {
          ...c,
          currentAmount: newCurrent,
          status: newStatus,
          completedAt: newCurrent >= c.targetAmount ? new Date().toISOString().split('T')[0] : c.completedAt,
          members: updatedMembers,
          contributions: [newContrib, ...c.contributions],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  toggleCircleWishlist: async (circleId: string, itemId: string) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          wishlist: c.wishlist.map((item: WishlistItem) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  voteCirclePoll: async (circleId: string, pollId: string, optionId: string) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          polls: c.polls.map((poll: CirclePoll) => {
            if (poll.id !== pollId) return poll
            return {
              ...poll,
              options: poll.options.map((opt: any) => {
                const hasVoted = opt.votes.includes('m1')
                if (opt.id === optionId) {
                  return { ...opt, votes: hasVoted ? opt.votes : [...opt.votes, 'm1'] }
                } else {
                  return { ...opt, votes: opt.votes.filter((v: string) => v !== 'm1') }
                }
              }),
            }
          }),
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  addCircleWishlistItem: async (circleId: string, title: string, cost?: number) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          wishlist: [...c.wishlist, { id: crypto.randomUUID(), title, estimatedCost: cost, completed: false }],
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  addCirclePoll: async (circleId: string, question: string, options: string[]) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        return {
          ...c,
          polls: [
            ...c.polls,
            {
              id: crypto.randomUUID(),
              question,
              active: true,
              options: options.map((opt: any, i: number) => ({ id: `opt_${i}`, text: opt, votes: [] })),
            },
          ],
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  addCircleBillSplit: async (circleId: string, split: any) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        const existingSplits = c.splits || []
        return {
          ...c,
          splits: [split, ...existingSplits],
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
  settleCircleBillSplit: async (circleId: string, splitId: string, memberId: string) => {
    set((s: CircleState) => ({
      circles: s.circles.map((c: MochiCircle) => {
        if (c.id !== circleId) return c
        const existingSplits = c.splits || []
        const updatedSplits = existingSplits.map((sp: any) => {
          if (sp.id !== splitId) return sp
          const settled = sp.settledMemberIds || []
          if (settled.includes(memberId)) return sp
          return { ...sp, settledMemberIds: [...settled, memberId] }
        })
        return { ...c, splits: updatedSplits, updatedAt: new Date().toISOString() }
      }),
    }))
    const updated = get().circles.find((c: MochiCircle) => c.id === circleId)
    if (updated) await saveDocToCloud(FIRESTORE_COLLECTIONS.CIRCLES, { ...updated, userId: updated.userId || 'anon' })
  },
}))
