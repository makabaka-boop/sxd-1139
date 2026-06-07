<template>
  <div class="form-step">
    <h3>备注与确认</h3>
    
    <div class="form-section">
      <h4>复核状态</h4>
      <div class="review-status-selector">
        <label 
          v-for="opt in reviewOptions" 
          :key="opt.value"
          :class="['status-option', { active: formData.reviewStatus === opt.value }]"
        >
          <input 
            type="radio" 
            :value="opt.value" 
            v-model="formData.reviewStatus"
            @change="$emit('update')"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="form-section">
      <h4>联系记录</h4>
      <div class="contact-history">
        <div 
          v-for="(record, index) in contactList" 
          :key="index"
          class="contact-record"
        >
          <div class="record-header">
            <span class="record-time">{{ formatDate(record.time) }}</span>
            <span class="record-person">{{ record.person || '未录入' }}</span>
            <button 
              class="btn-delete-record"
              @click="removeContactRecord(index)"
            >
              删除
            </button>
          </div>
          <div class="record-content">{{ record.content }}</div>
        </div>
        <div v-if="contactList.length === 0" class="empty-hint">
          暂无联系记录
        </div>
      </div>
      
      <div class="add-contact-form">
        <div class="form-item">
          <label>联系人</label>
          <input 
            type="text" 
            v-model="newContact.person" 
            placeholder="录入人员姓名"
          />
        </div>
        <div class="form-item full-width">
          <label>联系内容</label>
          <textarea 
            v-model="newContact.content" 
            placeholder="请输入联系内容..."
            rows="2"
          ></textarea>
        </div>
        <button 
          class="btn-add-contact"
          @click="addContactRecord"
          :disabled="!newContact.content.trim()"
        >
          添加联系记录
        </button>
      </div>
    </div>

    <div class="form-section">
      <h4>备注信息</h4>
      <textarea 
        v-model="formData.remarks" 
        placeholder="请输入备注信息，合并时旧备注会被保留..."
        rows="5"
        @input="$emit('update')"
      ></textarea>
    </div>

    <div class="form-section summary-section">
      <h4>信息确认</h4>
      <div class="summary-grid">
        <div class="summary-row">
          <span class="label">姓名：</span>
          <span class="value">{{ formData.name || '-' }}</span>
        </div>
        <div class="summary-row">
          <span class="label">手机号：</span>
          <span class="value">{{ formData.phone || '-' }}</span>
        </div>
        <div class="summary-row">
          <span class="label">活动批次：</span>
          <span class="value">{{ formData.activityBatch || '-' }}</span>
        </div>
        <div class="summary-row">
          <span class="label">分组偏好：</span>
          <span class="value">{{ getGroupLabel(formData.groupPreference) }}</span>
        </div>
        <div class="summary-row">
          <span class="label">费用状态：</span>
          <span class="value">{{ getFeeLabel(formData.feeStatus) }}</span>
        </div>
        <div class="summary-row">
          <span class="label">复核状态：</span>
          <span class="value">{{ getReviewLabel(formData.reviewStatus) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  FEE_STATUS_OPTIONS, 
  REVIEW_STATUS_OPTIONS, 
  GROUP_PREFERENCE_OPTIONS,
  formatDate 
} from '../../utils'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const reviewOptions = REVIEW_STATUS_OPTIONS

const newContact = ref({
  person: '',
  content: ''
})

const contactList = computed({
  get() {
    return Array.isArray(props.formData.contactHistory) 
      ? props.formData.contactHistory 
      : []
  },
  set(val) {
    emit('update')
  }
})

const addContactRecord = () => {
  if (!newContact.value.content.trim()) return
  
  const record = {
    person: newContact.value.person.trim() || '未录入',
    content: newContact.value.content.trim(),
    time: new Date().toISOString()
  }
  
  if (!props.formData.contactHistory) {
    props.formData.contactHistory = []
  }
  props.formData.contactHistory.push(record)
  
  newContact.value = { person: '', content: '' }
  emit('update')
}

const removeContactRecord = (index) => {
  if (props.formData.contactHistory) {
    props.formData.contactHistory.splice(index, 1)
    emit('update')
  }
}

const getLabel = (options, value) => {
  const opt = options.find(o => o.value === value)
  return opt ? opt.label : '-'
}

const getGroupLabel = (value) => getLabel(GROUP_PREFERENCE_OPTIONS, value)
const getFeeLabel = (value) => getLabel(FEE_STATUS_OPTIONS, value)
const getReviewLabel = (value) => getLabel(REVIEW_STATUS_OPTIONS, value)
</script>
