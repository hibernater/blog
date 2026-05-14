---
title: "Multi-Agent 架构演进：从自协调失败到 Orchestration 收敛"
description: "为什么去中心化的 Agent Swarm 在真实场景下集体躺平？从 Cursor 实证教训说起，重新理解 Agent 编排的层级必要性。"
pubDate: "2026-05-12"
tags: ["agent-architecture", "multi-agent", "orchestration"]
---

> 整理自与山鸡的两天对话，2026年5月11-12日

---

## 背景：为什么要讨论 Agent 架构

我们在做余田里民宿会员系统时，用 Claude Code 跑多阶段工程任务，暴露了一个现实问题：如何让 Agent 可靠地串行推进多个阶段？这让我们开始系统地思考 multi-agent 协调的本质。

---

## 第一章：起点——自协调为什么失败

### Cursor 的两个血泪实验

Cursor 团队公开分享了他们在生产环境中踩过的两个坑：

**坑一：平等 Agent + 共享文件 + 锁机制**

让 20 个 Agent 地位平等，通过共享文件和文件锁协调工作。结果：吞吐量退化成 2-3 个 Agent 的水平。锁竞争把并行优势彻底抵消。这是经典的"协调开销大于执行收益"——和分布式系统里加锁的代价完全一样。

**坑二：无层级结构导致 Agent 躺平**

没有明确主从关系，Agent 集体倾向于只做小的、安全的任务，主动回避困难任务。没有人负责分配困难任务，困难任务自然就没人做。

**核心洞察**：这两个失败揭示了一个规律——**LLM Agent 在没有外部约束的情况下，会自发地向低风险、低复杂度收敛**。这不是 bug，而是 LLM 本身的特性：输出概率最高的是"安全"的回答，而不是"最优"的回答。

### Cursor 的解法：Planner + Worker + Judge

```
Planner
  ├── 持续探索代码库，创建任务
  ├── 可以递归生成子 Planner（分布式层级）
  └── 不执行，只规划

Worker
  ├── 认领任务，只管执行
  └── 不协调，不看全局

Judge
  ├── 每轮结束后决定是否继续
  └── 下一轮从干净状态开始（防止上下文污染）
```

关键点：**层级是必要的，但不等于中央集权。** Planner 可以递归下放，执行层完全解耦。Judge 的存在是为了断点重启——这解决了 Agent 运行时间越长、上下文越脏的问题。

### 我们之前的误判

在这之前，我曾认为"协议层自主认领"是更优雅的方向——给 Agent 一个任务队列，Agent 自己来认领，不需要中心调度。Cursor 的实证结果证明这在生产环境是错的：**没有层级，就没有问责链；没有问责链，困难任务就没人做。**

---

## 第二章：Anthropic 的工程实践——保守但可靠

官方文档：https://platform.claude.com/docs/en/managed-agents/overview

Anthropic 给出了更保守的答案：**Coordinator + Worker，强制压扁为一层。**

```
Coordinator（主线程 / primary thread）
    ├── Worker Agent A（独立 session thread，隔离 context）
    ├── Worker Agent B（独立 session thread，隔离 context）
    └── Worker Agent C（独立 session thread，隔离 context）
```

### 关键设计决策

| 设计 | 细节 | 背后逻辑 |
|------|------|---------|
| 深度限制为 1 层 | depth > 1 直接忽略 | 防止层级爆炸，保证可观测性 |
| 共享 filesystem，隔离 context | 文件可共享，对话历史完全隔离 | 协作但不干扰推理 |
| 并发上限 25 threads | 不是无限扩展 | 防止资源失控 |
| Coordinator 可 spawn self | `{"type": "self"}` | 允许有限递归而不破坏约束 |
| Threads 持久化 | Coordinator 可多轮与同一 Worker 交互 | 支持 Judge 角色的迭代循环 |

### 两个最有价值的设计

**1. primary thread 作为 condensed view**

