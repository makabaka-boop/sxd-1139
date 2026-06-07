<template>
  <div class="draft-list">
    <div class="list-header">
      <h2>草稿箱 ({{ drafts.length }})</h2>
    </div>
    <div class="draft-items">
      <div 
        v-for="draft in sortedDrafts" 
        :key="draft.id"
        class="draft-item"
      >
        <div class="draft-info">
          <div class="draft-name">{{ draft.name || '未命名' }}</div>
          <div class="draft-meta">
            <span v-if="draft.phone">{{ draft.phone }}</span>
            <span v-if="draft.phone && draft.activityBatch"> · </span>
            <span v-if="draft.activityBatch">{{ draft.activityBatch }}</span>
          </div>
          <div class="draft-time">更新于 {{ formatDate(draft.updatedAt) }}</div>
        </div>
        <div class="draft-actions">
          <button class="btn-link" @click="$emit('restore', draft)">
            继续编辑
          </button>
          <button class="btn-link danger" @click="handleDelete(draft)">
            删除
          </button>
        </div>
      </div>
      <div v-if="drafts.length === 0" class="empty-drafts">
        暂无草稿
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { deleteDraft } from '../db'
import { formatDate } from '../utils'
import { useModal } from '../composables/useModal'

const { confirm } = useModal()

const props = defineProps({
  drafts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['restore', 'refresh'])

const sortedDrafts = computed(() => {
  return [...props.drafts].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )
})

const handleDelete = async (draft) => {
  const ok = await confirm(`确定要删除这份草稿吗？`)
  if (ok) {
    await deleteDraft(draft.id)
    emit('refresh')
  }
}
</script>
