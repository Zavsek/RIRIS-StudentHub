export interface Question {
  id: number
  courseId: number
  materialId?: number | null
  materialTitle?: string | null
  authorId: number
  authorName: string
  title: string
  content: string
  answersCount: number
  createdAt: string
}

export interface Answer {
  id: number
  questionId: number
  parentAnswerId?: number | null
  authorId: number
  authorName: string
  content: string
  createdAt: string
}

export interface QuestionDetail {
  id: number
  courseId: number
  materialId?: number | null
  materialTitle?: string | null
  authorId: number
  authorName: string
  title: string
  content: string
  createdAt: string
  answers: Answer[]
}

export interface CreateQuestionData {
  title: string
  content: string
  materialId?: number | null
}
