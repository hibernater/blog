---
title: "DeepSeek Harness 架构分析：从 Agent Runtime 中间件到 Agent OS"
description: "从插件容器、事件溯源 Session、极薄 Agent Loop、Tool 管线与 Subagent 机制，理解 Agent 架构的演进方向。"
pubDate: "2026-08-15"
tags: ["agent", "harness", "agent-runtime", "middleware", "deepseek"]
author: "齐晓宁"
originType: "原文发布"
originNote: "围绕 DeepSeek Harness 源码验证 Agent Runtime 的架构判断；公开版仅适配标题、元数据和少量表达。"
originSources:
  - "《DeepSeek Harness 架构分析》（2026-08-15）"
topic: "frontier"
topicOrder: 3
---

本文沿着“Agent Runtime 是大模型时代的中间件”这一判断，进一步拆解 DeepSeek Harness 的真实架构：它怎样组织插件、状态、模型调用、工具执行、权限与多 Agent，以及这些设计预示着怎样的 Agent 架构演进。

## 一、先给结论

DeepSeek Harness 最值得看的，不是它有多少 Tool、Skill 或 UI，而是它把 Agent 重新定义成了一个**可组合、可回放、可治理的运行时系统**。

如果用一句话概括它的架构：

> **Cordis 是插件容器，Session Event Log 是事实底座，Agent Loop 是极薄的执行主干，LLM、Tool、Skill、Sandbox、Compaction、Subagent、Workflow 和 UI 都通过能力接口与事件扩展点组合进来。**

它验证了一个核心判断：**Agent Runtime 的确正在成为大模型时代的中间件。**但源码也让这个判断更精确了：

1. DeepSeek Harness 不只是“模型调用 SDK”，而是一套管理模型、工具、状态、权限和生命周期的 Runtime；
2. 它也不只是一个传统微内核，因为真正稳定的“内核”不是某个巨大的 Agent 类，而是 **Cordis 的插件生命周期机制 + Session Event 语义合同**；
3. DeepSeek Harness 整个仓库同时包含 Runtime、Headless 入口和 Web 产品，所以它是**中间件底座 + 参考产品**，不能把整个仓库只归为第一层；
4. 它真正押注的方向不是“把越来越多规划逻辑写进框架”，而是相反：**模型越来越强，Loop 应该越来越薄；可靠性、状态、权限、审计和可恢复性则越来越厚。**

因此，我对它的定位是：

```text
DeepSeek Harness
= 以插件运行时为内核
+ 以事件溯源 Session 为事实底座
+ 以极薄 ReAct Loop 为执行主干
+ 以 Tool / Policy / Sandbox / Subagent / Workflow 为可组合能力
+ 以 Headless / Web / SDK 为产品入口
```

它已经不是一般意义上的 Agent Framework，更接近一个早期的 **Agent Runtime OS**。

---

## 二、静态架构：不是“大 Agent 类”，而是一棵插件树

### 2.1 最底层：Cordis 是真正的运行时容器

Harness 基于 Cordis 构建。Cordis 提供的不是业务 Agent 能力，而是 IoC、服务注册、事件、Scope、插件生命周期、依赖注入与热重载。

每个能力以插件注册到 `ctx`：

- `ctx.llm`：模型适配器注册表；
- `ctx.sessions`：Session 内存存储与事件源；
- `ctx.tools`：工具注册与执行管线；
- `ctx.agents`：Agent 创建、恢复和句柄生命周期；
- `ctx.sandbox`：进程沙箱能力接口；
- `ctx.compaction`：上下文压缩接口；
- `ctx.subagents`：子 Agent Provider 和可持续子会话；
- `ctx.workflowEngine`：Workflow 执行引擎；
- `ctx.systemPrompt`：Prompt 片段装配注册表。

这里最关键的不是“用了插件”，而是 Cordis 同时解决两种组合问题：

- **空间可组合性**：不同 Agent、不同 Scope 可以看到不同模型、工具、Prompt 和权限；
- **时间可组合性**：插件装载、卸载、依赖消失、HMR 重载时，服务和副作用能随 Fiber 生命周期一起撤销、恢复。

