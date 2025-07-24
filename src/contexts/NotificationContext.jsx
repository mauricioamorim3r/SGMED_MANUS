import React, { createContext, useContext, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
})

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = uuidv4()
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto remove after 5 seconds for success/info, 10 seconds for warnings, never for errors
    if (notification.type !== 'error') {
      const timeout = notification.type === 'warning' ? 10000 : 5000
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, timeout)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook para notificações específicas do SGM
export const useSGMNotifications = () => {
  const { addNotification } = useNotifications()

  const notifyEquipmentAlert = (equipment, message) => {
    addNotification({
      type: 'error',
      title: 'Alerta de Equipamento',
      message: `${equipment}: ${message}`,
      category: 'equipment',
      icon: '🚨'
    })
  }

  const notifyCalibrationDue = (count, days) => {
    addNotification({
      type: 'warning',
      title: 'Calibração Vencendo',
      message: `${count} equipamento(s) vencem em ${days} dias`,
      category: 'calibration',
      icon: '🗓️'
    })
  }

  const notifyStockLow = (item, currentStock, minStock) => {
    addNotification({
      type: 'warning',
      title: 'Estoque Baixo',
      message: `${item}: ${currentStock}/${minStock} unidades`,
      category: 'stock',
      icon: '📦'
    })
  }

  const notifyReportReady = (reportName) => {
    addNotification({
      type: 'success',
      title: 'Relatório Pronto',
      message: `${reportName} foi gerado com sucesso`,
      category: 'report',
      icon: '📊'
    })
  }

  const notifyAnalysisComplete = (analysisId) => {
    addNotification({
      type: 'info',
      title: 'Análise Concluída',
      message: `Análise ${analysisId} foi finalizada`,
      category: 'analysis',
      icon: '🧪'
    })
  }

  const notifyMOCApproved = (mocNumber) => {
    addNotification({
      type: 'success',
      title: 'MOC Aprovada',
      message: `Solicitação ${mocNumber} foi aprovada`,
      category: 'moc',
      icon: '✅'
    })
  }

  return {
    notifyEquipmentAlert,
    notifyCalibrationDue,
    notifyStockLow,
    notifyReportReady,
    notifyAnalysisComplete,
    notifyMOCApproved,
  }
}