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
  NTag,
  NPopconfirm,
  NTreeSelect,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { ref, reactive, h, onMounted, computed } from 'vue'

import {
  getDeptList,
  getDeptTree,
  createDept,
  updateDept,
  deleteDept,
  type Dept,
  type DeptTree,
  type DeptForm,
} from '@/api/dept'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemDept',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增部门')
const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const tableData = ref<Dept[]>([])
const deptTreeOptions = ref<any[]>([])

const formData = reactive<DeptForm>({
  parentId: 0,
  name: '',
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: 1,
  remark: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入部门名称', trigger: 'blur' },
}

const columns: DataTableColumns<Dept> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '部门名称', key: 'name', width: 200 },
  { title: '负责人', key: 'leader', width: 120 },
  { title: '联系电话', key: 'phone', width: 140 },
  { title: '邮箱', key: 'email', width: 180, ellipsis: { tooltip: true } },
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
  { title: '备注', key: 'remark', minWidth: 150, ellipsis: { tooltip: true } },
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
            default: () => `确定删除部门【${row.name}】吗？`,
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

const fetchDeptList = async () => {
  loading.value = true
  try {
    const res = await getDeptList()
    if (res.code === 200) {
      tableData.value = res.data || []
    }
  } catch (error) {
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

const fetchDeptTree = async () => {
  try {
    const res = await getDeptTree()
    if (res.code === 200) {
      deptTreeOptions.value = [
        { label: '顶级部门', value: 0 },
        ...convertToTreeOptions(res.data || []),
      ]
    }
  } catch (error) {
    message.error('获取部门树失败')
  }
}

const convertToTreeOptions = (depts: DeptTree[]): any[] => {
  return depts.map((dept) => ({
    label: dept.name,
    value: dept.id,
    children: dept.children ? convertToTreeOptions(dept.children) : undefined,
  }))
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    parentId: 0,
    name: '',
    leader: '',
    phone: '',
    email: '',
    sort: 0,
    status: 1,
    remark: '',
    version: undefined,
  })
}

const handleCreate = async () => {
  resetForm()
  await fetchDeptTree()
  modalTitle.value = '新增部门'
  showModal.value = true
}

const handleEdit = async (row: Dept) => {
  Object.assign(formData, row)
  await fetchDeptTree()
  modalTitle.value = '编辑部门'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateDept(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        fetchDeptList()
      }
    } else {
      const res = await createDept(formData)
      if (res.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchDeptList()
      }
    }
    return true
  } catch (error) {
    return false
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: Dept) => {
  try {
    const res = await deleteDept(row.id!, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      fetchDeptList()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchDeptList()
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
            新增部门
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
          <NFormItem label="上级部门" path="parentId">
            <NTreeSelect
              v-model:value="formData.parentId"
              :options="deptTreeOptions"
              placeholder="请选择上级部门"
              clearable
              style="width: 100%"
            />
          </NFormItem>
          <NFormItem label="部门名称" path="name">
            <NInput v-model:value="formData.name" placeholder="请输入部门名称" />
          </NFormItem>
          <NFormItem label="负责人" path="leader">
            <NInput v-model:value="formData.leader" placeholder="请输入负责人" />
          </NFormItem>
          <NFormItem label="联系电话" path="phone">
            <NInput v-model:value="formData.phone" placeholder="请输入联系电话" />
          </NFormItem>
          <NFormItem label="邮箱" path="email">
            <NInput v-model:value="formData.email" placeholder="请输入邮箱" />
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
    </NCard>
  </ScrollContainer>
</template>
