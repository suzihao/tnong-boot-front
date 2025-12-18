<template>
  <n-card title="用户管理" :bordered="false">
    <!-- 搜索栏 -->
    <n-space vertical :size="16">
      <n-space>
        <n-input
          v-model:value="queryParams.username"
          placeholder="用户名"
          clearable
          style="width: 200px"
        />
        <n-input
          v-model:value="queryParams.nickname"
          placeholder="昵称"
          clearable
          style="width: 200px"
        />
        <n-input
          v-model:value="queryParams.mobile"
          placeholder="手机号"
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
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="formData.username" :disabled="!!formData.id" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item v-if="!formData.id" label="密码" path="password">
          <n-input v-model:value="formData.password" type="password" show-password-on="click" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item label="昵称" path="nickname">
          <n-input v-model:value="formData.nickname" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="手机号" path="mobile">
          <n-input v-model:value="formData.mobile" placeholder="请输入手机号" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="formData.email" placeholder="请输入邮箱" />
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
import { useMessage } from 'naive-ui'
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
  NSwitch,
  NTag,
  NPopconfirm,
  NAvatar
} from 'naive-ui'
import { SearchOutline, RefreshOutline, AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { getUserPage, getUserById, createUser, updateUser, deleteUser } from '@/api/user'

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref(null)

const queryParams = reactive({
  username: '',
  nickname: '',
  mobile: '',
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
  username: '',
  password: '',
  nickname: '',
  mobile: '',
  email: '',
  status: 1,
  remark: '',
  version: null
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
  nickname: { required: true, message: '请输入昵称', trigger: 'blur' }
}

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: (row) => {
      return h(NAvatar, {
        round: true,
        size: 'small'
      }, { default: () => row.nickname?.charAt(0) || 'U' })
    }
  },
  { title: '用户名', key: 'username', width: 150 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '手机号', key: 'mobile', width: 130 },
  { title: '邮箱', key: 'email', width: 180 },
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
  { title: '最后登录时间', key: 'lastLoginTime', width: 160 },
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
            default: () => '确定删除该用户吗？'
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
    const res = await getUserPage(params)
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
  queryParams.username = ''
  queryParams.nickname = ''
  queryParams.mobile = ''
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
  modalTitle.value = '新增用户'
  Object.assign(formData, {
    id: null,
    username: '',
    password: '',
    nickname: '',
    mobile: '',
    email: '',
    status: 1,
    remark: '',
    version: null
  })
  showModal.value = true
}

const handleEdit = async (row) => {
  modalTitle.value = '编辑用户'
  try {
    const res = await getUserById(row.id)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      showModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    if (formData.id) {
      await updateUser(formData)
      message.success('更新成功')
    } else {
      await createUser(formData)
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
    await deleteUser(row.id, row.version)
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
