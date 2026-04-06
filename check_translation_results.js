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

async function updateCheckResult(id , checkResult) {
    if (checkResult >0) {
        checkResult = 200
    } else {
        checkResult = 500
    }
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      `UPDATE scene_default_phrases 
       SET check_result = ?
       WHERE id = ?`,
      [checkResult, id]
    );
    return result;
  } catch (error) {
    console.error('更新失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


async function verifyTranslation(text, sourceLang, targetLang, model = 'qwen-plus') {
    try {
        
        console.log(`检测语言：${sourceLang}`);
        console.log(`检测内容：${text}`);
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `你是一个严格的字符集检测助手。
                        主要任务：
                        判断用户提供的文本 (checkText) 中的字母/文字字符是否全部属于【${sourceLang}】的字符集。

                        判断规则（非常重要）：
                        1. 绝对不要翻译文本！绝对不要去理解文本的含义！你只能检查字符的外观字形和所属的语言字符集（Unicode范围）。
                        2. 只检查文字部分。完全忽略标点符号、特殊符号（如@、#、空格、换行符等）以及阿拉伯数字。
                        3. 如果 checkText 中的所有文字字符都属于【${sourceLang}】的常规字符集（例如韩语只有韩文/Hangul，没有汉字/假名/拉丁字母等），则返回 1。
                        4. 如果 checkText 中包含哪怕一个不属于【${sourceLang}】的文字字符（比如检测韩语时出现了真实的中文字符或英文字母），则返回 0。
                        5. 【防幻觉警告】绝不能自行脑补、翻译或联想文本内容！如果文本提到“${targetLang}翻译”，但后面给出的词语依然是纯中文（如“入住 退房”），你必须将其判定为全中文！如果韩文文本提到“중국어”(中文)，但它本身是用韩文字母写的，你必须将其判定为全韩文！只能基于【实际给出的字符字形】做判断！

                        示例：
                        目标语言：英语, checkText: "Does this bus go to the terminal?" -> 1
                        目标语言：英语, checkText: "Order 123 items, please!" -> 1
                        目标语言：英语, checkText: "Hello こんにちは world" -> 0 (包含日文字符)
                        目标语言：韩语, checkText: "레스토랑에서 사용할 수 있는 10가지" -> 1 (全是韩文，忽略数字和空格)
                        目标语言：韩语, checkText: "이것은 test 입니다" -> 0 (包含英文字符)
                        目标语言：韩语, checkText: "이것은 测试 입니다" -> 0 (包含中文字符)
                        目标语言：中文, checkText: "以下是与酒店相关的常用短语，以及${targetLang}翻译：入住 退房" -> 1 (全是中文字符，不要脑补${targetLang})
                        目标语言：韩语, checkText: "중국어 번역이 있습니다: 식사 주문" -> 1 (全是韩文字符，没有真正的中文字符，不要脑补汉字)

                        【严格执行】：
                        请详细分析字词检查的过程。
                        第一步：严格检查所有文字字词的外观字形；
                        第二步：判断是否所有文字字词均属于【${sourceLang}】的常规字符集；
                        第三步：根据前两步得出结论。绝不能因为文本提及其他语言而误判。

                        You must answer strictly in the following JSON format: {
                            "msg": "检测为0的原因",
                            "content": 0 or 1
                        }
                        注意：必须且只能返回纯 JSON 格式数据，绝对不要使用 Markdown 代码块（如 \`\`\`json），不要包含任何其他多余文本。
                    `
                },
                {
                    role: 'user',
                    content: `lang: ${sourceLang}, checkText: "${text}"`
                }
            ],
            temperature: 0.1
        });

        let rawContent = completion.choices[0].message.content;
        // 清洗可能存在的 markdown 代码块包裹
        rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        try {
            const evaluation = JSON.parse(rawContent);
            console.error('检测结果: ', evaluation);

            return evaluation;
        } catch (parseError) {
            console.error('JSON解析失败，原始返回内容:', rawContent);
            return { content: 0, msg: 'JSON解析失败' };
        }
    } catch (error) {
        console.error('校验翻译时出错:', error);
        return { content: 0, msg: '校验接口请求出错' };
    }
}

async function main() {
    

    // let defaultLang = ['ko','it','ru', 'zh', 'tr', 'ja', 'en', 'ar', 'fr', 'de', 'es']
    let defaultLang = ['zh', 'ja']
    let nativeLang;
    let targetLang;
    let tarName, navName;
    let minId = 1;
    let stop = false;

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
                        console.log('row.check_result>> ', row.check_result);
                        
                        if (row.check_result != 200){
                            console.log(`开始检测>>Id: ${row.id} scene_id: ${row.scene_id}  nativeLang: ${row.native_language}  targetLang: ${row.target_language}`);

                            let sourceCont = []
                            let tarCont = []
                            row.phrases.forEach((el) => {
                                sourceCont.push(`${el.original}`)
                                tarCont.push(`${el.translated}`)
                            })
                            // 继续检测
                            let content = `${sourceCont.join('\n')}\n${row.default_phrases.join(' ')}\n${row.intentions.join(' ')}\n${(row.pair1 && row.pair1.length)?row.pair1.join(' ') :''}\n${(row.pair2 && row.pair2.length)?row.pair2.join(' ') :''}
                            `
                            let result = await verifyTranslation(content, navName, tarName)                            
                            if (result.content == 0) {
                                // 检测第二遍
                                result = await verifyTranslation(content, navName, tarName, 'qwen-max')
                                
                            }
                            await updateCheckResult(row.id, result.content)
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
