// 새로운 데이터베이스 매니저 사용
const dbManager = require("./database-manager");

// 기존 API와 호환성을 위한 래퍼 함수들
const query = async (text, params) => {
  return await dbManager.query(text, params);
};

const getOne = async (text, params) => {
  return await dbManager.getOne(text, params);
};

const getMany = async (text, params) => {
  return await dbManager.getMany(text, params);
};

const execute = async (text, params) => {
  return await dbManager.execute(text, params);
};

const connectDB = async () => {
  return await dbManager.connectDB();
};

const restartPool = async () => {
  await dbManager.end();
  return await dbManager.initialize();
};

// 기존 코드와의 호환성을 위해 pool 객체 제공
const pool = {
  get ended() {
    return !dbManager.isHealthy();
  },
  query: dbManager.query.bind(dbManager),
  end: dbManager.end.bind(dbManager),
};

module.exports = {
  pool,
  query,
  getOne,
  getMany,
  execute,
  connectDB,
  restartPool,
};
