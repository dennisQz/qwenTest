import mysql from 'mysql2/promise';
import fs from 'fs';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root123456',
  database: 'langchain_chat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function querySceneDefaultPhrases() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM scene_default_phrases where native_language = "es" and target_language = "ar"');
    return rows;
  } catch (error) {
    console.error('查询失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

const LOG_FILE = 'request_log.txt';

function log(data, level = 'INFO') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,
        ...data
    };
    const formatted = JSON.stringify(logEntry, null, 2);
    fs.appendFileSync(LOG_FILE, formatted + '\n');
    console.log(formatted);
}

async function main() {
  try {
    const results = await querySceneDefaultPhrases();
    console.log('查询结果:');
    log(results, 'INFO');

    return results;
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
