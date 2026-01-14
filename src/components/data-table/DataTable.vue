<script setup lang="tsx">
import {
  NDataTable,
  NPagination,
  NButton,
  NButtonGroup,
  NNumberAnimation,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { ref, computed, watch, onMounted } from 'vue'

import { useInjection } from '@/composables'
import { mediaQueryInjectionKey } from '@/injection'

interface Props {
  columns: DataTableColumns<any>
  data: any[]
  loading?: boolean
  pagination?: PaginationProps
  checkedRowKeys?: Array<number | string>
  rowKey?: string | ((row: any) => string | number)
  striped?: boolean
  singleLine?: boolean
  scrollX?: number | boolean
  flexHeight?: boolean
  remote?: boolean
  showStyleControls?: boolean
  showScrollXControl?: boolean
  showDownloadCsv?: boolean
  rowProps?: (row: any) => any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  checkedRowKeys: () => [],
  rowKey: 'id',
  striped: false,
  singleLine: true,
  scrollX: false,
  flexHeight: false,
  remote: true,
  showStyleControls: true,
  showScrollXControl: true,
  showDownloadCsv: false,
})

const emit = defineEmits<{
  'update:checkedRowKeys': [value: Array<number | string>]
  'update:striped': [value: boolean]
  'update:singleLine': [value: boolean]
  'update:scrollX': [value: number | boolean]
}>()

const { isMaxMd } = useInjection(mediaQueryInjectionKey)

const dataTableRef = ref<InstanceType<typeof NDataTable> | null>(null)

// 内部状态管理
const internalStriped = ref(props.striped)
const internalSingleLine = ref(props.singleLine)
const internalScrollX = ref(props.scrollX)
const internalCheckedRowKeys = ref<Array<number | string>>(props.checkedRowKeys)

// 监听 props 变化
watch(() => props.striped, (val) => { internalStriped.value = val })
watch(() => props.singleLine, (val) => { internalSingleLine.value = val })
watch(() => props.scrollX, (val) => { internalScrollX.value = val })
watch(() => props.checkedRowKeys, (val) => { internalCheckedRowKeys.value = val })

// 监听内部状态变化并发出事件
watch(internalStriped, (val) => emit('update:striped', val))
watch(internalSingleLine, (val) => emit('update:singleLine', val))
watch(internalScrollX, (val) => emit('update:scrollX', val))
watch(internalCheckedRowKeys, (val) => emit('update:checkedRowKeys', val))

// 计算实际的 scrollX 值
const computedScrollX = computed(() => {
  if (typeof internalScrollX.value === 'boolean') {
    return internalScrollX.value ? 1800 : 0
  }
  return internalScrollX.value
})

// 上一次的总数（用于动画）
const prevTotal = ref(0)

// 分页前缀（显示总数）
const paginationPrefix: PaginationProps['prefix'] = (info) => {
  const { itemCount } = info
  return (
    itemCount !== undefined && (
      <div class="flex items-center gap-x-1">
        <span>共</span>
        <NNumberAnimation
          from={prevTotal.value}
          to={itemCount}
          onFinish={() => {
            prevTotal.value = itemCount
          }}
        />
        <span>条</span>
      </div>
    )
  )
}

// 切换条纹风格
const toggleStriped = () => {
  internalStriped.value = !internalStriped.value
}

// 切换单线风格
const toggleSingleLine = () => {
  internalSingleLine.value = !internalSingleLine.value
}

// 切换横向滚动
const toggleScrollX = () => {
  if (typeof internalScrollX.value === 'boolean') {
    internalScrollX.value = !internalScrollX.value
  } else {
    internalScrollX.value = internalScrollX.value > 0 ? 0 : 1800
  }
}

// 下载 CSV
const handleDownloadCsv = () => {
  if (!dataTableRef.value) return
  dataTableRef.value.downloadCsv()
}

// 调试：监听数据变化
onMounted(() => {
  console.log('DataTable mounted, data length:', props.data.length)
  console.log('DataTable columns:', props.columns.length)
})

watch(() => props.data, (newData) => {
  console.log('DataTable data changed, new length:', newData.length)
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  downloadCsv: handleDownloadCsv,
  dataTableRef,
})
</script>

<template>
  <div class="data-table-wrapper flex flex-1 flex-col">
    <!-- 表格 -->
    <NDataTable
      ref="dataTableRef"
      class="flex-1"
      v-model:checked-row-keys="internalCheckedRowKeys"
      :columns="columns"
      :data="data"
      :loading="loading"
      :remote="remote"
      :flex-height="flexHeight"
      :scroll-x="computedScrollX"
      :striped="internalStriped"
      :single-line="internalSingleLine"
      :row-key="rowKey"
      :row-props="rowProps"
    />

    <!-- 底部控制栏 -->
    <div class="mt-3 flex items-end justify-between max-xl:flex-col max-xl:gap-y-2">
      <!-- 左侧：已选择 + 样式控制按钮 -->
      <div class="flex items-center gap-x-3">
        <span>已选择 {{ internalCheckedRowKeys.length }} 条</span>

        <NButtonGroup v-if="showStyleControls" size="small" :ghost="true">
          <NButton
            @click="toggleStriped"
            :type="internalStriped ? 'primary' : 'default'"
            secondary
          >
            条纹风格
          </NButton>
          <NButton
            @click="toggleSingleLine"
            :type="!internalSingleLine ? 'primary' : 'default'"
            secondary
          >
            单线风格
          </NButton>
          <NButton
            v-if="showScrollXControl"
            @click="toggleScrollX"
            :type="computedScrollX > 0 ? 'primary' : 'default'"
            secondary
          >
            横向滚动
          </NButton>
          <NButton
            v-if="showDownloadCsv && !isMaxMd"
            @click="handleDownloadCsv"
            secondary
            type="info"
          >
            下载为Csv
          </NButton>
        </NButtonGroup>
      </div>

      <!-- 右侧：分页（带总数前缀） -->
      <NPagination
        v-if="pagination"
        v-bind="pagination"
        :prefix="paginationPrefix"
        :page-slot="isMaxMd ? 5 : undefined"
        :show-quick-jump-dropdown="!isMaxMd"
        :show-quick-jumper="!isMaxMd"
        :show-size-picker="!isMaxMd"
      />
    </div>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  width: 100%;
}
</style>
