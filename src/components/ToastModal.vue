<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="toast-modal-overlay" @click.self="handleOverlayClick">
        <div class="toast-modal" :class="[type, { 'modal-confirm': showCancel }]">
          <div class="toast-modal-icon">
            <span v-if="type === 'success'">✓</span>
            <span v-else-if="type === 'error'">✕</span>
            <span v-else-if="type === 'warning'">!</span>
            <span v-else-if="type === 'confirm'">?</span>
            <span v-else>i</span>
          </div>
          <div class="toast-modal-content">
            <h3 v-if="title" class="toast-modal-title">{{ title }}</h3>
            <p class="toast-modal-message">{{ message }}</p>
          </div>
          <div class="toast-modal-actions">
            <button v-if="showCancel" class="btn btn-secondary" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button class="btn btn-primary" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('update:visible', false)
  }
}
</script>

<style scoped>
.toast-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.toast-modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  text-align: center;
  animation: modalZoomIn 0.2s ease-out;
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.toast-modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
  font-weight: bold;
}

.toast-modal.success .toast-modal-icon {
  background: #f6ffed;
  color: #52c41a;
}

.toast-modal.error .toast-modal-icon {
  background: #fff1f0;
  color: #ff4d4f;
}

.toast-modal.warning .toast-modal-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.toast-modal.info .toast-modal-icon {
  background: #e6f4ff;
  color: #1677ff;
}

.toast-modal.confirm .toast-modal-icon {
  background: #e6f4ff;
  color: #1677ff;
}

.toast-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.toast-modal-message {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  word-break: break-all;
}

.toast-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.toast-modal-actions .btn {
  min-width: 100px;
  justify-content: center;
}
</style>
