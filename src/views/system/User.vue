<template>
  <n-card :bordered="false" class="user-card">
    <template #header>
      <div class="user-card-header">
        <div class="user-card-title">
          <div>
            <div class="user-card-title-main">用户管理</div>
            <div class="user-card-title-sub">管理系统中的用户信息与权限</div>
          </div>
        </div>
        <n-space :size="12" align="center">
          <div class="user-card-meta">共 {{ pagination.itemCount }} 个用户</div>
          <n-button v-perm="'user:create'" type="primary" size="small" @click="handleAdd">
            <template #icon><n-icon><add-outline /></n-icon></template>
            新增用户
          </n-button>
        </n-space>
      </div>
    </template>
    
    <!-- 搜索栏 -->
    <div class="user-toolbar">
      <n-space :size="12" wrap>
        <n-input
          v-model:value="queryParams.username"
          placeholder="用户名"
          clearable
          size="small"
          style="width: 200px"
        />
        <n-input
          v-model:value="queryParams.nickname"
          placeholder="昵称"
          clearable
          size="small"
          style="width: 200px"
        />
        <n-input
          v-model:value="queryParams.mobile"
          placeholder="手机号"
          clearable
          size="small"
          style="width: 200px"
        />
        <n-button type="primary" size="small" @click="handleQuery">
          <template #icon><n-icon><search-outline /></n-icon></template>
          查询
        </n-button>
        <n-button size="small" @click="handleReset">
          <template #icon><n-icon><refresh-outline /></n-icon></template>
          重置
        </n-button>
      </n-space>
    </div>

    <!-- 表格 -->
    <n-data-table
      class="user-table"
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :bordered="false"
      :single-line="false"
      :striped="false"
      size="small"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />

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

    <!-- 分配角色抽屉 -->
    <n-drawer v-model:show="showRoleDrawer" :width="420" placement="right">
      <n-drawer-content :title="`为【${currentUser.nickname || currentUser.username}】分配角色`">
        <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
          已选中 {{ checkedRoleIds.length }} 个角色，可以取消勾选来移除角色
        </n-alert>
        <n-checkbox-group v-model:value="checkedRoleIds">
          <n-space vertical>
            <n-checkbox v-for="role in roleList" :key="role.id" :value="role.id" :label="role.name">
              <div style="display: flex; align-items: center; gap: 8px">
                <span>{{ role.name }}</span>
                <n-tag size="tiny" type="info">{{ role.code }}</n-tag>
              </div>
            </n-checkbox>
          </n-space>
        </n-checkbox-group>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showRoleDrawer = false">取消</n-button>
            <n-button type="primary" @click="handleSaveUserRoles" :loading="savingRole">保存</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
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
  NAvatar,
  NDrawer,
  NDrawerContent,
  NCheckboxGroup,
  NCheckbox,
  NAlert
} from 'naive-ui'
import { SearchOutline, RefreshOutline, AddOutline, CreateOutline, TrashOutline, PeopleOutline } from '@vicons/ionicons5'
import { getUserPage, getUserById, createUser, updateUser, deleteUser, getUserRoles, assignUserRoles } from '@/api/user'
import { getRoleList } from '@/api/role'

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref(null)
const showRoleDrawer = ref(false)
const savingRole = ref(false)
const roleList = ref([])
const checkedRoleIds = ref([])
const currentUser = ref({})

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
  userId: '',
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
  { title: '用户ID', key: 'userId', width: 140 },
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
    width: 200,
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
          h(NButton, {
            size: 'small',
            type: 'info',
            text: true,
            onClick: () => handleAssignRole(row)
          }, { default: () => '分配角色', icon: () => h(NIcon, {}, { default: () => h(PeopleOutline) }) }),
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
    const res = await getUserById(row.userId)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      showModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleAssignRole = async (row) => {
  currentUser.value = row
  showRoleDrawer.value = true
  await Promise.all([fetchRoleList(), fetchUserRoles(row.userId)])
}

async function fetchRoleList() {
  try {
    const res = await getRoleList()
    if (res.code === 200) {
      roleList.value = res.data || []
    }
  } catch (error) {
    message.error('获取角色列表失败')
  }
}

async function fetchUserRoles(userId) {
  try {
    const res = await getUserRoles(userId)
    if (res.code === 200) {
      checkedRoleIds.value = res.data || []
    }
  } catch (error) {
    message.error('获取用户角色失败')
  }
}

async function handleSaveUserRoles() {
  if (!currentUser.value.userId) return
  savingRole.value = true
  try {
    const res = await assignUserRoles(currentUser.value.userId, checkedRoleIds.value)
    if (res.code === 200) {
      message.success('分配角色成功')
      showRoleDrawer.value = false
    }
  } catch (error) {
    message.error('分配角色失败')
  } finally {
    savingRole.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    if (formData.userId) {
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
    await deleteUser(row.userId, row.version)
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

<style scoped>
.user-card {
  padding: 0;
}

.user-card :deep(.n-card__content) {
  padding: 0 16px 16px;
}

.user-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}

.user-card-title {
  display: flex;
  align-items: center;
}

.user-card-title-main {
  font-size: 16px;
  font-weight: 600;
}

.user-card-title-sub {
  font-size: 12px;
  color: #999;
}

.user-toolbar {
  padding: 0 0 12px;
}

.user-table :deep(.n-data-table-th__title) {
  font-size: 13px;
  color: #666;
}

.user-table :deep(.n-data-table-td) {
  font-size: 13px;
}

.user-table :deep(.n-data-table-tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-table :deep(.n-data-table-th),
.user-table :deep(.n-data-table-td) {
  border-right: none !important;
}
</style>
