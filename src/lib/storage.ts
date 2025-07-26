import { ApiConfig, GeneratedImage, CustomModel } from "@/types"

const STORAGE_KEYS = {
  API_CONFIG: 'ai-drawing-api-config',
  HISTORY: 'ai-drawing-history',
  CUSTOM_MODELS: 'ai-drawing-custom-models'
}

export const storage = {
  // API 配置相关操作
  getApiConfig: (): ApiConfig | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG)
    return data ? JSON.parse(data) : null
  },

  setApiConfig: (key: string, baseUrl: string): void => {
    if (typeof window === 'undefined') return
    const apiConfig: ApiConfig = {
      key,
      baseUrl,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(apiConfig))
  },

  removeApiConfig: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.API_CONFIG)
  },

  // 历史记录相关操作
  getHistory: (): GeneratedImage[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return data ? JSON.parse(data) : []
  },

  addToHistory: (image: GeneratedImage): void => {
    if (typeof window === 'undefined') return
    const history = storage.getHistory()
    history.unshift(image)
    
    // 限制历史记录数量为50条，防止存储空间溢出
    const MAX_HISTORY_COUNT = 50
    if (history.length > MAX_HISTORY_COUNT) {
      history.splice(MAX_HISTORY_COUNT)
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
    } catch (error) {
      // 如果存储失败，尝试清理更多历史记录
      console.warn('存储空间不足，正在清理历史记录...')
      try {
        // 删除一半的历史记录
        const reducedHistory = history.slice(0, Math.floor(history.length / 2))
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(reducedHistory))
      } catch (secondError) {
        // 如果还是失败，清空所有历史记录
        console.warn('存储空间严重不足，清空所有历史记录')
        localStorage.removeItem(STORAGE_KEYS.HISTORY)
      }
    }
  },

  clearHistory: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
  },

  removeFromHistory: (id: string): void => {
    if (typeof window === 'undefined') return
    const history = storage.getHistory()
    const filtered = history.filter(img => img.id !== id)
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
    } catch (error) {
      console.warn('存储空间不足，无法更新历史记录')
    }
  },

  // 自定义模型相关操作
  getCustomModels: (): CustomModel[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MODELS)
    return data ? JSON.parse(data) : []
  },

  addCustomModel: (model: CustomModel): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    models.push(model)
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models))
    } catch (error) {
      console.warn('存储空间不足，无法添加自定义模型')
    }
  },

  removeCustomModel: (id: string): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    const filtered = models.filter(model => model.id !== id)
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(filtered))
    } catch (error) {
      console.warn('存储空间不足，无法删除自定义模型')
    }
  },

  updateCustomModel: (id: string, updated: Partial<CustomModel>): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    const index = models.findIndex(model => model.id === id)
    if (index !== -1) {
      models[index] = { ...models[index], ...updated }
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models))
      } catch (error) {
        console.warn('存储空间不足，无法更新自定义模型')
      }
    }
  }
} 