---
title: "我是如何使用 Hermes 和「山鸡」的"
description: "从 AI 聊天到个人 Agent 操作系统：安装 Hermes、搭建知识库、构建第二大脑，以及如何让 Agent 解决日常问题。"
pubDate: "2026-05-18"
tags: ["Hermes", "Agent", "second-brain", "knowledge-management"]
---

> 版本：v0.1  
> 适合读者：想把 AI 从「问答工具」升级成「长期助理 / 第二大脑 / 工作伙伴」的人  
> 核心观点：Hermes 不是一个更聪明的聊天窗口，而是一个能连接本地文件、知识库、工具、定时任务和消息平台的个人 Agent 操作系统。

---

## 0. 先说结论：Hermes 到底帮我解决了什么

我现在使用 Hermes，不是为了多一个聊天机器人，而是为了把 AI 变成一个长期和我一起工作的 agent。

它现在主要帮我做几类事情：

1. **日常问题解决**
   - 查资料、写文档、整理会议纪要、准备面试、做投资分析、写分享材料。

2. **本地知识库管理**
   - 把我的工作、投资、AI 工程、阅读、健康、外部咨询资料，沉淀到本地 Markdown 知识库。

3. **第二大脑**
   - 不只是存资料，而是维护我的目标、困惑、认知 gap、待消化 inbox、每周进化任务。

4. **长期个人助理**
   - 它记得我的偏好、工作背景、家庭健康档案、投资方法、常用目录、沟通风格。

5. **多工具执行者**
   - 它可以读写文件、跑命令、部署项目、截图、生成图片、发消息、定时提醒。

6. **跨设备工作台**
   - 我有 Mac Mini 和笔记本，Hermes 可以通过共享目录和 SSH 在两台机器之间协同。

我给我的 Hermes Agent 起了个名字叫：**山鸡**。

这个名字不重要，重要的是：

> 当你给 Agent 一个稳定身份、长期记忆、知识库、工具权限和工作流程后，它就不再是一次性问答工具，而会慢慢变成一个真正了解你的长期工作伙伴。

---

## 1. 适合谁使用 Hermes

Hermes 比普通 ChatGPT / Claude 更复杂，也更强。它更适合这些人：

- 经常写文档、做研究、整理信息的人
- 有大量本地资料，希望 AI 能帮忙读、整理、归档的人
- 开发者、产品经理、投资人、咨询顾问、创业者
- 想搭建个人第二大脑的人
- 想把 AI 接入 Telegram / 微信 / 钉钉 / Slack 等消息平台的人
- 想让 AI 定时执行任务，比如每日简报、投资监控、健康提醒的人
- 愿意花一点时间配置工具和工作流的人

如果只是偶尔问几个问题，普通 ChatGPT 就够了。  
如果你想让 AI 长期接管一部分信息处理和执行工作，Hermes 才值得投入。

---

## 2. Hermes 的核心结构

可以先用一个简单图理解：

```text
┌──────────────────────────┐
│ 你：通过 CLI / 微信 / 钉钉 / Telegram 发需求 │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ Hermes Agent / 山鸡        │
│ - 理解你的需求              │
│ - 调用模型                  │
│ - 选择工具                  │
│ - 执行动作                  │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ 工具层                     │
│ 文件 / 终端 / 浏览器 / 搜索 / 图片 / 消息 / cron │
└─────────────┬────────────┘
              ↓
┌──────────────────────────┐
│ 本地长期上下文              │
│ Memory / Skills / Wiki / Sessions / Scripts │
└──────────────────────────┘
```

几个关键词：

| 名词 | 解释 |
|---|---|
| Model | 背后的大模型，可以是 OpenAI、Anthropic、OpenRouter、本地模型等 |
| Tools | Agent 可调用的工具，比如读文件、写文件、跑命令、浏览器、发消息 |
| Memory | 长期记忆，记录你的偏好、身份、环境事实 |
| Skills | 可复用流程，比如“怎么做投资分析”“怎么写会议复盘”“怎么操作 GitHub PR” |
| Wiki | 你的本地知识库，通常是一堆 Markdown 文件 |
| Gateway | 消息平台入口，比如微信、钉钉、Telegram |
| Cron | 定时任务，比如每日简报、每周复盘 |