传统插件系统通常只解决“装进去”；Cordis 还试图解决“运行中怎么安全拆掉、重装、回滚”。这正是 Agent 长生命周期运行比普通 SDK 更难的地方。

### 2.2 配置层：Profile = Bundle + Patch 的声明式装配

产品不是把能力硬编码在入口里，而是通过 Profile 组装：

```text
空 Profile
  + dsh-base Bundle
  + headless / web Bundle
  + 用户 Profile Patch
  + 启动时额外 Patch
  = 最终插件树
```

`dsh-base` 默认装入模型、Session、Agent、Tool、持久化、凭证、Sandbox、Approval、Compaction、Subagent、Workflow 等插件；`headless` 和 `web` 再覆盖入口相关配置。

插件行的顺序不决定启动顺序。各插件根据所需 Service 是否可用自动激活。这意味着配置表达的是**依赖图**，不是脆弱的手工启动脚本。

我实际用公开 npm 包执行了：

```bash
npx @deepseek-ai/dsh@0.1.0-rc.6 --profile headless --dump-config
```

输出确认最终运行树由 `@deepseek-ai/dsh-base` 和 `@deepseek-ai/dsh-headless` 分层合成；默认模型、JSONL Session、Sandbox、Approval 等都以独立插件行存在。

### 2.3 核心主干：五个基础服务 + 一个具体 Loop

具体 `dsh-agent-loop` 依赖五个基础服务：

```text
ctx.agents
ctx.sessions
ctx.llm
ctx.tools
ctx.systemPrompt
```

Loop 自己只做：

```text
收输入
→ 组 Context / Prompt / Tool Schema
→ 调模型
→ 解析 Tool Call
→ 执行 Tool
→ 把结果写回 Session
→ 再调模型
→ 结束
```

官方源码甚至明确规定：**只有 `agent-loop` 包含具体 Loop 逻辑；超出“call model, run tools, repeat”的行为都应该进入插件。**

因此以下能力都不在 Loop 核心里：

- Retry；
- Compaction；
- Plan Mode；
- Goal；
- Approval；
- Sandbox；
- Subagent；
- Workflow；
- UI；
- Persistence。

这是一条非常重要的 Agent 演进判断：

> **规划、目标、Workflow 和多 Agent 不应天然等于 Agent 内核。它们只是可选策略。稳定内核负责执行语义与生命周期，策略应当可以替换。**

### 2.4 规模说明

本次核验的公开仓库中：

- `packages/` 下约 226 个 workspace package；
- 约 822 个测试文件；
- Core 只有 8 个包，但 Client 有 39 个，Session 相关有 13 个，Subagent 有 11 个；
- 默认 Base Bundle 已经是一个相当完整的本地 Agent 产品装配。

这说明它不是示例级 Demo，而是经过高度拆分的工程体系。但“包多”不自动等于架构好，真正需要看的是这些包是否围绕稳定合同拆分。DeepSeek Harness 的答案主要是 Service、Event、Scope 和 Capability Seam。

---

## 三、动态架构：真正的主干不是 ReAct，而是事件溯源

### 3.1 一轮任务如何运行

完整动态链路可以压缩为：

```text
User / API / UI
  ↓ followup
Agent Inbox（next-turn / next-step）
  ↓
turn/start
  ↓
agent/pre-step（Compaction、策略插件可介入）
  ↓
step/start + user/message
  ↓
System Prompt + Tool Schema + Session Surface
  ↓
agent/request → ctx.llm.stream
  ↓
assistant/chunk* → assistant/message
  ↓
Tool 分类与调度
  ↓
tools/pre-execute
  ↓
monotonic guards（只可继续收紧，不能被后续插件放开）
  ↓
tools/execute（timeout / retry / metrics 可包装）
  ↓
tools/post-execute
  ↓
tool/result
  ↓
下一 Step 或 turn/end
```

这里同时存在两条通道：

1. **实时控制通道 `agent/*`**：状态、Inbox、Steering、取消、插件拦截；
2. **持久事实通道 `session/event`**：Turn、Step、模型输出、Tool Call/Result、使用量、压缩、恢复证据。

UI 或 SDK 要回放历史，应读取 `session/event`；实时调度才读取 `agent/*`。这避免把“正在发生什么”和“已经成为事实什么”混成一个状态变量。

