---
title: "YC 把地图画到了哪里，又漏了什么"
description: "回到 YC Summer 2026 RFS 一手原文，拆解企业 AI 叙事中的知识底座、运行闭环与服务交付，以及地图上仍然模糊的治理空白。"
pubDate: "2026-08-15"
tags: ["AI前沿观察", "YC", "企业AI", "Agent", "协议层"]
author: "齐晓宁"
---

7月初，我在微信上刷到一条视频，标题大意是：

> YC 内部猛料，下一个万亿美元巨头是这个新物种。

典型的标题党。但它引用的东西是真的：Y Combinator 发布了 [Summer 2026 Requests for Startups](https://www.ycombinator.com/rfs)。我把原文找出来逐条读了一遍，发现它比二手视频更有意思，也更诚实。

## 先拆穿二手解读

视频里的说法是：YC 经过系统研究，得出一个结论——未来十年最大的公司将是 RaaS，也就是 Results as a Service。

原文并不是这样。

YC Summer 2026 RFS 一共列出16个方向，由YC合伙人以及YC创业者分别署名，从低农药农业到反无人机蜂群防御，覆盖面很宽。

所谓RaaS，来自对其中一条 [AI-Native Service Companies](https://www.ycombinator.com/rfs#ai-native-service-companies) 的二次概括。YC原文并没有使用RaaS这个词，也没有提出“按结果定价”。它真正说的是：一些AI-native公司不再销售软件工具，而是直接销售服务、把工作完成。

“万亿”则出自另一条 [Software for Agents](https://www.ycombinator.com/rfs#software-for-agents)。Aaron Epstein 的原话是一个预测：

> The next trillion users on the internet won't be people, they'll be AI agents.

这里的“万亿”是他设想中的互联网用户数量，不是公司市值。

两条内容被剪成一条，用户数被换成市值。这未必是恶意，但非常符合流量传播的物理规律：复杂的原文被压缩成一个更刺激、更容易转发的结论。

这也是为什么，遇到这类信息，值得回到一手来源。

## 三条线索拼成一张企业AI地图

16个方向里，有多条直接指向企业AI。我挑出三条放在一起读，它们恰好能拼成一个相对完整的图景。

### 第一层：不只卖工具，而是直接交付服务

在 [AI-Native Service Companies](https://www.ycombinator.com/rfs#ai-native-service-companies) 中，Gustaf Alströmer 提出：AI-native公司可以不再只卖软件，而是直接销售服务。

> Instead of giving you a tool, they just do the work.

背后的商业判断很清楚：全球服务支出远大于软件支出，很多服务本来就已经外包。客户已经习惯把整项工作交给外部服务商；变化在于，实际完成工作的主体可能从人力团队转向AI-native系统。

他列举了四类场景：

- 保险经纪；
- 会计、税务和审计；
- 合规；
- 医疗行政。

我理解这些场景有几个近似共性：大量工作以信息处理为主，部分流程早已外包，交付物也相对容易验收。条件越齐，AI-native服务公司的账就越容易算清楚。

但“直接交付服务”不自动等于“按结果收费”。结果定价可以是进一步的商业模式推演，却不能冒充YC原文的结论。

### 第二层：Company Brain——让企业知识变成可执行资产

[Company Brain](https://www.ycombinator.com/rfs#company-brain) 的判断是：企业AI自动化最大的瓶颈，正在从模型能力转向领域知识。

每家公司的关键知识散落在员工脑子、旧邮件、聊天记录、工单和数据库里。公司之所以能运转，往往依赖一群人“大概记得应该怎么办”。AI Agent却不能长期依赖这种隐性记忆。

因此，企业需要把碎片化知识抽取出来、结构化、持续更新，并转成AI可执行的Skill。

Tom Blomfield把它描述成“一张公司如何运转的活地图”：

- 退款应该怎么处理；
- 定价例外由谁批准；
- 事故发生时如何响应；
- 哪些流程可以自动执行；
- 哪些情况必须交给人。

它不只是企业搜索，也不只是文档问答机器人，而是原始公司数据与可靠AI自动化之间缺失的一层。

### 第三层：AI Operating System——让公司从开环变成闭环

在 [The AI Operating System for Companies](https://www.ycombinator.com/rfs#ai-operating-system-for-companies) 中，Diana Hu描述了一种更完整的形态：最好的AI-native公司会让整个公司变得“可查询”。

会议、工单、客户交互、代码、项目进展等组织活动都被持续捕获，对智能层可读。系统不只是回答问题，而是不断比较：

```text
实际发生了什么
和
原本应该发生什么
```

然后据此调整下一轮行动。

她有一句话非常准确：

> [“Not another dashboard. The system that turns a company's own artifacts into a self-improving loop.”](https://www.ycombinator.com/rfs#ai-operating-system-for-companies)

把这三条放在一起，构成了YC这组RFS给出的企业AI图景之一：

```text
企业知识底座
+ 业务运行闭环
+ 不只卖工具、而是直接交付服务
```

## 但地图上仍有一块模糊地带

继续读完整份RFS，我注意到另一件事：这些方向大量讨论AI能不能完成工作、怎样获取企业知识、系统能不能持续改进，但很少把下面这些能力作为一个独立主题展开：

```text
谁有权发起行动？
Agent能读取和修改什么？
高风险动作由谁批准？
一次状态变更如何留下完整责任链？
外部动作失败后如何补偿？
系统怎样证明结果真的发生了？
```

这里要特别区分：AI-Native Service Companies确实提到了会计、税务与审计业务，但那里的audit是一类专业服务；这里所说的是Agent自身的操作审计、责任链和审计日志。

这块空白至少有两种解释。

一种是：YC认为治理与信任只是Company Brain和AI OS的实现细节，没有必要单独列成创业方向。

另一种是：当前产业叙事仍然优先追求“AI能不能把事情做完”，而企业真正关心的“我敢不敢让它做、出了问题怎么办”，被暂时推迟了。

我现在还不能确定哪一种解释更接近事实。也不能因为RFS没有单列，就断言市场上不存在相关产品。MCP、A2A、Workflow、Policy Engine、审计系统和一些Agent安全创业公司都在覆盖其中的一部分。

真正值得研究的问题是：这些零散能力之间，是否还缺少一层明确的“企业业务行动契约”，把一次模型驱动的行动变成企业可以理解、授权、执行、验证和追责的业务交易。

这不是已经成立的行业共识，而是地图边缘值得继续验证的一块空白。

## 三个带走的判断

### 一，服务交付不等于结果定价

YC真正提出的是：不只交付工具，而是把工作做完。结果定价是可能的商业模式之一，但它仍取决于结果能否定义、归因和验收。

### 二，对照外部框架时，缺席项和在场项同样重要

著名机构画出的地图，画了什么通常很容易看到。没画什么，可能是你的机会，也可能是你自己的盲区。事先分不清时，最诚实的做法不是急着宣布答案，而是把它标记成待验证命题。

### 三，永远回到一手原文

16条被压缩成1条，“万亿用户”变成“万亿美元”，中间隔的未必是恶意，只是传播天然偏好更简单、更刺激的故事。

信息的价值密度，往往和传播的方便程度成反比。

地图边缘的空白处，古代制图师会画上海怪。现在那里可以写：

> **此处尚无共识。**
