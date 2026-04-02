import OpenAI from 'openai';
import process from 'process';

const openai = new OpenAI({
    apiKey: 'sk-808701fbaed240688aaf3a075dad0a6b',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
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

let phrases = [];
let fixList = [];
let intentions = [];

async function main() {
    const startTime = Date.now();
    try {
        const messages = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通西班牙语和阿拉伯语。
                    重要规则：
                    1. 所有original字段必须是100%西班牙语
                    2. 所有translated字段必须是100%阿拉伯语
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    将以下常用语列表内容翻译成西班牙语和阿拉伯语。
                    - 常用语列表: [
                        ${phrases.join(',\n')}
                    ]

                    请严格确保：
                    - original只包含西班牙语字符
                    - translated只包含阿拉伯语字符
                    - 不混入任何其他语言

                    You must answer strictly in the following JSON format: {
                        "phrases": (type: array of dev.langchain4j.scene.aiservice.model.SceneTranslationPhrase: {
                        "original": (type: string),
                        "translated": (type: string)
                        }),
                        "intentions": (type: array of string),
                        "fixedTextList": (type: array of string)
                    }`
            }
        ];

        const intentionMsgs = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通西班牙语。
                    重要规则：
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    
                    - 意图列表（翻译成西班牙语）: [
                        ${intentions.join(',\n')}
                    ]

                    将以下常用语列表内容翻译成西班牙语和阿拉伯语。

                    请严格确保：
                    - 不混入任何其他语言

                    You must answer strictly in the following JSON format: {
                        "intentions": (type: array of string)
                    }`
            }
        ];
        const fixListMsgs = [
            {
                "role": "system",
                "content": `你是一个专业翻译助手，精通西班牙语。
                    重要规则：
                    3. 禁止在任何翻译中混入其他语言字符
                    4. 生成翻译后必须验证语言正确性
                `
            },
            {
                "role": "user",
                "content": `
                    将以下意图列表内容翻译成西班牙语。
                    - 意图列表: [
                        ${fixedTextList.join(',\n')}
                    ]

                    请严格确保：
                    - 不混入任何其他语言

                    You must answer strictly in the following JSON format: {
                        "fixedTextList": (type: array of string)
                    }`
            }
        ];

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

        console.log('=======================Response=======================');
        
        const content = response.choices[0]?.message?.content;
        
        if (response.usage) {
            console.log('Usage:', response.usage);
        }

        console.log('\nAnswer Content:', content);
        const endTime = Date.now();
        console.log(`\n总用时: ${endTime - startTime}ms`);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();