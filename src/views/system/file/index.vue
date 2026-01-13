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
  NUpload,
  NPopconfirm,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type PaginationProps,
  type UploadFileInfo,
} from 'naive-ui'
import { ref, reactive, h, onMounted } from 'vue'

import {
  getFilePage,
  uploadFile,
  downloadFile,
  deleteFile,
  type SysFile,
  type FilePageParams,
} from '@/api/file'
import { ScrollContainer } from '@/components'

defineOptions({
  name: 'SystemFile',
})

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const queryFormRef = ref<FormInst | null>(null)
const uploading = ref(false)
const fileList = ref<UploadFileInfo[]>([])

const queryParams = reactive<Omit<FilePageParams, 'page' | 'size'>>({
  fileName: '',
  bizType: '',
})

const tableData = ref<SysFile[]>([])
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

const uploadFormData = reactive({
  bizType: '',
  bizId: undefined as number | undefined,
  remark: '',
})

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const columns: DataTableColumns<SysFile> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '文件名', key: 'fileName', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: '文件大小',
    key: 'fileSize',
    width: 120,
    render: (row) => formatFileSize(row.fileSize),
  },
  { title: '文件类型', key: 'fileType', width: 120 },
  {
    title: '存储类型',
    key: 'storageType',
    width: 100,
    render: (row) => {
      const map: Record<number, string> = { 1: '本地', 2: 'OSS', 3: 'MinIO' }
      return map[row.storageType ?? 1] ?? row.storageType
    },
  },
  { title: '业务类型', key: 'bizType', width: 120 },
  { title: '备注', key: 'remark', width: 150, ellipsis: { tooltip: true } },
  { title: '上传时间', key: 'createdTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    align: 'center',
    render: (row) => (
      <div class="flex gap-2">
        <NButton secondary type="info" size="small" onClick={() => handleDownload(row)}>
          下载
        </NButton>
        <NPopconfirm
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={() => handleDelete(row)}
        >
          {{
            default: () => `确定删除文件【${row.fileName}】吗？`,
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
    const res = await getFilePage({
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
    fileName: '',
    bizType: '',
  })
  handleQuery()
}

const handleUpload = () => {
  fileList.value = []
  Object.assign(uploadFormData, {
    bizType: '',
    bizId: undefined,
    remark: '',
  })
  showModal.value = true
}

const handleFileChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList
}

const handleSubmitUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('请选择文件')
    return
  }

  uploading.value = true
  try {
    const file = fileList.value[0].file
    if (!file) {
      message.error('文件不存在')
      return
    }

    const res = await uploadFile(
      file,
      uploadFormData.bizType || undefined,
      uploadFormData.bizId,
      uploadFormData.remark || undefined,
    )

    if (res.code === 200) {
      message.success('上传成功')
      showModal.value = false
      getList()
    }
  } catch (error) {
    message.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDownload = (row: SysFile) => {
  const url = downloadFile(row.id!)
  window.open(url, '_blank')
}

const handleDelete = async (row: SysFile) => {
  try {
    const res = await deleteFile(row.id!, row.version!)
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
          <NFormItem label="文件名" path="fileName">
            <NInput
              v-model:value="queryParams.fileName"
              placeholder="请输入文件名"
              clearable
            />
          </NFormItem>
          <NFormItem label="业务类型" path="bizType">
            <NInput
              v-model:value="queryParams.bizType"
              placeholder="请输入业务类型"
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
          <NButton type="success" @click="handleUpload">
            <template #icon>
              <span class="iconify ph--upload-simple" />
            </template>
            上传文件
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

      <!-- 上传弹窗 -->
      <NModal
        v-model:show="showModal"
        title="上传文件"
        preset="dialog"
        :mask-closable="false"
      >
        <NForm :model="uploadFormData" label-placement="left" label-width="100" style="margin-top: 20px">
          <NFormItem label="选择文件" required>
            <NUpload
              :file-list="fileList"
              :max="1"
              @update:file-list="handleFileChange"
              :default-upload="false"
            >
              <NButton>选择文件</NButton>
            </NUpload>
          </NFormItem>
          <NFormItem label="业务类型" path="bizType">
            <NInput v-model:value="uploadFormData.bizType" placeholder="例如 avatar" />
          </NFormItem>
          <NFormItem label="业务ID" path="bizId">
            <NInput v-model:value="uploadFormData.bizId" placeholder="请输入业务ID" />
          </NFormItem>
          <NFormItem label="备注" path="remark">
            <NInput
              v-model:value="uploadFormData.remark"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="请输入备注"
            />
          </NFormItem>
        </NForm>

        <template #action>
          <NSpace justify="end">
            <NButton @click="showModal = false">取消</NButton>
            <NButton type="primary" @click="handleSubmitUpload" :loading="uploading">
              上传
            </NButton>
          </NSpace>
        </template>
      </NModal>
    </NCard>
  </ScrollContainer>
</template>
