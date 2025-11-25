<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">域名管理</h1>
        <p class="mt-2 text-sm text-gray-700">管理您的所有域名，包括注册商、到期日期和状态</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
        <button @click="triggerImport" type="button" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">导入</button>
        <button @click="exportDomains" type="button" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">导出</button>
        <button @click="openAddModal" type="button" class="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">添加域名</button>
      </div>
      <input type="file" ref="fileInput" class="hidden" accept=".json" @change="handleImport" />
    </div>

    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">域名</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">注册商</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">域名天数</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">到期日期</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">状态</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">备注</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span class="sr-only">编辑</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="domain in domains" :key="domain.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                  <a v-if="domain.domain_url" :href="domain.domain_url" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-900">{{ domain.domain }}</a>
                  <span v-else class="text-gray-900">{{ domain.domain }}</span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <a v-if="domain.registrar_url" :href="domain.registrar_url" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-900">{{ domain.registrar || '-' }}</a>
                  <span v-else class="text-gray-500">{{ domain.registrar || '-' }}</span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span :class="[getDaysRemaining(domain.expiry_date) < 0 ? 'text-red-600 font-semibold' : getDaysRemaining(domain.expiry_date) <= 30 ? 'text-yellow-600 font-semibold' : 'text-gray-500']">
                    {{ getDaysRemaining(domain.expiry_date) < 0 ? '已过期' : `${getDaysRemaining(domain.expiry_date)} 天` }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(domain.expiry_date) }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span :class="[domain.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20', 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset']">
                    {{ domain.status === 'Active' ? '在线' : '离线' }}
                  </span>
                </td>
                <td class="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" :title="domain.notes">{{ domain.notes || '-' }}</td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button @click="openEditModal(domain)" class="text-indigo-600 hover:text-indigo-900 mr-4">编辑</button>
                  <button @click="openDeleteConfirm(domain)" class="text-red-600 hover:text-red-900">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <DomainModal :is-open="modalOpen" :domain="selectedDomain" @close="closeModal" @save="handleSave" />
    <NotificationDialog 
      :is-open="notificationOpen" 
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      :details="notificationDetails"
      @close="closeNotification" 
    />
    <ConfirmDialog
      :is-open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="确认"
      cancel-text="取消"
      @confirm="handleConfirm"
      @cancel="closeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDomainStore } from '../stores/domain'
import { storeToRefs } from 'pinia'
import DomainModal from '../components/DomainModal.vue'
import NotificationDialog from '../components/NotificationDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { parseJSON, exportToJSON, getMimeType, getFileExtension } from '../utils/fileFormats'

const domainStore = useDomainStore()
const { domains } = storeToRefs(domainStore)
const modalOpen = ref(false)
const selectedDomain = ref(null)
const fileInput = ref(null)

// Notification dialog state
const notificationOpen = ref(false)
const notificationType = ref<'success' | 'error' | 'info'>('success')
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationDetails = ref('')

// Confirm dialog state
const confirmOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string, details?: string) => {
  notificationType.value = type
  notificationTitle.value = title
  notificationMessage.value = message
  notificationDetails.value = details || ''
  notificationOpen.value = true
}

const closeNotification = () => {
  notificationOpen.value = false
}

const showConfirm = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  confirmOpen.value = true
}

const closeConfirm = () => {
  confirmOpen.value = false
  confirmAction.value = null
}

const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  closeConfirm()
}

onMounted(() => {
  domainStore.fetchDomains()
})

const getDaysRemaining = (expiryDate: string) => {
  if (!expiryDate) return 0
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const openAddModal = () => {
  selectedDomain.value = null
  modalOpen.value = true
}

const openEditModal = (domain: any) => {
  selectedDomain.value = domain
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  selectedDomain.value = null
}

const handleSave = async (domainData: any) => {
  if (selectedDomain.value) {
    await domainStore.updateDomain(selectedDomain.value.id, domainData)
  } else {
    await domainStore.addDomain(domainData)
  }
  closeModal()
}

const openDeleteConfirm = (domain: any) => {
  showConfirm(
    '确认删除',
    `确定要删除域名 ${domain.domain} 吗？此操作无法撤销。`,
    () => {
      domainStore.deleteDomain(domain.id)
    }
  )
}

const triggerImport = () => {
  fileInput.value.click()
}

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      const data = parseJSON(content)
      
      if (data.length > 0) {
        const result = await domainStore.importDomains(data)
        if (result && result.success) {
          let message = `已导入 ${result.imported} 个域名`
          if (result.skipped > 0) {
            message += '\n' + `跳过 ${result.skipped} 个重复域名`
          }
          showNotification(
            'success',
            '导入成功',
            message,
            result.skipped > 0 ? `跳过 ${result.skipped} 个重复域名` : undefined
          )
        } else {
          showNotification('error', '导入失败', result?.error || '错误')
        }
      }
    } catch (err: any) {
      console.error('Import failed', err)
      showNotification('error', '导入失败', '文件解析失败', err.message)
    }
    // Reset input
    if (fileInput.value) fileInput.value.value = ''
  }
  reader.readAsText(file)
}

const exportDomains = () => {
  try {
    const data = exportToJSON(domains.value)
    const mimeType = getMimeType()
    const extension = getFileExtension()
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `domains-${new Date().toISOString().split('T')[0]}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err: any) {
    console.error('Export failed', err)
    showNotification('error', '导出失败', '错误', err.message)
  }
}
</script>
