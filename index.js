import OpenAI from 'openai';
import process from 'process';

const openai = new OpenAI({
    apiKey: 'sk-808701fbaed240688aaf3a075dad0a6b',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';

async function main() {
    const startTime = Date.now();
    try {
        const messages = [
            {
                "role": "system",
                "content": `你是一个专业的翻译助手。请将用户提供的内容按照要求翻译。
                    翻译要求：
                    **翻译准确性**：确保翻译准确、自然、口语化" 
                `
            },
            {
                "role": "user",
                "content": `
                    ### 输入数据
                    - 常用语列表: [
                        您好，我有预订
                        请问还有空房间吗
                        请给我看一下身份证
                        早餐几点开始
                        请给我一把房间钥匙
                        可以帮我把行李拿到房间吗
                        请问客房服务怎么叫
                        退房时间是几点
                        请帮我开发票
                        可以寄存行李吗
                    ]
                    - 意图列表: [点咖啡，休息，社交]
                    - 固定词条列表: [
                        您能为我提供我可以在咖啡馆使用的10个常用短语吗?
                        太棒了！这里有10个关于咖啡馆的常用短语，附带英语翻译：
                        目前，您心里有没有具体的诉求呢？比如要一份菜单、要冰饮还是热饮、要其他产品等等，都可以直接询问。
                        请描述一下你脑海中的情形。
                    ]

                    ### 配置信息
                    - 母语 (Native): 日语
                    - 目标语言 (Target): 英语

                    1. **phrases (常用语)**:
                    - 将“常用语列表”中的每一项分别翻译成日语及英语。
                    - 结构: {"original": "日语内容", "translated": "英语内容"}。
                    - 目标：确保original均为日语内容, translated均为英语内容。

                    2. **intentions (意图)**:
                    - 检查“意图列表”中的每一项。
                    - 目标: 确保所有项均为 **日语**。如果某项不是 日语，请将其翻译为 日语。

                    3. **fixedTextList (固定词条)**:
                    - 检查“固定词条列表”中的每一项。
                    - 目标: 确保所有项均为 **日语**。如果某项不是 日语，请将其翻译为 日语。

                    ### 输出约束
                    - **仅返回** 一个标准的 JSON 对象。 
                    - **严禁** 使用 Markdown 代码块标记（如 json）。
                    - **严禁** 包含任何前导或后续的解释性文字。
                    
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

        const response = await openai.chat.completions.create({
            model: "qwen-plus",
            messages,
            stream: false,
            top_p: 1,
            temperature: 0.9,
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