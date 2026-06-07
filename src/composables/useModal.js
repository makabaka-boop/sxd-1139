import { ref } from 'vue'

const modalState = ref({
  visible: false,
  title: '',
  message: '',
  type: 'info',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: false,
  closeOnOverlay: true,
  onConfirm: null,
  onCancel: null
})

export function useModal() {
  const showModal = (options) => {
    modalState.value = {
      visible: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      showCancel: options.showCancel || false,
      closeOnOverlay: options.closeOnOverlay !== false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    }
  }

  const closeModal = () => {
    modalState.value.visible = false
  }

  const alert = (message, options = {}) => {
    return new Promise((resolve) => {
      showModal({
        message,
        type: options.type || 'info',
        title: options.title || '提示',
        confirmText: options.confirmText || '确定',
        showCancel: false,
        onConfirm: () => resolve(true)
      })
    })
  }

  const success = (message, options = {}) => {
    return alert(message, { ...options, type: 'success', title: options.title || '成功' })
  }

  const error = (message, options = {}) => {
    return alert(message, { ...options, type: 'error', title: options.title || '错误' })
  }

  const warning = (message, options = {}) => {
    return alert(message, { ...options, type: 'warning', title: options.title || '警告' })
  }

  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      showModal({
        message,
        type: options.type || 'confirm',
        title: options.title || '确认',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        showCancel: true,
        closeOnOverlay: false,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })
  }

  const handleConfirm = () => {
    if (modalState.value.onConfirm) {
      modalState.value.onConfirm()
    }
    closeModal()
  }

  const handleCancel = () => {
    if (modalState.value.onCancel) {
      modalState.value.onCancel()
    }
    closeModal()
  }

  return {
    modalState,
    showModal,
    closeModal,
    alert,
    success,
    error,
    warning,
    confirm,
    handleConfirm,
    handleCancel
  }
}
