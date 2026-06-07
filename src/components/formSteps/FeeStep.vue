<template>
  <div class="form-step">
    <h3>费用信息</h3>
    <div class="form-grid">
      <div class="form-item">
        <label>费用状态</label>
        <select 
          v-model="formData.feeStatus"
          @change="$emit('update')"
        >
          <option value="">请选择</option>
          <option 
            v-for="opt in feeOptions" 
            :key="opt.value" 
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="form-item">
        <label>应缴金额 (元)</label>
        <input 
          type="number" 
          v-model.number="formData.totalFee" 
          placeholder="请输入应缴金额"
          min="0"
          step="0.01"
          @input="$emit('update')"
        />
      </div>
      <div class="form-item">
        <label>已缴金额 (元)</label>
        <input 
          type="number" 
          v-model.number="formData.paidAmount" 
          placeholder="请输入已缴金额"
          min="0"
          step="0.01"
          @input="$emit('update')"
        />
      </div>
      <div class="form-item">
        <label>支付方式</label>
        <select 
          v-model="formData.paymentMethod"
          @change="$emit('update')"
        >
          <option value="">请选择</option>
          <option value="wechat">微信</option>
          <option value="alipay">支付宝</option>
          <option value="bank">银行转账</option>
          <option value="cash">现金</option>
        </select>
      </div>
    </div>

    <div class="fee-summary" v-if="formData.totalFee !== undefined">
      <div class="summary-item">
        <span>应缴金额：</span>
        <span class="amount">¥{{ formData.totalFee || 0 }}</span>
      </div>
      <div class="summary-item">
        <span>已缴金额：</span>
        <span class="amount paid">¥{{ formData.paidAmount || 0 }}</span>
      </div>
      <div class="summary-item highlight">
        <span>待缴金额：</span>
        <span class="amount unpaid">¥{{ remainingAmount }}</span>
      </div>
    </div>

    <div class="form-section">
      <h4>支付备注</h4>
      <textarea 
        v-model="formData.paymentRemark" 
        placeholder="请输入支付相关备注..."
        rows="3"
        @input="$emit('update')"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FEE_STATUS_OPTIONS } from '../../utils'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
})

defineEmits(['update'])

const feeOptions = FEE_STATUS_OPTIONS

const remainingAmount = computed(() => {
  const total = props.formData.totalFee || 0
  const paid = props.formData.paidAmount || 0
  return (total - paid).toFixed(2)
})
</script>
