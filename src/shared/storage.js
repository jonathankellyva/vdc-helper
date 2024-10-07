const createStorage = (storage) => {
    return {
        get: function(key, defaultValue) {
            const promise = new Promise((resolve) => {
                storage.get(key, (result) => {
                    const value = result[key] !== undefined ? result[key] : defaultValue;
                    resolve(value);
                });
            }).catch(() => {});
            promise.nonnull = function() {
                return new Promise((resolve) => {
                    this.then(value => {
                        if (value !== null && value !== undefined) {
                            resolve(value);
                        }
                    });
                });
            };
            return promise;
        },
        set: function(key, value) {
            if (value === null || value === undefined) {
                this.remove(key);
            } else {
                storage.set({ [key]: value });
            }
        },
        remove: function(key) {
            storage.remove(key);
        }
    };
};

const STORAGE_SYNC = createStorage(chrome.storage.sync);
const STORAGE_LOCAL = createStorage(chrome.storage.local);
