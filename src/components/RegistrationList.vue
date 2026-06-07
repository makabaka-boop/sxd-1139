<template>
  <div class="registration-list">
    <div class="list-header">
      <h2>报名列表</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="$emit('add')">
          + 新增报名
        </button>
        <button class="btn btn-outline" @click="handleExport">
          导出CSV
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <label>搜索</label>
        <input 
          type="text" 
          v-model="filters.keyword" 
          placeholder="搜索姓名/手机号/邮箱"
          @input="applyFilters"
        />
      </div>
      <div class="filter-item">
        <label>活动批次</label>
        <select v-model="filters.activityBatch" @change="applyFilters">
          <option value="">全部</option>
          <option v-for="batch in activityBatches" :key="batch" :value="batch">
            {{ batch }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label>费用状态</label>
        <select v-model="filters.feeStatus" @change="applyFilters">
          <option value="">全部</option>
          <option v-for="opt in feeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label>分组偏好</label>
        <select v-model="filters.groupPreference" @change="applyFilters">
          <option value="">全部</option>
          <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label>复核状态</label>
        <select v-model="filters.reviewStatus" @change="applyFilters">
          <option value="">全部</option>
          <option v-for="opt in reviewOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <button class="btn btn-outline btn-sm" @click="resetFilters">
          重置筛选
        </button>
      </div>
    </div>

    <div class="list-stats">
      <span>共 {{ filteredList.length }} 条记录</span>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>手机号</th>
            <th>邮箱</th>
            <th>活动批次</th>
            <th>分组偏好</th>
            <th>费用状态</th>
            <th>复核状态</th>
            <th>报名时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.email || '-' }}</td>
            <td>{{ item.activityBatch }}</td>
            <td>
              <span :class="['badge', 'group-' + item.groupPreference]">
                {{ getGroupLabel(item.groupPreference) }}
              </span>
            </td>
            <td>
              <span :class="['badge', 'fee-' + item.feeStatus]">
                {{ getFeeLabel(item.feeStatus) }}
              </span>
            </td>
            <td>
              <span :class="['badge', 'review-' + item.reviewStatus]">
                {{ getReviewLabel(item.reviewStatus) }}
              </span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td class="actions-col">
              <button class="btn-link" @click="$emit('edit', item)">编辑</button>
              <button class="btn-link danger" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="10" class="empty-state">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { deleteRegistration } from '../db'
import { 
  FEE_STATUS_OPTIONS, 
  REVIEW_STATUS_OPTIONS, 
  GROUP_PREFERENCE_OPTIONS,
  DEFAULT_ACTIVITY_BATCHES,
  formatDate,
  exportToCSV
} from '../utils'

const props = defineProps({
  registrations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add', 'edit', 'delete', 'refresh'])

const activityBatches = DEFAULT_ACTIVITY_BATCHES
const feeOptions = FEE_STATUS_OPTIONS
const reviewOptions = REVIEW_STATUS_OPTIONS
const groupOptions = GROUP_PREFERENCE_OPTIONS

const filters = ref({
  keyword: '',
  activityBatch: '',
  feeStatus: '',
  groupPreference: '',
  reviewStatus: ''
})

const filteredList = computed(() => {
  let list = [...props.registrations]
  
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.name?.toLowerCase().includes(kw) ||
      item.phone?.includes(kw) ||
      item.email?.toLowerCase().includes(kw)
    )
  }
  
  if (filters.value.activityBatch) {
    list = list.filter(item => item.activityBatch === filters.value.activityBatch)
  }
  
  if (filters.value.feeStatus) {
    list = list.filter(item => item.feeStatus === filters.value.feeStatus)
  }
  
  if (filters.value.groupPreference) {
    list = list.filter(item => item.groupPreference === filters.value.groupPreference)
  }
  
  if (filters.value.reviewStatus) {
    list = list.filter(item => item.reviewStatus === filters.value.reviewStatus)
  }
  
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const applyFilters = () => {
}

const resetFilters = () => {
  filters.value = {
    keyword: '',
    activityBatch: '',
    feeStatus: '',
    groupPreference: '',
    reviewStatus: ''
  }
}

const getLabel = (options, value) => {
  const opt = options.find(o => o.value === value)
  return opt ? opt.label : '-'
}

const getGroupLabel = (value) => getLabel(GROUP_PREFERENCE_OPTIONS, value)
const getFeeLabel = (value) => getLabel(FEE_STATUS_OPTIONS, value)
const getReviewLabel = (value) => getLabel(REVIEW_STATUS_OPTIONS, value)

const handleDelete = async (item) => {
  if (confirm(`确定要删除 ${item.name} 的报名记录吗？`)) {
    await deleteRegistration(item.id)
    emit('refresh')
  }
}

const handleExport = () => {
  exportToCSV(filteredList.value, `报名列表_${new Date().toLocaleDateString()}.csv`)
}
</script>