---

## 3. 安装 Hermes

> 官方文档：https://hermes-agent.nousresearch.com/docs

### 3.1 环境要求

推荐环境：

- macOS / Linux / WSL
- Python 3.10+
- Git
- 一个可用的大模型 provider
  - OpenRouter
  - Anthropic
  - OpenAI
  - DeepSeek
  - Gemini
  - 或其他 Hermes 支持的 provider

### 3.2 一键安装

官方安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装后运行：

```bash
hermes
```

第一次建议跑配置向导：

```bash
hermes setup
```

检查状态：

```bash
hermes doctor
```

切换模型：

```bash
hermes model
```

查看配置：

```bash
hermes config
```

编辑配置：

```bash
hermes config edit
```

---

## 4. 最小可用配置

刚开始不要追求一步到位。建议先做到这四件事：

```text
1. CLI 能正常聊天
2. 能读写本地文件
3. 能调用终端命令
4. 能保存 memory / skills
```

### 4.1 建议启用的工具

运行：

```bash
hermes tools
```

初始建议启用：

```text
file          读写文件
terminal      执行命令
web/search    查资料
skills        使用技能
memory        长期记忆
session_search 搜索历史会话
cronjob       定时任务
vision        图片理解
```

如果你是开发者，可以再启用：

```text
browser       浏览器自动化
delegation    子 Agent 并行任务
image_gen     生成图片
tts           文字转语音
```

### 4.2 API Key 放哪里

密钥不要写进知识库。一般放：

```text
~/.hermes/.env
```

常见环境变量：

```bash
OPENROUTER_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
OPENAI_API_KEY=xxx
GOOGLE_API_KEY=xxx
DEEPSEEK_API_KEY=xxx
```

原则：

```text
配置放 config.yaml
密钥放 .env
知识沉淀放 Documents/hermes
```

---

## 5. 给 Agent 建一个稳定身份

我给我的 Agent 起名叫“山鸡”。

这不是形式主义，而是为了让它有稳定的工作方式：

- 用中文和我交流
- 直接动手解决问题
- 不编造，不确定就说不确定
- 重要信息自动归档
- 投资和健康类问题更严格
- 长期任务少打扰，自主推进

你可以也给自己的 Agent 设一个身份，比如：

```text
我的私人研究助理
我的 AI 项目经理
我的健康管家
我的投资分析师
我的家庭数字管家
```

建议写一个 `persona` 文档，包含：

```markdown
# 我的 Agent 身份设定

## 名字

## 服务对象是谁

## 核心职责

## 沟通风格

## 不能做什么

## 重要偏好

## 常用目录

## 长期任务
```

这样 Agent 不是每次重新认识你，而是在一个稳定的人设下长期工作。

---

## 6. 搭建你的本地知识库

我建议知识库不要一开始就搞得很复杂。先用一个统一根目录：

```text
~/Documents/hermes/
```

然后按用途分：

```text
~/Documents/hermes/
  wiki/
    work-wiki/
    agent-engineering-wiki/
    second-brain/
    investment-wiki/
    reading-wiki/
    ai-news-wiki/
  blog/
  面试/
  咨询档案/
  家庭健康/
  项目档案/
```

### 6.1 每个库负责什么

| 目录 | 用途 |
|---|---|
| `work-wiki` | 工作项目、会议纪要、组织判断、项目复盘 |
| `agent-engineering-wiki` | AI 工程、Agent 架构、Harness、工具调研 |
| `second-brain` | 目标、困惑、gap、inbox、每周进化任务 |
| `investment-wiki` | 投资研究、公司档案、投资纪律 |
| `reading-wiki` | 读书笔记、思想卡片 |
| `ai-news-wiki` | AI 新闻、外部信号 |
| `blog` | 可对外分享的文章 |
| `面试` | 按公司归档面试资料 |
| `咨询档案` | 按公司/朋友/客户归档外部沟通材料 |
| `家庭健康` | 家庭健康档案、体检报告、日常记录 |

