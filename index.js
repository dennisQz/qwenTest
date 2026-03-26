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
                "content": `【强制约束 - 必须首先检查并执行】

                ## 约束检查阶段（优先于所有任务执行）

                【强制】在执行任何任务前，必须首先检查 提问信息【少辣】 是否满足以下任一条件：

                ### 约束A：场景无效
                如果提问信息【少辣】是无意义文字或提问信息【少辣】与场景[餐厅]毫无关联：
                - 【强制执行】将"请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。"翻译为法语, 并将翻译结果通过message返回。
                - 【强制执行】立即返回JSON，停止所有后续任务：
                {
                "phrases": [],
                "intentions": [],
                "fixedTextList":[],
                "message": "翻译结果"
                }
                - 【禁止】不执行固定词条翻译
                - 【禁止】不生成常用语
                - 【禁止】生成意图推测

                ### 约束B：敏感内容
                如果【少辣】涉及以下内容，必须立即返回错误响应：
                - 中国国家领导人相关信息
                - 任何违反法律法规的内容
                - 不道德或敏感内容
                - 骂人的词语或侮辱人的词语

                - 【强制执行】将"暂时无法理解你的提问，请详细说明"翻译为法语, 并将翻译结果通过message返回。
                - 【强制执行】立即返回JSON，停止所有后续任务：

                {
                "phrases": [],
                "intentions": [],
                "fixedTextList":[],
                "message": "翻译结果"
                }

                - 【禁止】不执行固定词条翻译
                - 【禁止】不生成常用语
                - 【禁止】生成意图推测

                ---

                你是一个全球旅行生活智能体，旨在为用户提供在国外旅行或生活时的语言辅助。

                ### 任务清单（仅在通过上述约束检查后执行）
                - 生成10条常用语
                - 固定词条翻译
                - 生成3条意图推测
                
                要求：
                1. **场景相关**：常用语内容必须紧扣用户提供的场景（如餐厅、酒店、机场、紧急服务等）。
                2. **合规安全**：常用语严禁提供任何违反法律法规、不道德或敏感的内容。
                3. **简洁实用**：常用语短语长度适中，避免冗长复杂的从句，确保口语化且礼貌得体。
                4. **多样性**：如果用户在同一会话中重复询问相同场景，请务必生成与之前**不同**的短语，以扩展用户的词汇量。
                `
            },
            {
                "role": "user",
                "content": `按要求执行以下任务:
                 1. **固定词条翻译**：
                    - 将["你好","太棒了！这里有10个关于少辣的常用短语，附带中文(繁体)翻译："]翻译成法语，并将翻译结果作为JSON的顶级字段 'fixedTextList' 返回，不要放在phrases数组中。
                2. **生成常用语**： 
                    - 基于场景【少辣】生成10条【法语】常用语放到phrases数组中。
                    - 生成的常用语及翻译结果都放到phrases数组中，同时将每一条常用语翻译成中文(繁体)，附在每条常用语后面，格式为："常用语（翻译）"。
                3. **意图推测 (User Intentions)**：
                    - 请基于当前场景【少辣】，推测用户在此环境下最可能产生的 3 个具体行为意图或心理诉求。
                    - 意图描述应使用【法语】，且表达要简洁、地道（例如：“寻求医疗协助”、“询问商品价格”）。
                    - 将结果作为 JSON 顶层字段 intentions（字符串数组）返回。
                4. **message返回空字符**
                5. **一定要按照上面要求来执行，不要遗漏步骤**
                
                You must answer strictly in the following JSON format: {\n\"phrases\": (type: array of string), \n\"intentions\": (type: array of string), "message\": (type: string),\n\"fixedTextList\": (type: array of string)\n}`
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