<script setup lang="tsx">
import {
  NCard,
  NInput,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NSwitch,
  NTag,
  NPopconfirm,
  NSpace,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getDictTypePage,
  createDictType,
  updateDictType,
  deleteDictType,
  type DictType,
  type DictTypeForm,
  type DictTypePageParams,
} from '@/api/dict-type'
import { ScrollContainer, QueryHeader, DataTable } from '@/components'

defineOptions({
  name: 'SystemDictType',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增字典类型')
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const queryParams = reactive<Omit<DictTypePageParams, 'page' | 'size'>>({
  dictCode: '',
  dictName: '',
  status: undefined,
})

const tableData = ref<DictType[]>([])
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

const formData = reactive<DictTypeForm>({
  dictCode: '',
  dictName: '',
  status: 1,
  remark: '',
})

const rules: FormRules = {
  dictCode: { required: true, message: '请输入字典编码', trigger: 'blur' },
  dictName: { required: true, message: '请输入字典名称', trigger: 'blur' },
}

const columns: DataTableColumns<DictType> = [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 80 },
  { title: '字典编码', key: 'dictCode', width: 180 },
  { title: '字典名称', key: 'dictName', width: 180 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 1 ? '启用' : '禁用') },
      )
    },
  },
  { title: '备注', key: 'remark', minWidth: 200, ellipsis: { tooltip: true } },
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
            default: () => `确定删除字典类型【${row.dictName}】吗？`,
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
    const res = await getDictTypePage({
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
    dictCode: '',
    dictName: '',
    status: undefined,
  })
  handleQuery()
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    dictCode: '',
    dictName: '',
    status: 1,
    remark: '',
    version: undefined,
  })
}

const handleCreate = () => {
  resetForm()
  modalTitle.value = '新增字典类型'
  showModal.value = true
}

const handleEdit = (row: DictType) => {
  Object.assign(formData, row)
  modalTitle.value = '编辑字典类型'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateDictType(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        getList()
      }
    } else {
      const res = await createDictType(formData)
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

const handleDelete = async (row: DictType) => {
  try {
    const res = await deleteDictType(row.id!, row.version!)
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
      <QueryHeader
        :query-fields="[
          { label: '字典编码', slot: 'dictCode' },
          { label: '字典名称', slot: 'dictName' },
        ]"
        :action-buttons="[
          {
            label: '新增字典类型',
            type: 'success',
            icon: 'ph--plus-circle',
            onClick: handleCreate,
          },
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
        <template #dictCode>
          <NInput
            v-model:value="queryParams.dictCode"
            placeholder="请输入字典编码"
            clearable
          />
        </template>
        <template #dictName>
          <NInput
            v-model:value="queryParams.dictName"
            placeholder="请输入字典名称"
            clearable
          />
        </template>
      </QueryHeader>

      <!-- 数据表格 -->
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        v-model:checked-row-keys="checkedRowKeys"
        :row-key="(row: DictType) => row.id!"
        :scroll-x="0"
        :show-download-csv="false"
      />

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
          <NFormItem label="字典编码" path="dictCode">
            <NInput
              v-model:value="formData.dictCode"
              :disabled="!!formData.id"
              placeholder="例如 sys_status"
            />
          </NFormItem>
          <NFormItem label="字典名称" path="dictName">
            <NInput v-model:value="formData.dictName" placeholder="例如 系统状态" />
          </NFormItem>
          <NFormItem label="状态" path="status">
            <NSwitch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
              <template #checked>启用</template>
              <template #unchecked>禁用</template>
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
