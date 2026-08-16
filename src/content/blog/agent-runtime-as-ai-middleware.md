---
title: "Agent Runtime 是 AI 时代的中间件"
description: "从十五年前 Ocean 通讯网关的亲历架构出发，重新判断 Agent Runtime、通用 Agent 产品与业务 Agent 的边界。"
pubDate: "2026-08-16"
tags: ["Agent Runtime", "中间件", "插件架构", "企业Agent", "架构思想史"]
author: "齐晓宁"
originType: "轻编辑"
originNote: "保留 Ocean 亲历架构与争论推进过程，删除了与 DeepSeek Harness 源码分析重复的严格映射和产品细节。"
originSources:
  - "《Agent Runtime 是 AI 时代的中间件：一场从 Ocean 通讯网关吵到 DeepSeek Harness 的讨论》（2026-08-14）"
topic: "enterprise-agent-architecture"
topicOrder: 5
---

我第一次看到 DeepSeek Harness 的插件架构时，脑子里跳出来的不是 Codex，也不是又一个 Agent Framework，而是十五年前参与建设的 Ocean 通讯网关。

一位老朋友看完后问我：

> “Agent 里面哪一层，就相当于你们以前哪一层？”

我当时回答得很直接：

> “Agent 就是中间件，一毛一样。”

这句话很快遭到反驳：Ocean 处理的是通信协议，Agent 处理的是理解、规划和行动；架构同构，不代表对象相同。争论来回几轮以后，我最终保留了原判断，但补全了主语：

> **Agent Runtime 是 AI 时代的中间件；通用 Agent 是中间件加通用产品；业务 Agent 则是运行在这层中间件之上的领域应用。**

这不是文字游戏。主语是否准确，会直接决定企业应该建设共享 Runtime，还是让每个业务团队各做一套“大 Agent”。

## 为什么 Ocean 会让我想到 Agent Runtime

Ocean 当年面对的是大量异构的 Consumer 和 Provider。不同系统使用不同协议，也有不同的加密、认证、连接、路由和业务规则。

如果所有差异都写进网关核心，每接一种协议、一个业务单元，核心就要修改一次。最后主干会变成一个谁都不敢动的巨石。

我们的解法是：

1. 保留稳定的协议转换核心和运行顺序；
2. 先把不同请求转换成标准中间态；
3. 在解析、转换、路由、授权、加密、连接等关键边界开放受控 Plugin；
4. 让变化快、差异大的业务规则从核心剥离出去。

我后来所说的“核心最后只剩一个空壳”，并不是核心没有价值。恰恰相反，它留下的是最稳定、最值得统一的部分：标准中间态、转换顺序、运行生命周期，以及插件介入的位置。

DeepSeek Harness 面对的对象变成了模型、Tool、Skill、Session、Sandbox 和 Agent Loop，但它解决的工程矛盾很相似：

> **哪些能力应该进入稳定内核，哪些变化应该通过明确的扩展合同进入。**

DeepSeek Harness 官方把自己的架构概括为“Everything is a plugin”。其架构文档显示，模型适配器、工具注册表、Session Log 乃至 Agent Loop 本身都通过 Cordis 插件组合。Cordis 论文则把动态组合拆成空间可组合性与时间可组合性：组件不仅要能装上去，卸载时还要能撤销副作用；依赖变化后，系统还要能停用、恢复和重组。

这些源码与论文细节，我已经在《DeepSeek Harness 架构分析》中单独展开。这里真正关心的是：**为什么新的计算底座一旦进入大规模业务，都会重新需要中间件。**

## 第一次反驳为什么听起来对，却没有对准

反驳“Agent 就是中间件”最自然的方式，是把 Agent 定义成：

```text
模型推理
+ 上下文
+ 目标
+ 规划循环
+ Tool / Skill
+ 状态
+ 反馈与重规划
```

按照这个定义，Agent 是主动执行主体，中间件只是它下面的 Runtime。这个判断没有错，但它默认“Agent”指一个具体运行实例。

而我当时比较的是另一层：

- Ocean 封装不同软件系统通信时反复遇到的共同复杂性；
- Agent Runtime 封装人和业务系统使用概率智能时反复遇到的共同复杂性。

今天每一个稍微复杂的 Agent 都会重新面对：

- Context 的解析与组装；
- Session、Memory 和持久状态；
- 模型适配、选择与路由；
- Tool、MCP 与外部系统调用；
- 权限、凭证、Sandbox 和审批；
- Trace、Eval、重试、恢复和结果处理。

这些能力不属于询盘、采购、客服或作图中的任何一个具体业务。把它们从业务应用中抽离，形成统一、可复用、可治理的运行层，正是中间件一直在做的事。

真正的问题不是“Agent 有没有业务逻辑”，而是大家在用同一个词指不同的层。

## 同一个 Agent，其实指了三个东西

把语义拆开后，争论就清楚了。

