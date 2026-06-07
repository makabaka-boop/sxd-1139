<template>
  <div class="app">
    <header class="app-header">
      <h1>活动报名管理系统</h1>
      <nav class="app-nav">
        <button 
          :class="['nav-btn', { active: currentView === 'list' }]"
          @click="currentView = 'list'"
        >
          报名列表
        </button>
        <button 
          :class="['nav-btn', { active: currentView === 'form' }]"
          @click="openForm()"
        >
          {{ isEditing ? '编辑报名' : '新增报名' }}
        </button>
        <button 
          :class="['nav-btn', { active: currentView === 'drafts' }]"
          @click="currentView = 'drafts'"
        >
          草稿箱
          <span v-if="drafts.length > 0" class="nav-badge">{{ drafts.length }}</span>
        </button>
      </nav>
    </header>

    <main class="app-main">
      <div v-if="currentView === 'list'" class="view-container">
        <RegistrationList 
          :registrations="registrations"
          @add="openForm()"
          @edit="openFormForEdit"
          @refresh="loadData"
        />
      </div>

      <div v-if="currentView === 'form'" class="view-container">
        <div class="form-container">
          <button class="btn-back" @click="backToList">
            ← 返回列表
          </button>
          <RegistrationForm 
            :initial-data="editingData"
            :is-editing="isEditing"
            @submitted="onFormSubmitted"
            @saved="onDraftSaved"
          />
        </div>
      </div>

      <div v-if="currentView === 'drafts'" class="view-container">
        <div class="drafts-container">
          <button class="btn-back" @click="backToList">
            ← 返回列表
          </button>
          <DraftList 
            :drafts="drafts"
            @restore="restoreDraft"
            @refresh="loadDrafts"
          />
        </div>
      </div>
    </main>

    <ToastModal 
      :visible="modalState.visible"
      :title="modalState.title"
      :message="modalState.message"
      :type="modalState.type"
      :confirm-text="modalState.confirmText"
      :cancel-text="modalState.cancelText"
      :show-cancel="modalState.showCancel"
      :close-on-overlay="modalState.closeOnOverlay"
      @update:visible="val => modalState.visible = val"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RegistrationList from './components/RegistrationList.vue'
import RegistrationForm from './components/RegistrationForm.vue'
import DraftList from './components/DraftList.vue'
import ToastModal from './components/ToastModal.vue'
import { getAllRegistrations, getAllDrafts, initDB } from './db'
import { useModal } from './composables/useModal'

const { modalState, handleConfirm, handleCancel } = useModal()

const currentView = ref('list')
const registrations = ref([])
const drafts = ref([])
const editingData = ref(null)
const isEditing = ref(false)

const loadData = async () => {
  await initDB()
  registrations.value = await getAllRegistrations()
  drafts.value = await getAllDrafts()
}

const loadDrafts = async () => {
  drafts.value = await getAllDrafts()
}

const openForm = () => {
  editingData.value = null
  isEditing.value = false
  currentView.value = 'form'
}

const openFormForEdit = (item) => {
  editingData.value = { ...item }
  isEditing.value = true
  currentView.value = 'form'
}

const backToList = () => {
  currentView.value = 'list'
  editingData.value = null
  isEditing.value = false
}

const onFormSubmitted = async () => {
  await loadData()
  backToList()
}

const onDraftSaved = async () => {
  await loadDrafts()
}

const restoreDraft = (draft) => {
  editingData.value = { ...draft }
  isEditing.value = false
  currentView.value = 'form'
}

onMounted(() => {
  loadData()
})
</script>
