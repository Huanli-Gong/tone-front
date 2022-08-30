const defaultKey = 'pages.home.push'

const text =  {
  // page1
  'system.introduction': 'T-One系统介绍',
  'brief.introduction': '测试类型众多，测试环境异常复杂，怎么能轻松自动化起来？业内首个一站式、全场景质量协作平台 T-One 能满足你的一切自动化测试需求：',
  'li.use1': '支持多CPU混合架构（x86、arm、loogarch、risc-v）',
  'li.use2': '支持多操作系统类型（龙蜥OS、centos、debian、ubuntu、统信、麒麟）',
  'li.use3': '支持复杂环境测试（企业内网、网络隔离环境、弹性云虚拟机/容器、应用集群及多种混合环境）',
  // page2
  'platform': '平台架构',
  'project': '项目数据',
  'analysis': '数据分析',
  'offline': '离线模式',
  'authentication': '数据认证',

  'manage': '管理平台',
  'test.execution': '测试执行',
  'test.plan': '测试计划',
  'test.analysis': '测试分析',
  'test.report': '测试报告',
  'case.certification': '用例集成认证',
  'test.manage': '测试流程管理',
  'ws.manage': 'Workspace管理',
  'master.push': 'Master推送',
  'notice': '通知',
  'authority': '权限',

  'distributed.tasks.engine': '分布式任务执行引擎',
  'func.and.perf': '功能、性能测试',
  'single.and.multi': '单机、多机测试',
  'application.cluster': '应用集群测试',
  'cloud': '云上测试',
  'tasks.scheduling': '分布式任务调度',
  'process.engine': 'DAG流程引擎',
  'machine.scheduling': '机器调度',
  'message': '消息',
  'event': '事件',

  'active.mode': '（主动模式）',
  'passive.mode': '（被动模式）',
  'test.framework': '测试机器池   tone测试框架',
  'support.env': '企业内网、云上、隔离等多环境支持  phy/vm/docker等',
  // page3
  'product.features': '产品特点',
  'quality.platform': '一站式质量平台',
  'quality.platform.info': '平台打通了测试准备、测试执行、测试分析、测试计划、测试报告、覆盖率检测、智能Bisect、智能巡检等流程全闭环，为社区研发提供一站式测试支撑',
  'quality.collaboration': '质量协作能力',
  'quality.collaboration.info': '通过分布式的业务架构，Testfarm支持多企业、多团队的质量协作模式',
  'data.analysis': '数据分析能力',
  'data.analysis.info': '平台提供了时序分析、对比分析，以及聚合生成测试报告的能力，在大量测试之后对数据进行分析以发现软件问题',
  'ci.services': '开源软件包CI服务',
  'ci.services.info': '社区开发者可以将自己的软件包(可来自代码托管平台如github/gitee/codeup等)注册到Testfarm, 平台会监控软件包的代码变更，一旦有变更则会立即触发测试，并将测试结果通知开发者，方便开源软件包引入',
  'env.login.debugger': '环境登陆调试服务',
  'env.login.debugger.info': '社区开发者可以reserve测试环境并登陆，方便在测试环境中进行测试及debug',
  'defect.location': '缺陷定位诊断服务',
  'defect.location.info': '对于发现的软件缺陷，平台可以提供缺陷的自动化定位诊断能力，可以发现引入缺陷的commit地址',
  // page4
  'application.scenarios': '应用场景',
  'release.test': 'Release测试',
  'release.test.info': '每次AnolisOS的发布，社区测试团队会根据发布测试策略进行大规模测试，保障产品发布质量，外部用户可以在Testfarm查看发布测试数据。',
  'open.source.ci': '开源软件包CI',
  'open.source.ci.info': '开源软件包CI，社区开发者可以将软件包注册到平台，平台会自动监控软件包的变更，一旦发生变更会立即进行测试并推送测试结果。',
  'custom.test': '自定义测试',
  'custom.test.info': '自定义测试，社区开发者根据自己的需求可以在T-One平台进行测试，可以通过页面直接提交测试任务，或者使用API提交测试任务。',
  'offline.test': '离线测试',
  'offline.test.info': '离线测试，对于网络不可达的测试环境，用户可以使用离线测试模式测试并上传数据。',
  'independent.deploy': '独立部署', 
  'independent.deploy.info': '独立部署，外部用户也可以在自己环境下独立部署平台，测试并上传数据到Testfarm。',
  // 'test.plan': '测试计划',
  'test.plan.info': '对于周期性的，或者期望按约定计划执行的大批量测试任务，可以使用测试计划功能提前做计划，平台会按给定计划执行测试。',

};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})