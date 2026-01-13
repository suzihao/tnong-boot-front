<script setup lang="tsx">
import {
  NCard,
  NSpace,
  NInput,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NSwitch,
  NTag,
  NPopconfirm,
  NPagination,
  NSelect,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getJobPage,
  createJob,
  updateJob,
  deleteJob,
  changeJobStatus,
  runJobOnce,
  type Job,
  type JobForm,
  type JobPageParams,
} from '@/api/job'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemJob',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增任务')
const formRef = ref<FormInst | null>(null)
const queryFormRef = ref<FormInst | null>(null)
const saving = ref(false)

const queryParams = reactive<Omit<JobPageParams, 'page' | 'size'>>({
  jobName: '',
  jobGroup: '',
  status: undefined,
})

const tableData = ref<Job[]>([])
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

const formData = reactive<JobForm>({
  jobName: '',
  jobGroup: 'DEFAULT',
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: 1,
  concurrent: 0,
  status: 1,
  remark: '',
})

const rules: FormRules = {
  jobName: { required: true, message: '请输入任务名称', trigger: 'blur' },
  invokeTarget: { required: true, message: '请输入调用目标', trigger: 'blur' },
  cronExpression: { required: true, message: '请输入Cron表达式', trigger: 'blur' },
}

const misfirePolicyOptions = [
  { label: '立即执行', value: 1 },
  { label: '执行一次', value: 2 },
  { label: '放弃执行', value: 3 },
]

const columns: DataTableColumns<Job> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '任务名称', key: 'jobName', width: 150 },
  { title: '任务组', key: 'jobGroup', width: 120 },
  { title: '调用目标', key: 'invokeTarget', minWidth: 200, ellipsis: { tooltip: true } },
  { title: 'Cron表达式', key: 'cronExpression', width: 150 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 1 ? '运行' : '暂停') },
      )
    },
  },
  { title: '备注', key: 'remark', width: 150, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    fixed: 'right',
    align: 'center',
    render: (row) => (
      <div class="flex gap-2">
        <NButton secondary type="primary" size="small" onClick={() => handleEdit(row)}>
          编辑
        </NButton>
        <NButton secondary type="info" size="small" onClick={() => handleRun(row)}>
          执行
        </NButton>
        <NButton
          secondary
          type={row.status === 1 ? 'warning' : 'success'}
          size="small"
          onClick={() => handleToggleStatus(row)}
        >
          {row.status === 1 ? '暂停' : '启动'}
        </NButton>
        <NPopconfirm
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={() => handleDelete(row)}
        >
          {{
            default: () => `确定删除任务【${row.jobName}】吗？`,
            trigger: () => (
              <NButton secondary type="error" size="small">
                删除
              </NButton>
            ),
          }}
        </NPopconfirm>
      </div>
    ),
  },
]

const getList = async () => {
  loading.value = true
  try {
    const res = await getJobPage({
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
    jobName: '',
    jobGroup: '',
    status: undefined,
  })
  handleQuery()
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: 1,
    concurrent: 0,
    status: 1,
    remark: '',
    version: undefined,
  })
}

const handleCreate = () => {
  resetForm()
  modalTitle.value = '新增任务'
  showModal.value = true
}

const handleEdit = (row: Job) => {
  Object.assign(formData, row)
  modalTitle.value = '编辑任务'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateJob(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        getList()
      }
    } else {
      const res = await createJob(formData)
      if (res.code === 200) {
        message.success('新增成功')
        showModal.value = false
        getList()
      }
    }
    return true
  } catch (error) {
    return false
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: Job) => {
  try {
    const res = await deleteJob(row.id!, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      getList()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const handleToggleStatus = async (row: Job) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const res = await changeJobStatus(row.id!, newStatus)
    if (res.code === 200) {
      message.success('状态修改成功')
      getList()
    }
  } catch (error) {
    message.error('状态修改失败')
  }
}

const handleRun = async (row: Job) => {
  try {
    const res = await runJobOnce(row.id!)
    if (res.code === 200) {
      message.success('任务已触发执行')
    }
  } catch (error) {
    message.error('任务执行失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <NCard class="flex-1" content-class="flex flex-col">
      <!-- 查询表单 -->
      <NForm
        ref="queryFormRef"
        :model="queryParams"
        label-placement="left"
        label-width="80"
        class="mb-4"
      >
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
          <NFormItem label="任务名称" path="jobName">
            <NInput
              v-model:value="queryParams.jobName"
              placeholder="请输入任务名称"
              clearable
            />
          </NFormItem>
          <NFormItem label="任务组" path="jobGroup">
            <NInput
              v-model:value="queryParams.jobGroup"
              placeholder="请输入任务组"
              clearable
            />
          </NFormItem>
          <NFormItem label=" " label-width="0">
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
          </NFormItem>
        </div>
      </NForm>

      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <div class="flex gap-2">
          <NButton type="success" @click="handleCreate">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新增任务
          </NButton>
        </div>
      </div>

      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :single-line="true"
        />
        <div class="mt-4 flex justify-end">
          <NPagination v-bind="pagination" />
        </div>
      </div>

      <!-- 新增/编辑弹窗 -->
      <NModal
        v-model:show="showModal"
        :title="modalTitle"
        preset="dialog"
        :mask-closable="false"
        style="width: 600px"
      >
        <NForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="100"
          style="margin-top: 20px"
        >
          <NFormItem label="任务名称" path="jobName">
            <NInput v-model:value="formData.jobName" placeholder="请输入任务名称" />
          </NFormItem>
          <NFormItem label="任务组" path="jobGroup">
            <NInput v-model:value="formData.jobGroup" placeholder="例如 DEFAULT" />
          </NFormItem>
          <NFormItem label="调用目标" path="invokeTarget">
            <NInput
              v-model:value="formData.invokeTarget"
              placeholder="例如 com.example.task.MyTask.execute"
            />
          </NFormItem>
          <NFormItem label="Cron表达式" path="cronExpression">
            <NInput
              v-model:value="formData.cronExpression"
              placeholder="例如 0 0/5 * * * ?"
            />
          </NFormItem>
          <NFormItem label="执行策略" path="misfirePolicy">
            <NSelect
              v-model:value="formData.misfirePolicy"
              :options="misfirePolicyOptions"
            />
          </NFormItem>
          <NFormItem label="并发执行" path="concurrent">
            <NSwitch v-model:value="formData.concurrent" :checked-value="1" :unchecked-value="0">
              <template #checked>允许</template>
              <template #unchecked>禁止</template>
            </NSwitch>
          </NFormItem>
          <NFormItem label="状态" path="status">
            <NSwitch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
              <template #checked>运行</template>
              <template #unchecked>暂停</template>
            </NSwitch>
          </NFormItem>
          <NFormItem label="备注" path="remark">
            <NInput
              v-model:value="formData.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="请输入备注"
            />
          </NFormItem>
        </NForm>

        <template #action>
          <NSpace justify="end">
            <NButton @click="showModal = false">取消</NButton>
            <NButton type="primary" @click="handleSubmit" :loading="saving">保存</NButton>
          </NSpace>
        </template>
      </NModal>
    </NCard>
  </ScrollContainer>
</template>
