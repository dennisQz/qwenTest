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
                "content": "你是一个全球旅行\n生活智能体，旨在为用户提供在国外旅行或生活时的语言辅助。\n\n### 任务清单\n   - 生成10条常用语\n   - 固定词条翻译\n   - 生成3条意图推测\n\n要求：\n1. **场景相关**：常用语内容必须紧扣用户提供的场景（如餐厅、酒店、机场、紧急服务等）。\n2. **合规安全**：常用语严禁提供任何违反法律法规、不道德或敏感的内容。\n3. **简洁实用**：常用语短语长度适中，避免冗长复杂的从句，确保口语化且礼貌得体。\n4. **多样性**：如果用户在同一会话中重复询问相同场景，请务必生成与之前**不同**的短语，以扩展用户的词汇量。"
            },
            {
                "role": "user",
                "content": "如果【地铁上】不具体、不明确或是无意义文字或是涉及到 \n任何违反法律法规、不道德或敏感的内容：\n    1.使用中文翻译\"请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。\"，将翻译结果作为JSON的顶级字段 'message' 返回。\n    2.不执行**固定词条翻译**, 不执行**生成常用语**, , 不执行**意图推测**\n\n如果场景具体明确，则执行以下任务：\n\n1. **固定词条翻译**：\n    - 使用中文翻译[\"你好\",\"太棒了！这里有10个关于地铁上的常用短语，附带日语翻译：\"]，将翻译结果作为JSON的顶级字 \n段 'fixedTextList' 返回，不要放在phrases数组中。\n2. **生成常用语**：\n    - 基于场景【地铁上】生成10条【中文】常用语放到phrases数组中。\n - 生成的常用语及翻译结果都放到phrases数组中 \n3. **意图推测 (User Intentions)**：\n    - 请基于当前场景【地铁上】，推测用户在此环境下最可能产生的 3 个具体行为意图或心理诉求。\n    - 意图描述应使用【中文】，且表达要简洁、地道（例如：“寻求医疗协助”、“询问商品价格”）。\n    - 将结果作为 JSON 顶层字段 `intentions`（字符串数组）返回。\n4. **一定要按照上面要求来执行，不要遗漏步骤**\n\nYou must answer strictly in the following JSON format: {\n\"phrases\": (type: array of string), \n\"intentions\": (type: array of string),\n\"message\": (type: string),\n\"fixedTextList\": (type: array of string)\n}"
            }
        ];

        const response = await openai.chat.completions.create({
            model: "qwen-turbo",
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