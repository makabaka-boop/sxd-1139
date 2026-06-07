<template>
  <div class="form-step">
    <h3>分组偏好</h3>
    <div class="form-grid">
      <div class="form-item">
        <label>分组偏好</label>
        <select 
          v-model="formData.groupPreference"
          @change="$emit('update')"
        >
          <option value="">请选择</option>
          <option 
            v-for="opt in groupOptions" 
            :key="opt.value" 
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="form-item">
        <label>期望室友</label>
        <input 
          type="text" 
          v-model="formData.preferredRoommate" 
          placeholder="请输入期望室友姓名"
          @input="$emit('update')"
        />
      </div>
      <div class="form-item">
        <label>饮食偏好</label>
        <select 
          v-model="formData.dietPreference"
          @change="$emit('update')"
        >
          <option value="">无特殊要求</option>
          <option value="vegetarian">素食</option>
          <option value="halal">清真</option>
          <option value="no_seafood">不吃海鲜</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div class="form-item">
        <label>交通方式</label>
        <select 
          v-model="formData.transportation"
          @change="$emit('update')"
        >
          <option value="">请选择</option>
          <option value="self">自行前往</option>
          <option value="shuttle">统一大巴</option>
          <option value="carpool">拼车</option>
        </select>
      </div>
    </div>

    <div class="form-section">
      <h4>特殊需求</h4>
      <textarea 
        v-model="formData.specialRequirements" 
        placeholder="请输入其他特殊需求或备注..."
        rows="4"
        @input="$emit('update')"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { GROUP_PREFERENCE_OPTIONS } from '../../utils'

defineProps({
  formData: {
    type: Object,
    required: true
  }
})

defineEmits(['update'])

const groupOptions = GROUP_PREFERENCE_OPTIONS
</script>
