import OpenAI from 'openai';
import process from 'process';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: 'sk-808701fbaed240688aaf3a075dad0a6b',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;
let phrasesBuffer = '';
let originalText = '';
let inPhrasesField = false;

async function main() {
    try {
        const messages = [
            {
                "role": "system",
                "content": 
               `强制约束 - 必须首先检查并执行】

                ## 约束检查阶段（优先于所有任务执行）

                【强制】在执行任何任务前，必须先检查提问信息【点餐】是否满足以下任一条件：

                ### 约束A：场景无效
                如果提问信息【点餐】是无意义文字或提问信息【点餐】与场景[餐厅]毫无关联：
                - 【强制执行】将"请询问当前场景相关常用语，如需询问其他场景，请重新添加场景。"翻译为英文, 并将翻译结果通过message返回。
                - 【强制执行】将翻译结果作为JSON的顶级字段 'message' 返回。
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
                "content": `执行以下任务：
                    1. **固定词条翻译**：
                        - 使用中文翻译["你好","太棒了！这里有10个关于餐厅的常用短语，附带英文翻译："]，将翻译结果作为JSON的顶级字段'fixedTextList' 返回，不要放在phrases中。

                    2. **生成常用语**：
                        - 基于场景【餐厅】生成10条【中文】常用语，同时将常用语翻译成【英文】。
                        - 将生成的常用语及翻译结果使用|拼接起来放到phrases中。
                        - 严格按照格式存放，如： "常用语|翻译//常用语|翻译//常用语|翻译"
                    3. **意图推测 (User Intentions)**：   
                    - 请基于当前场景【餐厅】，推测用户在此环境下最可能产生的 3 个具体行为意图或心理诉求。  
                    - 意图描述应使用【中文】，且表达要简洁、地道（例如：“寻求医疗协助”、“询问商品价格”）。   
                    - 将结果作为 JSON 顶层字段 
                    4. **一定要按照上面要求来执行，不要遗漏步骤**

                    You must answer strictly in the following JSON format: {\n\"phrases\": (type: String), \n\"intentions\": (type: array of string),\n\"message\": (type: string),\n\"fixedTextList\": (type: array of string)\n}`
            }
        ];

        const stream = await openai.chat.completions.create({
            // You can replace with other Qwen3 models or QwQ models as needed
            model: "qwen-turbo",
            messages,
            stream: true,
            top_p: 1,
            temperature: 0.8,
            enable_search: false,
            enable_thinking: false,
            thinking_budget: 5529,
            result_format: "message"
        });
        console.log('='.repeat(20) + 'Thinking Process' + '='.repeat(20));

            let endFor = false;

            
        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log('Usage:');
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0].delta;
            
            // Only collect reasoning content
            if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
                if (!isAnswering) {
                    process.stdout.write(delta.reasoning_content);
                }
                reasoningContent += delta.reasoning_content;
            }


            // Receive content, start responding
            if (delta.content !== undefined && delta.content) {
                if (!isAnswering) {
                    console.log('='.repeat(20) + 'Complete Response' + '='.repeat(20));
                    isAnswering = true;
                }
                // console.log('delta.content:::', delta.content);
                answerContent += delta.content;
                
                if (!endFor) {
                    for (const char of delta.content) {
                        phrasesBuffer += char;
                        // console.log('phrasesBuffer:::', phrasesBuffer);
                        
                        if (!inPhrasesField) {
                            const phrasesMatch = phrasesBuffer.match(/"phrases":\s*"/);
                            if (phrasesMatch) {
                                inPhrasesField = true;
                                const idx = phrasesBuffer.indexOf(phrasesMatch[0]) + phrasesMatch[0].length;
                                phrasesBuffer = phrasesBuffer.substring(idx);
                            }
                        }
                        
                        if (inPhrasesField) {
                            if (char === '|') {
                                originalText = phrasesBuffer.slice(0, -1).trim();
                                phrasesBuffer = '';
                            } else if (char === '/' && phrasesBuffer.endsWith('//')) {
                                phrasesBuffer = phrasesBuffer.slice(0, -2);
                                console.log('\n原文: ' + originalText);
                                console.log('译文: ' + phrasesBuffer.trim());
                                console.log('---');
                                phrasesBuffer = '';
                                originalText = '';
                            }  else if (phrasesBuffer.endsWith('",')) {
                                phrasesBuffer = phrasesBuffer.slice(0, -2);
                                console.log('\n原文: ' + originalText);
                                console.log('译文: ' + phrasesBuffer.trim());
                                console.log('---');
                                phrasesBuffer = '';
                                originalText = '';
                                endFor = true;
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('answerContent>> ', answerContent);
    }
}

main();