### 3.2 Session Event Log 才是 Harness 的“自有协议”

昨天把 Ocean 的“自有协议”映射成 Session、Message、Context、State，方向没错，但看完源码后可以再精确一步：

> **DeepSeek Harness 的标准中间态，不是某一个 Message 对象，而是 append-only 的 Session Event Log，加上由它投影出来的当前 Surface。**

Session Log 记录全部事实；Surface 只保留当前应送给模型的消息投影。Compaction 不删除原始历史，而是追加一个 Replacement Event，把旧 Surface 区间遮蔽掉。

```text
完整事实：Session Event Log（只追加、可审计、可回放）
                    ↓ projection
模型上下文：Current Surface（可替换、可压缩）
```

这个设计同时满足：

- 模型看到的是经过压缩的当前上下文；
- 审计仍能看到压缩前的完整事实；
- Crash 后可以判断 Tool 是“尚未开始”还是“可能已经执行但结果未知”；
- 请求可以从日志重建，而不是依赖进程内临时对象。

这是 Agent Runtime 与普通聊天框架的分水岭。

### 3.3 Request 可重建，而不只是 Transcript 可查看

Harness 会记录 `request/header`，保存模型 Provider、Model、System Prompt、Tool Schema、调用参数等非历史请求信息。再结合 Session Surface，可以重建当时实际发给模型的请求。

这比普通 Trace 更进一步：

- Trace 只是“看见发生了什么”；
- Reconstructable Request 是“能重新构造模型为什么看到这些输入”。

在概率系统里，如果连模型输入都无法还原，后续所谓归因、Eval、回归和事故分析都不可靠。

### 3.4 Tool 管线是第二条中间件主干

Tool Runtime 不只是工具注册表，而是一条受控执行总线：

```text
Schema 注册
→ 可见性与 Scope
→ 参数校验
→ Pre Policy
→ 单调 Guard
→ Around Execute
→ Post Policy
→ 统一结果渲染
→ 最终观察事件
```

“单调 Guard”尤其重要：前面的安全插件一旦拒绝，后面的插件不能重新放行。这相当于把安全策略从普通 Middleware 升级成具有单调性的 Authority Boundary。

Harness 还区分：

- Tool 的 **canonical value**：程序消费的结构化结果；
- Tool 的 **model-facing content**：写入对话、给模型阅读的呈现；
- Tool 的 **UI presentation**：前端卡片如何展示。

这避免了一个常见错误：让同一段文本同时承担程序结果、模型 Observation 和 UI 展示三种职责。

### 3.5 Code Mode：Tool Calling 正在向 Agent VM 演进

Harness 支持把所有 Tool 生成为 TypeScript/Python SDK，只给模型一个 `run_code` 入口。模型可以在代码里调用多个工具、并行读取、过滤和计算，只有最终打印/返回值进入主上下文。

这代表 Agent 架构的一个明显演进：

```text
逐个 Function Call
→ 多 Tool Workflow
→ 模型编写短程序，在受控 Runtime 中批量调用 Tool
```

好处是减少中间结果进入 Context、提高组合表达力；代价是执行期中间值不完全进入可回放日志、Worker 内存需要额外限制。Harness 已记录子调用的开始和结果，但也承认 Code Mode 的完整 canonical value 是 execution-local，不能仅靠 Session 回放恢复。

这说明未来的 Agent Runtime 很可能不仅像中间件，也越来越像一台**面向模型的虚拟机**。

---

## 四、可靠性与治理：它怎样处理“概率智能的副作用”

### 4.1 Sandbox、Approval、Policy 不是一层东西

Harness 把治理拆成三条不同机制：

- **Sandbox**：操作系统级执行约束；Linux 优先 bwrap/Landlock，macOS 使用 Seatbelt，Windows 使用 ACL Restricted Token；不可用时 fail closed；
- **Approval**：需要人确认的交互决策；
- **Tool Policy / Guard**：调用前后针对具体工具和参数的策略判断。

Scope 只负责组合可见性，不被当作安全边界。源码明确说明 Tool Restriction 是 visibility composition，不是 authority boundary。

这是一个成熟判断：

