<template>
  <n-card title="租户管理" :bordered="false">
    <!-- 搜索栏 -->
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="queryParams.tenantId"
          placeholder="租户ID"
          clearable
          style="width: 200px"
        />
        <n-input
          v-model:value="queryParams.name"
          placeholder="租户名称"
          clearable
          style="width: 200px"
        />
        <n-button type="primary" @click="handleQuery">
          <template #icon><n-icon><search-outline /></n-icon></template>
          查询
        </n-button>
        <n-button @click="handleReset">
          <template #icon><n-icon><refresh-outline /></n-icon></template>
          重置
        </n-button>
        <n-button type="success" @click="handleAdd">
          <template #icon><n-icon><add-outline /></n-icon></template>
          新增
        </n-button>
      </n-space>

      <!-- 表格 -->
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-space>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      :title="modalTitle"
      preset="dialog"
      :positive-text="'确定'"
      :negative-text="'取消'"
      @positive-click="handleSubmit"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100"
        style="margin-top: 20px"
      >
        <n-form-item label="租户ID" path="tenantId">
          <n-input-number v-model:value="formData.tenantId" :disabled="!!formData.id" placeholder="请输入租户ID" :show-button="false" style="width: 100%" />
        </n-form-item>
        <n-form-item label="租户名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入租户名称" />
        </n-form-item>
        <n-form-item label="联系人" path="contactName">
          <n-input v-model:value="formData.contactName" placeholder="请输入联系人" />
        </n-form-item>
        <n-form-item label="联系电话" path="contactPhone">
          <n-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="联系邮箱" path="contactEmail">
          <n-input v-model:value="formData.contactEmail" placeholder="请输入联系邮箱" />
        </n-form-item>
        <n-form-item label="到期时间" path="expireTime">
          <n-date-picker
            v-model:value="formData.expireTime"
            type="datetime"
            clearable
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            placeholder="请输入备注"
          />
        </n-form-item>
      </n-form>
    </n-modal>
  </n-card>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  NCard,
  NSpace,
  NInput,
  NButton,
  NIcon,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NDatePicker,
  NInputNumber,
  NSwitch,
  NTag,
  NPopconfirm
} from 'naive-ui'
import { SearchOutline, RefreshOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { getTenantPage, getTenantById, createTenant, updateTenant, deleteTenant } from '@/api/tenant'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增租户')
const formRef = ref(null)

const queryParams = reactive({
  tenantId: null,
  name: '',
  current: 1,
  size: 10
})

const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

const formData = reactive({
  id: null,
  tenantId: null,
  name: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  status: 1,
  expireTime: null,
  remark: '',
  version: null
})

const rules = {
  tenantId: { required: true, message: '请输入租户ID', trigger: 'blur', type: 'number' },
  name: { required: true, message: '请输入租户名称', trigger: 'blur' }
}

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '租户ID', key: 'tenantId', width: 150 },
  { title: '租户名称', key: 'name', width: 150 },
  { title: '联系人', key: 'contactName', width: 100 },
  { title: '联系电话', key: 'contactPhone', width: 130 },
  { title: '联系邮箱', key: 'contactEmail', width: 180 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, {
        default: () => row.status === 1 ? '启用' : '禁用'
      })
    }
  },
  { title: '到期时间', key: 'expireTime', width: 160 },
  { title: '创建时间', key: 'createdTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            text: true,
            onClick: () => handleEdit(row)
          }, { default: () => '编辑', icon: () => h(NIcon, {}, { default: () => h(CreateOutline) }) }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              text: true
            }, { default: () => '删除', icon: () => h(NIcon, {}, { default: () => h(TrashOutline) }) }),
            default: () => '确定删除该租户吗？'
          })
        ]
      })
    }
  }
]

const getList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      current: pagination.page,
      size: pagination.pageSize
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
  queryParams.tenantId = null
  queryParams.name = ''
  handleQuery()
}

const handlePageChange = (page) => {
  pagination.page = page
  getList()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  getList()
}

const handleAdd = () => {
  modalTitle.value = '新增租户'
  Object.assign(formData, {
    id: null,
    tenantId: null,
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    status: 1,
    expireTime: null,
    remark: '',
    version: null
  })
  showModal.value = true
}

const handleEdit = async (row) => {
  modalTitle.value = '编辑租户'
  try {
    const res = await getTenantById(row.id)
    if (res.code === 200) {
      Object.assign(formData, {
        ...res.data,
        expireTime: res.data.expireTime ? new Date(res.data.expireTime).getTime() : null
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
      expireTime: formData.expireTime ? new Date(formData.expireTime).toISOString() : null
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

const handleDelete = async (row) => {
  try {
    await deleteTenant(row.id, row.version)
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
