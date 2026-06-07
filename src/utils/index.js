export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function exportToCSV(data, filename = 'registrations.csv') {
  if (!data || data.length === 0) {
    return false
  }

  const headers = [
    'ID', '姓名', '手机号', '邮箱', '活动批次', 
    '分组偏好', '费用状态', '复核状态', '报名时间', '备注'
  ]

  const rows = data.map(item => [
    item.id || '',
    item.name || '',
    item.phone || '',
    item.email || '',
    item.activityBatch || '',
    item.groupPreference || '',
    item.feeStatus || '',
    item.reviewStatus || '',
    formatDate(item.createdAt),
    (item.remarks || '').replace(/\n/g, '; ')
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const FEE_STATUS_OPTIONS = [
  { value: 'unpaid', label: '未缴费' },
  { value: 'partial', label: '部分缴费' },
  { value: 'paid', label: '已缴费' },
  { value: 'refunded', label: '已退款' }
]

export const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: '待复核' },
  { value: 'confirmed', label: '已确认' },
  { value: 'duplicate', label: '重复报名' },
  { value: 'cancelled', label: '已取消' }
]

export const GROUP_PREFERENCE_OPTIONS = [
  { value: 'A', label: 'A组' },
  { value: 'B', label: 'B组' },
  { value: 'C', label: 'C组' },
  { value: 'D', label: 'D组' },
  { value: 'no_preference', label: '无偏好' }
]

export const DEFAULT_ACTIVITY_BATCHES = [
  '2024春季场',
  '2024夏季场',
  '2024秋季场',
  '2024冬季场'
]

export function validatePhone(phone) {
  if (!phone) return { valid: false, message: '请输入手机号' }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(phone)) {
    return { valid: false, message: '请输入正确的11位手机号' }
  }
  return { valid: true }
}

export function validateEmail(email) {
  if (!email) return { valid: true }
  const reg = /^[\w.-]+@[\w.-]+\.\w+$/
  if (!reg.test(email)) {
    return { valid: false, message: '请输入正确的邮箱地址' }
  }
  return { valid: true }
}

export function validateIdCard(idCard) {
  if (!idCard) return { valid: true }
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!reg.test(idCard)) {
    return { valid: false, message: '请输入正确的身份证号' }
  }
  return { valid: true }
}

export function validateRequired(value, fieldName = '该项') {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `请输入${fieldName}` }
  }
  return { valid: true }
}
