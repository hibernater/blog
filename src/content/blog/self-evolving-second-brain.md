---
title: "自进化第二大脑：从想法到 MVP"
description: "六个 AI 角色 + 三层 wiki 沉淀机制 — 一套能自我进化的认知系统设计。"
pubDate: "2026-05-12"
tags: ["second-brain", "multi-agent", "system-design"]
---

> 整理自与山鸡的讨论，2026年5月12日
> 状态：MVP 已上线，每日 8:30 + 每周一 10:00 自动运行

---

## 一、起点：一个想法

晓宁提出：

> 自进化的认知系统，应该从我的目标或者我的困惑中，自动发现我缺少的认知、我有哪些不足，来建议我补全。并且有个 agent 或者任务，为我定制化地建立我需要的知识库。

这是个有吸引力的想法，但要让它真正可用，必须先回答几个根本性问题。

---

## 二、关键决策点

### 决策一：诊断认知，还是推荐内容？

最初的方向选择有三个：

- **推荐内容**："你应该读这篇文章"——简单但浅
- **诊断认知**："你在 X 方面有盲区，这里是结构化的知识地图"——核心价值
- **自动生产内容**："帮你把知识库建好"——容易跑偏，质量难控

**决策：诊断优先，知识库是结果而不是目的。**

理由：内容推荐是被动的，认知诊断是主动的——后者能反向驱动你去补什么，知识库的丰富是诊断的副产物。

### 决策二：信号源——已知的已知 vs unknown unknowns

可用的信号源分为两类：

**显性信号**：你主动问的问题、说"我没明白"的时刻、搜索的关键词

**隐性信号**：和我的判断有分歧的地方（认知边界）、决策时犹豫的地方、反复出现的同类问题

但**两者都只能观察"你已经触碰到的边界"**，无法发现"完全不知道的东西"——这就是经典的 unknown unknowns 问题。

晓宁的洞察：

> 我如果可以定义我这个角色应该掌握什么，那就不是 unknown unknowns 问题了。

**决策：unknown unknowns 必须靠外部参照系，不能靠用户自定义。**

两种外部权威：
- **角色锚定**：你这个角色（阿里 AI 团队 Leader + 创业公司董事）应该掌握什么
- **前沿牵引**：领域最前沿在讨论什么，你还没接触到的就是潜在盲区

### 决策三：MVP 单 Agent，还是多 Agent 拆分？

参考了 codex 给晓宁的方案，里面列了 8 个专业 Agent：Research / Critic / Translator / Memory / Self-Modeling / Gap-Analyst / Experiment / Evolution-Coach。

**决策：MVP 阶段用单 Agent 实现所有角色，等出现专业化痛点再拆。**

理由（来自我们对 multi-agent 架构的讨论）：当前 LLM 可靠性不足以支撑无中心协调，所有大厂都收敛到 Orchestration。一上来搞 8 个 Agent 是过度工程。

**拆分时机的判断标准**：主 Agent 单次任务上下文超过某个阈值时，就是拆分信号。

### 决策四：和现有 5 个 wiki 什么关系？

现状：5 个 wiki（agent-engineering-wiki / investment-wiki / reading-wiki / ai-news-wiki / hermes blog）都是"原料堆"，彼此没有联系。

**决策：框架共用，配置分离——不要为每个领域建独立系统。**

理由：
- 目标地图是统一的人，不是有 5 个齐晓宁
- 困惑和缺口本质上跨域（"中小企业 AI 产品 PMF"既是 AI 也是商业问题）
- 维护成本：5 套系统 = 5 个 skill + 10 个 cron + 5 套地图，不可持续

### 决策五（核心争议）：second-brain 能不能直接写主 wiki？

这是最关键的决策点。晓宁敏锐地指出矛盾：

> 现在的 wiki 是"我已有的认知"，second-brain 回血的 wiki 是"我需要补充的认知"，second-brain 如果能回写 wiki，怎么区分这两种认知？

如果系统直接写主 wiki，下一轮诊断时无法区分"我懂的"和"系统给我塞的"——这会导致**系统让你误以为自己懂**，认知反向腐化。

