import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  
  let idCounter = 0

  const addNotification = (message, type = 'info', duration = 3000) => {
    const notification = {
      id: ++idCounter,
      message,
      type, // success, error, warning, info
      timestamp: Date.now()
    }

    notifications.value.push(notification)

    // Auto-remove après duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, duration)
    }

    return notification.id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  }
})
