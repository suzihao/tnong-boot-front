<script setup lang="tsx">
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
  NAlert,
  NTag,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type TreeOption,
} from 'naive-ui'
import { ref, reactive, h, onMounted, computed } from 'vue'

import { getMenuTree, type MenuItem } from '@/api/menu'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  assignRoleMenus,
  type Role,
} from '@/api/role'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemRole',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增角色')
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const tableData = ref<Role[]>([])

const formData = reactive<Partial<Role>>({
  code: '',
  name: '',
  dataScope: 0,
  sort: 0,
  status: 1,
  isSystem: 0,
  remark: '',
})

const rules: FormRules = {
  code: { required: true, message: '请输入角色编码', trigger: 'blur' },
  name: { required: true, message: '请输入角色名称', trigger: 'blur' },
}

const dataScopeOptions = [
  { label: '全部数据', value: 0 },
  { label: '本部门', value: 1 },
  { label: '本部门及子部门', value: 2 },
  { label: '仅本人', value: 3 },
]

const columns: DataTableColumns<Role> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '编码', key: 'code', width: 120 },
  { title: '名称', key: 'name', width: 150 },
  {
    title: '数据范围',
    key: 'dataScope',
    width: 150,
    render: (row) => {
      const map: Record<number, string> = {
        0: '全部数据',
        1: '本部门',
        2: '本部门及子部门',
        3: '仅本人',
      }
      return map[row.dataScope ?? 0] ?? row.dataScope
    },
  },
  { title: '排序', key: 'sort', width: 80 },
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
  { title: '备注', key: 'remark', minWidth: 180, ellipsis: { tooltip: true } },
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
        <NButton secondary type="info" size="small" onClick={() => openPermDrawer(row)}>
          分配菜单
        </NButton>
        <NPopconfirm
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={() => handleDelete(row)}
        >
          {{
            default: () => `确定删除角色【${row.name}】吗？`,
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

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await getRoleList()
    if (res.code === 200) {
      tableData.value = res.data || []
    }
  } catch (error) {
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    code: '',
    name: '',
    dataScope: 0,
    sort: 0,
    status: 1,
    isSystem: 0,
    remark: '',
    version: undefined,
  })
}

const handleCreate = () => {
  resetForm()
  modalTitle.value = '新增角色'
  showModal.value = true
}

const handleEdit = (row: Role) => {
  Object.assign(formData, row)
  modalTitle.value = '编辑角色'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateRole(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        fetchRoles()
      }
    } else {
      const res = await createRole(formData)
      if (res.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchRoles()
      }
    }
    return true
  } catch (error) {
    return false
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: Role) => {
  try {
    const res = await deleteRole(row.id, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      fetchRoles()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 分配菜单
const showPermDrawer = ref(false)
const currentRoleId = ref<number | null>(null)
const menuTree = ref<TreeOption[]>([])
const checkedMenuIds = ref<number[]>([])
const savingPerm = ref(false)

const openPermDrawer = async (row: Role) => {
  currentRoleId.value = row.id
  showPermDrawer.value = true
  await Promise.all([fetchMenuTree(), fetchRoleMenus(row.id)])
}

const fetchMenuTree = async () => {
  try {
    const res = await getMenuTree()
    if (res.code === 200) {
      menuTree.value = convertToTreeOptions(res.data || [])
    }
  } catch (error) {
    message.error('获取菜单树失败')
  }
}

const convertToTreeOptions = (menus: MenuItem[]): TreeOption[] => {
  return menus.map((menu) => ({
    key: menu.id,
    label: menu.name,
    children: menu.children ? convertToTreeOptions(menu.children) : undefined,
  }))
}

const fetchRoleMenus = async (roleId: number) => {
  try {
    const res = await getRoleMenus(roleId)
    if (res.code === 200) {
      checkedMenuIds.value = res.data || []
    }
  } catch (error) {
    message.error('获取角色菜单失败')
  }
}

const onCheckedMenuChange = (keys: Array<string | number>) => {
  checkedMenuIds.value = keys as number[]
}

const handleSaveRoleMenus = async () => {
  if (!currentRoleId.value) return
  savingPerm.value = true
  try {
    const res = await assignRoleMenus(currentRoleId.value, checkedMenuIds.value)
    if (res.code === 200) {
      message.success('权限保存成功')
      showPermDrawer.value = false
    }
  } catch (error) {
    message.error('权限保存失败')
  } finally {
    savingPerm.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <ScrollContainer wrapper-class="flex flex-col gap-y-2">
    <NCard class="flex-1" content-class="flex flex-col">
      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <div class="flex gap-2">
          <NButton type="success" @click="handleCreate">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新增角色
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
          <NFormItem label="角色编码" path="code">
            <NInput
              v-model:value="formData.code"
              :disabled="!!formData.id"
              placeholder="例如 ADMIN"
            />
          </NFormItem>
          <NFormItem label="角色名称" path="name">
            <NInput v-model:value="formData.name" placeholder="例如 管理员" />
          </NFormItem>
          <NFormItem label="数据范围" path="dataScope">
            <NSelect v-model:value="formData.dataScope" :options="dataScopeOptions" />
          </NFormItem>
          <NFormItem label="排序" path="sort">
            <NInputNumber v-model:value="formData.sort" :min="0" style="width: 100%" />
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

      <!-- 分配菜单抽屉 -->
      <NDrawer v-model:show="showPermDrawer" :width="420" placement="right">
        <NDrawerContent title="分配菜单权限">
          <NAlert type="info" :show-icon="false" style="margin-bottom: 16px">
            已选中 {{ checkedMenuIds.length }} 个菜单/按钮
          </NAlert>
          <NTree
            block-line
            checkable
            cascade
            :data="menuTree"
            :checked-keys="checkedMenuIds"
            key-field="key"
            label-field="label"
            children-field="children"
            @update:checked-keys="onCheckedMenuChange"
          />
          <template #footer>
            <NSpace justify="end">
              <NButton @click="showPermDrawer = false">取消</NButton>
              <NButton type="primary" @click="handleSaveRoleMenus" :loading="savingPerm">
                保存
              </NButton>
            </NSpace>
          </template>
        </NDrawerContent>
      </NDrawer>
    </NCard>
  </ScrollContainer>
</template>