### 第一层：Agent Runtime / Harness

它提供模型适配、Context、Memory、Tool、Session、Loop、权限、Trace、生命周期和可恢复执行。

这一层不直接对某个业务结果负责。它是中间件。

### 第二层：通用 Agent 产品

Codex、Claude Code、Hermes 等产品内部都有 Runtime，但用户接触到的已经不只是 Runtime，还包括默认工具、任务执行方式、交互界面和产品体验。

这一层可以理解为：

```text
Agent Runtime
+ 通用任务执行能力
+ 默认工作方式
+ 产品界面
```

它既有中间件底座，也已经是通用应用产品。

### 第三层：业务 Agent

询盘 Agent、采购 Agent、客服 Agent、履约 Agent 要理解具体业务对象、遵守领域规则、执行真实动作，并对业务 Outcome 负责。

它们运行在 Runtime 之上，正如领域应用运行在应用服务器和数据库之上。它们不是中间件。

所以，“Agent 就是中间件”说得太宽；“Agent 与中间件完全不同”又说得太窄。准确表达是：

> **Agent Runtime 是中间件。通用 Agent 是 Runtime 加产品。业务 Agent 是运行在 Runtime 上的领域应用。**

## 历史重演到哪里开始分叉

Ocean 与 Agent Runtime 的架构同构是真实的，但二者的运行语义并不相同。

传统通信中间件主要回答：

> 一条已经定义清楚的 Request，怎样安全、正确、高效地到达另一个系统，再把 Response 带回来？

Agent Runtime 还要回答：

> 用户到底想做什么？下一步做什么？调用哪个能力？观察结果后是否改变计划？什么时候停止或升级给人？

这带来五类传统网关没有同等强度的问题：

1. **概率性**：同一输入可能产生不同计划，Context 的变化会改变行为；
2. **副作用**：Tool 调用会改变真实业务状态，不能把模型“认为成功”当成真实成功；
3. **长程状态**：任务可能跨天等待、人审、重试和恢复；
4. **治理责任**：权限、预算、审批、审计和回滚不能只写在 Prompt 里；
5. **评测与发布**：一次成功不能证明系统可靠，每次能力更新都需要 Replay、Eval、Canary 和回滚。

因此，AI 中间件不能只追求“能力可插拔”，还必须追求状态可恢复、行为可验证、更新可治理。

这个分叉并不否定“中间件”类比。它说明新的中间件正在封装一种比网络通信更不确定、更主动的复杂性。

## 对企业 Agent 架构的四个启发

### 第一，不要让每个业务 Agent 重做 Runtime

询盘、采购、客服和履约 Agent 不应该分别建设模型适配、Context、Memory、权限、Trace 和 Eval。企业真正需要的是共享 Agent Runtime，业务团队在上面建设领域 Agent。

### 第二，Runtime 团队与业务团队的责任要分开

Runtime 团队负责稳定合同、执行生命周期、状态、权限、可观测性和可靠性；业务 Agent 团队负责 Ontology、业务 Skill、领域规则、目标和结果。

混成一个“大 Agent”，最后通常既不能复用，也没人对业务结果负责。

### 第三，插件数量不是生态，扩展合同才是

一个 Tool 能安装，不代表它可以安全进入生产系统。模型、Tool、Skill、Action、Evidence、Permission 和 Outcome 都需要清晰合同。第三方能力可以扩展 Runtime，但不能绕过状态、权限和审计。

### 第四，扩展点应该围绕真实状态转换形成

不要先设计宏大的 Plugin Market，再让业务找位置接入。先观察真实运行：输入何时被解释、Context 何时形成、动作何时被授权、状态何时改变、结果何时回写。反复出现差异和治理需求的位置，才值得固化成扩展点。

## 结语

十五年前，Ocean 把异构系统通信的共同复杂性从业务应用中抽离出来；今天，Agent Runtime 正在把模型驱动的理解、工具调用、状态管理和受控执行从业务 Agent 中抽离出来。

软件历史并没有简单重复，但它押着相同的韵脚：

> **每当一种新的计算底座进入大规模应用，业务系统都会重复遭遇一批共同复杂性；中间件会再次出现，把这些复杂性从领域应用中拿走。**

所以我仍然保留最初的判断，只把主语说得更准确：

> **Agent Runtime 是 AI 时代的中间件。它封装业务系统使用模型、工具和外部系统时的共同复杂性；业务 Agent 则运行在这层中间件之上，对具体业务结果负责。**

---

## 参考资料

1. [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
2. [DeepSeek Harness Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
3. [Cordis 论文：A Programming Paradigm for Spatiotemporal Composability](https://github.com/cordiverse/paper)

> 事实边界：Ocean 架构来自亲历者回忆，未以公开技术文档二次核验；DeepSeek Harness 截至本文发布时仍处于 Developer Preview，官方明确提醒其可能发生兼容性破坏变更。