### 6.2 知识库和 Agent 的关系

给技术小白可以这样理解：

```text
知识库 = 长期记忆
Agent = 会读记忆、会思考、会做事的助手
用法 = 你直接提需求，Agent 去知识库找上下文，然后帮你完成任务
```

流程：

```text
会议 / 链接 / 文件 / 想法
        ↓
进入知识库
        ↓
Agent 读取知识库
        ↓
Agent 帮你总结、判断、行动
        ↓
结果再沉淀回知识库
```

---

## 7. 建立你的第二大脑

第二大脑不是“收藏夹”，而是一个认知任务系统。

我的 second-brain 主要维护几类东西：

```text
goals        长期目标
confusions   当前困惑
gaps         认知缺口
inbox        待消化材料
evolution-tasks 每周进化任务
weekly-memos 每周深度备忘录
```

建议目录：

```text
~/Documents/hermes/wiki/second-brain/
  maps/
    goals.md
    confusions.md
    gaps.md
  inbox/
    GP001-xxx/
      README.md
      materials.md
      .status
  evolution-tasks/
    2026-W21.md
  weekly-memos/
    2026-W21.md
```

### 7.1 inbox 的状态机

不要把所有材料都直接写进主 wiki。先进入 inbox：

```text
pending     待看
reviewing   正在消化
mastered    已理解
synthesized 已沉淀到主 wiki / blog / skill
```

流程：

```text
发现 gap
  ↓
创建 inbox
  ↓
补材料 / 提问题
  ↓
你和 Agent 一起消化
  ↓
沉淀到正式 wiki
```

### 7.2 日常怎么用

你可以直接对 Agent 说：

```text
调出最近一周的 gaps 和 confusions
```

```text
推进 GP006
```

```text
这个材料先放进 second-brain inbox，等我有空一起消化
```

```text
把 GP008 沉淀到 investment-wiki
```

---

## 8. 如何让 Agent 真的帮你解决日常问题

关键不是问“你怎么看”，而是给 Agent 一个可执行任务。

### 8.1 普通问法 vs Agent 问法

普通问法：

```text
这个项目怎么做？
```

更好的 Agent 问法：

```text
基于我的 work-wiki 和最近会议纪要，帮我整理这个项目的当前状态、主要风险、下一步行动，并写入项目档案。
```

普通问法：

```text
帮我准备面试。
```

更好的 Agent 问法：

```text
读取 ~/Documents/hermes/面试/滴滴能源/ 下的材料，结合我上次面试复盘，准备下一轮面试的主线话术、可能问题、反问清单和 90 天计划。
```

普通问法：

```text
这个链接有用吗？
```

更好的 Agent 问法：

```text
研究这个链接，判断它对我的 agent-engineering-wiki / business-os 有没有可迁移模式。如果有，归档 raw，提炼成 concept，并说明适用边界。
```

### 8.2 常用指令模板

#### 会议后

```text
这是会议纪要，帮我归档到对应公司/项目目录，提炼：
1. 对方真正关心什么
2. 暗含的组织矛盾
3. 我下一步该推动什么
4. 哪些内容值得沉淀进 wiki
```

#### 面试前

```text
基于面试/<公司>/ 下的资料，帮我准备：
1. 公司和岗位理解
2. 我的核心叙事
3. 90 天计划
4. 对方可能问的问题
5. 我应该反问的问题
```

#### 读文章/链接

```text
研究这个链接，不要只总结内容。请提炼：
1. 它解决什么问题
2. 可迁移模式是什么
3. 对我的工作/投资/agent 工程有什么启发
4. 应该归档到哪个 wiki
```

#### 项目启动

