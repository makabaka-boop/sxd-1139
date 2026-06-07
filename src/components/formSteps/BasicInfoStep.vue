<template>
  <div class="form-step">
    <h3>基本信息</h3>
    <div class="form-grid">
      <div class="form-item">
        <label>姓名 <span class="required">*</span></label>
        <input 
          type="text" 
          v-model="formData.name" 
          placeholder="请输入姓名"
          :class="{ 'input-error': errors.name }"
          @input="validateName"
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>
      <div class="form-item">
        <label>手机号 <span class="required">*</span></label>
        <input 
          type="tel" 
          v-model="formData.phone" 
          placeholder="请输入手机号"
          :class="{ 'input-error': errors.phone }"
          @input="onPhoneChange"
        />
        <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
      </div>
      <div class="form-item">
        <label>邮箱</label>
        <input 
          type="email" 
          v-model="formData.email" 
          placeholder="请输入邮箱"
          :class="{ 'input-error': errors.email }"
          @input="onEmailChange"
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>
      <div class="form-item">
        <label>活动批次 <span class="required">*</span></label>
        <select 
          v-model="formData.activityBatch"
          :class="{ 'input-error': errors.activityBatch }"
          @change="validateActivityBatch"
        >
          <option value="">请选择活动批次</option>
          <option 
            v-for="batch in activityBatches" 
            :key="batch" 
            :value="batch"
          >
            {{ batch }}
          </option>
        </select>
        <span v-if="errors.activityBatch" class="error-text">{{ errors.activityBatch }}</span>
      </div>
      <div class="form-item">
        <label>性别</label>
        <select 
          v-model="formData.gender"
          @change="$emit('update')"
        >
          <option value="">请选择</option>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </div>
      <div class="form-item">
        <label>身份证号</label>
        <input 
          type="text" 
          v-model="formData.idCard" 
          placeholder="请输入身份证号"
          :class="{ 'input-error': errors.idCard }"
          @input="validateIdCard"
        />
        <span v-if="errors.idCard" class="error-text">{{ errors.idCard }}</span>
      </div>
    </div>

    <div v-if="duplicates.length > 0" class="duplicate-warning">
      <div class="warning-header">
        <span class="warning-icon">⚠️</span>
        <span>检测到可能的重复报名</span>
      </div>
      <div class="duplicate-list">
        <div 
          v-for="item in duplicates" 
          :key="item.id" 
          class="duplicate-item"
        >
          <div class="duplicate-info">
            <span class="duplicate-name">{{ item.name }}</span>
            <span class="duplicate-contact">{{ item.phone }} / {{ item.email }}</span>
            <span class="duplicate-batch">{{ item.activityBatch }}</span>
          </div>
          <div class="duplicate-actions">
            <button 
              class="btn-merge" 
              @click="$emit('merge', item)"
            >
              合并旧数据
            </button>
            <button 
              class="btn-view"
              @click="$emit('view', item)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { findDuplicateRegistrations, findDraftsByContact } from '../../db'
import { 
  DEFAULT_ACTIVITY_BATCHES, 
  validatePhone, 
  validateEmail, 
  validateIdCard, 
  validateRequired 
} from '../../utils'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'merge', 'view', 'duplicates-found'])

const activityBatches = DEFAULT_ACTIVITY_BATCHES
const duplicates = ref([])

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  activityBatch: '',
  idCard: ''
})

const validateName = () => {
  const result = validateRequired(props.formData.name, '姓名')
  errors.name = result.valid ? '' : result.message
  emit('update')
  return result.valid
}

const validatePhoneField = () => {
  const result = validatePhone(props.formData.phone)
  errors.phone = result.valid ? '' : result.message
  return result.valid
}

const validateEmailField = () => {
  const result = validateEmail(props.formData.email)
  errors.email = result.valid ? '' : result.message
  return result.valid
}

const validateActivityBatch = () => {
  const result = validateRequired(props.formData.activityBatch, '活动批次')
  errors.activityBatch = result.valid ? '' : result.message
  emit('update')
  return result.valid
}

const validateIdCard = () => {
  const result = validateIdCard(props.formData.idCard)
  errors.idCard = result.valid ? '' : result.message
  emit('update')
  return result.valid
}

const validateAll = () => {
  const v1 = validateName()
  const v2 = validatePhoneField()
  const v3 = validateEmailField()
  const v4 = validateActivityBatch()
  const v5 = validateIdCard()
  return v1 && v2 && v3 && v4 && v5
}

const checkDuplicates = async () => {
  const phone = props.formData.phone?.trim()
  const email = props.formData.email?.trim()
  
  if (!phone && !email) {
    duplicates.value = []
    emit('duplicates-found', [])
    return
  }

  const [regDuplicates, draftDuplicates] = await Promise.all([
    phone || email ? findDuplicateRegistrations(phone, email) : Promise.resolve([]),
    phone || email ? findDraftsByContact(phone, email) : Promise.resolve([])
  ])

  const allDuplicates = [...regDuplicates, ...draftDuplicates]
  const filtered = allDuplicates.filter(d => 
    d.id !== props.formData.id && 
    (d.phone === phone || d.email === email)
  )

  duplicates.value = filtered
  emit('duplicates-found', filtered)
}

const onPhoneChange = () => {
  validatePhoneField()
  emit('update')
  if (props.formData.phone?.length >= 7) {
    checkDuplicates()
  }
}

const onEmailChange = () => {
  validateEmailField()
  emit('update')
  if (props.formData.email?.includes('@')) {
    checkDuplicates()
  }
}

defineExpose({
  validateAll,
  errors
})

watch(() => [props.formData.phone, props.formData.email], () => {
  if (!props.formData.phone && !props.formData.email) {
    duplicates.value = []
  }
})
</script>