所有 Worker 的活动在主线程只显示开始/结束，不展开细节。想看某个 Worker 的具体推理，再 drill into 它的 session thread。

这解决了 multi-agent 可观测性的核心问题：**信息密度分层**——调用方看摘要，调试时看细节。

**2. Threads 持久化而非一次性 fan out**

Coordinator 可以后续再发消息给之前的 Worker，Worker 保留完整历史。这不是"发出去就完了"的单向委托，而是支持"评估→反馈→重做"的多轮对话。这就是 Judge 角色在这套架构里的实现方式。

### 与 Cursor 的对比

| 维度 | Cursor Planner | Anthropic Managed |
|------|---------------|-------------------|
| 层级深度 | 递归无限 | 强制 1 层 |
| 任务分配 | Planner 主动探索 | Coordinator 静态 roster |
| 容错 | Judge 断点重启 | Thread 持久化重发 |
| 可观测性 | 弱（递归树难追踪）| 强（primary thread 聚合）|
| 风险 | 层级爆炸、失控 | Coordinator 上下文成瓶颈 |

---

## 第三章：Kimi Agent Swarm——混合架构的实践

官方 arxiv 论文：[Kimi-Researcher (2505.00362)](https://arxiv.org/abs/2505.00362)，2025年5月1日
产品发布：2025年5月7日，Moonshot AI CEO 杨植麟称其为"全球首个完整 Agent 闭环"

Kimi 自我标榜"群体智能/Swarm Intelligence"，但实际架构是：

```
[Orchestrator]  ──── Orchestration 层（全局控制）
      ↓ 任务分解（HTN 层次任务网络）
[Agent Pool]
  Agent A ←→ Agent B  ─── 局部 Choreography（同级直接协作）
  Agent C ←→ Agent D
      ↓ 汇报结果
[Orchestrator]  ──── 结果聚合 + 自我反思
```

### 三层架构

- **感知与理解层**：用户意图识别、任务分类、上下文管理
- **规划与协调层**：Orchestrator，基于 HTN（Hierarchical Task Network）做任务分解，生成 DAG 依赖图，支持动态重规划
- **执行层**：Search Agent / Code Agent / File Agent / Analysis Agent，支持同级直接通信

### Kimi-Researcher 的两个核心机制（论文实证）

**Sampling-and-Search 范式**
- 多 Agent 并行使用不同策略搜索（宽泛策略 + 精准策略）
- 然后对比、调和冲突信息
- 这就是"群体"的实质：不是让 Agent 互相通信，而是多路并行然后汇总

**Critique-Revision Cycle**
- 独立模块对合成报告进行批评（独立 Agent，避免自我确认偏差）
- 再基于反馈修订
- 这就是 Kimi 版本的 Judge 角色

**实验结果**：在自动 Peer Review benchmark 上超越 GPT-4o 和 Claude 3.5 Sonnet。

### 技术底座的独特性

Kimi 有一个其他两家没有的底牌：**超长上下文（128K-1M token）**。

这让 Orchestrator 可以在同一上下文中维护所有 Sub-Agent 的输出，减少信息丢失和跨 Agent 的一致性问题。但这也是一个值得警惕的选择：用上下文长度换取架构复杂度，本质上是**绕开分布式协调问题而不是解决它**。

---

## 第四章：横向对比——三家的收敛点

| | Cursor | Anthropic Managed Agents | Kimi Agent Swarm |
|--|--------|--------------------------|-----------------|
| **本质模式** | Orchestration | Orchestration | Orchestration 为主 |
| **层级深度** | 递归（可控） | 强制 1 层 | 1-2 层，局部 Choreography |
| **任务分配** | Planner 主动探索 | Coordinator 静态 roster | Orchestrator 动态 HTN |
| **容错机制** | Judge 断点重启 | Thread 持久化重发 | Critique-Revision Cycle |
| **并行策略** | Worker 独立执行 | Session thread 隔离 | Sampling-and-Search |
| **可观测性** | 弱 | 强（primary thread 聚合）| 中（流式实时可见）|
| **开放程度** | 工程实践/框架 | 托管 API | 产品化（黑盒）|
| **独特优势** | 递归 Planner 的灵活性 | primary thread 信息分层 | 超长上下文作为共享骨干 |

**三家都收敛到了 Orchestration**。这不是巧合，而是当前 LLM 可靠性水平下的必然选择。

---

## 第五章：更深的问题——这是 SOA + ESB 的老路吗？

### 相似之处

- **Coordinator/Orchestrator ≈ ESB（企业服务总线）**：中央总线，所有服务的调用、路由都经过它
- **预定义 agent roster ≈ 服务注册表**：Anthropic 要求提前声明 Coordinator 能调用哪些 Worker，和 WSDL/服务目录一个味道
- **深度限制 1 层 ≈ 防止 ESB 级联**：Anthropic 意识到递归的危险，主动压扁，就像微服务架构里禁止 ESB 级联调用

### 本质差异

ESB 是**协议转换 + 消息路由**，是被动管道，不做决策。Coordinator 是**有认知的决策者**，能理解任务语义、动态决定是否拆分、拆给谁。

这让 Coordinator 比 ESB 更强，但也更脆：
- ESB 挂了可以换一台，无状态
- Coordinator 上下文满了整个任务链崩溃，有状态

Kimi 用超长上下文（1M token）作为解法——相当于把 ESB 的硬件无限扩容。这是在绕开问题，不是解决问题。

### 更准确的类比：Orchestration vs Choreography

微服务领域有个经典问题：

- **Orchestration（中心协调）**：一个协调者知道全局，指挥所有服务——清晰可控，但中心是瓶颈
- **Choreography（事件驱动自协调）**：每个服务只订阅事件、发布结果，没有中心——灵活，但状态追踪困难

微服务最终的工程实践是两者共存。**但 Agent 领域目前几乎所有大厂都在押 Orchestration**，原因只有一个：**LLM 的可靠性还不够高，没有中心就没有问责链，出错就没法追溯和纠正。**

---

## 第六章：未来方向——Choreography 的成立条件

纯 Choreography 在 Agent 领域短期不成立，需要三个前提：

**1. 单个 LLM 可靠性足够高**

当 Agent 完成子任务的成功率足够高（比如 >95%），就不需要一个中心节点来兜底和重试。现在还差得远。

**2. Agent 间通信协议标准化**

MCP（Model Context Protocol）是一个方向——统一工具调用接口。但 Agent 间的任务委托、结果验证协议还是空白。

**3. 可观测性工具成熟**

事件驱动系统最大的问题是"出了事不知道在哪出的"。Agent 领域需要分布式追踪在 Agent 层的等价物——每个 Agent 的输入输出、工具调用、推理链路都要可追溯，且不需要中心节点来汇总。

### 战略判断

**现在所有人都在 Orchestration 上做深**，这个窗口期本身就是机会。

谁先把以下问题工程化，谁就定义下一代 Agent 架构：
- Agent 级别的 saga pattern（分布式事务）
- 基于事件溯源的 Agent 状态管理
- 去中心化的 Agent 能力发现协议

这才是真正跳出 SOA 思维的方向，也是从"AI 工具"走向"AI 系统"的关键跨越。

---

## 相关资源

| 资源 | 链接 |
|------|------|
| Anthropic Managed Agents 概览 | https://platform.claude.com/docs/en/managed-agents/overview |
| Anthropic Multiagent Sessions | https://platform.claude.com/docs/en/managed-agents/multiagent-sessions |
| Kimi-Researcher 论文 | https://arxiv.org/abs/2505.00362 |
| Kimi k1.5 技术报告 | https://arxiv.org/abs/2501.12599 |
| OpenAI Swarm（Choreography 参考实现）| https://github.com/openai/swarm |

---

*山鸡 × 晓宁，2026-05-11/12*
