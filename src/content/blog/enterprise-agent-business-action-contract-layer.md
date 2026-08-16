---
title: "企业级 Agent 真正缺的不是 Loop，而是业务行动契约层"
description: "从模型行动到企业可治理业务交易：为什么 Loop、Harness、MCP、A2A 和 Workflow 之外，还需要显式的业务行动契约。"
pubDate: "2026-08-16"
tags: ["企业AI", "Agent", "EAPL", "协议层", "AI Business OS"]
author: "齐晓宁"
originType: "综合提炼"
originNote: "以 EAPL 博客稿为主，结合理论论文和公开证据，收窄成“业务行动契约层”这一命题。"
originSources:
  - "《企业级 Agent 真正缺的不是 Loop，而是协议层》博客稿（2026-07-03）"
  - "《企业级 Agent 协议层》理论论文初稿（2026-07-03）"
topic: "enterprise-agent-architecture"
topicOrder: 1
---

过去一年，几乎所有AI产品都在谈Agent。

我们看到越来越多产品从“聊天助手”变成“行动助手”：调用工具、浏览网页、操作软件、写代码、查数据库、发邮件，甚至多个Agent协作完成任务。

行业也开始讨论一系列关键词：

```text
Agent Loop
Workflow
Harness
Tool Use
MCP
A2A
Observability
Guardrails
Evaluation
```

这些都重要。

但如果把视角放到企业场景，我越来越觉得：**企业级Agent真正缺的不是另一个Loop，而是一层明确的业务行动契约。**

它要回答的不是“模型能不能调用工具”，而是：

> 如何把一次模型驱动的行动，变成企业可以理解、授权、执行、验证、审计和补偿的业务交易？

我暂时把这组能力叫做：

> **Enterprise Agent Protocol Layer（EAPL）**

需要先说明它当前的认知状态：EAPL是我提出的一个待验证的企业业务行动契约参考模型，不是现行行业标准。“协议层”首先表达的是一个标准化方向，而不是已经完成的wire protocol。

## Loop为什么不够

很多Agent系统的基本结构是一个Loop：

```text
观察
→ 思考
→ 行动
→ 再观察
→ 再思考
→ 再行动
```

ReAct一类范式让模型在推理的同时与环境交互，这是Agent区别于传统问答模型的关键进步。

但企业要的不是一个“能够行动的模型”，而是一个“能够被企业系统信任地行动的执行节点”。

比如，Agent要处理一笔订单异常。模型给出一句“这笔订单应该赔付”，离真正完成业务还有很远。

企业真正关心的是：

```text
它处理的是哪个订单？
用了哪些证据？
依据哪个版本的规则？
有没有读到最新物流轨迹？
这个动作会不会改变客户承诺？
是否需要主管审批？
工单和财务状态是否真的改变？
失败以后如何补偿？
谁应该为这次行动负责？
```

Loop说明Agent如何持续运行，却不定义一次行动如何被企业系统理解、授权、执行、验证和追责。

## Harness为什么仍然不等于业务契约

Harness可以承载Agent的执行与运行控制，包括：

```text
工具沙箱
权限和策略
Trace
Eval
Retry
Guardrail
审批
状态恢复
执行环境
```

没有Harness，Agent很容易成为一个到处乱跑、不可控、不可观察的黑盒。

但即使Harness能够实现状态、审批、重试和验证，如果没有显式的领域行动契约，通用运行时也无法仅凭一次Tool Call判断：这次业务状态变更到底合不合法。

Harness可以记录：

```text
Agent调用了read_order
Agent调用了update_ticket
Agent生成了一段赔付建议
```

企业还需要知道：

```text
这是不是一次合法的赔付判断？
它绑定的是哪个业务对象？
上下文证据是否完整？
状态迁移是否符合规则？
调用者有没有权限？
是否满足人工审批条件？
结果是否真正发生？
责任链是否完整？
```

所以，更准确的关系是：

> **Loop让Agent动起来；Harness承载并控制它如何运行；业务行动契约定义什么才算一次合法、可验证的企业行动。**

## 从Tool Call到Governed Business Transaction

今天很多Agent系统把一次函数调用当作行动的基本单位：

```json
{
  "tool": "trigger_refund",
  "order_id": "123",
  "amount": 800
}
```

Schema可以保证字段存在、类型正确，却无法单独回答：

- 订单是否具备赔付资格；
- 800元是否在当前角色权限内；
- 是否存在重复赔付；
- 使用的是哪一版规则；
- 是否需要人工审批；
- 外部支付是否成功；
- 工单、账务和客户通知是否一致；
- 失败后应该撤销还是补偿。

因此，企业Agent的基本单位不应该只是Tool Call，而应该是一笔：

