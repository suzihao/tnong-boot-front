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
  NInputNumber,
  NSwitch,
  NTag,
  NPopconfirm,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getDictItemPage,
  createDictItem,
  updateDictItem,
  deleteDictItem,
  type DictItem,
  type DictItemForm,
  type DictItemPageParams,
} from '@/api/dict-item'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemDictItem',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('新增字典项')
const formRef = ref<FormInst | null>(null)
const queryFormRef = ref<FormInst | null>(null)
const saving = ref(false)

const queryParams = reactive<Omit<DictItemPageParams, 'page' | 'size'>>({
  dictCode: '',
  itemLabel: '',
  status: undefined,
})

const tableData = ref<DictItem[]>([])
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

const formData = reactive<DictItemForm>({
  dictCode: '',
  itemLabel: '',
  itemValue: '',
  sort: 0,
  status: 1,
  remark: '',
})

const rules: FormRules = {
  dictCode: { required: true, message: '请输入字典编码', trigger: 'blur' },
  itemLabel: { required: true, message: '请输入字典标签', trigger: 'blur' },
  itemValue: { required: true, message: '请输入字典值', trigger: 'blur' },
}

const columns: DataTableColumns<DictItem> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '字典编码', key: 'dictCode', width: 150 },
  { title: '字典标签', key: 'itemLabel', width: 150 },
  { title: '字典值', key: 'itemValue', width: 150 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error', size: 'small' },
        { default: () => (row.status === 1 ? '启用' : '禁用') },
      )
    },
  },
  { title: '备注', key: 'remark', minWidth: 180, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdTime', width: 180 },
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
            default: () => `确定删除字典项【${row.itemLabel}】吗？`,
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
    const res = await getDictItemPage({
      page: pagination.page!,
      size: pagination.pageSize!,
      ...queryParams,
    })
    if (res.code === 200) {
      tableData.value = res.data.records || []
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
  queryFormRef.value?.restoreValidation()
  Object.assign(queryParams, {
    dictCode: '',
    itemLabel: '',
    status: undefined,
  })
  handleQuery()
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    dictCode: '',
    itemLabel: '',
    itemValue: '',
    sort: 0,
    status: 1,
    remark: '',
    version: undefined,
  })
}

const handleCreate = () => {
  resetForm()
  modalTitle.value = '新增字典项'
  showModal.value = true
}

const handleEdit = (row: DictItem) => {
  Object.assign(formData, row)
  modalTitle.value = '编辑字典项'
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true
    if (formData.id) {
      const res = await updateDictItem(formData)
      if (res.code === 200) {
        message.success('更新成功')
        showModal.value = false
        getList()
      }
    } else {
      const res = await createDictItem(formData)
      if (res.code === 200) {
        message.success('新增成功')
        showModal.value = false
        getList()
      }
    }
    return true
  } catch (error) {
    return false
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: DictItem) => {
  try {
    const res = await deleteDictItem(row.id!, row.version!)
    if (res.code === 200) {
      message.success('删除成功')
      getList()
    }
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
      <!-- 查询表单 -->
      <NForm
        ref="queryFormRef"
        :model="queryParams"
        label-placement="left"
        label-width="80"
        class="mb-4"
      >
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
          <NFormItem label="字典编码" path="dictCode">
            <NInput
              v-model:value="queryParams.dictCode"
              placeholder="请输入字典编码"
              clearable
            />
          </NFormItem>
          <NFormItem label="字典标签" path="itemLabel">
            <NInput
              v-model:value="queryParams.itemLabel"
              placeholder="请输入字典标签"
              clearable
            />
          </NFormItem>
          <NFormItem label=" " label-width="0">
            <NSpace>
              <NButton type="primary" @click="handleQuery">
                <template #icon>
                  <span class="iconify ph--magnifying-glass" />
                </template>
                查询
              </NButton>
              <NButton @click="handleReset">
                <template #icon>
                  <span class="iconify ph--arrow-counter-clockwise" />
                </template>
                重置
              </NButton>
            </NSpace>
          </NFormItem>
        </div>
      </NForm>

      <div class="mb-2 flex justify-end gap-x-4 max-xl:mb-4 max-xl:flex-wrap">
        <div class="flex gap-2">
          <NButton type="success" @click="handleCreate">
            <template #icon>
              <span class="iconify ph--plus-circle" />
            </template>
            新增字典项
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
        <div class="mt-4 flex justify-end">
          <NPagination v-bind="pagination" />
        </div>
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
          <NFormItem label="字典编码" path="dictCode">
            <NInput
              v-model:value="formData.dictCode"
              placeholder="例如 sys_status"
            />
          </NFormItem>
          <NFormItem label="字典标签" path="itemLabel">
            <NInput v-model:value="formData.itemLabel" placeholder="例如 正常" />
          </NFormItem>
          <NFormItem label="字典值" path="itemValue">
            <NInput v-model:value="formData.itemValue" placeholder="例如 1" />
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
