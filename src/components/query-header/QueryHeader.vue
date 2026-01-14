<script setup lang="ts">
import { NForm, NFormItem, NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { computed, h } from 'vue'

interface QueryField {
  label: string
  slot: string
  labelWidth?: string | number
}

interface ActionButton {
  label: string
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  icon?: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
}

interface Props {
  queryFields?: QueryField[]
  actionButtons?: ActionButton[]
  loading?: boolean
  maxVisibleButtons?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryFields: () => [],
  actionButtons: () => [],
  loading: false,
  maxVisibleButtons: 3,
})

// 计算可见的按钮和下拉菜单中的按钮
const visibleButtons = computed(() => {
  return props.actionButtons.slice(0, props.maxVisibleButtons)
})

const dropdownButtons = computed(() => {
  return props.actionButtons.slice(props.maxVisibleButtons)
})

// 转换下拉按钮为 Dropdown 选项
const dropdownOptions = computed<DropdownOption[]>(() => {
  return dropdownButtons.value.map((btn, index) => ({
    label: btn.label,
    key: `dropdown-${index}`,
    icon: btn.icon
      ? () => h('span', { class: `iconify ${btn.icon}` })
      : undefined,
    props: {
      onClick: btn.onClick,
    },
  }))
})

const handleDropdownSelect = (key: string) => {
  const index = parseInt(key.replace('dropdown-', ''))
  const button = dropdownButtons.value[index]
  if (button && button.onClick) {
    button.onClick()
  }
}
</script>

<template>
  <div class="query-header mb-4">
    <div class="flex items-start justify-between gap-4">
      <!-- 左侧查询表单 -->
      <div v-if="queryFields.length > 0" class="flex-1">
        <NForm :inline="true" label-placement="left" class="query-form">
          <div class="grid grid-cols-1 gap-x-4 gap-y-2 lg:grid-cols-3">
            <NFormItem
              v-for="field in queryFields"
              :key="field.slot"
              :label="field.label"
              :label-width="field.labelWidth || 80"
            >
              <slot :name="field.slot" />
            </NFormItem>
          </div>
        </NForm>
      </div>

      <!-- 右侧操作按钮 -->
      <div v-if="actionButtons.length > 0" class="flex shrink-0 gap-2">
        <!-- 可见按钮 -->
        <NButton
          v-for="(btn, index) in visibleButtons"
          :key="index"
          :type="btn.type || 'default'"
          :loading="btn.loading"
          :disabled="btn.disabled"
          @click="btn.onClick"
        >
          <template v-if="btn.icon" #icon>
            <span :class="`iconify ${btn.icon}`" />
          </template>
          {{ btn.label }}
        </NButton>

        <!-- 更多按钮（下拉菜单） -->
        <NDropdown
          v-if="dropdownButtons.length > 0"
          trigger="click"
          :options="dropdownOptions"
          @select="handleDropdownSelect"
        >
          <NButton>
            <template #icon>
              <span class="iconify ph--dots-three-outline-vertical" />
            </template>
            更多
          </NButton>
        </NDropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-header {
  width: 100%;
}

.query-form :deep(.n-form-item) {
  margin-bottom: 0;
}

.query-form :deep(.n-form-item-label) {
  min-width: 80px;
}

.query-form :deep(.n-input),
.query-form :deep(.n-input-number),
.query-form :deep(.n-select) {
  width: 100%;
  min-width: 180px;
}
</style>