> **Governed Business Transaction——受治理的业务行动。**

Tool只是执行动作的技术入口。真正稳定的边界应该是Action Contract：它定义前置条件、授权、不变量、业务效果、结果验证和补偿；再通过MCP、OpenAPI、SDK或消息系统绑定到具体工具。

## 业务行动契约至少包含八类内容

### 1. 任务契约：Agent到底被派去做什么

企业不能只给Agent一句“帮我处理这个订单异常”。任务需要结构化定义：

```text
任务类型
目标业务对象
业务目标
成功标准
允许动作
禁止动作
截止时间
输出给谁
```

没有任务契约，Agent可能表现得非常努力，却始终没有完成真正的业务目标。

### 2. 业务对象契约：Agent操作的不是文本，而是业务对象

企业Agent面对的是订单、客户、合同、供应商、库存、工单、发票、商机和物流轨迹。

它需要知道：

```text
对象的唯一身份是什么？
当前权威状态在哪里？
有哪些合法状态迁移？
哪些字段可以被谁修改？
并发冲突如何处理？
```

真正的企业Agent不是“读一段话、回一段话”，而是读取业务对象、形成判断，并推动对象发生合法状态迁移。

### 3. 上下文契约：Agent凭什么判断

企业上下文不是一团文本。每条信息都有来源、版本、时效、可信度和适用范围。

```text
订单系统记录 > 人工转述
政策原文 > 二手总结
实时物流API > 昨日缓存
财务系统数据 > 销售口头描述
```

Agent必须知道证据来自哪里、是否过期、是否完整，以及冲突时以谁为准。否则模型即使给出正确答案，也无法形成企业能够接受的证据链。

### 4. 业务动作与工具绑定契约

这里需要区分两层：

```text
Action Contract
前置条件、业务效果、不变量、授权、验证和补偿

Tool Binding
通过MCP、OpenAPI、SDK或消息调用哪个具体系统
```

一个`read_order`和一个`trigger_refund`风险完全不同。可以给业务动作设置副作用等级：

```text
L0：只读查询
L1：生成草稿
L2：写内部记录
L3：对外发送信息
L4：改变业务主状态
L5：产生财务或法律后果
```

工具调用成功，不等于业务行动合法；接口返回200，也不等于外部结果已经正确发生。

### 5. 状态契约：不要把所有状态混在一张表里

企业任务通常是跨天、异步、需要等待的长流程。状态至少要区分四层：

```text
Task / Run State
created, running, waiting, failed, completed, cancelled, timed_out

Business Object State Transition
订单、工单、合同等对象自己的状态迁移

Approval Decision
pending, approved, rejected, expired

Post-run Review / Patch
reviewed, patch_proposed, tested, released
```

任务运行完成，不代表业务对象已经达到目标状态；审批通过，也不等于外部动作已经执行成功；复盘和Patch则属于离线慢循环，不应该混进在线Run状态。

### 6. 人工关卡契约：人在系统里不是兜底闲聊

高金额、对外承诺、客户赔付、合同修改、供应商替换、低置信度和规则冲突，都可能需要人工决策。

人工介入不能只是Agent问一句“你看这样可以吗”，而应该形成结构化审批包：

```text
谁需要审批？
为什么触发审批？
Agent建议是什么？
证据是什么？
可选项有哪些？
每个选项有什么影响？
超时如何处理？
驳回原因如何进入后续复盘？
```

人在企业Agent系统中不是临时救火队，而是协议化的治理节点。

### 7. 审计契约：Trace不等于责任链

OpenTelemetry Trace可以记录一次调用经过哪些服务，却不能自动替代业务审计。

业务审计还需要：

```text
谁发起任务？
哪个Agent和哪个模型执行？
使用哪些规则与证据？
谁批准？
最终改变了什么业务状态？
结果有没有验证？
记录的保留期和访问权限是什么？
怎样防止篡改和抵赖？
```

Telemetry可能采样、丢失或只面向性能分析；业务审计必须面向责任主体和业务后果。两者可以通过`trace_id`关联，但不能混为一谈。

### 8. 学习回写契约：执行完不等于自动修改系统

一次任务结束后，系统可以生成候选改进：

```text
规则Patch
流程Patch
Ontology Patch
Tool Schema Patch
Prompt / Skill Patch
Eval Rubric Patch
```

但一次人工驳回不能直接变成组织规则。Learning Patch应该只是候选补丁，继续经过：

```text
离线Eval
→ 人工审批
→ 版本发布
→ Canary
→ 结果监控
→ 必要时回滚
```

企业Agent的自我改进，本质上更像一套受治理的软件发布系统，而不是让Agent在线修改自己。

## 两条横向约束

前面的八类契约不是八座孤岛，还需要两条横向能力贯穿全程。

