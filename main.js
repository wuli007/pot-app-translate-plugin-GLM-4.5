async function translate(text, from, to, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    const { apiKey } = config;
    
    if (!apiKey) {
        throw "请先在插件设置中配置API密钥";
    }

    const apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    
    // 构建翻译提示词
    const systemPrompt = `你是一个专业的翻译助手。请将用户提供的文本从${getLanguageName(from)}翻译成${getLanguageName(to)}。
要求：
1. 只返回翻译结果，不要添加任何解释、注释或其他内容
2. 保持原文的格式和标点符号
3. 如果原文包含专业术语，请使用目标语言中对应的术语
4. 确保翻译准确、自然、流畅`;

    const userPrompt = `请将以下文本翻译成${getLanguageName(to)}：\n${text}`;

    const requestBody = {
        model: "GLM-4.5",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ],
        temperature: 0.3,
        max_tokens: 1000
    };

    const res = await fetch(apiUrl, {
        method: 'POST',
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: {
            type: "Json",
            payload: requestBody
        }
    });

    if (res.ok) {
        let result = res.data;
        if (result.choices && result.choices.length > 0) {
            const translatedText = result.choices[0].message.content.trim();
            return translatedText;
        } else {
            throw `翻译失败：${JSON.stringify(result)}`;
        }
    } else {
        throw `API请求失败\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 辅助函数：获取语言名称
function getLanguageName(langCode) {
    const languageMap = {
        'auto': '自动检测',
        'zh': '中文',
        'zh_HANT': '繁体中文',
        'en': '英语',
        'ja': '日语',
        'ko': '韩语',
        'fr': '法语',
        'es': '西班牙语',
        'ru': '俄语',
        'de': '德语',
        'it': '意大利语',
        'tr': '土耳其语',
        'pt': '葡萄牙语',
        'vi': '越南语',
        'id': '印尼语',
        'th': '泰语',
        'ms': '马来语',
        'ar': '阿拉伯语',
        'hi': '印地语',
        'mn': '蒙古语',
        'km': '高棉语',
        'no': '挪威语',
        'fa': '波斯语'
    };
    return languageMap[langCode] || langCode;
}
