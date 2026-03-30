import fs from 'fs';

const API_URL = 'http://localhost:8082/travel/assistant';

const requestData = {
    sessionId: "0A706E38120977852C48E0A483A1C2CD",
    deviceId: "DBED7226-A7DC-450D-8E5E-223",
    sceneId: 3,
    scene: "看演出",
    targetLanguage: "zh",
    nativeLanguage: "ko"
};

const LOG_FILE = 'request_log.txt';

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
}

async function makeRequest(requestNumber) {
    const startTime = Date.now();
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        const responseData = await response.text();
        
        const logEntry = `Request #${requestNumber} | Status: ${response.status} | Duration: ${duration}ms | Response: ${responseData}`;
        log(logEntry);

        return {
            requestNumber,
            status: response.status,
            duration,
            success: response.ok,
            response: responseData
        };

    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const logEntry = `Request #${requestNumber} | Status: ERROR | Duration: ${duration}ms | Error: ${error.message}`;
        log(logEntry);

        return {
            requestNumber,
            status: 'ERROR',
            duration,
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    log('========================================');
    log('开始测试请求 - 总共20次');
    log('========================================');

    const totalRequests = 20;
    const results = [];

    for (let i = 1; i <= totalRequests; i++) {
        const result = await makeRequest(i);
        results.push(result);
        
        if (i < totalRequests) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = results.filter(r => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / totalRequests;

    log('========================================');
    log('测试完成 - 汇总信息');
    log('========================================');
    log(`总请求数: ${totalRequests}`);
    log(`成功请求: ${successfulRequests}`);
    log(`失败请求: ${failedRequests}`);
    log(`总耗时: ${totalDuration}ms`);
    log(`平均耗时: ${averageDuration.toFixed(2)}ms`);

    return results;
}

runTests().catch(error => {
    log(`脚本执行错误: ${error.message}`);
    process.exit(1);
});
