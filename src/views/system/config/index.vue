<script setup lang="tsx">
import {
  NCard,
  NInput,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NSpace,
  NPopconfirm,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted, computed } from 'vue'

import {
  getConfigPage,
  createConfig,
  updateConfig,
  deleteConfig,
  type Config,
  type ConfigForm,
  type ConfigPageParams,
} from '@/api/config'
import { ScrollContainer, QueryHeader } from '@/components'

defineOptions({
  name: 'SystemConfig',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增配置')
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const queryParams = reactive<Omit<ConfigPageParams, 'page' | 'size'>>({
  configKey: '',
  configName: '',
  configType: '',
})

const tableData = ref<Config[]>([])
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

const formData = reactive<ConfigForm>({
  configKey: '',
  configValue: '',
  configName: '',
  configType: '',
  remark: '',
})

const rules: FormRules = {
  configKey: { required: true, message: '请输入配置键', trigger: 'blur' },
  configName: { required: true, message: '请输入配置名称', trigger: 'blur' },
  configValue: { required: true, message: '请输入配置值', trigger: 'blur' },
}

// 查询字段配置
const queryFields = [
  { label: '配置键', slot: 'configKey' },
  { label: '配置名称', slot: 'configName' },
  { label: '配置类型', slot: 'configType' },
]

// 操作按钮配置
const actionButtons = computed(() => [
  {
    label: '新增配置',
    type: 'success' as const,
    icon: 'ph--plus-circle',
    onClick: handleCreate,
  },
  {
    label: '查询',
    type: 'info' as const,
    icon: 'ph--magnifying-glass',
    onClick: handleQuery,
    loading: loading.value,
    disabled: loading.value,
  },
  {
    label: '重置',
    type: 'warning' as const,
    icon: 'ph--arrow-clockwise',
    onClick: handleReset,
  },
])

const columns: DataTableColumns<Config> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '配置键', key: 'configKey', width: 200 },
  { title: '配置名称', key: 'configName', width: 150 },
  { title: '配置值', key: 'configValue', minWidth: 200, ellipsis: { tooltip: true } },
  { title: '配置类型', key: 'configType', width: 120 },
  { title: '备注', key: 'remark', width: 180, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    align: 'center',
    render: (row) => (
      <div class="flex gap-2">
        <NButton secondary type="primary" size="small" onClick={() => handleEdit(row)}>
          编辑
        </NButton>
        <NPopconfirm
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={() => handleDelete(row)}
        >
          {{
            default: () => `确定删除配置【${row.configName}】吗？`,
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
    const res = await getConfigPage({
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
  Object.assign(queryParams, {
    configKey: '',
    configName: '',
    configType: '',
  })
  handleQuery()
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    configKey: '',
    configValue: '',
    configName: '',
    configType: '',
    remark: '',
    version: undefined,
  })
}

const handleCreate = () => {
  resetForm()
  modalTitle.value = '新增配置'
  showModal.value = true
}

const handleEdit = (row: Config) => {
  Object.assign(formData, row)
  modalTitle.value = '编辑配置'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateConfig(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        getList()
      }
    } else {
      const res = await createConfig(formData)
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

const handleDelete = async (row: Config) => {
  try {
    const res = await deleteConfig(row.id!, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      getList()
    }
  } catch (error) {
    message.error('删除失败')
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
      <QueryHeader :query-fields="queryFields" :action-buttons="actionButtons" :loading="loading">
        <template #configKey>
          <NInput
            v-model:value="queryParams.configKey"
            placeholder="请输入配置键"
            clearable
          />
        </template>
        <template #configName>
          <NInput
            v-model:value="queryParams.configName"
            placeholder="请输入配置名称"
            clearable
          />
        </template>
        <template #configType>
          <NInput
            v-model:value="queryParams.configType"
            placeholder="请输入配置类型"
            clearable
          />
        </template>
      </QueryHeader>

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
      >
        <NForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="100"
          style="margin-top: 20px"
        >
          <NFormItem label="配置键" path="configKey">
            <NInput
              v-model:value="formData.configKey"
              :disabled="!!formData.id"
              placeholder="例如 system.title"
            />
          </NFormItem>
          <NFormItem label="配置名称" path="configName">
            <NInput v-model:value="formData.configName" placeholder="例如 系统标题" />
          </NFormItem>
          <NFormItem label="配置值" path="configValue">
            <NInput
              v-model:value="formData.configValue"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入配置值"
            />
          </NFormItem>
          <NFormItem label="配置类型" path="configType">
            <NInput v-model:value="formData.configType" placeholder="例如 system" />
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