> **“模型看不见某工具”不等于“模型无权执行该工具”；真正权限必须在执行路径上再次强制。**

### 4.2 权限状态也是日志事实

每个 Session 的 Sandbox Mode 通过 `sandbox/mode` Event 持久化，恢复后通过 Fold 得出当前有效模式。Workspace Root 来自不可变的 Session Header。

权限不是进程里一个随手改掉的布尔值，而是可追溯、可恢复的业务事实。这与企业 Agent 需要的审计语义一致。

### 4.3 Crash 恢复承认“外部世界可能已经变了”

如果日志里出现 Tool Call 但没有 Result，Harness 不会假装它失败，也不会盲目重试，而是区分：

- Tool 尚未被记录为开始：可以提示重试；
- Tool 已开始但没有结果：Outcome Unknown，必须根据幂等性先核验外部世界。

这是 Agent Runtime 最关键的可靠性语义之一。数据库事务只能保护内部状态，无法自动回滚邮件、付款、发布或第三方 API 副作用。可靠 Agent 必须把“不确定结果”作为一等状态。

### 4.4 测试纪律强，但 Agent Eval 仍是明显缺口

仓库的工程测试非常重：

- Unit；
- 每文件 100% Coverage Gate；
- Real API E2E；
- Snapshot Replay；
- Web Browser E2E；
- 强调“验证真实世界，不相信 Agent 自我汇报”。

但它的 `BENCHMARK.md` 目前只有三行启动说明；仓库中也没有形成完整的一等 Agent Eval/Judge 子系统。

因此必须区分：

```text
测试 / Replay
= 这套 Runtime 是否按合同运行

Agent Eval
= 这个 Agent 是否把任务做对、质量是否提高、业务结果是否更好
```

DeepSeek Harness 对前者做得很强，对后者还没有给出同等成熟的架构答案。这也是它从开发者预览走向企业基础设施必须补的一层。

---

## 五、多 Agent 与 Workflow：为什么都不是核心

### 5.1 Subagent 是 Provider Seam，而不是另一个 Loop

Subagent 有多种 Provider：

- spawn：新上下文；
- fork：继承父 Session 已完成历史；
- ACP；
- Codex；
- Claude Code；
- DSH SDK。

它区分一次性子任务和可持续子会话。可持续子 Agent 的身份存在 Session 中，进程内 Activation 只是一次运行实例；冷启动后可以从持久化 Session 恢复。

```text
Durable Child Session
  ↕ 多次冷启动/恢复
Process-local Activation
  └─ Agent Handle + Inbox + 子 Activation
```

这表明多 Agent 的本质不应该是“多开几个模型线程”，而是：

- 身份与血缘；
- 权限与直接父子授权；
- 生命周期；
- 消息队列；
- 可持续性；
- 结果与中断语义。

### 5.2 Workflow 是确定性执行层，不是 Agent 的定义

Workflow 引擎作为独立能力插件存在，适合确定性步骤、并行分支和结构化输出。Agent Loop 负责模型驱动的动态决策，两者可以互相调用，但不应混为一套抽象。

这正好纠正今天常见的误区：

> **Agent 不等于 Workflow；Workflow 也不应承担所有 Agent 的规划。**

模型擅长在不确定环境里判断下一步，Workflow 擅长在已知流程里稳定执行。成熟 Runtime 应允许两者组合，而不是硬选一个框架统治全部场景。

---

## 六、与 Ocean 中间件的更严格映射

看完源码后，昨天的映射可以升级为：

| Ocean | DeepSeek Harness |
|---|---|
| Consumer / Provider 接入 | User/API/UI、LLM Provider、Tool/MCP、Subagent Provider |
| Ocean 自有协议 | Session Event Log + Message Surface + Request Header |
| 协议转换引擎 | Agent Loop + LLM Adapter + Tool Runtime |
| 转换前后 Plugin | `agent/*`、`tools/*`、`system-prompt/*` Waterfall 与 Guard |
| 路由与连接管理 | Model Registry、Tool Registry、Agent/Subagent Lifecycle |
| 认证、鉴权、加密 | Credential、Approval、Guard、Sandbox Policy |
| 长连接状态 | Durable Session、Inbox、Activation、Persistence |
| 请求追踪 | Event Source、Replay、Projection、Telemetry |
| Plugin 生命周期 | Cordis Fiber、Scope、Inject、HMR、Effect Cleanup |