```text
帮我为这个项目建立项目档案，包括 README、当前状态、决策日志、风险清单、任务列表，并放到 ~/Documents/hermes/wiki/work-wiki/projects/<项目名>/
```

#### 复盘

```text
把这次经历沉淀成方法论：
1. 发生了什么
2. 我原来的假设是什么
3. 被什么事实修正
4. 可复用原则是什么
5. 是否需要写进 wiki 或 blog
```

---

## 9. Memory、Wiki、Skill 三者怎么分工

这三个概念容易混。

| 类型 | 放什么 | 不放什么 |
|---|---|---|
| Memory | 长期稳定事实和偏好 | 临时任务进展、一次性结论 |
| Wiki | 结构化知识、项目档案、研究材料 | 密码、token、碎片废话 |
| Skill | 可复用流程和操作手册 | 普通知识、原始资料 |

### 9.1 Memory 示例

适合放：

```text
用户偏好中文沟通
用户喜欢直接动手解决
用户的共享目录是 ~/Documents/hermes/
用户投资分析要求事实/价格/观点分离
```

不适合放：

```text
今天修了哪个 bug
某个 PR 编号
某次面试临时结论
某个项目当前进度
```

### 9.2 Wiki 示例

适合放：

```text
滴滴能源面试复盘
TangBuy 咨询材料
business-os 产品方法论
AI 工程调研
投资公司档案
```

### 9.3 Skill 示例

适合放：

```text
如何做投资委员会分析
如何归档外部咨询材料
如何用 Harness 做 AI 长任务
如何安全升级 Hermes
如何处理家庭健康报告
```

一句话：

```text
Memory 记事实，Wiki 存知识，Skill 存做法。
```

---

## 10. 让 Agent 接入微信/钉钉/Telegram

Hermes 支持 gateway，可以把 Agent 接到消息平台。

常见命令：

```bash
hermes gateway setup
hermes gateway install
hermes gateway start
hermes gateway status
hermes gateway restart
```

支持的平台很多，包括：

```text
Telegram / Discord / Slack / WhatsApp / Signal / Matrix / Email / DingTalk / Weixin 等
```

我的体验是：

- CLI 适合长任务、开发、复杂文件操作
- 微信/Telegram 适合随手问、发图片、发会议纪要
- 钉钉适合定时提醒、正式通知、日报周报

建议初学者先接一个平台，例如 Telegram 或钉钉；等稳定后再接微信。

---

## 11. 定时任务：让 Agent 主动工作

Hermes 的 cron 可以让 Agent 定时执行任务。

例如：

```text
每天早上 8 点：生成 AI 日报
每周日晚上：总结本周成长日志
每周三上午：投资反思
每天晚上：健康提醒
```

CLI 示例：

```bash
hermes cron create '0 8 * * *'
```

实际使用时，你要给 cron 一个自包含 prompt，例如：

```text
每天早上 8 点，读取最近 AI 资讯源，生成中文 AI 日报。要求：
1. 只输出用户需要看的结论
2. 每条说明验证了什么、修正了什么、用户要做什么
3. 不输出内部推理和英文 scratchpad
4. 发送到钉钉
```

定时任务的关键不是“定时调用模型”，而是让它形成固定工作流：

```text
采集 → 筛选 → 分析 → 输出 → 归档
```

---

## 12. 多设备同步：本地知识库怎么不分叉

如果你有多台电脑，最容易出问题的是目录分叉。

我的做法是：

```text
所有共享知识都放在 ~/Documents/hermes/
这个目录背后通过 iCloud Drive 同步
两台 Mac 都通过同一个路径访问
```

原则：

```text
1. 共享知识统一放 ~/Documents/hermes/
2. 不要在 ~/Documents/ 顶层到处建新目录
3. 凭据和密钥不要放 iCloud
4. 路径要稳定，Agent 和脚本都引用 ~/Documents/hermes/...
```

如果你不是多 Mac 用户，可以先不用搞复杂同步。单机目录就够了。

---

## 13. 安全和隐私边界

