
// 获取支持的语言列表（带超时和降级）
export async function getLanguagesInfo(options = {}) {
    const {
        apiUrl = 'https://api.example.com/languages',
        timeout = 5000,
    } = options;
        // 动态获取 fetch，兼容 Node 12+ 和浏览器
    async function getFetch() {
        if (typeof fetch === 'function') {
            return fetch;
        }
        // Node 18+ 原生 fetch
        if (typeof global !== 'undefined' && typeof global.fetch === 'function') {
            return global.fetch;
        }
        // Node 12-17 动态引入 node-fetch
        try {
            // node-fetch v2 (CJS) or v3 (ESM)
            let nodeFetch;
            try {
                // ESM
                nodeFetch = (await import('node-fetch')).default;
            } catch {
                // CJS
                nodeFetch = require('node-fetch');
            }
            return nodeFetch;
        } catch (e) {
            throw new Error('fetch is not available in this environment. Please install node-fetch.');
        }
    }

        // 动态获取 AbortController，兼容 Node 12+
    async function getAbortController() {
        if (typeof AbortController !== 'undefined') {
            return AbortController;
        }
        try {
            // node-fetch v2 需单独引入 abort-controller
            let AC;
            try {
                // ESM
                AC = (await import('abort-controller')).default;
            } catch {
                // CJS
                AC = require('abort-controller');
            }
            return AC;
        } catch {
            throw new Error('AbortController is not available. Please install abort-controller.');
        }
    }

    // 验证API URL
    if (!apiUrl || typeof apiUrl !== 'string') {
        console.error('Invalid API URL provided. Using default languages.');
        return {};
    }
    try {
        // 创建超时控制器
        const fetchFn = await getFetch();
        const AbortControllerClass = await getAbortController();
        const controller = new AbortControllerClass();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // 发起请求
        const response = await fetchFn(apiUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        clearTimeout(timeoutId);

        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 解析响应数据
        const languages = await response.json();

        // 验证响应格式
        // if (!Array.isArray(languages)) {
        //     throw new Error('Invalid response format: expected an array');
        // }

        // 返回获取的语言列表
        return languages;

    } catch (error) {
        // 错误处理
        if (error.name === 'AbortError') {
            console.error(`Request timed out after ${timeout}ms. Using default languages.`);
        } else {
            console.error(`Failed to fetch languages: ${error.message}. Using default languages.`);
        }

        return defaultLanguages;
    }

}