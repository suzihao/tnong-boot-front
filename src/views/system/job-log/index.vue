<script setup lang="tsx">
import {
  NCard,
  NInput,
  NButton,
  NModal,
  NTag,
  NSpace,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getJobLogPage,
  getJobLogById,
  type JobLog,
  type JobLogPageParams,
} from '@/api/job-log'
import { ScrollContainer, QueryHeader, DataTable } from '@/components'

defineOptions({
  name: 'SystemJobLog',
})

const message = useMessage()

const loading = ref(false)
const showDetailModal = ref(false)
const currentLog = ref<JobLog | null>(null)

const queryParams = reactive<Omit<JobLogPageParams, 'page' | 'size'>>({
  jobName: '',
  jobGroup: '',
  status: undefined,
})

const tableData = ref<JobLog[]>([])
const checkedRowKeys = ref<Array<number | string>>([])

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

const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const columns: DataTableColumns<JobLog> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '任务名称', key: 'jobName', width: 150 },
  { title: '任务组', key: 'jobGroup', width: 120 },
  { title: '调用目标', key: 'invokeTarget', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 1 ? '成功' : '失败') },
      )
    },
  },
  {
    title: '执行时长',
    key: 'duration',
    width: 120,
    render: (row) => formatDuration(row.duration),
  },
  { title: '执行时间', key: 'startTime', width: 180 },
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
    const res = await getJobLogPage({
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
  queryParams.jobName = ''
  queryParams.jobGroup = ''
  queryParams.status = undefined
  handleQuery()
}

const handleViewDetail = async (row: JobLog) => {
  try {
    const res = await getJobLogById(row.id!)
    if (res.code === 200) {
      currentLog.value = res.data
      showDetailModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <NCard class="flex-1" content-class="flex flex-col">
      <!-- 查询头部 -->
      <QueryHeader
        :query-fields="[
          { label: '任务名称', slot: 'jobName' },
          { label: '任务组', slot: 'jobGroup' },
        ]"
        :action-buttons="[
          {
            label: '查询',
            type: 'info',
            icon: 'ph--magnifying-glass',
            onClick: handleQuery,
            loading: loading,
            disabled: loading,
          },
          {
            label: '重置',
            type: 'warning',
            icon: 'ph--arrow-clockwise',
            onClick: handleReset,
          },
        ]"
      >
        <template #jobName>
          <NInput v-model:value="queryParams.jobName" placeholder="任务名称" clearable />
        </template>
        <template #jobGroup>
          <NInput v-model:value="queryParams.jobGroup" placeholder="任务组" clearable />
        </template>
      </QueryHeader>

      <!-- 数据表格 -->
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        v-model:checked-row-keys="checkedRowKeys"
        :row-key="(row) => row.id"
        :scroll-x="1600"
        :show-download-csv="false"
      />

      <!-- 详情弹窗 -->
      <NModal
        v-model:show="showDetailModal"
        title="任务日志详情"
        preset="dialog"
        style="width: 700px"
      >
        <div v-if="currentLog" class="space-y-4" style="margin-top: 20px">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">任务ID</div>
              <div class="mt-1">{{ currentLog.jobId }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">任务名称</div>
              <div class="mt-1">{{ currentLog.jobName }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">任务组</div>
              <div class="mt-1">{{ currentLog.jobGroup }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">执行状态</div>
              <div class="mt-1">
                <NTag :type="currentLog.status === 1 ? 'success' : 'error'" size="small">
                  {{ currentLog.status === 1 ? '成功' : '失败' }}
                </NTag>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">开始时间</div>
              <div class="mt-1">{{ currentLog.startTime }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">结束时间</div>
              <div class="mt-1">{{ currentLog.endTime }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">执行时长</div>
              <div class="mt-1">{{ formatDuration(currentLog.duration) }}</div>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500">调用目标</div>
            <div class="mt-1 rounded bg-gray-100 p-2 font-mono text-sm">
              {{ currentLog.invokeTarget }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500">执行消息</div>
            <div class="mt-1 rounded bg-gray-100 p-2 text-sm">
              {{ currentLog.jobMessage || '-' }}
            </div>
          </div>
          <div v-if="currentLog.exceptionInfo">
            <div class="text-sm text-gray-500">异常信息</div>
            <div class="mt-1 max-h-60 overflow-auto rounded bg-red-50 p-2 font-mono text-sm text-red-600">
              {{ currentLog.exceptionInfo }}
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
