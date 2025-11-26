/**
 * Cloudflare Worker Cron Trigger
 * 
 * 使用方法:
 * 1. 在 Cloudflare Dashboard 创建一个 Worker
 * 2. 将本文件所有代码复制粘贴到 Worker 编辑器中
 * 3. 配置环境变量 PAGES_URL (你的 Pages 项目地址)
 * 4. 配置 Cron 触发器 (0 1 * * * 和 30 1 * * *)
 */

export default {
    async scheduled(event, env, ctx) {
        const cron = event.cron;
        console.log(`[Cron] Triggered at: ${new Date().toISOString()}, Cron: ${cron}`);

        try {
            // 每天 UTC 1:00 (北京时间 9:00) - 域名到期通知
            if (cron === '0 1 * * *') {
                await triggerNotification(env, 'notify');
            }

            // 每天 UTC 1:30 (北京时间 9:30) - 域名状态检查
            if (cron === '30 1 * * *') {
                await triggerNotification(env, 'check-status');
            }
        } catch (error) {
            console.error('[Cron] Error:', error);
        }
    },
};

async function triggerNotification(env, endpoint) {
    // 移除末尾的斜杠(如果有)
    const baseUrl = env.PAGES_URL.replace(/\/$/, '');
    const url = `${baseUrl}/api/cron/${endpoint}`;

    console.log(`[Cron] Calling API: ${endpoint}`);

    const headers = {};
    // 如果配置了 API Key,使用 Bearer Token 认证
    if (env.CRON_API_KEY) {
        headers['Authorization'] = `Bearer ${env.CRON_API_KEY}`;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`[Cron] ${endpoint} success:`, JSON.stringify(result));
        } else {
            const errorText = await response.text();
            console.error(`[Cron] ${endpoint} failed (${response.status}):`, errorText);
        }
    } catch (error) {
        console.error(`[Cron] ${endpoint} request error:`, error);
    }
}
