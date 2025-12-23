<script setup lang="tsx">
import {
  NCard,
  NInput,
  NInputNumber,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NSwitch,
  NTag,
  NPopconfirm,
  NDatePicker,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import { ScrollContainer } from '@/components'
import {
  getTenantPage,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  type Tenant,
  type TenantForm,
  type TenantPageParams,
} from '@/api/tenant'

defineOptions({
  name: 'SystemTenant',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增租户')
const formRef = ref<FormInst | null>(null)
const queryFormRef = ref<FormInst | null>(null)

const queryParams = reactive<Omit<TenantPageParams, 'page' | 'size'>>({
  tenantId: undefined,
  name: '',
})

const tableData = ref<Tenant[]>([])
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

const formData = reactive<TenantForm>({
  tenantId: undefined,
  name: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  status: 1,
  expireTime: undefined,
  remark: '',
})

const rules: FormRules = {
  tenantId: { required: true, message: '请输入租户ID', trigger: 'blur', type: 'number' },
  name: { required: true, message: '请输入租户名称', trigger: 'blur' },
}

const columns: DataTableColumns<Tenant> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '租户ID', key: 'tenantId', width: 150 },
  { title: '租户名称', key: 'name', width: 150 },
  { title: '联系人', key: 'contactName', width: 100 },
  { title: '联系电话', key: 'contactPhone', width: 130 },
  { title: '联系邮箱', key: 'contactEmail', width: 180, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 1 ? '启用' : '禁用') },
      )
    },
  },
  { title: '到期时间', key: 'expireTime', width: 160 },
  { title: '创建时间', key: 'createdTime', width: 160 },
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
            default: () => '确定删除该租户吗？',
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
    const params: TenantPageParams = {
      ...queryParams,
      page: pagination.page,
      size: pagination.pageSize,
    }
    const res = await getTenantPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
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
  queryParams.tenantId = undefined
  queryParams.name = ''
  handleQuery()
}

const handleAdd = () => {
  modalTitle.value = '新增租户'
  Object.assign(formData, {
    id: undefined,
    tenantId: undefined,
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    status: 1,
    expireTime: undefined,
    remark: '',
    version: undefined,
  })
  showModal.value = true
}

const handleEdit = async (row: Tenant) => {
  modalTitle.value = '编辑租户'
  try {
    const res = await getTenantById(row.id!)
    if (res.code === 200) {
      Object.assign(formData, {
        ...res.data,
        expireTime: res.data.expireTime ? new Date(res.data.expireTime).getTime() : undefined,
      })
      showModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    const data = {
      ...formData,
      expireTime: formData.expireTime ? new Date(formData.expireTime).toISOString() : undefined,
    }

    if (formData.id) {
      await updateTenant(data)
      message.success('更新成功')
    } else {
      await createTenant(data)
      message.success('新增成功')
    }

    showModal.value = false
    getList()
    return true
  } catch (error) {
    return false
  }
}

const handleDelete = async (row: Tenant) => {
  try {
    await deleteTenant(row.id!, row.version!)
    message.success('删除成功')
    getList()
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
      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <NForm
          ref="queryFormRef"
          :model="queryParams"
          :inline="true"
          label-placement="left"
        >
          <NFormItem label="租户ID">
            <NInputNumber
              v-model:value="queryParams.tenantId"
              placeholder="租户ID"
              clearable
              :show-button="false"
            />
          </NFormItem>
          <NFormItem label="租户名称">
            <NInput
              v-model:value="queryParams.name"
              placeholder="租户名称"
              clearable
            />
          </NFormItem>
        </NForm>
        <div class="flex gap-2">
          <NButton type="success" @click="handleAdd">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新增租户
          </NButton>
          <NButton type="info" @click="handleQuery" :loading="loading" :disabled="loading">
            <template #icon>
              <span class="iconify ph--magnifying-glass" />
            </template>
            查询
          </NButton>
          <NButton type="warning" @click="handleReset">
            <template #icon>
              <span class="iconify ph--arrow-clockwise" />
            </template>
            重置
          </NButton>
        </div>
      </div>

      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :remote="true"
          :single-line="true"
        />
        <div class="mt-3 flex items-end justify-between max-xl:flex-col max-xl:gap-y-2">
          <div class="flex items-center gap-x-3">
            <span>共 {{ pagination.itemCount }} 条</span>
          </div>
          <NPagination v-bind="pagination" />
        </div>
      </div>

      <!-- 新增/编辑弹窗 -->
      <NModal
        v-model:show="showModal"
        :title="modalTitle"
        preset="dialog"
        :positive-text="'确定'"
        :negative-text="'取消'"
        @positive-click="handleSubmit"
      >
        <NForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="100"
          style="margin-top: 20px"
        >
          <NFormItem label="租户ID" path="tenantId">
            <NInputNumber
              v-model:value="formData.tenantId"
              :disabled="!!formData.id"
              placeholder="请输入租户ID"
              :show-button="false"
              style="width: 100%"
            />
          </NFormItem>
          <NFormItem label="租户名称" path="name">
            <NInput v-model:value="formData.name" placeholder="请输入租户名称" />
          </NFormItem>
          <NFormItem label="联系人" path="contactName">
            <NInput v-model:value="formData.contactName" placeholder="请输入联系人" />
          </NFormItem>
          <NFormItem label="联系电话" path="contactPhone">
            <NInput v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
          </NFormItem>
          <NFormItem label="联系邮箱" path="contactEmail">
            <NInput v-model:value="formData.contactEmail" placeholder="请输入联系邮箱" />
          </NFormItem>
          <NFormItem label="到期时间" path="expireTime">
            <NDatePicker
              v-model:value="formData.expireTime"
              type="datetime"
              clearable
              style="width: 100%"
            />
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
      </NModal>
    </NCard>
  </ScrollContainer>
</template>
