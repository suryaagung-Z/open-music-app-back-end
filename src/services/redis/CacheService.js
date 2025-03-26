const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis Error:', error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    const data = JSON.stringify(value);
    await this._client.set(key, data, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Cache tidak ditemukan');

    return JSON.parse(result);
  }

  async delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
