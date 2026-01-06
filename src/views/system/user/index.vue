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
  NAvatar,
  NDrawer,
  NDrawerContent,
  NCheckboxGroup,
  NCheckbox,
  NAlert,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import { ScrollContainer } from '@/components'
import { useUserStore } from '@/stores/user'
import {
  getUserPage,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignUserRoles,
  type User,
  type UserForm,
  type UserPageParams,
} from '@/api/user'
import { getRoleList, type Role } from '@/api/role'

defineOptions({
  name: 'SystemUser',
})

const message = useMessage()
const userStore = useUserStore()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref<FormInst | null>(null)
const queryFormRef = ref<FormInst | null>(null)
const showRoleDrawer = ref(false)
const savingRole = ref(false)
const roleList = ref<Role[]>([])
const checkedRoleIds = ref<number[]>([])
const currentUser = ref<Partial<User>>({})

const queryParams = reactive<Omit<UserPageParams, 'page' | 'size'>>({
  username: '',
  nickname: '',
  mobile: '',
})

const tableData = ref<User[]>([])
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

const formData = reactive<UserForm>({
  userId: '',
  username: '',
  password: '',
  nickname: '',
  mobile: '',
  email: '',
  status: 1,
  remark: '',
})

const rules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
  nickname: { required: true, message: '请输入昵称', trigger: 'blur' },
}

const columns: DataTableColumns<User> = [
  { title: '用户编码', key: 'userCode', width: 140 },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: (row) => {
      return h(
        NAvatar,
        {
          round: true,
          size: 'small',
        },
        { default: () => row.nickname?.charAt(0) || 'U' },
      )
    },
  },
  { title: '用户名', key: 'username', width: 150 },
  { title: '昵称', key: 'nickname', width: 120 },
  { title: '手机号', key: 'mobile', width: 130 },
  { title: '邮箱', key: 'email', width: 180, ellipsis: { tooltip: true } },
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
  { title: '最后登录时间', key: 'lastLoginTime', width: 160 },
  { title: '创建时间', key: 'createdTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 240,
    fixed: 'right',
    align: 'center',
    render: (row) => (
      <div class="flex gap-2">
        <NButton secondary type="primary" size="small" onClick={() => handleEdit(row)}>
          编辑
        </NButton>
        <NButton secondary type="info" size="small" onClick={() => handleAssignRole(row)}>
          分配角色
        </NButton>
        <NPopconfirm
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={() => handleDelete(row)}
        >
          {{
            default: () => '确定删除该用户吗？',
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
    const params: UserPageParams = {
      ...queryParams,
      page: pagination.page,
      size: pagination.pageSize,
    }
    const res = await getUserPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
      pagination.itemCount = res.data.total
    }
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message); // 安全访问 message
    } else {
      message.error('查询失败：未知错误');
    }
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

const handleAdd = () => {
  modalTitle.value = '新增用户'
  Object.assign(formData, {
    id: undefined,
    userId: '',
    username: '',
    password: '',
    nickname: '',
    mobile: '',
    email: '',
    status: 1,
    remark: '',
    version: undefined,
  })
  showModal.value = true
}

const handleEdit = async (row: User) => {
  modalTitle.value = '编辑用户'
  try {
    const res = await getUserById(row.id!)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      showModal.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleAssignRole = async (row: User) => {
  currentUser.value = row
  showRoleDrawer.value = true
  await Promise.all([fetchRoleList(), fetchUserRoles(row.id!)])
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

async function fetchUserRoles(id: string) {
  try {
    const res = await getUserRoles(id)
    if (res.code === 200) {
      checkedRoleIds.value = res.data || []
    }
  } catch (error) {
    message.error('获取用户角色失败')
  }
}

async function handleSaveUserRoles() {
  if (!currentUser.value.id) return
  savingRole.value = true
  try {
    const res = await assignUserRoles(currentUser.value.id, checkedRoleIds.value)
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

const handleDelete = async (row: User) => {
  try {
    await deleteUser(row.id!, row.version!)
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
          <NFormItem label="用户名">
            <NInput
              v-model:value="queryParams.username"
              placeholder="用户名"
              clearable
            />
          </NFormItem>
          <NFormItem label="昵称">
            <NInput
              v-model:value="queryParams.nickname"
              placeholder="昵称"
              clearable
            />
          </NFormItem>
          <NFormItem label="手机号">
            <NInput
              v-model:value="queryParams.mobile"
              placeholder="手机号"
              clearable
            />
          </NFormItem>
        </NForm>
        <div class="flex gap-2">
          <NButton
            v-if="userStore.hasPerm('user:create')"
            type="success"
            @click="handleAdd"
          >
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新增用户
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
          <NFormItem label="用户名" path="username">
            <NInput
              v-model:value="formData.username"
              :disabled="!!formData.userId"
              placeholder="请输入用户名"
            />
          </NFormItem>
          <NFormItem v-if="!formData.userId" label="密码" path="password">
            <NInput
              v-model:value="formData.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
            />
          </NFormItem>
          <NFormItem label="昵称" path="nickname">
            <NInput v-model:value="formData.nickname" placeholder="请输入昵称" />
          </NFormItem>
          <NFormItem label="手机号" path="mobile">
            <NInput v-model:value="formData.mobile" placeholder="请输入手机号" />
          </NFormItem>
          <NFormItem label="邮箱" path="email">
            <NInput v-model:value="formData.email" placeholder="请输入邮箱" />
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

      <!-- 分配角色抽屉 -->
      <NDrawer v-model:show="showRoleDrawer" :width="420" placement="right">
        <NDrawerContent
          :title="`为【${currentUser.nickname || currentUser.username}】分配角色`"
        >
          <NAlert type="info" :show-icon="false" style="margin-bottom: 16px">
            已选中 {{ checkedRoleIds.length }} 个角色，可以取消勾选来移除角色
          </NAlert>
          <NCheckboxGroup v-model:value="checkedRoleIds">
            <NSpace vertical>
              <NCheckbox v-for="role in roleList" :key="role.id" :value="role.id">
                <div class="flex items-center gap-2">
                  <span>{{ role.name }}</span>
                  <NTag size="tiny" type="info">{{ role.code }}</NTag>
                </div>
              </NCheckbox>
            </NSpace>
          </NCheckboxGroup>
          <template #footer>
            <NSpace justify="end">
              <NButton @click="showRoleDrawer = false">取消</NButton>
              <NButton type="primary" @click="handleSaveUserRoles" :loading="savingRole">
                保存
              </NButton>
            </NSpace>
          </template>
        </NDrawerContent>
      </NDrawer>
    </NCard>
  </ScrollContainer>
</template>
