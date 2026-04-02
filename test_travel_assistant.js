import fs from 'fs';

const API_URL = 'http://localhost:8082/travel/assistant';

const requestData = {
    sessionId: "0A706E38120977852C48E0A483A1C2CD",
    deviceId: "DBED7226-A7DC-450D-8E5E-223",
    sceneId: 3,
    first: 1,
    scene: "看演出",
    targetLanguage: "en",
    nativeLanguage: "zh"
};

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

async function makeRequest(sceneId, nativeLanguage, targetLanguage ) {
    const startTime = Date.now();
    
    try {
        requestData.sceneId = sceneId;
        requestData.targetLanguage = targetLanguage;
        requestData.nativeLanguage = nativeLanguage;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        const responseText = await response.text();
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
        
        const logEntry = {
            type: 'request',
            requestNumber: `${targetLanguage}-${nativeLanguage}-${sceneId}`,
            targetLanguage,
            nativeLanguage,
            sceneId,
            status: response.status,
            duration: `${duration}ms`,
            response: responseData
        };
        log(logEntry, 'INFO');

        return {
            requestNumber: `${targetLanguage}-${nativeLanguage}-${sceneId}`,
            status: response.status,
            duration,
            success: response.ok,
            response: responseData
        };

    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const logEntry = {
            type: 'request_error',
            requestNumber: `${targetLanguage}-${nativeLanguage}-${sceneId}`,
            targetLanguage,
            nativeLanguage,
            sceneId,
            status: 'ERROR',
            duration: `${duration}ms`,
            error: error.message
        };
        log(logEntry, 'ERROR');

        return {
            requestNumber: `${targetLanguage}-${nativeLanguage}-${sceneId}`,
            status: 'ERROR',
            duration,
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    const langs = ['ar','zh','ja'];
    const maxNum = 12;
    
    const startLog = {
        type: 'test_start',
        message: '开始测试请求',
        totalExpected: (langs.length * (langs.length - 1)) * maxNum
    };
    log(startLog, 'INFO');

    let totalRequests = 1;

    const results = [];

    for (let index = 0; index < langs.length; index++) {
        const tar = langs[index];
        for (let j = 0; j < langs.length; j++) {
            const nav = langs[j];
            if (tar == nav) {
                continue;
            }
            const testGroupLog = {
                type: 'test_group',
                targetLanguage: tar,
                nativeLanguage: nav,
                sceneIds: Array.from({length: maxNum}, (_, i) => i + 1)
            };
            log(testGroupLog, 'INFO');
            for (let m = 1; m <= maxNum; m++) {
                totalRequests++;
                const result = await makeRequest(m, nav, tar);
                results.push(result);
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
   

    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = results.filter(r => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalDuration / totalRequests;

    const summary = {
        type: 'summary',
        totalRequests: totalRequests,
        successfulRequests: successfulRequests,
        failedRequests: failedRequests,
        totalDuration: `${totalDuration}ms`,
        averageDuration: `${averageDuration.toFixed(2)}ms`
    };
    log(summary, 'INFO');

    return results;
}

runTests().catch(error => {
    const errorLog = {
        type: 'script_error',
        message: '脚本执行错误',
        error: error.message
    };
    log(errorLog, 'ERROR');
    process.exit(1);
});