**决策：状态机 + 确认仪式**

```
gap (盲区，系统识别)
  ↓ 系统自动 Research
inbox/ (status: pending)
  ↓ 用户说"我开始看了"
status: reviewing
  ↓ 用户说"我消化了"
status: mastered
  ↓ 用户说"沉淀到 wiki"
主 wiki (status: synthesized)
```

**核心边界**：
- gap → inbox 是系统自动的
- inbox → reviewing → mastered → synthesized **必须用户显式触发**
- 主 wiki 永远只读，second-brain 不能直接写

**这个设计的深层意义**：

把"系统主动补全"和"人主动消化"分成两个清晰的世界——

> 自进化的边界是：系统可以无限扩展 inbox，但永远不能替代你的"消化"动作。

消化必须保持人来做。否则系统会让你误以为自己懂，那是认知的反方向。

---

## 三、最终架构

### 数据结构

```
~/Documents/hermes/wiki/second-brain/
│
├── maps/  ← 系统大脑，所有 Agent 读写中枢
│   ├── goals.md          # 目标地图（YAML 结构化）
│   ├── confusions.md     # 困惑地图
│   └── gaps.md           # 缺口地图
│
├── inbox/  ← 系统准备的材料区
│   ├── README.md
│   └── <gap-id>-<topic>/  # 每个 gap 一个子目录
│       ├── README.md
│       ├── materials.md
│       └── .status        # pending / reviewing / mastered
│
├── daily-radar/          # 每日 AI 前沿雷达
├── weekly-memos/         # 周度深度研究备忘录
└── evolution-tasks/      # 进化任务清单
```

### 三张地图的格式

YAML 结构化，每条有唯一 id，便于 Agent 增删改查、互相关联、状态追踪。

**goals.md**：目标，按 scope 分（阿里/董事/投资/健康）

**confusions.md**：当前开放问题，status: open / exploring / resolved / stale

**gaps.md**：认知缺口，priority: high / medium / low，detected_at + source 必填

**关键纪律**：
1. 只追加，不覆盖（历史是认知演化痕迹）
2. 状态变化必须留痕（保留 raised_at，新增 resolved_at）
3. 每次更新加 source 字段（从哪个对话/项目检测到）
4. 拿不准的不写

### 三种运行模式

**MODE=daily（每天 8:30）**

```
Research（采集前沿）
  ↓
Critic（评估过滤：可信度/新颖性/相关性/hype 风险）
  ↓
Translator（转化：对 G001-G004 目标的意义）
  ↓
写入 daily-radar/YYYY-MM-DD.md
推送 top 5 到微信
```

**MODE=weekly（周一 10:00）**

```
Self-Modeling（扫对话 + blog + wiki 变更）
  ↓
更新三张地图（追加，不覆盖）
  ↓
Gap Analyst（对照参照系找 unknown unknowns）
  ↓
Research（推进 top 2-3 个 gap 到 inbox/）
  ↓
Evolution Coach（生成下周进化任务）
  ↓
深度研究主题（可选，写入 weekly-memos/）
  ↓
推送周报到微信
```

**MODE=digest（响应用户消化确认）**

用户在对话中说：
- "GP076 我开始看了" → status: reviewing
- "GP076 消化了" → status: mastered
- "沉淀 GP076 到 wiki" → 生成草稿给用户 review，确认后写入主 wiki

### 实体清单

**Skill**：`second-brain-agent` v2.0

**Cron 任务**：
- `第二大脑-每日雷达`（每天 8:30）
- `第二大脑-周度循环`（周一 10:00）

**参照系**：`~/Documents/hermes/cognitive-reference-v1.md`

---

## 四、6 个月后的样子

### 数据规模

```
maps/
├── goals.md          # 40+ 条（4 个目标拆解成 sub-goals）
├── confusions.md     # 120+ 条（open 20, resolved 80, stale 20）
└── gaps.md           # 80+ 条（filled 40, open 40）

daily-radar/          # 180 个文件
weekly-memos/         # 26 个深度研究
evolution-tasks/      # 26 周任务
inbox/                # 持续流动，pending/reviewing/mastered 状态各占一部分
```

