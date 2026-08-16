export const TOPICS = [
	{
		id: 'personal-ai',
		number: 'P1',
		track: 'personal',
		title: '个人 AI 与第二大脑',
		shortTitle: '个人 AI',
		description: '记录私人 Agent、第二大脑与认知系统如何共同演化。',
		question: 'AI 如何从任务助手变成持续理解我、补全我并与我共同演化的个人系统？',
		color: '#9b3f62',
		upcoming: ['它真的进化了吗：个人 AI 系统阶段复盘'],
	},
	{
		id: 'frontier',
		number: '01',
		track: 'enterprise',
		title: 'AI 前沿观察',
		shortTitle: '前沿观察',
		description: '发现外部信号、争议和反例。',
		question: '外部世界正在发生什么？哪些变化值得进入我们的判断系统？',
		color: '#4263a8',
		upcoming: [],
	},
	{
		id: 'enterprise-ai-foundations',
		number: '02',
		track: 'enterprise',
		title: '企业 AI 认知框架',
		shortTitle: '认知框架',
		description: '定义什么是企业 AI、六要素和总体地图。',
		question: '企业 AI 到底是什么？怎样才算从工具使用走向业务系统？',
		color: '#7c4d9e',
		upcoming: [],
	},
	{
		id: 'enterprise-agent-architecture',
		number: '03',
		track: 'enterprise',
		title: '企业 Agent 系统架构',
		shortTitle: '系统架构',
		description: '解释理解、规划、执行、治理和自迭代如何运行。',
		question: '企业如何把理解、规划、执行与自反馈真正连成可靠系统？',
		color: '#187f76',
		upcoming: [],
	},
	{
		id: 'enterprise-ai-implementation',
		number: '04',
		track: 'enterprise',
		title: '企业 AI 落地与执行',
		shortTitle: '落地与执行',
		description: '解释最小闭环、ROI、轻量 FDE 和规模化复制。',
		question: '如何从第一条真实业务闭环开始，证明价值并逐步复制？',
		color: '#ad6425',
		upcoming: [],
	},
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((topic) => [topic.id, topic])) as Record<
	TopicId,
	(typeof TOPICS)[number]
>;