两者最深的共同点不是“都能装插件”，而是：

> **先建立稳定中间态，再围绕中间态的状态转换开放扩展点。**

两者最深的差异是：

- Ocean 的请求路径大体在处理前已经确定；
- Harness 的下一条路径可能由模型根据上一步 Observation 动态生成；
- 因此 Harness 不仅要管理协议转换，还要管理概率决策、上下文、执行副作用和不确定结果。

所以它是中间件，但不是传统意义上的被动管道，而是**带决策循环的主动运行时**。

---

## 七、设计取舍与我不完全认同的地方

### 7.1 优点

**第一，Loop 极薄。** 模型能力升级时，不需要重写一个重型 Planning Framework。

**第二，Event Log 是唯一事实源。** 对恢复、回放、审计、Compaction 和 Subagent 血缘都非常重要。

**第三，能力接口与实现分离。** LLM、持久化、Sandbox、Subagent 等都可以替换 Provider。

**第四，安全约束在执行路径，而不只在 Prompt。** Guard、Approval、Sandbox 各司其职。

**第五，生命周期设计深入。** 插件卸载和异步任务清理被当作架构问题，而不是工程尾项。

### 7.2 代价与风险

**第一，架构认知成本高。** 226 个包、Service/Event/Scope/Bundle/Patch 多套概念，对普通应用开发者过重。

**第二，过度细分风险真实存在。** 一些包很小，长期可能带来依赖图、版本和调试复杂度。当前依靠 Monorepo 与严格契约控制，拆到开放生态后未必同样顺利。

**第三，Profile Patch 是整段替换，不做深合并。** 配置覆盖必须重述完整字段，容易造成升级漂移。

**第四，本地优先，不等于企业分布式 Runtime。** 默认 JSONL、本地进程、单机插件容器很适合开发者 Agent；但企业级还需要多租户、分布式调度、跨服务事务语义、集中 Policy、审计后台、灰度发布和 SLO。

**第五，Sandbox 主要治理文件副作用。** 官方也明确指出 Sandbox Mode 不覆盖网络和完整进程策略；Windows 与旧 Linux 内核还可能只有部分约束。

**第六，Eval 与 Outcome 闭环尚弱。** Runtime Trace 很强，但没有把“任务质量、业务结果、归因、策略更新、实验验证”做成完整一等闭环。

**第七，仍处于 RC 开发者预览。** 公开 npm 最新核验为 `0.1.0-rc.6`；Session Format Version 仍为 0，官方明确不承诺广泛兼容。

### 7.3 公开热度不能误读为成熟度

截至 2026-08-15 核验时，GitHub 元数据显示仓库于 2026-08-13 转为公开可见，约 108.6k Stars、10.4k Forks，Issue 功能关闭。公开 Git 对象实际包含 12,293 个 Commit，最早作者日期为 2026-06-10，至少 20 名贡献者，最新合并记录为 PR #2519。也就是说，它不是两天内创建的项目，而是内部密集开发后整体公开；GitHub 的 `created_at` 不能当作真实开发起点。

这些数据能证明投入规模和发布关注度，但仍不能直接证明生产成熟度。Stars/Forks 主要反映 DeepSeek 品牌和发布热度，Issue 又尚未开放，外部社区采用、长期兼容性和生产 SLO 仍需单独验证。

---

## 八、Agent 架构的五阶段演进

结合 DeepSeek Harness，可以把 Agent 架构演进看成五阶段：

### 阶段一：LLM Wrapper

```text
Prompt → Model → Text
```

解决模型 API 适配，不解决行动与状态。

### 阶段二：单体 ReAct Agent

```text
Prompt → Model → Tool → Observation → Model
```

Loop、Memory、Tool、Prompt 和业务逻辑写在一个 Agent 类里，能跑，但难复用、难治理。

### 阶段三：Harness / Runtime 中间件

模型、Tool、Session、Memory、权限和 Hook 被抽成统一能力；业务 Agent 运行在共享 Runtime 上。

### 阶段四：事件溯源的插件 Runtime OS

