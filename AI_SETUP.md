# AI API 配置说明

## 环境变量设置

在 Vercel 项目设置中添加以下环境变量之一：

### OpenAI API
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Claude API (Anthropic)
```
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
```

## 支持的AI服务

### 1. OpenAI GPT-3.5 Turbo
- **模型**: gpt-3.5-turbo
- **最大tokens**: 2000
- **温度**: 0.7
- **成本**: 较低
- **速度**: 快

### 2. Claude 3 Sonnet
- **模型**: claude-3-sonnet-20240229
- **最大tokens**: 2000
- **成本**: 中等
- **速度**: 中等
- **质量**: 高

## 优先级

系统会按以下优先级选择AI服务：
1. 如果设置了 `OPENAI_API_KEY`，优先使用 OpenAI
2. 如果没有 OpenAI 密钥但有 `CLAUDE_API_KEY`，使用 Claude
3. 如果都没有设置，返回错误

## 测试

1. 在 Vercel 环境变量中设置 API 密钥
2. 重新部署应用
3. 访问数据分析页面
4. 点击"生成报告"按钮
5. 查看AI生成的报告

## 提示词特点

- 专业的教学分析师角色
- 基于真实班级数据生成报告
- 包含统计分析、建议和改进措施
- 使用Markdown格式，支持emoji
- 针对教育场景优化

## 故障排除

如果AI报告生成失败，请检查：
1. API密钥是否正确设置
2. API密钥是否有效且有足够额度
3. 网络连接是否正常
4. 查看浏览器控制台错误信息
