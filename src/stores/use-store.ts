// store/useStore.ts
import { create } from 'zustand'

interface ChatHistoryItem {
  id: string
  title: string
  messages: Array<any>
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  name?: string
}

interface State {
  isLoading: boolean
  chatHistories: ChatHistoryItem[]
  currentUser: User | null
  token: string | null
  setIsLoading: (loading: boolean) => void
  setChatHistories: (histories: ChatHistoryItem[]) => void
  setCurrentUser: (user: User | null) => void
  setToken: (token: string | null) => void
  loadChatHistories: () => Promise<void>
  saveChatHistory: (title: string, messages: any[]) => Promise<ChatHistoryItem | null>
  updateChatHistory: (id: string, title?: string, messages?: any[]) => Promise<boolean>
  deleteChatHistory: (id: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
}

const API_BASE = '/api'

export const useStore = create<State>((set, get) => ({
  isLoading: false,
  chatHistories: [],
  currentUser: null,
  token: null,

  setIsLoading: (loading) => set(() => ({ isLoading: loading })),
  setChatHistories: (histories) => set(() => ({ chatHistories: histories })),
  setCurrentUser: (user) => set(() => ({ currentUser: user })),
  setToken: (token) => set(() => ({ token })),

  loadChatHistories: async () => {
    const { token } = get()
    if (!token) return

    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/chat-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        set({ chatHistories: data.chatHistories })
      }
    } catch (error) {
      console.error('Failed to load chat histories:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  saveChatHistory: async (title: string, messages: any[]) => {
    const { token } = get()
    if (!token) return null

    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/chat-history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, messages })
      })

      if (response.ok) {
        const data = await response.json()
        const newHistory = data.chatHistory
        set(state => ({
          chatHistories: [newHistory, ...state.chatHistories]
        }))
        return newHistory
      }
    } catch (error) {
      console.error('Failed to save chat history:', error)
    } finally {
      set({ isLoading: false })
    }
    return null
  },

  updateChatHistory: async (id: string, title?: string, messages?: any[]) => {
    const { token } = get()
    if (!token) return false

    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/chat-history/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, messages })
      })

      if (response.ok) {
        const data = await response.json()
        set(state => ({
          chatHistories: state.chatHistories.map(h =>
            h.id === id ? data.chatHistory : h
          )
        }))
        return true
      }
    } catch (error) {
      console.error('Failed to update chat history:', error)
    } finally {
      set({ isLoading: false })
    }
    return false
  },

  deleteChatHistory: async (id: string) => {
    const { token } = get()
    if (!token) return false

    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/chat-history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        set(state => ({
          chatHistories: state.chatHistories.filter(h => h.id !== id)
        }))
        return true
      }
    } catch (error) {
      console.error('Failed to delete chat history:', error)
    } finally {
      set({ isLoading: false })
    }
    return false
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        set({
          currentUser: data.user,
          token: data.token
        })

        setTimeout(() => {
          get().loadChatHistories()
        }, 100)
        return true
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      set({ isLoading: false })
    }
    return false
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true })
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      if (response.ok) {
        console.log('Registration successful')
        // const data = await response.json()
        // set({
        //   currentUser: data.user,
        //   token: data.token
        // })
        return true
      }
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      set({ isLoading: false })
    }
    return false
  },

  logout: () => {
    // => Clear user and token with apis
    set({
      currentUser: null,
      token: null,
      chatHistories: []
    })
  }
}))
