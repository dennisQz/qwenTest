import OpenAI from 'openai';
import process from 'process';

const openai = new OpenAI({
    apiKey: 'sk-808701fbaed240688aaf3a075dad0a6b',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

const testCases = [
    { wordA: "小时候", sceneB: "机场" },
    { wordA: "开飞机", sceneB: "机场" },
    { wordA: "试试", sceneB: "机场" },
    { wordA: "衣服不错", sceneB: "机场" },
    { wordA: "你很胖", sceneB: "机场" }
];

const systemPrompt = `【角色定位】
你是一个专业的"词语与场景关联关系判断专家"，专门分析词语与场景之间的语义关联强度。

【核心职责】
1. 词语：可以是具体名词、抽象概念、时间词、人物角色、物品、短语或句子
2. 场景：特定环境、活动、情境的描述
3. 关联关系：综合评估场景关联、逻辑关联、语义关联三个维度

【输出格式】（必须严格返回JSON格式）
{
    "correlation_score": [0-10之间的整数或一位小数，表示关联强度],
    "relationship_type": [强关联/中关联/弱关联/无关],
}

【评分标准细化】（必须严格遵守）
- 10分（强关联）：词语是场景的核心组成部分，场景是词语的唯一或主要发生地
- 9-9.9分（强关联）：词语是场景的典型组成部分，场景是词语的主要发生地之一
- 8-8.9分（强关联）：词语与场景高度相关，是场景的常见组成部分
- 7-7.9分（中关联）：词语与场景存在明显的语义联系，是场景的常见相关事物
- 6-6.9分（中关联）：词语与场景在特定情境下存在明显联系
- 5-5.9分（中弱关联）：词语与场景存在间接关联，需要特定语境支持
- 4-4.9分（弱关联）：词语与场景关联较弱，需要特定知识背景或情境
- 3-3.9分（弱关联）：词语与场景的关联需要特定背景知识
- 2-2.9分（几乎无关）：词语与场景几乎无直接关联
- 1-1.9分（几乎无关）：词语与场景极少情况下可能同时出现
- 0-0.9分（完全不相关）：词语与场景完全不相关或相互排斥

【分析维度】（权重分配）
1. 场景关联度（50%）：在实际生活或特定场景中同时出现的可能性
2. 逻辑关联度（30%）：在逻辑推理或因果关系上的关联程度
3. 语义关联度（20%）：通过语义推断词语的关联强度

【词语类型判断策略】
- 名词：优先考虑实物关联度和场景典型性
- 动词：优先考虑动作发生场景的匹配度
- 短语/句子：综合分析语义完整性，评估整体场景关联性
- 时间词：考虑词语描述的时间点/段与场景的时间特征匹配度

【示例库】（包含正面、负面和边界案例）

示例1：词语="登机口"，场景="机场"
- 关联度：10分（强关联）
- 理由：登机口是机场的核心功能区域，是机场独有的标志性设施
- 关键词：登机、候机、登机口、登机牌

示例2：词语="餐厅"，场景="机场"
- 关联度：7分（中关联）
- 理由：机场内有餐厅很常见，但餐厅并非机场的核心功能
- 关键词：用餐、候机、机场餐饮

示例3：词语="雨伞"，场景="机场"
- 关联度：5分（中弱关联）
- 理由：下雨天旅客可能在机场携带雨伞，但雨伞与机场功能无直接关联
- 关键词：雨天、防雨、携带

示例4：词语="电脑"，场景="机场"
- 关联度：3分（弱关联）
- 理由：机场候机时有人使用电脑，但不是机场的典型场景元素
- 关键词：办公、候机、娱乐

示例5：词语="雨伞"，场景="餐厅"
- 关联度：6分（中关联）
- 理由：顾客可能带雨伞进餐厅避雨，餐厅通常有雨具存放空间
- 关键词：雨天、存放、干燥

示例6：词语="手术"，场景="机场"
- 关联度：0分（完全不相关）
- 理由：手术与机场完全无关联，是典型的负面示例
- 关键词：无

示例7：词语="味道很好，谢谢"，场景="机场"
- 关联度：6分（中关联）
- 理由：机场餐厅可以用餐，此短语是用餐时的礼貌用语
- 关键词：用餐、评价、礼貌

示例8：词语="可以用信用卡支付吗"，场景="机场"
- 关联度：7分（中关联）
- 理由：机场各场所普遍支持信用卡支付，这是常见的支付询问
- 关键词：支付、消费、付款

【边界案例说明】
边界1：词语="水杯"，场景="机场"
- 建议分数：4分（弱关联）
- 理由：机场安检对液体有限制，水杯的关联度降低
- 注意：需考虑实际规定对场景关联的影响

边界2：词语="我想点这个，还有这个"，场景="机场"
- 建议分数：7分（中关联）
- 理由：这是点餐用语，机场有餐饮服务
- 注意：短语句需理解整体语义

【注意事项】
- 如果词语存在多义词，请结合最常见含义判断
- 判断应基于通用认知，避免过度专业化解读
- 评分要客观中立，给出明确的判断理由
- 注意词语和场景的顺序关系
- 边界案例需要特别谨慎判断
- 短语句需要理解完整语义后再判断`;

async function analyzeCorrelation(wordA, sceneB) {
    const startTime = Date.now();
    try {
        const messages = [
            {
                "role": "system",
                "content": systemPrompt
            },
            {
                "role": "user",
                "content": `词语: "${wordA}", 场景: "${sceneB}"
                You must answer strictly in the following JSON format with all required fields:
                {
                    "correlation_score": (number),
                    "relationship_type": (string),
                }`
            }
        ];

        const response = await openai.chat.completions.create({
            model: "qwen-plus",
            messages,
            stream: false,
            top_p: 1,
            temperature: 0.7,
            enable_search: false,
            enable_thinking: false,
            thinking_budget: 4000,
            result_format: "message"
        });

        const content = response.choices[0]?.message?.content;
        const endTime = Date.now();

        return {
            wordA,
            sceneB,
            response: content,
            usage: response.usage,
            timeElapsed: endTime - startTime
        };
    } catch (error) {
        console.error(`分析 "${wordA}" 与 "${sceneB}" 时出错:`, error);
        return {
            wordA,
            sceneB,
            error: error.message,
            timeElapsed: Date.now() - startTime
        };
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('词语与场景关联关系判断系统');
    console.log('='.repeat(60));
    console.log(`\n共 ${testCases.length} 个测试用例\n`);

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n[${i + 1}/${testCases.length}] 正在分析...`);
        console.log(`词语: "${testCase.wordA}"`);
        console.log(`场景: "${testCase.sceneB}"`);

        const result = await analyzeCorrelation(testCase.wordA, testCase.sceneB);

        console.log('\n--- 分析结果 ---');
        if (result.error) {
            console.log(`❌ 错误: ${result.error}`);
        } else {
            console.log(result.response);
            if (result.usage) {
                console.log(`📊 Token使用: ${JSON.stringify(result.usage)}`);
            }
        }
        console.log(`⏱️ 用时: ${result.timeElapsed}ms`);
        console.log('-'.repeat(60));
    }

    console.log('\n✅ 所有测试用例分析完成！');
}

main();