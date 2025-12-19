<template>
  <div class="page-card">
    <n-card title="菜单管理" :bordered="false">
      <template #header-extra>
        <n-button type="primary" size="small" @click="handleCreate">新增菜单</n-button>
      </template>

      <n-data-table
        :columns="tableColumns"
        :data="menuTree"
        :pagination="false"
        size="small"
        default-expand-all
      />
    </n-card>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="dialog" :title="modalTitle" style="width: 600px">
      <n-form :model="editForm" :label-width="90" label-placement="left" style="margin-top: 16px">
        <n-form-item label="上级菜单">
          <n-tree-select
            v-model:value="editForm.parentId"
            :options="parentTreeOptions"
            clearable
            placeholder="根级菜单"
            key-field="id"
            label-field="name"
            children-field="children"
          />
        </n-form-item>
        <n-form-item label="类型">
          <n-radio-group v-model:value="editForm.type">
            <n-space>
              <n-radio :value="1"><n-tag type="info" size="small">目录</n-tag></n-radio>
              <n-radio :value="2"><n-tag type="success" size="small">菜单</n-tag></n-radio>
              <n-radio :value="3"><n-tag type="warning" size="small">按钮</n-tag></n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="名称">
          <n-input v-model:value="editForm.name" placeholder="请输入菜单名称" />
        </n-form-item>
        <n-form-item label="路由路径" v-if="editForm.type !== 3">
          <n-input v-model:value="editForm.path" placeholder="例如 /user" />
        </n-form-item>
        <n-form-item label="组件路径" v-if="editForm.type === 2">
          <n-input v-model:value="editForm.component" placeholder="例如 system/User" />
        </n-form-item>
        <n-form-item label="权限标识" v-if="editForm.type === 3">
          <n-input v-model:value="editForm.perms" placeholder="例如 user:create" />
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="editForm.icon" placeholder="可选" />
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="editForm.sort" :min="0" style="width: 100%" />
        </n-form-item>
        <n-form-item label="是否可见" v-if="editForm.type !== 3">
          <n-switch v-model:value="editForm.visible" :checked-value="1" :unchecked-value="0">
            <template #checked>显示</template>
            <template #unchecked>隐藏</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="editForm.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="editForm.remark" type="textarea" placeholder="可选" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleModalSubmit" :loading="saving">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  NCard,
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NRadioGroup,
  NRadio,
  NSpace,
  NTag,
  NModal,
  NIcon,
  NTreeSelect,
  useMessage,
  useDialog
} from 'naive-ui'
import { FolderOutline, DocumentOutline, RadioButtonOnOutline } from '@vicons/ionicons5'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const message = useMessage()
const dialog = useDialog()

const menuTree = ref([])
const saving = ref(false)
const showEditModal = ref(false)
const modalTitle = ref('')

const editForm = reactive({
  id: null,
  parentId: 0,
  type: 1,
  name: '',
  path: '',
  component: '',
  perms: '',
  icon: '',
  sort: 0,
  visible: 1,
  status: 1,
  remark: '',
  version: null
})

const parentTreeOptions = computed(() => {
  const buildTree = (nodes) => {
    return nodes.filter(n => n.type !== 3).map(n => ({
      id: n.id,
      name: n.name,
      children: n.children ? buildTree(n.children) : []
    }))
  }
  return [{ id: 0, name: '根级菜单', children: buildTree(menuTree.value) }]
})

const tableColumns = [
  {
    title: '菜单名称',
    key: 'name',
    width: 250,
    tree: true,
    render: (row) => {
      const icons = { 1: FolderOutline, 2: DocumentOutline, 3: RadioButtonOnOutline }
      return [
        h(NIcon, { size: 16, style: 'margin-right: 6px; vertical-align: middle' }, { default: () => h(icons[row.type]) }),
        row.name,
        row.type === 3 && row.perms ? h(NTag, { size: 'tiny', type: 'warning', style: 'margin-left: 8px' }, { default: () => row.perms }) : null
      ]
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render: (row) => {
      const types = {
        1: { text: '目录', type: 'info' },
        2: { text: '菜单', type: 'success' },
        3: { text: '按钮', type: 'warning' }
      }
      return h(NTag, { type: types[row.type].type, size: 'small' }, { default: () => types[row.type].text })
    }
  },
  { title: '路径', key: 'path', width: 150 },
  { title: '排序', key: 'sort', width: 70 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => h(NTag, { type: row.status === 1 ? 'success' : 'error', size: 'small' }, {
      default: () => row.status === 1 ? '启用' : '禁用'
    })
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => h(NSpace, {}, {
      default: () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' })
      ]
    })
  }
]

async function fetchMenuTree() {
  const res = await getMenuTree()
  if (res.code === 200) {
    menuTree.value = res.data || []
  }
}

function resetEditForm() {
  editForm.id = null
  editForm.parentId = 0
  editForm.type = 1
  editForm.name = ''
  editForm.path = ''
  editForm.component = ''
  editForm.perms = ''
  editForm.icon = ''
  editForm.sort = 0
  editForm.visible = 1
  editForm.status = 1
  editForm.remark = ''
  editForm.version = null
}

function handleCreate() {
  resetEditForm()
  modalTitle.value = '新增菜单'
  showEditModal.value = true
}

function handleEdit(row) {
  Object.assign(editForm, row)
  modalTitle.value = '编辑菜单'
  showEditModal.value = true
}

function handleDelete(row) {
  dialog.warning({
    title: '提示',
    content: `确定删除菜单【${row.name}】吗？`,
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      const res = await deleteMenu(row.id, row.version)
      if (res.code === 200) {
        message.success('删除成功')
        fetchMenuTree()
      }
    }
  })
}

async function handleModalSubmit() {
  if (!editForm.name) {
    message.warning('请填写菜单名称')
    return
  }
  if (editForm.type !== 3 && !editForm.path) {
    message.warning('目录/菜单需要配置路由路径')
    return
  }
  if (editForm.type === 3 && !editForm.perms) {
    message.warning('按钮需要配置权限标识')
    return
  }
  saving.value = true
  try {
    if (editForm.id) {
      const res = await updateMenu(editForm)
      if (res.code === 200) {
        message.success('更新成功')
        showEditModal.value = false
        fetchMenuTree()
      }
    } else {
      const res = await createMenu(editForm)
      if (res.code === 200) {
        message.success('新增成功')
        showEditModal.value = false
        fetchMenuTree()
      }
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMenuTree()
})
</script>

<style scoped>
.page-card {
  height: 100%;
}
</style>
