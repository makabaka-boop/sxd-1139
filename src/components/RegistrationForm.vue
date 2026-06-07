<template>
  <div class="registration-form">
    <div class="form-header">
      <h2>{{ isEditing ? '编辑报名信息' : '新增报名' }}</h2>
      <div class="draft-status" v-if="lastSavedAt">
        <span class="save-indicator">✓</span>
        草稿已保存于 {{ formatDate(lastSavedAt) }}
      </div>
    </div>

    <div class="step-nav">
      <div 
        v-for="(step, index) in steps" 
        :key="step.key"
        :class="['step-item', { active: currentStep === index, completed: currentStep > index }]"
        @click="goToStep(index)"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <div class="form-body">
      <component 
        :is="currentStepComponent" 
        :form-data="formData"
        @update="onFormUpdate"
        @merge="handleMerge"
        @view="handleView"
        @duplicates-found="onDuplicatesFound"
      />
    </div>

    <div class="form-footer">
      <button 
        class="btn btn-secondary"
        @click="prevStep"
        :disabled="currentStep === 0"
      >
        上一步
      </button>
      <div class="footer-actions">
        <button 
          class="btn btn-outline"
          @click="resetForm"
        >
          重置
        </button>
        <button 
          class="btn btn-secondary"
          @click="saveAsDraft"
        >
          保存草稿
        </button>
        <button 
          v-if="currentStep < steps.length - 1"
          class="btn btn-primary"
          @click="nextStep"
        >
          下一步
        </button>
        <button 
          v-else
          class="btn btn-success"
          @click="submitForm"
          :disabled="!isFormValid"
        >
          确认提交
        </button>
      </div>
    </div>

    <div v-if="showMergeDialog" class="modal-overlay" @click.self="showMergeDialog = false">
      <div class="modal">
        <h3>检测到重复数据</h3>
        <p>找到匹配的旧数据，是否合并？合并会保留旧备注信息。</p>
        <div class="merge-preview">
          <div class="merge-col">
            <h4>当前输入</h4>
            <pre>{{ JSON.stringify(mergeNewData, null, 2) }}</pre>
          </div>
          <div class="merge-col">
            <h4>旧数据</h4>
            <pre>{{ JSON.stringify(mergeOldData, null, 2) }}</pre>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showMergeDialog = false">取消</button>
          <button class="btn btn-primary" @click="confirmMerge">确认合并</button>
          <button class="btn btn-outline" @click="skipMerge">忽略，作为新记录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BasicInfoStep from './formSteps/BasicInfoStep.vue'
import PreferenceStep from './formSteps/PreferenceStep.vue'
import FeeStep from './formSteps/FeeStep.vue'
import RemarkStep from './formSteps/RemarkStep.vue'
import { saveDraft, addRegistration, updateRegistration, deleteDraft, mergeRegistrationData } from '../db'
import { debounce, formatDate } from '../utils'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  draftId: {
    type: [Number, String],
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submitted', 'cancelled', 'saved'])

const steps = [
  { key: 'basic', label: '基本信息', component: BasicInfoStep },
  { key: 'preference', label: '分组偏好', component: PreferenceStep },
  { key: 'fee', label: '费用信息', component: FeeStep },
  { key: 'remark', label: '备注确认', component: RemarkStep }
]

const currentStep = ref(0)
const lastSavedAt = ref(null)
const showMergeDialog = ref(false)
const mergeOldData = ref(null)
const mergeNewData = ref(null)
const foundDuplicates = ref([])

const createEmptyForm = () => ({
  name: '',
  phone: '',
  email: '',
  activityBatch: '',
  gender: '',
  idCard: '',
  groupPreference: '',
  preferredRoommate: '',
  dietPreference: '',
  transportation: '',
  specialRequirements: '',
  feeStatus: '',
  totalFee: null,
  paidAmount: null,
  paymentMethod: '',
  paymentRemark: '',
  reviewStatus: 'pending',
  remarks: '',
  contactHistory: []
})

const formData = ref(createEmptyForm())

const currentStepComponent = computed(() => steps[currentStep.value].component)

const isFormValid = computed(() => {
  return formData.value.name && 
         formData.value.phone && 
         formData.value.activityBatch
})

const goToStep = (index) => {
  currentStep.value = index
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const onFormUpdate = () => {
  autoSaveDraft()
}

const onDuplicatesFound = (duplicates) => {
  foundDuplicates.value = duplicates
}

const autoSaveDraft = debounce(async () => {
  const data = {
    ...formData.value,
    id: props.draftId || formData.value.id
  }
  const saved = await saveDraft(data)
  if (saved) {
    lastSavedAt.value = new Date().toISOString()
    if (!formData.value.id) {
      formData.value.id = saved.id
    }
  }
}, 1000)

const saveAsDraft = async () => {
  const data = {
    ...formData.value,
    id: props.draftId || formData.value.id
  }
  const saved = await saveDraft(data)
  if (saved) {
    lastSavedAt.value = new Date().toISOString()
    if (!formData.value.id) {
      formData.value.id = saved.id
    }
    alert('草稿已保存')
    emit('saved', saved)
  }
}

const handleMerge = (oldData) => {
  mergeOldData.value = oldData
  mergeNewData.value = { ...formData.value }
  showMergeDialog.value = true
}

const handleView = (item) => {
  console.log('View item:', item)
  alert(`查看详情：\n${JSON.stringify(item, null, 2)}`)
}

const confirmMerge = () => {
  if (mergeOldData.value) {
    const merged = mergeRegistrationData(mergeOldData.value, formData.value)
    Object.assign(formData.value, merged)
  }
  showMergeDialog.value = false
  mergeOldData.value = null
  mergeNewData.value = null
}

const skipMerge = () => {
  showMergeDialog.value = false
  mergeOldData.value = null
  mergeNewData.value = null
}

const resetForm = () => {
  if (confirm('确定要重置表单吗？未保存的内容将丢失。')) {
    formData.value = createEmptyForm()
    lastSavedAt.value = null
    currentStep.value = 0
  }
}

const submitForm = async () => {
  if (!isFormValid.value) {
    alert('请填写必填项：姓名、手机号、活动批次')
    return
  }

  if (foundDuplicates.value.length > 0 && !showMergeDialog.value) {
    if (!confirm('检测到可能的重复报名，确定仍要提交吗？')) {
      return
    }
  }

  try {
    const submitData = { ...formData.value }
    delete submitData.id

    if (props.isEditing && props.initialData) {
      await updateRegistration(props.initialData.id, submitData)
      if (formData.value.id) {
        await deleteDraft(formData.value.id)
      }
    } else {
      await addRegistration(submitData)
      if (formData.value.id) {
        await deleteDraft(formData.value.id)
      }
    }

    alert('提交成功！')
    emit('submitted')
    formData.value = createEmptyForm()
    currentStep.value = 0
    lastSavedAt.value = null
  } catch (error) {
    console.error('Submit error:', error)
    alert('提交失败：' + error.message)
  }
}

onMounted(() => {
  if (props.initialData) {
    formData.value = { ...createEmptyForm(), ...props.initialData }
  } else if (props.draftId) {
    formData.value.id = props.draftId
  }
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = { ...createEmptyForm(), ...newVal }
    currentStep.value = 0
  }
})
</script>
