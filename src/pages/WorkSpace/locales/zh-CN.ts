import {
  aligroupServer_baseline, aliyunServer_baseline,
  GROUP_MANAGE, CLOUD_MANAGE,
} from '@/utils/utils';

export default {
  // 'menu.WorkspaceConfig': 'Workspace配置',
  // 'menu.WorkspaceConfig.BasicConfig': '基础配置',
  // 'menu.WorkspaceConfig.MemberManage': '成员管理',
  // 'menu.WorkspaceConfig.JoinDetail': '审批管理',

  // 'menu.JobConfig': 'Job配置',
  // 'menu.JobConfig.JobTypeManage': 'Job类型管理',
  // 'menu.JobConfig.TagManage': 'Job标签管理',
  // 'menu.JobConfig.TestTemplateManage': 'Job模板管理',

  // 'menu.Baseline': '基线管理',
  // 'menu.Baseline.GroupBaseline': aligroupServer_baseline,
  // 'menu.Baseline.ClusterBaseline': aliyunServer_baseline,

  // 'menu.TestSuiteManage': 'Test Suite管理',
  // 'menu.WorkspaceCreate': '创建工作台',
  // 'menu.TestSuiteCreate': '创建Test suite',
  // 'menu.PersonCenter': '个人中心',

  // 'menu.DeviceManage': '机器管理',
  // 'menu.DeviceManage.CludeManage': CLOUD_MANAGE,
  // //   'menu.DeviceManage.CludeManage': '云上机器',
  // 'menu.DeviceManage.GroupManage': GROUP_MANAGE,
  // //   'menu.DeviceManage.GroupManage': '内网机器',
  // 'menu.DeviceManage.DispatchTag': '调度标签',
  // 'menu.DeviceManage.CloudConfig': '云资源配置',

  'Workspace.WorkspaceConfig': 'Workspace配置',
  'Workspace.WorkspaceConfig.BasicConfig': '基础配置',
  'Workspace.WorkspaceConfig.MemberManage': '成员管理',
  'Workspace.WorkspaceConfig.JoinDetail': '审批管理',

  'Workspace.JobConfig': 'Job配置',
  'Workspace.JobConfig.JobTypeManage': 'Job类型管理',
  'Workspace.JobConfig.TagManage': 'Job标签管理', // ''
  'Workspace.JobConfig.TestTemplateManage': 'Job模板管理',
  'Workspace.JobConfig.JobTypeUpdate': 'Job类型编辑',
  'Workspace.JobConfig.CreateJobType': '新建Job类型',
  'Workspace.JobTypePreview': 'Job类型预览',

  'Workspace.Baseline': '基线管理',
  'Workspace.Baseline.GroupBaseline': aligroupServer_baseline,
  //   'Workspace.Baseline.GroupBaseline': '内网基线',
  //   'Workspace.Baseline.ClusterBaseline': '云上基线',
  'Workspace.Baseline.ClusterBaseline': aliyunServer_baseline,

  'Workspace.DevOps': 'ws系统配置',

  'Workspace.TestSuiteManage': 'Test Suite管理',
  'Workspace.WorkspaceCreate': '创建工作台',
  'Workspace.TestSuiteCreate': '创建Test suite',
  'Workspace.PersonCenter': '个人中心',

  'Workspace.DeviceManage': '机器管理',
  //   'Workspace.DeviceManage.CludeManage': '云上机器',
  'Workspace.DeviceManage.CludeManage': CLOUD_MANAGE,
  'Workspace.DeviceManage.GroupManage': GROUP_MANAGE,
  //   'Workspace.DeviceManage.GroupManage': '内网机器',
  'Workspace.DeviceManage.DispatchTag': '调度标签',
  'Workspace.DeviceManage.CloudConfig': `云资源配置`,

  'Workspace.Product': '产品管理',

  'Workspace.TestJob': '新建Job',
  'Workspace.TestTemplate': 'Job模板',
  'Workspace.TestExport': '导入配置',

  'Workspace.TestResult': '测试结果',
  'Workspace.TestResult.TestResult': '测试结果',
  'Workspace.TemplateEdit': '模板编辑',
  'Workspace.TemplatePreview': '模板预览',

  'Workspace.TestReport': '测试报告',
  'Workspace.TestReport.TemplateCreate': '新建报告模版',
  'Workspace.TestReport.Template': '报告模版',
  'Workspace.CreateReport': '生成报告',
  'Workspace.TestReport.ReportTemplatePreview': '报告模版预览',

  'Workspace.TestAnalysis': '测试分析',

  'Workspace.TestSuiteSearch': 'TestSuite检索',
  'Workspace.IndexPage': 'Test Suite 检索',
  'Workspace.ConfDetail': 'Conf详情',
  'Workspace.SuiteDetail': 'Suite详情',

  'Workspace.TestAnalysis.TestAnalysis': '测试分析',
  'Workspace.TestAnalysis.CompareAnalysis': '对比分析',
  'Workspace.TestAnalysis.CompareAnalysisConf': '配置页',
  'Workspace.TestAnalysis.ResultCompareAnalysis': '结果页',
  'Workspace.TestAnalysis.TimeAnalysis': '时序分析',

  'Workspace.TestPlan': '测试计划',
  'Workspace.TestPlan.Manage': '计划管理',
  'Workspace.TestPlan.Create': '新建计划',
  'Workspace.TestPlan.Run': '运行计划',
  'Workspace.TestPlan.Edit': '编辑计划',
  'Workspace.TestPlan.View': '计划视图',
  'Workspace.TestPlan.Summary': '计划运行结果汇总',
  'Workspace.TestPlan.Detail': '计划详情',
};
