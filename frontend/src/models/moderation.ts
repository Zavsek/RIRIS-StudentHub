export type MaterialStatus = 'Cakanje' | 'Priporoceno' | 'Nepriporoceno'

export interface ModeratorStatus {
  isModerator: boolean
}

export interface ModerationCourse {
  id: number
  name: string
  programName?: string
  pendingMaterialsCount: number
  totalMaterialsCount: number
}

export interface ModeratorUser {
  userId: number
  name: string
  email: string
  assignedAt: string
}
