import mysql from 'mysql2/promise';
import OpenAI from 'openai';
import fs from 'fs';


let langMap = {
    "zh": "中文",
    "zh-cn": "中文",
    "zh-hans": "中文（简体）",
    "zh-hant": "中文（繁体）",
    "zh-tw": "中文（繁体）",
    "zh-hk": "中文（繁体）",
    "en": "英语",
    "en-us": "英语",
    "en-gb": "英语",
    "en-au": "英语",
    "en-ca": "英语",
    "en-nz": "英语",
    "en-za": "英语",
    "en-ph": "英语",
    "ja": "日语",
    "ko": "韩语",
    "fr": "法语",
    "fr-ca": "法语",
    "fr-ch": "法语",
    "de": "德语",
    "es": "西班牙语",
    "es-mx": "西班牙语",
    "es-es": "西班牙语",
    "es-ar": "西班牙语",
    "es-co": "西班牙语",
    "es-cl": "西班牙语",
    "es-pe": "西班牙语",
    "pt": "葡萄牙语",
    "pt-br": "葡萄牙语",
    "pt-pt": "葡萄牙语",
    "ru": "俄语",
    "ar": "阿拉伯语",
    "ar-sa": "阿拉伯语",
    "it": "意大利语",
    "nl": "荷兰语",
    "nl-be": "荷兰语",
    "pl": "波兰语",
    "tr": "土耳其语",
    "vi": "越南语",
    "th": "泰语",
    "id": "印度尼西亚语",
    "ms": "马来语",
    "hi": "印地语",
    "bn": "孟加拉语",
    "ta": "泰米尔语",

    "te": "泰卢固语",
    "mr": "马拉地语",
    "gu": "古吉拉特语",
    "kn": "卡纳达语",
    "ml": "马拉雅拉姆语",
    "uk": "乌克兰语",
    "cs": "捷克语",
    "el": "希腊语",
    "he": "希伯来语",
    "hu": "匈牙利语",
    "sv": "瑞典语",
    "da": "丹麦语",
    "fi": "芬兰语",
    "no": "挪威语",
    "nb": "挪威语",
    "bg": "保加利亚语",
    "ro": "罗马尼亚语",
    "sk": "斯洛伐克语",
    "sl": "斯洛文尼亚语",
    "hr": "克罗地亚语",
    "sr": "塞尔维亚语",
    "ca": "加泰罗尼亚语",
    "tl": "菲律宾语",
    "fil": "菲律宾语",
    "sw": "斯瓦希里语",
    "fa": "波斯语",
    "ur": "乌尔都语",
    "pa": "旁遮普语",
    "bn-in": "孟加拉语",
    "az": "阿塞拜疆语",
    "be": "白俄罗斯语",
    "bs": "波斯尼亚语",
    "bs-cyrl": "波斯尼亚语",
    "et": "爱沙尼亚语",
    "ka": "格鲁吉亚语",
    "ky": "吉尔吉斯语",
    "lo": "老挝语",
    "lv": "拉脱维亚语",
    "lt": "立陶宛语",
    "mk": "马其顿语",
    "mn": "蒙古语",
    "ne": "尼泊尔语",
    "tg": "塔吉克语",
    "uz": "乌兹别克语",
    "cy": "威尔士语",
    "zu": "祖鲁语",
    "af": "南非荷兰语",
    "sq": "阿尔巴尼亚语",
    "am": "阿姆哈拉语",
    "hy": "亚美尼亚语",
    "eu": "巴斯克语",
    "my": "缅甸语",
    "fy": "弗里斯兰语",
    "gl": "加利西亚语",
    "gn": "瓜拉尼人",
    "ha": "豪萨语",
    "ig": "Igbo",
    "ga": "爱尔兰语",
    "is": "冰岛语",
    "lb": "卢森堡语",
    "mt": "马耳他语",
    "or": "奥里亚语",
    "gd": "苏格兰盖尔语",
    "so": "索马里语"
};

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

const openai = new OpenAI({
    apiKey: 'sk-808701fbaed240688aaf3a075dad0a6b',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

const LOG_FILE = 'translation_check_log.txt';

function log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        message,
        ...(data && { data })
    };
    const formatted = JSON.stringify(logEntry, null, 2);
    fs.appendFileSync(LOG_FILE, formatted + '\n');
    console.log(formatted);
}

