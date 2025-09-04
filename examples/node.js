// import { getResource } from '../dist/esm/index.js'
// const getResource = require('../dist/index.cjs')
const { getResource } = require('../dist/cjs/index.cjs')

const main = async () => {
    await getResource({
        langList: ['zh-CN', 'en', 'ar'],
        appName: 'base',
        mode: 'custom',
        cwd: process.cwd()
    })
}

main()