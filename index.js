import OpenAI from 'openai';
import fs from 'fs';
import yaml from 'js-yaml';
import mysql from 'mysql2/promise';


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
    "mr": "马拉地语",
    "ms": "马来语",
    "hi": "印地语",
    "uz": "乌兹别克语",
    "fa": "波斯语",
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
    
  
    "pa": "旁遮普语",
    "bn": "孟加拉语",

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
    "so": "索马里语",
    "te": "泰卢固语",   // 印度
    "ta": "泰米尔语",   // 印度
    "ur": "乌尔都语",   // 印度
    "gu": "古吉拉特语", // 印度
    "kn": "卡纳达语",   // 印度
    "ml": "马拉雅拉姆语" // 印度
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
}


let sceneId = 1;
let targetLanguage = 'zh';
let nativeLanguage = "tr";

let targetLangName = langMap[targetLanguage]
let nativeLangName = langMap[nativeLanguage]

let phrases = [];
let fixList = [];
let intentions = [];

async function getSceneById(sceneId) {
    try {
        const yamlContent = fs.readFileSync('./scene-phrases.yml', 'utf8');
        const data = yaml.load(yamlContent);
        return data.scenes.find(scene => scene.sceneId === sceneId);
    } catch (error) {
        console.error('Error reading scene-phrases.yml:', error);
        return null;
    }
}

function extractSceneData(scene) {
    if (!scene) {
        return {
        };
    }

    let obj = {
        scene: scene.scene || '',
        phrases: scene.phrases || [],
        intentions: scene.intentions || [],
    }

    let lst = [
        `Could you provide me with 10 common phrases I can use in ${scene.scene}?`,
        `Fantastic! Here are 10 common phrases related to ${scene.scene}, along with ${targetLangName} translations：`,
    ]
    if (Array.isArray(scene.pair1)) {
        lst.push(...scene.pair1)
    } 
    if (Array.isArray(scene.pair2)) {
        lst.push(...scene.pair2)
    }
    obj.fixList = lst; 
    
    return obj;
}

async function initializeSceneData(sceneId) {
    const scene = await getSceneById(sceneId);
    const data = extractSceneData(scene);
    
    phrases = data.phrases;
    intentions = data.intentions;
    fixList = data.fixList;
    
    return data;
}

async function translateApi(messages, type){
    
    let startTime = Date.now();

    const response = await openai.chat.completions.create({
        model: "qwen-plus",
        messages,
        stream: false,
        top_p: 1,
        temperature: 0.3,
        enable_search: false,
        enable_thinking: false,
        thinking_budget: 4000,
        result_format: "message"
    });
    const content = response.choices[0]?.message?.content;
    // 清洗可能存在的 markdown 代码块包裹
    const rawContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();

    // if (response.usage) {
    //     log('Usage:', response.usage);
    // }
    console.log(`\n ${type} Answer Content:`,  rawContent);
    const endTime = Date.now();
    console.log(`\n ================================================================= 总用时: ${endTime - startTime}ms `);
    return JSON.parse(rawContent)
}

async function queryExit(native_language, target_language, sceneId) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`SELECT id, scene_id, native_language, target_language FROM scene_default_phrases where scene_id = ${sceneId} and native_language = "${native_language}" and target_language = "${target_language}"`);
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

