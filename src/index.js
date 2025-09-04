const isNode = () => {
    return typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null &&
        typeof process.versions.node === 'string';
};

/**
 * 获取MP资源并生成i18n文件
 * @param {Object} options
 * @param {string[]} options.langList 语言列表
 * @param {string} options.apiUrl 语言API地址
 * @param {string} options.appName 应用名
 * @param {string} options.mode 模式
 * @param {string} options.cwd 工作目录
 * @returns {Promise<void>}
 */
export async function getResource(options = {}) {
    if (!isNode()) {
        // 浏览器环境下静默返回
        return;
    }
    function ensureAbsolutePath(path) {
        const { isAbsolute, resolve } = require('path');
        return isAbsolute(path) ? path : resolve(process.cwd(), path);
    }


    // Node 12+ ESM: 动态引入 Node-only 依赖
    let __filename_;
    if (typeof require !== 'undefined') {
        __filename_ = __filename
    }
    let resolve, dirname, fileURLToPath, fs, getLanguagesInfo, __filename__, __dirname, consola;
    try {
        // 动态 import
        ({ resolve, dirname } = await import('path'));
        ({ fileURLToPath } = await import('url'));
        fs = (await import('fs-extra')).default;
        ({ getLanguagesInfo } = await import('./fetch.js'));
        consola = (await import('consola')).default;

        // 兼容 Node 12.17+ ESM
        __filename__ = fileURLToPath(import.meta.url);
        __dirname = dirname(__filename__);
    } catch (e) {
        // 兼容 Node 12.0-12.16 或 CJS 环境
        // eslint-disable-next-line
        const path = require('path');
        // eslint-disable-next-line
        fs = require('fs-extra');
        // eslint-disable-next-line
        getLanguagesInfo = require('./fetch.js').getLanguagesInfo;

        // 在CJS环境中，确保路径是绝对的
        __filename = ensureAbsolutePath(__filename_ || process.argv[1]);
        console.log('__filename: ', __filename);
        __dirname = path.dirname(__filename);
        console.log('__dirname: ', __dirname);
        resolve = path.resolve;
    }

    // 提前计算mock.json路径
    const {
        langList = ['zh-CN', 'en'],
        apiUrl = 'http://172.168.51.175/api/admin/basic-application/dictionary/v1/visitor/data-by-type-mod?typeCode=lang_type&project=0',
        appName = 'base',
        mode = 'stand',
        cwd = process.cwd(),
    } = options;

    let langData = await getLanguagesInfo({ apiUrl });
    console.log('langData: ', langData);
    const resultPath = resolve(cwd, `public/i18n/${mode}/front-end/${appName}`);
    await fs.ensureDir(resultPath);
    await fs.emptyDir(resultPath);

    const mockJsonPath = resolve(__dirname, 'mock.json');
    for (const lang of langList) {
        const langFileResultPath = resolve(resultPath, `${lang}.js`);
        const data = await fs.readJson(mockJsonPath);
        const fileContent = `export default ${JSON.stringify(data, null, 2)};`;
        await fs.ensureFile(langFileResultPath);
        await fs.outputFile(langFileResultPath, fileContent);
    }
    consola.success(`i18n 资源文件已生成，路径为：${resultPath}`);
}
