<script setup lang="tsx">
import {
  NCard,
  NSpace,
  NInput,
  NButton,
  NDataTable,
  NModal,
  NTag,
  NPagination,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type PaginationProps,
  type DataTableRowKey,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getOperLogPage,
  getOperLogById,
  batchDeleteOperLog,
  truncateOperLog,
  type OperLog,
  type OperLogPageParams,
} from '@/api/oper-log'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemOperLog',
})

const message = useMessage()

const loading = ref(false)
const showDetailModal = ref(false)
const queryFormRef = ref<FormInst | null>(null)
const currentLog = ref<OperLog | null>(null)
const checkedRowKeys = ref<DataTableRowKey[]>([])

const queryParams = reactive<Omit<OperLogPageParams, 'page' | 'size'>>({
  module: '',
  operName: '',
  status: undefined,
})

const tableData = ref<OperLog[]>([])
const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  onUpdatePage: (page: number) => {
    pagination.page = page
    getList()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    getList()
  },
})

const businessTypeMap: Record<number, string> = {
  0: '其他',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '清空',
}

const columns: DataTableColumns<OperLog> = [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 80 },
  { title: '模块', key: 'module', width: 120 },
  {
    title: '业务类型',
    key: 'businessType',
    width: 100,
    render: (row) => businessTypeMap[row.businessType ?? 0] ?? row.businessType,
  },
  { title: '操作人员', key: 'operName', width: 120 },
  { title: '请求方法', key: 'requestMethod', width: 100 },
  { title: '操作地址', key: 'operUrl', minWidth: 200, ellipsis: { tooltip: true } },
  { title: '操作IP', key: 'operIp', width: 140 },
  { title: '操作地点', key: 'operLocation', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 0 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 0 ? '成功' : '失败') },
      )
    },
  },
  {
    title: '耗时(ms)',
    key: 'costTime',
    width: 100,
  },
  { title: '操作时间', key: 'operTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    align: 'center',
    render: (row) => (
      <NButton secondary type="info" size="small" onClick={() => handleViewDetail(row)}>
        详情
      </NButton>
    ),
  },
]