以 Durable Event Log 为事实源，以 Scope 和生命周期管理动态组合；支持恢复、回放、Subagent、Workflow、Code Mode 和多入口。

DeepSeek Harness 已经进入这一阶段。

### 阶段五：企业 Agent Control Plane

在 Runtime 之上继续增加：

- 企业 Ontology 和业务对象身份；
- Goal / Metric / Outcome 合同；
- 跨 Agent 的 Policy 与权限中心；
- Eval、Judge、实验、Canary、回滚；
- 分布式调度、资源治理与 SLO；
- 真实业务结果驱动的策略与 Skill 更新；
- AI 服务市场与可信供应链。

DeepSeek Harness 为这一阶段提供了非常好的单机 Runtime 基础，但它本身还不是完整的企业 Agent OS。

---

## 九、对我们理解企业 Agent 的三个关键修正

### 修正一：Agent 的“智能”与“工程主干”要分开看

模型负责概率判断；Runtime 负责确定性边界。

```text
模型：理解、规划、选择、生成
Runtime：状态、权限、执行、顺序、恢复、审计
```

模型越强，硬编码 Planner 可以越薄；但 Runtime 不会消失，反而要更可靠，因为更强模型会执行更多真实动作。

### 修正二：Ontology 不应该塞进通用 Harness

Harness 定义 Session、Message、Tool、Agent 和权限等通用运行语义；企业 Ontology 定义客户、商品、订单、线索、合同等业务语义。

```text
DeepSeek Harness：通用执行语义
企业 Agent OS：业务对象与经营语义
业务 Agent：围绕目标操作这些对象
```

因此 DeepSeek Harness 可以成为企业 Agent OS 的 Runtime 层，但不能替代 Ontology、Goal、Metric 与业务闭环。

### 修正三：未来竞争不只是“谁的 Loop 更聪明”

真正长期的壁垒会分成三层：

1. **模型层**：推理与生成能力；
2. **Runtime 层**：可组合、可治理、可恢复的执行中间件；
3. **业务层**：Ontology、Skill、真实 Outcome 数据与自迭代闭环。

DeepSeek Harness 强在第二层。它说明 Agent 框架的竞争正在从“谁封装了 ReAct”走向“谁定义了稳定的执行语义和生态合同”。

---

## 十、最终判断

DeepSeek Harness 对“Agent Runtime 是大模型时代的中间件”提供了非常强的实证，但它给出的答案比传统类比更进一步：

> **Agent Runtime 不只是连接模型与工具的 Middleware，它正在演化成一个以事件日志为事实底座、以插件容器为生命周期内核、以模型为动态规划器、以 Sandbox/Policy 为执行边界的 Agent Runtime OS。**

真正稳定的并不是 Prompt、Planner 或 Workflow，而是：

- 执行生命周期；
- Session Event 语义；
- Tool 调用合同；
- 权限与副作用边界；
- 可回放、可恢复、可审计的状态转换。

DeepSeek 的核心架构押注可以压成一句话：

> **把智能留给模型，把确定性留给 Runtime，把业务语义留给上层 Agent。**

这也是企业 Agent 架构最值得继承的地方。

---

## 参考与核验说明

### 主要源码/文档

- 官方仓库：<https://github.com/deepseek-ai/deepseek-harness>
- Architecture：`docs/architecture.md`
- Agent Lifecycle：`docs/agent-lifecycle.md`
- Capability Seams：`docs/capability-seams.md`
- Session：`packages/core/session/README.md`
- Agent Loop：`packages/core/agent-loop/README.md`
- Tools：`packages/core/tools/README.md`
- Sandbox：`packages/sandbox/sandbox-local/README.md`
- Subagent：`docs/subsystems/subagent.md`
- Compaction：`docs/subsystems/compaction.md`
- Testing：`docs/testing.md`

### 实际核验

- 2026-08-15 拉取并检查公开仓库源码与文档；
- 实际安装并执行 `@deepseek-ai/dsh@0.1.0-rc.6 --help`；
- 实际执行 Headless Profile 的 `--dump-config`，确认 Bundle/Patch 插件树；
- 统计 workspace package 与测试文件规模；
- 通过 GitHub API、npm Registry 和 Git 历史核验公开元数据。