Hermes 很强，是因为它能读本地文件、执行命令、调用模型 API。也因此要有边界。

### 13.1 不要放进知识库的东西

```text
密码
API key
token
数据库连接串
身份证/手机号等高敏隐私原文
公司高度机密文档
未脱敏客户数据
未公开财务/交易数据
```

### 13.2 敏感资料怎么处理

建议三层：

```text
L1 可同步、可让 Agent 读
- wiki
- blog
- 脱敏会议纪要
- 方法论

L2 本地敏感，不自动同步
- 未脱敏合同
- 原始医疗报告
- 公司敏感材料

L3 凭据密钥，绝不进知识库
- .env
- Keychain
- 1Password
```

### 13.3 AI 读取边界

当你让 Agent 读取本地文件时，相关内容会进入模型上下文。  
所以如果材料非常敏感，要先脱敏，或者只让 Agent 处理摘要。

---

## 14. 一个从零开始的 7 天上手计划

### Day 1：安装并跑通 CLI

目标：能正常和 Hermes 对话。

```bash
hermes setup
hermes doctor
hermes
```

试几个问题：

```text
你现在能用哪些工具？
帮我检查当前目录有什么文件。
帮我写一个 markdown 文档。
```

### Day 2：建立知识库根目录

```bash
mkdir -p ~/Documents/hermes/wiki/{work-wiki,agent-engineering-wiki,second-brain,investment-wiki,reading-wiki,ai-news-wiki}
mkdir -p ~/Documents/hermes/{blog,面试,咨询档案,项目档案}
```

创建一个总说明：

```text
~/Documents/hermes/README.md
```

### Day 3：建立个人 Agent 身份

写一份：

```text
~/Documents/hermes/agent-persona.md
```

内容包括：

```text
我是谁
我希望 Agent 怎么帮我
我的工作方向
我的沟通偏好
我的常用目录
我的安全边界
```

然后让 Hermes 读取并总结成 memory / skill。

### Day 4：归档第一个真实项目

选一个你正在做的项目，建立：

```text
~/Documents/hermes/wiki/work-wiki/projects/<项目名>/README.md
~/Documents/hermes/wiki/work-wiki/projects/<项目名>/DECISIONS.md
~/Documents/hermes/wiki/work-wiki/projects/<项目名>/RISKS.md
~/Documents/hermes/wiki/work-wiki/projects/<项目名>/NEXT.md
```

让 Agent 帮你整理。

### Day 5：建立 second-brain

创建：

```text
second-brain/maps/goals.md
second-brain/maps/confusions.md
second-brain/maps/gaps.md
second-brain/inbox/
second-brain/evolution-tasks/
second-brain/weekly-memos/
```

问 Agent：

```text
基于我最近的工作和聊天，帮我整理当前 5 个 goals、5 个 confusions、5 个 gaps。
```

### Day 6：沉淀第一个 Skill

找一个你反复做的流程，比如：

```text
会议纪要归档
面试准备
投资分析
文章调研
项目复盘
```

让 Agent 写成 skill：

```text
把“面试准备”这个流程沉淀成一个 Hermes skill，以后我说准备某公司面试时自动执行。
```

### Day 7：设置第一个定时任务

例如每日简报：

```text
每天早上 8 点，读取我关注的 AI 新闻源，生成中文日报，按“验证了什么 / 修正了什么 / 我需要做什么”输出。
```

---

## 15. 真实使用场景示例

### 场景 1：朋友公司咨询

你发：

```text
这是 TangBuy 的背景，我要给他们分享 Harness Engineering，帮我准备课程和 Starter Kit。
```

Agent 做：

```text
1. 建立 ~/Documents/hermes/咨询档案/TangBuy/
2. 生成课程大纲
3. 生成可分享 kit
4. 打包 zip
5. 后续把方法论沉淀进 agent-engineering-wiki
```

### 场景 2：面试准备和复盘

你发：

```text
半小时后我要面试滴滴能源 CTO，帮我准备。
```

