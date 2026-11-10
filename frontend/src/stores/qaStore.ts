import { create } from 'zustand'
import * as signalR from '@microsoft/signalr'
import type { Question, QuestionDetail, Answer, CreateQuestionData } from '../models/qa'
import { useAuthStore } from './authStore'

interface QaState {
  questions: Question[]
  activeQuestion: QuestionDetail | null
  isLoading: boolean
  error: string | null
  hubConnection: signalR.HubConnection | null

  fetchQuestions: (courseId: number) => Promise<void>
  createQuestion: (courseId: number, data: CreateQuestionData) => Promise<Question>
  openQuestionThread: (questionId: number) => Promise<void>
  closeQuestionThread: () => Promise<void>
  submitAnswer: (questionId: number, content: string, parentAnswerId?: number | null) => Promise<void>
  deleteQuestion: (courseId: number, questionId: number) => Promise<void>
  deleteAnswer: (answerId: number) => Promise<void>
}

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().tokens?.accessToken
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const useQaStore = create<QaState>((set, get) => ({
  questions: [],
  activeQuestion: null,
  isLoading: false,
  error: null,
  hubConnection: null,

  fetchQuestions: async (courseId: number) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/questions`, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Napaka pri nalaganju vprašanj')
      const questions = await res.json() as Question[]
      set({ questions, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  createQuestion: async (courseId: number, data: CreateQuestionData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/courses/${courseId}/questions`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri objavi vprašanja' }))
        throw new Error(err.message || 'Napaka pri objavi vprašanja')
      }
      const newQuestion = await res.json() as Question
      set(state => ({ questions: [newQuestion, ...state.questions], isLoading: false }))
      return newQuestion
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
      throw e
    }
  },

  openQuestionThread: async (questionId: number) => {
    set({ isLoading: true, error: null })
    await get().closeQuestionThread()

    try {
      const res = await fetch(`/api/questions/${questionId}`, { headers: getAuthHeader() })
      if (!res.ok) throw new Error('Vprašanje ne obstaja več.')
      const detail = await res.json() as QuestionDetail
      set({ activeQuestion: detail, isLoading: false })

      const token = useAuthStore.getState().tokens?.accessToken
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/qa', {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .build()

      connection.on('ReceiveAnswer', (newAnswer: Answer) => {
        set(state => {
          if (!state.activeQuestion || state.activeQuestion.id !== newAnswer.questionId) return state
          if (state.activeQuestion.answers.some(a => a.id === newAnswer.id)) return state
          return {
            activeQuestion: {
              ...state.activeQuestion,
              answers: [...state.activeQuestion.answers, newAnswer]
            },
            questions: state.questions.map(q =>
              q.id === newAnswer.questionId ? { ...q, answersCount: q.answersCount + 1 } : q
            )
          }
        })
      })

      connection.on('DeleteAnswer', (deletedAnswerId: number) => {
        set(state => {
          if (!state.activeQuestion) return state
          return {
            activeQuestion: {
              ...state.activeQuestion,
              answers: state.activeQuestion.answers.filter(a => a.id !== deletedAnswerId && a.parentAnswerId !== deletedAnswerId)
            }
          }
        })
      })

      await connection.start()
      await connection.invoke('JoinQuestion', questionId)
      set({ hubConnection: connection })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  closeQuestionThread: async () => {
    const conn = get().hubConnection
    const active = get().activeQuestion
    if (conn) {
      if (active) {
        try { await conn.invoke('LeaveQuestion', active.id) } catch { /* ignore */ }
      }
      try { await conn.stop() } catch { /* ignore */ }
    }
    set({ hubConnection: null, activeQuestion: null })
  },

  submitAnswer: async (questionId: number, content: string, parentAnswerId?: number | null) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentAnswerId })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka pri pošiljanju odgovora' }))
        throw new Error(err.message || 'Napaka pri pošiljanju odgovora')
      }
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  },

  deleteQuestion: async (courseId: number, questionId: number) => {
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju vprašanja')
      set(state => ({
        questions: state.questions.filter(q => q.id !== questionId),
        activeQuestion: state.activeQuestion?.id === questionId ? null : state.activeQuestion
      }))
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  },

  deleteAnswer: async (answerId: number) => {
    try {
      const res = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      if (!res.ok) throw new Error('Napaka pri brisanju odgovora')
    } catch (e: any) {
      set({ error: e.message })
      throw e
    }
  }
}))
