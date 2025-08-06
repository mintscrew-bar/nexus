const redis = require("redis");

// 기본 Redis 설정
const defaultRedisUrl = "redis://localhost:6379";
const redisUrl = process.env.REDIS_URL || defaultRedisUrl;

const client = redis.createClient({
  url: redisUrl,
  retry_strategy: function (options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
      console.log("❌ Redis server refused connection");
      return new Error("Redis server refused connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.log("❌ Redis retry time exhausted");
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      console.log("❌ Redis max retry attempts reached");
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

// 연결 이벤트 리스너
client.on("connect", () => {
  console.log("✅ Connected to Redis");
});

client.on("ready", () => {
  console.log("✅ Redis client ready");
});

client.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

client.on("end", () => {
  console.log("❌ Redis connection ended");
});

// Redis 연결 함수
const connectRedis = async () => {
  try {
    await client.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    // Redis 연결 실패해도 서버는 계속 실행
    console.log("⚠️  Continuing without Redis...");
  }
};

// 헬퍼 함수들
const setKey = async (key, value, expireTime = null) => {
  try {
    if (expireTime) {
      await client.setEx(key, expireTime, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error("Redis setKey error:", error);
    return false;
  }
};

const getKey = async (key) => {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Redis getKey error:", error);
    return null;
  }
};

const deleteKey = async (key) => {
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Redis deleteKey error:", error);
    return false;
  }
};

const setHash = async (key, field, value) => {
  try {
    await client.hSet(key, field, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Redis setHash error:", error);
    return false;
  }
};

const getHash = async (key, field) => {
  try {
    const value = await client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Redis getHash error:", error);
    return null;
  }
};

const getAllHash = async (key) => {
  try {
    const hash = await client.hGetAll(key);
    const result = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    return result;
  } catch (error) {
    console.error("Redis getAllHash error:", error);
    return {};
  }
};

// Rate limiting 함수들
const incrementRateLimit = async (key, windowMs) => {
  try {
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, Math.floor(windowMs / 1000));
    }
    return current;
  } catch (error) {
    console.error("Redis incrementRateLimit error:", error);
    return 1;
  }
};

const getRateLimit = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error("Redis getRateLimit error:", error);
    return null;
  }
};

// Session 관리 함수들
const setSession = async (sessionId, userData, expireTime = 3600) => {
  return await setKey(`session:${sessionId}`, userData, expireTime);
};

const getSession = async (sessionId) => {
  return await getKey(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
  return await deleteKey(`session:${sessionId}`);
};

// Riot API 캐싱 함수들
const setRiotCache = async (key, data, expireTime = 300) => {
  return await setKey(`riot:${key}`, data, expireTime);
};

const getRiotCache = async (key) => {
  return await getKey(`riot:${key}`);
};

const clearRiotCache = async () => {
  try {
    const keys = await client.keys("riot:*");
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Redis clearRiotCache error:", error);
    return false;
  }
};

module.exports = {
  client,
  connectRedis,
  setKey,
  getKey,
  deleteKey,
  setHash,
  getHash,
  getAllHash,
  incrementRateLimit,
  getRateLimit,
  setSession,
  getSession,
  deleteSession,
  setRiotCache,
  getRiotCache,
  clearRiotCache,
};