async function insertData(sceneId, nativeLanguage, targetLanguage, phrases, intentions, defaultPhrases, pair1, pair2) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO scene_default_phrases 
       (scene_id, native_language, target_language, phrases, intentions, default_phrases, pair1, pair2) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sceneId, nativeLanguage, targetLanguage, phrases, intentions, defaultPhrases, pair1, pair2]
    );
    return result;
  } catch (error) {
    console.error('插入失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function getSysPrompt(langName) {
    return [
        {
            "role": "system",
            "content": `你是一个专业翻译助手，精通${langName}。
                重要规则：
                1. 禁止在任何翻译中混入其他语言字符
                2. 生成翻译后必须验证语言正确性
            `
        },
        {
            "role": "user",
            "content": `
                将以下常用语列表内容翻译成${langName}。
                - 常用语列表: [
                    ${phrases.join(',\n')}
                ]
                请严格确保：
                - 翻译内容只包含${langName}字符
                - 不混入任何其他语言

                You must answer strictly in the following JSON format: {
                    "phrases": (type: array of string)
                }`
        }
    ];
}

async function start (){
    try {
        
        console.log('sceneId:', sceneId, ' --- nativeLangName:', nativeLangName, ' ---  targetLangName: ', targetLangName);

        await initializeSceneData(sceneId);
        const nativeMessages = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通${targetLangName}和${nativeLangName}。
                    重要规则：
                    1. 所有original字段必须是100%${nativeLangName}
                    2. 所有translated字段必须是100%${targetLangName}
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    将以下常用语列表内容翻译成${nativeLangName}及${targetLangName}。
                    - 常用语列表: [
                        ${phrases.join(',\n')}
                    ]

                    请严格确保：
                    - original只包含${nativeLangName}字符
                    - translated只包含${targetLangName}字符
                    - 不混入任何其他语言

                    You must answer strictly in the following JSON format: {
                        "phrases": (type: array of objct: {
                            "original": (type: string),
                            "translated": (type: string)
                        }),
                    }`
            }
        ];
        
        const intentionMsgs = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通${nativeLangName}。
                    重要规则：
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    将以下intentions内容翻译成${nativeLangName}。
                    - intentions: [
                        ${intentions.join(',\n')}
                    ]

                    请严格确保：
                    - 不混入任何其他语言
                    - 返回JSON格式数据

                    You must answer strictly in the following JSON format: {
                        "intentions": (type: array of string)
                    }`
            }
        ];
        const fixListMsgs = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通${nativeLangName}。
                    重要规则：
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    将以下fixedTextList内容翻译成${nativeLangName}。

                    - fixedTextList: [
                        ${fixList.join(',\n')}
                    ]

                    请严格确保：
                    - 不混入任何其他语言

                    You must answer strictly in the following JSON format: {
                        "fixedTextList": (type: array of string)
                    }`
            }
        ];

        const rps = await translateApi(getSysPrompt(nativeLangName), 'native 常用语：')
        const rps2 = await translateApi(getSysPrompt(targetLangName), 'target 常用语：')

        let phrasesLst = [];
        if (Array.isArray(rps.phrases) && Array.isArray(rps2.phrases) ) {
            for (let s = 0; s < 10; s++) {
                phrasesLst.push({
                    "original": rps.phrases[s],
                     "translated": rps2.phrases[s],
                })
            }
        }


        const response1 = await translateApi(intentionMsgs, '意图：')
        const response2 = await translateApi(fixListMsgs, '固定短语：')
        
        // console.log('response ', response, intentionResponse, fixResponse);
        
        log('=======================Response=======================');
        
        let defaultPhrases = null;
        let pair1 = null;
        let pair2 = null;

        if (Array.isArray(response2.fixedTextList) && response2.fixedTextList.length > 0) {
            defaultPhrases = response2.fixedTextList.splice(0,2)
            pair1 = response2.fixedTextList.splice(0,2)
            pair2 = response2.fixedTextList.splice(0,2)

            if (Array.isArray(defaultPhrases) && defaultPhrases.length > 0) {
                defaultPhrases = JSON.stringify(defaultPhrases)
            } else {
                defaultPhrases = null
            }
            
            if (Array.isArray(pair1) && pair1.length === 2) {
                pair1 = JSON.stringify(pair1)
            } else {
                pair1 = null
            }
            
            if (Array.isArray(pair2) && pair2.length === 2) {
                pair2 = JSON.stringify(pair2)
            } else {
                pair2 = null
            }
        }

        const results = await insertData(
            sceneId,
            nativeLanguage,
            targetLanguage,
            JSON.stringify(phrasesLst),
            JSON.stringify(response1.intentions),
            defaultPhrases,
            pair1,
            pair2
        );
        return results;
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}


async function main() {
    try {
        // pt: 1320 -> 1585 已检测
        // nl: 1586 -> 1873 已检测
        // th: 1874 -> 1912
        // vi: 
        // pl: 
        //  "id": "印度尼西亚语",
        //     "mr": "马拉地语",
        //     "ms": "马来语",
        //     "hi": "印地语",
        
        let defaultLang = ['fa','uz','uk','cs','el','he','hu','sv','da','fi',
            'hi','ms','mr','id','th','vi','pl','nl','pt', 'ko',
            'it','ru', 'zh', 'tr', 'ja', 'en', 'ar', 'fr', 'de', 'es']

        for (let m = 0; m < defaultLang.length; m++) {
                nativeLanguage = defaultLang[m];

            for (let j = 0; j < defaultLang.length; j++) {
                targetLanguage = defaultLang[j];

                if (nativeLanguage === targetLanguage) {
                    continue;
                }
                // 判断是否存在
                
                for (let r = 1; r <= 12; r++) {
                    sceneId = r;
                    targetLangName = langMap[targetLanguage]
                    nativeLangName = langMap[nativeLanguage]
                    let exits = await queryExit(nativeLanguage, targetLanguage, sceneId)
                    
                    if (exits.length){
                        console.log('数据已存在：：：：：',  nativeLanguage, targetLanguage, sceneId);
                    } else {
                        await start();                    
                    }
                }
                
            }   
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

main();