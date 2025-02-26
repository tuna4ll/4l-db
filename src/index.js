import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Database {
    constructor(filePath = "myDatabase.json") {
        this.filePath = path.resolve(__dirname, filePath);
        this.cache = null; // Cache ekledik
        this.cacheTime = 0; // Cache süresi
    }

    // Cache kontrolü yapan bir yöntem
    async _getCache() {
        const currentTime = Date.now();
        if (this.cache && currentTime - this.cacheTime < 5000) { // 5 saniye geçmemeli
            return this.cache.data;
        }
        return null;
    }

    async _setCache(data) {
        this.cache = {
            data,
            time: Date.now()
        };
    }

    async _readFile() {
        const cachedData = await this._getCache();
        if (cachedData) return cachedData;

        try {
            const data = await fs.readFile(this.filePath, "utf8");
            const parsedData = JSON.parse(data);
            await this._setCache(parsedData); // Cache'e kaydet
            return parsedData;
        } catch (error) {
            if (error.code === "ENOENT") {
                await this._writeFile({});
                return {};
            }
            throw error;
        }
    }

    async _writeFile(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
        await this._setCache(data); // Cache'i güncelle
    }

    async defineSchema(collection, schema) {
        const db = await this._readFile();
        if (!db[collection]) db[collection] = [];
        db[`${collection}_schema`] = schema;
        await this._writeFile(db);
    }

    // Veriyi toplu olarak kaydetme
    async save(collection, data) {
        const db = await this._readFile();
        if (!db[collection]) db[collection] = [];
        const schema = db[`${collection}_schema`];

        if (schema) {
            for (const key of Object.keys(schema)) {
                if (!(key in data)) throw new Error(`Missing required field: ${key}`);
            }
        }

        db[collection].push(data);
        await this._writeFile(db);
        return data;
    }

    async find(collection, query) {
        const db = await this._readFile();
        return (db[collection] || []).filter(item =>
            Object.keys(query).every(key => item[key] === query[key])
        );
    }

    async findOne(collection, query) {
        const results = await this.find(collection, query);
        return results.length ? results[0] : null;
    }

    async update(collection, query, updates) {
        const db = await this._readFile();
        if (!db[collection]) return null;

        let updated = null;
        db[collection] = db[collection].map(item => {
            if (Object.keys(query).every(key => item[key] === query[key])) {
                updated = { ...item };

                for (const [op, fields] of Object.entries(updates)) {
                    if (op === "$set") {
                        Object.assign(updated, fields);
                    } else if (op === "$inc") {
                        for (const [key, value] of Object.entries(fields)) {
                            if (typeof updated[key] === "number") {
                                updated[key] += value;
                            }
                        }
                    } else if (op === "$push") {
                        for (const [key, value] of Object.entries(fields)) {
                            if (Array.isArray(updated[key])) {
                                updated[key].push(value);
                            }
                        }
                    }
                }
                return updated;
            }
            return item;
        });

        await this._writeFile(db);
        return updated;
    }

    async delete(collection, query) {
        const db = await this._readFile();
        if (!db[collection]) return 0;

        const initialLength = db[collection].length;
        db[collection] = db[collection].filter(item =>
            !Object.keys(query).every(key => item[key] === query[key])
        );

        await this._writeFile(db);
        return initialLength - db[collection].length;
    }
}

export default Database;