async function getTranslations(languagePair = null, limit = 20) {
    let connection;
    try {
        connection = await pool.getConnection();
        let query = 'SELECT * FROM scene_default_phrases';
        const params = [];
        
        if (languagePair) {
            query += ' WHERE native_language = ? AND target_language = ?';
            params.push(languagePair.native, languagePair.target);
        }
        
        query += ' LIMIT ?';
        params.push(limit);
        
        console.log('执行查询:', { query, params });
        const [rows] = await connection.query(query, params);
        return rows;
    } catch (error) {
        console.error('查询翻译数据失败:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


async function verifyTranslation(text, sourceLang) {
    try {
        
        console.log(`检测语言：${sourceLang}`);
        console.log(`检测内容：${text}`);
        
        const completion = await openai.chat.completions.create({
            model: 'qwen-plus',
            messages: [
                {
                    role: 'system',
                    content: `你是一个文字检测助手，精通各种语言文字。
                        主要任务：
                        检测用户提供内容checkText中文字是否是${sourceLang}。
                        判断规则：
                            - 只检测checkText实际的文字内容，忽略特殊字符、标点符号及阿拉伯数字。
                            - 不用管检测文字的含义，只检测文字内容
                        如果checkText内容中包含非${sourceLang}的文字（即文字部分不匹配目标语言），返回0；
                        否则返回1；

                        正确案例（文字部分全部是英语）：
                        lang: 英语, content: "Does this bus go to the terminal?"
                        正确案例（包含阿拉伯数字和标点，仍返回1）：
                        lang: 英语, content: "Order 123 items, please!"
                        正确案例（包含特殊符号，仍返回1）：
                        lang: 英语, content: "Hello @World #2024!"
                        错误案例（文字部分包含中文，应返回0）：
                        lang: 英语, content: "Does 你好 this bus go to the terminal?"
                        错误案例（文字部分包含日文，应返回0）：
                        lang: 英语, content: "Hello こんにちは world"

                        You must answer strictly in the following JSON format: {
                            "content": 0 or 1
                            "msg": 原因
                        }
                    `
                },
                {
                    role: 'user',
                    content: `lang: ${sourceLang}, checkText: "${text}"`
                }
            ],
            temperature: 0.1
        });

        const evaluation = JSON.parse(completion.choices[0].message.content);
        return evaluation;
    } catch (error) {
        console.error('校验翻译时出错:', error);
    }
}

async function main() {
    

    // let defaultLang = ['ko','it','ru', 'zh', 'tr', 'ja', 'en', 'ar', 'fr', 'de', 'es']
    let defaultLang = ['ko', 'zh']
    let nativeLang;
    let targetLang;
    let tarName, navName;
    let minId = 1;
    try {
        for (let m = 0; m < defaultLang.length; m++) {
            nativeLang = defaultLang[m];
            navName = langMap[nativeLang]

            for (let j = 0; j < defaultLang.length; j++) {
                targetLang = defaultLang[j];
                tarName = langMap[targetLang]

                if (nativeLang === targetLang) {
                    continue;
                }

                let languagePair = {
                    native: nativeLang,
                    target: targetLang
                };
                // 先查询数据

                const results = await getTranslations(languagePair);

                if (Array.isArray(results)){
                    // console.log('results>> ', results[0]);

                    console.log('查询结果results长度 ', results.length);
                    
                    for (let m = 0; m < results.length; m++) {
                        let row = results[m];
                        if (row.id > minId){
                            console.log(`开始检测: ${row.id}`);
                            
                            // 继续检测
                            let content = `${row.default_phrases.join(' ')}\n${row.intentions.join(' ')}\n${(row.pair1 && row.pair1.length)?row.pair1.join(' ') :''}\n${(row.pair2 && row.pair2.length)?row.pair2.join(' ') :''}
                            `
                            let result = await verifyTranslation(content, navName)
                            console.log('检测结果', result);
                            
                            // let result = await verifyTranslation(content, tarName)
                            if (result.content == 0) {
                                break;
                            }
                        }
                    }

                }
                
                console.log('\n=== 翻译数据校验报告 ===');
               
            }
        }
        
    } catch (error) {
        console.error('执行失败:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
