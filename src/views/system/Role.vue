<template>
  <div class="page-card">
    <n-card title="角色管理" :bordered="false">
      <template #header-extra>
        <n-button type="primary" size="small" @click="handleCreate">新增角色</n-button>
      </template>

      <n-data-table :columns="columns" :data="tableData" :loading="loading" />
    </n-card>

    <n-modal v-model:show="showModal" preset="dialog" :title="modalTitle" :mask-closable="false">
      <n-form :model="form" :label-width="80" label-placement="left">
        <n-form-item label="角色编码">
          <n-input v-model:value="form.code" placeholder="例如 ADMIN" :disabled="!!form.id" />
        </n-form-item>
        <n-form-item label="角色名称">
          <n-input v-model:value="form.name" placeholder="例如 管理员" />
        </n-form-item>
        <n-form-item label="数据范围">
          <n-select v-model:value="form.dataScope" :options="dataScopeOptions" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="form.sort" :min="0" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="form.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="form.remark" type="textarea" />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="saving">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-drawer v-model:show="showPermDrawer" :width="420" placement="right">
      <n-drawer-content title="分配菜单权限">
        <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
          已选中 {{ checkedMenuIds.length }} 个菜单/按钮，可以取消勾选来移除权限
        </n-alert>
        <n-tree
          block-line
          checkable
          cascade
          check-strategy="all"
          :data="menuTree"
          :checked-keys="checkedMenuIds"
          key-field="id"
          label-field="name"
          children-field="children"
          @update:checked-keys="onCheckedMenuChange"
        />
        <template #footer>
          <n-space justify="end">
            <n-button @click="showPermDrawer = false">取消</n-button>
            <n-button type="primary" @click="handleSaveRoleMenus" :loading="savingPerm">保存</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NSpace,
  NDrawer,
  NDrawerContent,
  NTree,
  NAlert
} from 'naive-ui'
import { getRoleList, createRole, updateRole, deleteRole, getRoleMenus, assignRoleMenus } from '@/api/role'
import { getMenuTree } from '@/api/menu'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const tableData = ref([])

const showModal = ref(false)
const modalTitle = ref('')
const saving = ref(false)
const form = reactive({
  id: null,
  code: '',
  name: '',
  dataScope: 0,
  sort: 0,
  status: 1,
  isSystem: 0,
  remark: '',
  version: null
})

const dataScopeOptions = [
  { label: '全部数据', value: 0 },
  { label: '本部门', value: 1 },
  { label: '本部门及子部门', value: 2 },
  { label: '仅本人', value: 3 }
]

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '编码', key: 'code', width: 120 },
  { title: '名称', key: 'name', minWidth: 150 },
  {
    title: '数据范围',
    key: 'dataScope',
    render(row) {
      const map = {
        0: '全部数据',
        1: '本部门',
        2: '本部门及子部门',
        3: '仅本人'
      }
      return map[row.dataScope] ?? row.dataScope
    }
  },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return row.status === 1 ? '启用' : '禁用'
    }
  },
  { title: '备注', key: 'remark', minWidth: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    render(row) {
      return [
        h(NButton, { quaternary: true, size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { quaternary: true, size: 'small', onClick: () => openPermDrawer(row) }, { default: () => '分配菜单' }),
        h(
          NButton,
          { quaternary: true, size: 'small', type: 'error', onClick: () => handleDelete(row) },
          { default: () => '删除' }
        )
      ]
    }
  }
]

async function fetchRoles() {
  loading.value = true
  try {
    const res = await getRoleList()
    if (res.code === 200) {
      tableData.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = null
  form.code = ''
  form.name = ''
  form.dataScope = 0
  form.sort = 0
  form.status = 1
  form.isSystem = 0
  form.remark = ''
  form.version = null
}

function handleCreate() {
  resetForm()
  modalTitle.value = '新增角色'
  showModal.value = true
}

function handleEdit(row) {
  Object.assign(form, row)
  modalTitle.value = '编辑角色'
  showModal.value = true
}

async function handleSubmit() {
  if (!form.code || !form.name) {
    message.warning('请填写角色编码和名称')
    return
  }
  saving.value = true
  try {
    if (form.id) {
      const res = await updateRole(form)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        fetchRoles()
      }
    } else {
      const res = await createRole(form)
      if (res.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchRoles()
      }
    }
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  dialog.warning({
    title: '提示',
    content: `确定删除角色【${row.name}】吗？`,
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      const res = await deleteRole(row.id, row.version)
      if (res.code === 200) {
        message.success('删除成功')
        fetchRoles()
      }
    }
  })
}

// 分配菜单
const showPermDrawer = ref(false)
const currentRoleId = ref(null)
const menuTree = ref([])
const checkedMenuIds = ref([])
const savingPerm = ref(false)

async function openPermDrawer(row) {
  currentRoleId.value = row.id
  showPermDrawer.value = true
  await Promise.all([fetchMenuTree(), fetchRoleMenus(row.id)])
}

async function fetchMenuTree() {
  const res = await getMenuTree()
  if (res.code === 200) {
    menuTree.value = res.data || []
  }
}

async function fetchRoleMenus(roleId) {
  const res = await getRoleMenus(roleId)
  if (res.code === 200) {
    checkedMenuIds.value = res.data || []
  }
}

function onCheckedMenuChange(keys) {
  checkedMenuIds.value = keys
}

async function handleSaveRoleMenus() {
  if (!currentRoleId.value) return
  savingPerm.value = true
  try {
    const res = await assignRoleMenus(currentRoleId.value, checkedMenuIds.value)
    if (res.code === 200) {
      message.success('权限保存成功')
      showPermDrawer.value = false
    }
  } finally {
    savingPerm.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.page-card {
  height: 100%;
}
</style>
