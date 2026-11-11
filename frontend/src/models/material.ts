export interface Material {
  id: number
  courseId: number
  authorId: number
  authorName: string
  title: string
  description?: string
  fileName: string
  status: string
  createdAt: string
  reviewedById?: number
  reviewedByName?: string
  averageRating?: number | null
  ratingCount?: number
  userRating?: number | null
}