const getList = async () => {
  loading.value = true
  try {
    const res = await getOperLogPage({
      page: pagination.page!,
      size: pagination.pageSize!,
      ...queryParams,
    })
    if (res.code === 200) {
      tableData.value = res.data.records || []
      pagination.itemCount = res.data.total
    }
  } catch (error) {
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  queryFormRef.value?.restoreValidation()
  Object.assign(queryParams, {
    module: '',
    operName: '',
    status: undefined,
  })
  handleQuery()
}

const handleViewDetail = async (row: OperLog) => {
  try {
    const res = await getOperLogById(row.id!)
    if (res.code === 200) {
      currentLog.value = res.data
      showDetailModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleBatchDelete = async () => {
  if (checkedRowKeys.value.length === 0) {
    message.warning('请选择要删除的日志')
    return
  }

  try {
    const res = await batchDeleteOperLog(checkedRowKeys.value as number[])
    if (res.code === 200) {
      message.success('删除成功')
      checkedRowKeys.value = []
      getList()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const handleTruncate = async () => {
  try {
    const res = await truncateOperLog()
    if (res.code === 200) {
      message.success('清空成功')
      getList()
    }
  } catch (error) {
    message.error('清空失败')
  }
}

const handleCheck = (rowKeys: DataTableRowKey[]) => {
  checkedRowKeys.value = rowKeys
}

onMounted(() => {
  getList()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <NCard class="flex-1" content-class="flex flex-col">
      <!-- 查询表单 -->
      <div class="mb-4 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
        <NSpace vertical>
          <span class="text-sm">模块</span>
          <NInput v-model:value="queryParams.module" placeholder="请输入模块" clearable />
        </NSpace>
        <NSpace vertical>
          <span class="text-sm">操作人员</span>
          <NInput
            v-model:value="queryParams.operName"
            placeholder="请输入操作人员"
            clearable
          />
        </NSpace>
        <NSpace vertical>
          <span class="text-sm">&nbsp;</span>
          <NSpace>
            <NButton type="primary" @click="handleQuery">
              <template #icon>
                <span class="iconify ph--magnifying-glass" />
              </template>
              查询
            </NButton>
            <NButton @click="handleReset">
              <template #icon>
                <span class="iconify ph--arrow-counter-clockwise" />
              </template>
              重置
            </NButton>
          </NSpace>
        </NSpace>
      </div>

      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <div class="flex gap-2">
          <NPopconfirm
            positiveText="确定"
            negativeText="取消"
            @positive-click="handleBatchDelete"
          >
            <template #trigger>
              <NButton type="error" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <span class="iconify ph--trash" />
                </template>
                批量删除
              </NButton>
            </template>
            确定删除选中的 {{ checkedRowKeys.length }} 条日志吗？
          </NPopconfirm>
          <NPopconfirm positiveText="确定" negativeText="取消" @positive-click="handleTruncate">
            <template #trigger>
              <NButton type="warning">
                <template #icon>
                  <span class="iconify ph--broom" />
                </template>
                清空日志
              </NButton>
            </template>
            确定清空所有操作日志吗？此操作不可恢复！
          </NPopconfirm>
        </div>
      </div>

      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :single-line="true"
          :row-key="(row: OperLog) => row.id!"
          :checked-row-keys="checkedRowKeys"
          @update:checked-row-keys="handleCheck"
        />
        <div class="mt-4 flex justify-end">
          <NPagination v-bind="pagination" />
        </div>
      </div>

      <!-- 详情弹窗 -->
      <NModal
        v-model:show="showDetailModal"
        title="操作日志详情"
        preset="dialog"
        style="width: 800px"
      >
        <div v-if="currentLog" class="space-y-4" style="margin-top: 20px">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">日志ID</div>
              <div class="mt-1">{{ currentLog.id }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">模块</div>
              <div class="mt-1">{{ currentLog.module }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">业务类型</div>
              <div class="mt-1">
                {{ businessTypeMap[currentLog.businessType ?? 0] ?? currentLog.businessType }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">操作状态</div>
              <div class="mt-1">
                <NTag :type="currentLog.status === 0 ? 'success' : 'error'" size="small">
                  {{ currentLog.status === 0 ? '成功' : '失败' }}
                </NTag>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">操作人员</div>
              <div class="mt-1">{{ currentLog.operName }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">请求方法</div>
              <div class="mt-1">{{ currentLog.requestMethod }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">操作IP</div>
              <div class="mt-1">{{ currentLog.operIp }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">操作地点</div>
              <div class="mt-1">{{ currentLog.operLocation }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">耗时</div>
              <div class="mt-1">{{ currentLog.costTime }}ms</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">操作时间</div>
              <div class="mt-1">{{ currentLog.operTime }}</div>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500">操作地址</div>
            <div class="mt-1 rounded bg-gray-100 p-2 font-mono text-sm">
              {{ currentLog.operUrl }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500">请求方法</div>
            <div class="mt-1 rounded bg-gray-100 p-2 font-mono text-sm">
              {{ currentLog.method }}
            </div>
          </div>
          <div v-if="currentLog.operParam">
            <div class="text-sm text-gray-500">请求参数</div>
            <div class="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 font-mono text-sm">
              {{ currentLog.operParam }}
            </div>
          </div>
          <div v-if="currentLog.jsonResult">
            <div class="text-sm text-gray-500">返回结果</div>
            <div class="mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 font-mono text-sm">
              {{ currentLog.jsonResult }}
            </div>
          </div>
          <div v-if="currentLog.errorMsg">
            <div class="text-sm text-gray-500">错误信息</div>
            <div
              class="mt-1 max-h-60 overflow-auto rounded bg-red-50 p-2 font-mono text-sm text-red-600"
            >
              {{ currentLog.errorMsg }}
            </div>
          </div>
        </div>

        <template #action>
          <NSpace justify="end">
            <NButton @click="showDetailModal = false">关闭</NButton>
          </NSpace>
        </template>
      </NModal>
    </NCard>
  </ScrollContainer>
</template>