### 涌现行为

3-6 个月后系统能做的事：

**1. 跨周对比**：
> 你 3 个月前的 confusion C034，现在 gaps 里出现了相同主题，说明这块没真补。

**2. 决策记录追溯**：
你做过的判断（"觉得 Choreography 短期不成立"）会被关联到原始对话，半年后被证伪/印证时自动提醒。

**3. 个人模型成熟**：
从 maps 反推出你的认知特征——"你倾向系统性思考但商业方法论是薄弱区"——这是真正的 Self-Modeling。

**4. 学习的反馈循环**：
完成 evolution-tasks 后，相关 gap 自动 filled，下次诊断不再推同样的盲区。

### 5 个原 wiki 的演化

| Wiki | 6 个月后 | 联动机制 |
|------|---------|---------|
| agent-engineering-wiki | 14页 → 30+页 | second-brain 识别 gap → 占位 → inbox 准备 → 用户消化 → 回灌 |
| investment-wiki | 取决于 goals 里有没有投资目标 | 同上 |
| reading-wiki | 反映这半年认知输入流 | 阅读完 → 触发地图更新 |
| ai-news-wiki | 被 daily-radar 替代 | daily-radar 直接归档进去 |
| hermes blog | 6 个月后最有价值的目录 | second-brain 实体 |

### 6 个月后最核心的资产

不是 daily 雷达，而是 **maps/**：

> 三张地图记录了你这半年认知是如何演化的，这是任何 wiki 都无法替代的"思维考古资产"。

---

## 五、核心设计原则

### 1. 双向流动，不是单向推送

```
wiki → second-brain：wiki 是"已有认知"原料
second-brain → wiki：诊断结果指导 wiki 该补什么
```

### 2. 物理隔离 + 仪式流动

- "已有认知"（5 个主 wiki）和"待补充认知"（inbox/）物理隔离
- 通过显式的消化仪式可以流动
- 系统永远不能跨越这个边界

### 3. 系统的边界

**系统可以做的**：
- 扫描对话、采集前沿、过滤评估、生成材料
- 更新地图（追加，不覆盖）
- 准备 inbox（pending 状态）

**系统不能做的**：
- 直接写主 wiki
- 自动 synthesize 到 wiki
- 删除地图历史
- 替代用户的"消化"动作

### 4. 反馈闭环

每次执行末尾必须自检：
- 我可能错过了什么
- 哪些判断我没把握
- 当前 inbox 待消化的有哪些

用户的反馈通过对话流回 context（session_search），用于下次执行。

---

## 六、一句话总结

> **自进化第二大脑的本质不是让 AI 替你思考，而是让 AI 帮你看见你看不见的盲区，然后老老实实地等你自己消化。**

系统的所有自动化都服务于"加快你的认知演化"，但**绝不能让你误以为自己懂了**——那是认知的反方向。

---

## 七、未来扩展方向

**短期（1-3 个月）**：
- 跑起来后基于反馈迭代 skill
- 优化 daily 雷达的过滤标准（噪音问题）
- 优化 weekly 周报的信息密度

**中期（3-6 个月）**：
- 加入跨域 gap 检测（投资判断 vs AI 判断的对照）
- 加入决策追溯机制（你的判断被证伪/印证时自动提醒）
- 扩展到投资、健康领域（共用框架，配置分离）

**长期（6 个月+）**：
- 拆分专业 Agent（出现专业化痛点时）
- 引入 LLM-as-Judge 评估系统输出质量（呼应 Harness 五元组）
- 个人判断框架的结构化沉淀

---

## 相关文档

- 配套讨论：`agent-architecture-orchestration-vs-choreography.md`（multi-agent 架构基础）
- 配套讨论：`harness-design-best-practices.md`（Harness 五元组，本系统的方法论基础）

---

*山鸡 × 晓宁，2026-05-12*
