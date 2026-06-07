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
          @input="$emit('update')"
        />
      </div>
      <div class="form-item">
        <label>手机号 <span class="required">*</span></label>
        <input 
          type="tel" 
          v-model="formData.phone" 
          placeholder="请输入手机号"
          @input="onPhoneChange"
        />
      </div>
      <div class="form-item">
        <label>邮箱</label>
        <input 
          type="email" 
          v-model="formData.email" 
          placeholder="请输入邮箱"
          @input="onEmailChange"
        />
      </div>
      <div class="form-item">
        <label>活动批次 <span class="required">*</span></label>
        <select 
          v-model="formData.activityBatch"
          @change="$emit('update')"
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
          @input="$emit('update')"
        />
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
import { ref, watch } from 'vue'
import { findDuplicateRegistrations, findDraftsByContact } from '../../db'
import { DEFAULT_ACTIVITY_BATCHES } from '../../utils'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'merge', 'view', 'duplicates-found'])

const activityBatches = DEFAULT_ACTIVITY_BATCHES
const duplicates = ref([])

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
  emit('update')
  if (props.formData.phone?.length >= 7) {
    checkDuplicates()
  }
}

const onEmailChange = () => {
  emit('update')
  if (props.formData.email?.includes('@')) {
    checkDuplicates()
  }
}

watch(() => [props.formData.phone, props.formData.email], () => {
  if (!props.formData.phone && !props.formData.email) {
    duplicates.value = []
  }
})
</script>
