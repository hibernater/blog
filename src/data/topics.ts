export const TOPICS = [
	{
		id: 'frontier',
		number: '01',
		title: 'AI 前沿观察',
		shortTitle: '前沿观察',
		description: '发现外部信号、争议和反例。',
		question: '外部世界正在发生什么？哪些变化值得进入我们的判断系统？',
		color: '#4263a8',
		upcoming: ['RSI 到底是不是递归式自我改进', 'Agent-ready B2B', 'Token 毛利不等于业务毛利'],
	},
	{
		id: 'enterprise-ai-foundations',
		number: '02',
		title: '企业 AI 认知框架',
		shortTitle: '认知框架',
		description: '定义什么是企业 AI、六要素和总体地图。',
		question: '企业 AI 到底是什么？怎样才算从工具使用走向业务系统？',
		color: '#7c4d9e',
		upcoming: ['从业务助理到业务操作系统：六要素', '企业 AI 总图：理解、规划、执行与自迭代', 'AI Business OS 与 ERP、Workflow、BPM、Agent Framework 的边界'],
	},
	{
		id: 'enterprise-agent-architecture',
		number: '03',
		title: '企业 Agent 系统架构',
		shortTitle: '系统架构',
		description: '解释理解、规划、执行、治理和自迭代如何运行。',
		question: '企业如何把理解、规划、执行与自反馈真正连成可靠系统？',
		color: '#187f76',
		upcoming: ['Agent Runtime 是 AI 时代的中间件', 'Agent-led、Workflow-led、Solver-led', '企业 Agent 如何真正自我进化'],
	},
	{
		id: 'enterprise-ai-implementation',
		number: '04',
		title: '企业 AI 落地与执行',
		shortTitle: '落地与执行',
		description: '解释最小闭环、ROI、轻量 FDE 和规模化复制。',
		question: '如何从第一条真实业务闭环开始，证明价值并逐步复制？',
		color: '#ad6425',
		upcoming: ['企业 AI 的 ROI 应该怎么算', '中小企业为什么不能从工具清单开始', '轻量 FDE 不是把顾问卖便宜，而是把交付变成产品'],
	},
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((topic) => [topic.id, topic])) as Record<
	TopicId,
	(typeof TOPICS)[number]
>;