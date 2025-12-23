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
  NSwitch,
  NRadioGroup,
  NRadio,
  NSpace,
  NTag,
  NTreeSelect,
  NPopconfirm,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type TreeSelectOption,
} from 'naive-ui'
import { ref, reactive, onMounted, computed } from 'vue'

import { ScrollContainer } from '@/components'
import {
  getMenuTree,
  createMenu,
  updateMenu,
  deleteMenu,
  type MenuItem,
  type MenuForm,
} from '@/api/menu'

defineOptions({
  name: 'SystemMenu',
})

const message = useMessage()

const menuTree = ref<MenuItem[]>([])
const loading = ref(false)
const saving = ref(false)
const showEditModal = ref(false)
const modalTitle = ref('新增菜单')
const formRef = ref<FormInst | null>(null)

const editForm = reactive<MenuForm>({
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
})

const parentTreeOptions = computed<TreeSelectOption[]>(() => {
  const buildTree = (nodes: MenuItem[]): TreeSelectOption[] => {
    return nodes
      .filter((n) => n.type !== 3)
      .map((n) => ({
        key: n.id,
        label: n.name,
        children: n.children ? buildTree(n.children) : undefined,
      }))
  }
  return [{ key: 0, label: '根级菜单', children: buildTree(menuTree.value) }]
})

const columns: DataTableColumns<MenuItem> = [
  {
    key: 'name',
    title: '菜单名称',
    width: 200,
  },
  {
    key: 'type',
    title: '类型',
    width: 80,
    render: (row) => {
      const typeMap: Record<number, string> = {
        1: '目录',
        2: '菜单',
        3: '按钮',
      }
      return typeMap[row.type] || row.type
    },
  },
  {
    key: 'path',
    title: '路径',
    width: 150,
  },
  {
    key: 'component',
    title: '组件',
    width: 150,
  },
  {
    key: 'perms',
    title: '权限标识',
    width: 150,
  },
  {
    key: 'sort',
    title: '排序',
    width: 80,
  },
  {
    key: 'status',
    title: '状态',
    width: 80,
  },
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
            default: () => `确定删除菜单【${row.name}】吗？`,
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

async function fetchMenuTree() {
  loading.value = true
  try {
    const res = await getMenuTree()
    if (res.code === 200) {
      menuTree.value = res.data || []
    }
  } catch (error) {
    message.error('获取菜单树失败')
  } finally {
    loading.value = false
  }
}

function resetEditForm() {
  Object.assign(editForm, {
    id: undefined,
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
    version: undefined,
  })
}

function handleCreate() {
  resetEditForm()
  modalTitle.value = '新增菜单'
  showEditModal.value = true
}

function handleEdit(row: MenuItem) {
  Object.assign(editForm, row)
  modalTitle.value = '编辑菜单'
  showEditModal.value = true
}

async function handleDelete(row: MenuItem) {
  try {
    const res = await deleteMenu(row.id, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      fetchMenuTree()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

async function handleModalSubmit() {
  try {
    await formRef.value?.validate()

    if (!editForm.name) {
      message.warning('请填写菜单名称')
      return false
    }
    if (editForm.type !== 3 && !editForm.path) {
      message.warning('目录/菜单需要配置路由路径')
      return false
    }
    if (editForm.type === 3 && !editForm.perms) {
      message.warning('按钮需要配置权限标识')
      return false
    }

    saving.value = true
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
    return true
  } catch (error) {
    return false
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMenuTree()
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
            新增菜单
          </NButton>
        </div>
      </div>

      <div class="flex flex-1 flex-col">
        <NDataTable
          class="flex-1"
          :columns="columns"
          :data="menuTree"
          :row-key="(row: MenuItem) => row.id"
          :pagination="false"
          :loading="loading"
          :single-line="true"
          default-expand-all
        />
      </div>

      <!-- 编辑弹窗 -->
      <NModal
        v-model:show="showEditModal"
        :title="modalTitle"
        preset="dialog"
        :mask-closable="false"
        style="width: 600px"
      >
        <NForm
          ref="formRef"
          :model="editForm"
          label-placement="left"
          label-width="100"
          style="margin-top: 20px"
        >
          <NFormItem label="上级菜单">
            <NTreeSelect
              v-model:value="editForm.parentId"
              :options="parentTreeOptions"
              clearable
              placeholder="根级菜单"
              key-field="key"
              label-field="label"
              children-field="children"
            />
          </NFormItem>
          <NFormItem label="类型">
            <NRadioGroup v-model:value="editForm.type">
              <NSpace>
                <NRadio :value="1">
                  <NTag type="info" size="small">目录</NTag>
                </NRadio>
                <NRadio :value="2">
                  <NTag type="success" size="small">菜单</NTag>
                </NRadio>
                <NRadio :value="3">
                  <NTag type="warning" size="small">按钮</NTag>
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItem>
          <NFormItem label="名称">
            <NInput v-model:value="editForm.name" placeholder="请输入菜单名称" />
          </NFormItem>
          <NFormItem label="路由路径" v-if="editForm.type !== 3">
            <NInput v-model:value="editForm.path" placeholder="例如 /user" />
          </NFormItem>
          <NFormItem label="组件路径" v-if="editForm.type === 2">
            <NInput v-model:value="editForm.component" placeholder="例如 system/User" />
          </NFormItem>
          <NFormItem label="权限标识" v-if="editForm.type === 3">
            <NInput v-model:value="editForm.perms" placeholder="例如 user:create" />
          </NFormItem>
          <NFormItem label="图标">
            <NInput v-model:value="editForm.icon" placeholder="可选" />
          </NFormItem>
          <NFormItem label="排序">
            <NInputNumber v-model:value="editForm.sort" :min="0" style="width: 100%" />
          </NFormItem>
          <NFormItem label="是否可见" v-if="editForm.type !== 3">
            <NSwitch v-model:value="editForm.visible" :checked-value="1" :unchecked-value="0">
              <template #checked>显示</template>
              <template #unchecked>隐藏</template>
            </NSwitch>
          </NFormItem>
          <NFormItem label="状态">
            <NSwitch v-model:value="editForm.status" :checked-value="1" :unchecked-value="0">
              <template #checked>启用</template>
              <template #unchecked>禁用</template>
            </NSwitch>
          </NFormItem>
          <NFormItem label="备注">
            <NInput
              v-model:value="editForm.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="可选"
            />
          </NFormItem>
        </NForm>
        <template #action>
          <NSpace justify="end">
            <NButton @click="showEditModal = false">取消</NButton>
            <NButton type="primary" @click="handleModalSubmit" :loading="saving">保存</NButton>
          </NSpace>
        </template>
      </NModal>
    </NCard>
  </ScrollContainer>
</template>
