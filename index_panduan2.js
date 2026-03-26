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
                "content": `【任务定义】
                    你是一个词语场景及情境关联度分析专家，负责判断两个给定词语之间的语义关联强弱。

                    【输入格式】
                    词语A: [第一个词语]
                    词语B: [第二个词语]

                    [输出格式]
                    {   "correlation_score": [0-10之间的整数或一位小数，表示关联强度]}

                    【评分标准】
                    - 9-10分：两个词语高度相关，通常会同时出现或互为上下文
                    - 7-8分：词语间存在明显关联，语义或场景高度吻合
                    - 5-6分：存在一定关联，但关联度一般
                    - 3-4分：关联较弱，可能仅在特定语境下有关联
                    - 1-2分：几乎没有关联
                    - 0分：完全不相关或相互矛盾

                    【分析维度说明】
                    - 场景关联度：在实际生活或特定场景中同时出现的可能性
                    - 逻辑关联度：在逻辑推理或因果关系上的关联程度
                    - 语义关联度：通过语义推断词语的关联的强度

                    【注意事项】
                    - 如果词语存在多义词，请结合常见含义判断
                    - 判断应基于通用认知，避免过度专业化解读
                `
            },
            {
                "role": "user",
                "content": `词语A: "六点十分", 词语B: "餐厅"
                You must answer strictly in the following JSON format: {"correlation_score": (type: number)}`
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