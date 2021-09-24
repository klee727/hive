const Keyv = require('keyv');
const { KeyvFile } = require('keyv-file')

let kvs = {
    memory: new Keyv(),
    file: new Keyv({
        store: new KeyvFile({
            filename: './statestore.json',
        }),
    }),
}
function stateWrapper(namespace, type) {
    const _key = (k) => `${namespace}#${k}`
    const _store = kvs[type]
    return {
        set: async (key, value) => {
            await _store.set(_key(key), value)
        },
        get: async (key, reserve = null) => {
            const value = await _store.get(_key(key))
            return typeof value != 'undefined' ? value : reserve
        },
        delete: async (key) => {
            await _store.delete(_key(key))
        }
    }
}

module.exports = {
    stateWrapper
}