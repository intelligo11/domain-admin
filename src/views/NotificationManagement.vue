<template>
  <div>
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">通知管理</h1>
        <p class="mt-2 text-sm text-gray-700">配置域名到期通知和其他系统通知设置</p>
      </div>
    </div>

    <div class="mt-8 space-y-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Telegram 机器人通知</h3>
          
          <div class="mt-6 space-y-6">
            <div class="flex items-start">
              <div class="flex h-6 items-center">
                <input
                  id="telegram-enabled"
                  v-model="settings.telegramEnabled"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div class="ml-3 text-sm leading-6">
                <label for="telegram-enabled" class="font-medium text-gray-900">启用 Telegram 通知</label>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="telegram-bot-token" class="block text-sm font-medium leading-6 text-gray-900">Bot Token</label>
                <input
                  id="telegram-bot-token"
                  v-model="settings.telegramBotToken"
                  type="text"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                />
              </div>

              <div>
                <label for="telegram-chat-id" class="block text-sm font-medium leading-6 text-gray-900">Chat ID</label>
                <input
                  id="telegram-chat-id"
                  v-model="settings.telegramChatId"
                  type="text"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="-1001234567890"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">飞书机器人通知</h3>
          
          <div class="mt-6 space-y-6">
            <div class="flex items-start">
              <div class="flex h-6 items-center">
                <input
                  id="feishu-enabled"
                  v-model="settings.feishuEnabled"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div class="ml-3 text-sm leading-6">
                <label for="feishu-enabled" class="font-medium text-gray-900">启用飞书通知</label>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="feishu-webhook-url" class="block text-sm font-medium leading-6 text-gray-900">Webhook URL</label>
                <input
                  id="feishu-webhook-url"
                  v-model="settings.feishuWebhookUrl"
                  type="text"
                  class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">到期提醒设置</h3>
          
          <div class="mt-6">
            <label for="notify-days" class="block text-sm font-medium leading-6 text-gray-900">提前提醒天数</label>
            <input
              id="notify-days"
              v-model.number="settings.notifyDaysBefore"
              type="number"
              class="mt-2 block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="30"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-x-4">
        <button
          type="button"
          @click="saveSettings"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          保存设置
        </button>
        <button
          type="button"
          @click="sendTestNotification"
          class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          发送测试通知
        </button>
        <span v-if="saveMessage" :class="['text-sm', saveMessageType === 'success' ? 'text-green-600' : 'text-red-600']">{{ saveMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface NotificationSettings {
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  feishuEnabled: boolean
  feishuWebhookUrl: string
  notifyDaysBefore: number
}

const settings = ref<NotificationSettings>({
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  feishuEnabled: false,
  feishuWebhookUrl: '',
  notifyDaysBefore: 30
})

const saveMessage = ref('')
const saveMessageType = ref<'success' | 'error'>('success')

const loadSettings = async () => {
  try {
    const response = await fetch('/api/notifications/settings')
    if (response.ok) {
      const data = await response.json()
      settings.value = {
        telegramEnabled: data.telegram_enabled,
        telegramBotToken: data.telegram_bot_token,
        telegramChatId: data.telegram_chat_id,
        feishuEnabled: data.feishu_enabled,
        feishuWebhookUrl: data.feishu_webhook_url,
        notifyDaysBefore: data.notify_days_before
      }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
}

const saveSettings = async () => {
  try {
    const response = await fetch('/api/notifications/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_enabled: settings.value.telegramEnabled,
        telegram_bot_token: settings.value.telegramBotToken,
        telegram_chat_id: settings.value.telegramChatId,
        feishu_enabled: settings.value.feishuEnabled,
        feishu_webhook_url: settings.value.feishuWebhookUrl,
        notify_days_before: settings.value.notifyDaysBefore
      })
    })
    
    if (response.ok) {
      saveMessage.value = '✓ 设置已保存'
      saveMessageType.value = 'success'
    } else {
      saveMessage.value = '✗ 保存失败'
      saveMessageType.value = 'error'
    }
  } catch (e) {
    console.error('Failed to save settings:', e)
    saveMessage.value = '✗ 保存失败'
    saveMessageType.value = 'error'
  }
  
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}

const sendTestNotification = async () => {
  try {
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings.value)
    })
    
    if (response.ok) {
      saveMessage.value = '✓ 测试通知已发送'
      saveMessageType.value = 'success'
    } else {
      const data = await response.json()
      saveMessage.value = '✗ ' + (data.error || '发送测试通知失败')
      saveMessageType.value = 'error'
    }
  } catch (e) {
    saveMessage.value = '✗ 发送测试通知失败'
    saveMessageType.value = 'error'
  }
  
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}

onMounted(() => {
  loadSettings()
})
</script>