### Policy / Authorization

它回答：谁可以对什么对象，在什么条件下执行什么动作，何时必须进入人工关卡。

这类能力可以借鉴[Open Policy Agent](https://www.openpolicyagent.org/docs/latest/)和[Cedar](https://docs.cedarpolicy.com/)等已有策略系统，不需要由Agent协议层重新发明。

### Verification / Outcome

它回答：任务成功到底意味着什么，动作后置条件是否满足，业务对象是否真正迁移到目标状态，外部结果是否可以验收。

没有结果验证，“Tool Call成功”很容易被误当成“业务成功”。

## 它和数据库事务有什么相似，又有什么不同

企业Agent的行动更像Transaction，而不是Chat：读取对象、判断规则、发起审批、更新系统、触发外部动作、留下审计记录、验证结果。

但这里不能机械照搬数据库ACID。

单系统写入可以借鉴事务、幂等键、唯一约束和乐观并发控制；跨多个企业系统的长流程更接近[Saga](https://doi.org/10.1145/38713.38742)：通过一系列可验证步骤和补偿动作获得业务一致性。

例如，外部邮件已经发送、赔付款已经进入支付渠道、供应商已经收到指令，这些动作通常无法像数据库行一样原子回滚。系统能做的是发送更正、发起冲正、暂停后续步骤或转人工补偿。

所以企业Agent需要区分：

```text
技术回滚
业务补偿
人工纠错
结果对账
```

## MCP、A2A、Workflow和EAPL是什么关系

不能把现有技术简化成几句过时的标签。

最新[MCP规范](https://modelcontextprotocol.io/specification/2026-07-28)不仅覆盖工具，还包括资源、提示、授权、进度和取消；[Tasks扩展](https://modelcontextprotocol.io/extensions/tasks/overview)进一步支持长任务、持久句柄、中途输入和人工关卡。

[A2A 1.0](https://a2a-protocol.org/latest/specification/)也不仅是“Agent互相说话”，它已经定义任务生命周期、状态、Artifacts、异步通知、长期任务和human-in-the-loop。

Workflow Engine则成熟覆盖持久状态、定时器、重试、人工任务与补偿。[Temporal](https://docs.temporal.io/workflows)和[Camunda](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)已经解决了大量执行可靠性问题。

因此，EAPL不应该重复制造一个执行引擎。更合理的定位是：

> **一组可以承载在MCP、A2A、OpenAPI和Workflow之上的领域业务行动契约。**

可以这样理解：

```text
MCP / OpenAPI / SDK
负责能力和工具的具体接入

A2A
负责Agent之间的任务协作和消息交换

Workflow Engine
负责持久执行、等待、重试和补偿

OpenTelemetry
负责运行观测及语义约定

Policy Engine
负责授权和策略决策

EAPL参考模型
把上述能力组合成一笔合法、可验证的领域业务行动
```

它们应该组合，而不是互相替代。

## 这对AI Business OS意味着什么

如果把企业未来的AI系统看成AI Business OS，Agent不是孤立应用，而是运行在目标、业务对象、知识、工具、权限和学习机制之上的执行单元。

```text
Goal & Metrics
→ 定义任务和成功标准

Ontology / Business Objects
→ 定义Agent正在操作什么

Knowledge & Context
→ 提供判断证据

Execution Harness
→ 承载行动和长程运行

Governance
→ 决定权限、审批和责任

Feedback & Learning
→ 把结果转成受治理的系统更新
```

业务行动契约把这些静态能力连接成一次真实运行：目标变成任务，Ontology变成业务对象，知识变成证据，工具变成受治理动作，审批变成结构化关卡，审计变成责任链，反馈变成候选系统改进。

## 最终判断

现有Workflow、Policy Engine、API、审计和观测系统可以组合出大量企业Agent能力。EAPL不是要否定它们，也不能宣称自己已经填补了一个被证明存在的行业标准空位。

它提出的是一个更聚焦的问题：

> 当模型开始改变真实业务状态时，我们是否需要一套显式、可移植、可验证的领域行动契约，把散落在Prompt、工具代码、Workflow和人工经验里的约束统一表达出来？

如果缺少这些能力，Agent仍然可以完成任务，但它的生产风险、跨系统复用成本和审计难度会显著上升。

“EAPL之于企业Agent，如HTTP之于Web”目前只能是设计愿景，而不是事实判断。它是否真的值得成为独立协议层，还需要Reference Implementation、跨系统案例和Benchmark验证。

但有一点已经很清楚：

> **企业Agent的基本单位，不应该只是一轮Loop或一次Tool Call，而应该是一笔有对象、有证据、有授权、有状态、有结果、有责任链的受治理业务行动。**