Agent 做：

```text
1. 查公开资料
2. 结合你的背景设计主线
3. 准备 90 天计划
4. 准备对方可能问的问题
5. 面试后归档纪要并写复盘
```

### 场景 3：技术文章归档

你发一个链接：

```text
看看这个 Claude Code 工程规范，对我们有没有启发？
```

Agent 做：

```text
1. 查原始项目/文章
2. 判断是否成熟
3. 提炼可迁移模式
4. 归档 raw
5. 必要时写入 agent-engineering-wiki
```

### 场景 4：家庭健康管理

你发体检报告或血糖截图：

```text
帮我看一下妈妈今天的血糖情况。
```

Agent 做：

```text
1. 归档原图
2. 提取关键指标
3. 和历史记录对比
4. 给出风险提示
5. 记录到家庭健康档案
```

### 场景 5：产品开发

你说：

```text
把 business-os 最新版本部署到笔记本，我要本地看。
```

Agent 做：

```text
1. 找到项目目录
2. 同步到另一台机器
3. 安装依赖
4. 跑 typecheck/build
5. 启动 dev server
6. 验证 HTTP 200
7. 打开浏览器
```

---

## 16. 最容易踩的坑

### 坑 1：只把 Hermes 当 ChatGPT 用

如果只是问答，价值有限。  
要让它读文件、写文件、归档、执行、复盘。

### 坑 2：知识库变成垃圾桶

不要什么都进主 wiki。建议分层：

```text
raw 原始材料
inbox 待消化
wiki 成熟知识
blog 对外表达
skill 可复用流程
```

### 坑 3：规则越写越多

Agent 规范会熵增。要定期删：

```text
这条规则还必要吗？
它应该放 memory、wiki 还是 skill？
它是长期原则还是临时补丁？
```

### 坑 4：把密钥放进知识库

不要这么做。密钥只放 `.env`、Keychain、1Password。

### 坑 5：没有验证

Agent 做完事后，要让它验证：

```text
文件是否真的写入？
服务是否真的启动？
测试是否真的通过？
链接是否真的可访问？
```

---

## 17. 我建议的最终形态

当 Hermes 用成熟后，它大概会变成这样：

```text
微信/Telegram/CLI
        ↓
你的个人 Agent
        ↓
长期 Memory + Skills
        ↓
本地知识库 Wiki
        ↓
工具执行层
        ↓
定时任务 / 消息推送 / 文档生成 / 项目执行
```

你不再需要自己记住所有上下文，也不需要每次从零解释背景。

你只需要说：

```text
帮我基于之前的资料，准备下一步。
```

Agent 就能从你的知识系统里找上下文，给你产出结果，并把结果继续沉淀回系统。

---

## 18. 给朋友的最小落地建议

如果朋友想开始，不要让他一上来搭完整系统。

建议只做三步：

### 第一步：安装 Hermes，跑通 CLI

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes setup
hermes doctor
hermes
```

### 第二步：建一个本地知识库目录

```text
~/Documents/hermes/
  wiki/work-wiki/
  wiki/agent-wiki/
  second-brain/
  inbox/
```

### 第三步：选一个真实场景试跑

不要空学。直接选一个：

```text
准备一次面试
整理一次会议
研究一个项目
归档一个客户咨询
写一次周报
```

对 Agent 说：

```text
请帮我处理这个任务，并把过程和结论沉淀到 ~/Documents/hermes/ 下，形成以后可复用的结构。
```

只要跑通一个真实场景，他就能理解 Hermes 的价值。

---

## 19. 最后一段话

我对 Hermes 最大的体会是：

> 真正有价值的不是“模型更聪明”，而是你有没有给 AI 一个可以长期工作的环境。

这个环境包括：

```text
稳定身份
长期记忆
本地知识库
可调用工具
可复用技能
定时任务
消息入口
复盘机制
```

当这些组合起来，AI 才会从“聊天机器人”变成“长期伙伴”。

我的山鸡就是这么长出来的。
