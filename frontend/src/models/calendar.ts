export type ObligationType = 'Kolokvij' | 'Izpit' | 'Oddaja'

export interface Obligation {
  id: number
  courseId: number
  courseName?: string | null
  authorId: number
  authorName: string
  title: string
  type: ObligationType
  date: string
  description?: string | null
  createdAt: string
}

export interface CreateObligationData {
  title: string
  type: ObligationType
  date: string
  description?: string | null
}

export interface UpdateObligationData {
  title: string
  type: ObligationType
  date: string
  description?: string | null
}
