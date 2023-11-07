import {
  aligroupServer_baseline, aliyunServer_baseline,
  GROUP_MANAGE, CLOUD_MANAGE,
} from '@/utils/utils';

export default {
  'menu.Dashboard': 'Dashboard',
  'menu.Dashboard.analysis': '分析页',
  'menu.Dashboard.monitor': '监控页',
  'menu.Dashboard.workplace': '工作台',
  'menu.exception.403': '403',
  'menu.exception.404': '404',
  'menu.exception.500': '500',
  'menu.server.404': '页面不存在 - T-One',
  'menu.server.500': '系统异常 - T-One',
  'menu.server.401': '无访问权限 - T-One',

  'menu.Workspace.500': "系统异常 - T-One",
  'menu.Workspace.401': "无访问权限 - T-One",
  'menu.Workspace.404': "页面不存在 - T-One",

  'menu.home': '首页',
  "menu.PersonCenter": '个人中心',
  "menu.HelpDoc": '帮助文档',
  "menu.NoticeDoc": '公告',
  'menu.workspace': '工作台',
  'menu.setting': '基础配置',
  'menu.basicConfig': '基础配置',
  'menu.DeviceManage': '机器管理',
  'menu.JobTypeCreate': '创建Job类型',
  'menu.Workspace': '工作台',
  'menu.BasicSetting': '基础配置',
  'menu.TestParmSetting': 'Testfarm配置',
  'menu.DirectRoute': 'directRoute',

  'menu.ShareReport': '测试报告',

  'menu.JobTypePreview': '模板预览',
  'menu.TemplateEdit': '模板编辑',
  'menu.Workspace.Workspace': '工作台',
  'menu.Workspace.TestJob': '新建Job',
  'menu.Workspace.TestJob.TestJob': '新建Job',
  'menu.Workspace.TestJob.TestTemplate': 'Job模板',
  'menu.Workspace.TestJob.TestExport': '导入配置',
  'menu.Workspace.TestJob.JobTypePreview': '模板预览',

  'menu.Workspace.TestAnalysis': '测试分析',
  'menu.Workspace.TestAnalysis.TestAnalysis': '测试分析',
  'menu.Workspace.TestAnalysis.CompareAnalysis': '对比分析',
  'menu.Workspace.TestAnalysis.TimeAnalysis': '时序分析',
  'menu.Workspace.TestAnalysis.CompareAnalysisConf': '配置页',
  'menu.Workspace.TestAnalysis.ResultCompareAnalysis': '结果页',

  'menu.Workspace.TestResult': '测试结果',
  'menu.Workspace.TestResult.TestResult': '测试结果',

  'menu.Workspace.TestReport': '测试报告',
  'menu.Workspace.TestReport.TemplateCreate': '新建报告模版',
  'menu.Workspace.TestReport.ReportTemplatePreview': '报告模版预览',
  'menu.Workspace.TestReport.TemplateEdit': '编辑报告模版',
  'menu.Workspace.TestReport.Report': '测试报告',
  'menu.Workspace.TestReport.EditReport': '编辑报告',
  // "menu.Workspace.TestReport.ShareReport": '分享报告',
  'menu.Workspace.TestReport.CompareAnalysisConf': '结果页',

  'menu.Workspace.CreateReport': '创建报告',

  'menu.Workspace.TestSuiteSearch': '测试用例',
  'menu.Workspace.TestSuiteSearch.TestSuiteSearchResult': '搜索结果',
  'menu.Workspace.TestSuiteSearch.IndexPage': '用例检索',
  'menu.Workspace.TestSuiteSearch.ConfDetail': 'Conf详情',
  'menu.Workspace.TestSuiteSearch.SuiteDetail': 'Suite详情',

  'menu.Workspace.Upload': '离线测试',

  'Workspace.Upload': '离线测试',

  'menu.Workspace.TestExport': '导出配置',
  'menu.Workspace.WorkSpaceCreate': '新建workspace',
  'menu.TemplatePreview': '模板预览',

  'menu.CreateJobType': '新建Job类型',
  'menu.Workspace.Dashboard': 'Dashboard',

  'menu.Workspace.DirectRoute': 'directRoute',
  'menu.systemConf.DirectRoute': 'DirectRoute',

  'menu.Workspace.JobConfig.CreateJobType': '新建Job类型',

  'menu.Workspace.WorkspaceConfig': 'Workspace配置',
  'menu.Workspace.WorkspaceConfig.MemberManage': '成员管理',
  'menu.Workspace.WorkspaceConfig.BasicConfig': '基础配置',
  'menu.Workspace.WorkspaceConfig.JoinDetail': '审批管理',

  'menu.Workspace.JobConfig': 'Job配置',
  'menu.Workspace.JobConfig.JobTypeUpdate': 'Job类型编辑',
  'menu.Workspace.JobConfig.JobTypeCreate': 'JobType新建',
  'menu.Workspace.JobConfig.JobTypeManage': 'Job类型管理',
  'menu.Workspace.JobConfig.TagManage': '标签管理',
  'menu.Workspace.JobConfig.TestTemplateManage': '模板管理',
  'menu.Workspace.JobConfig.JobTypePreview': 'Job类型预览',

  'menu.Workspace.TemplatePreview': '模板预览',
  'menu.Workspace.TestTemplate': '测试模板',
  'menu.Workspace.TemplateEdit': '模板编辑',

  'menu.Workspace.Product': '产品管理',
  'menu.Workspace.CloudConfig': '云资源配置',

  'menu.Workspace.TestSuiteManage': 'Test Suite管理',
  'menu.Workspace.WorkspaceCreate': '创建工作台',
  'menu.Workspace.TestSuiteCreate': '创建Test Suite',

  'menu.Workspace.DeviceManage': '机器管理',
  'menu.Workspace.DeviceManage.CludeManage': CLOUD_MANAGE,
  'menu.Workspace.DeviceManage.GroupManage': GROUP_MANAGE,
  'menu.Workspace.DeviceManage.DispatchTag': '调度标签',
  'menu.Workspace.DeviceManage.CloudConfig': '云资源配置',

  'menu.Workspace.Baseline': '基线管理',
  'menu.Workspace.Baseline.GroupBaseline': aligroupServer_baseline,
  'menu.Workspace.Baseline.ClusterBaseline': aliyunServer_baseline,
  'menu.Workspace.PersonCenter': '个人中心',

  'menu.Workspace.baseline': '基线管理',
  'menu.Workspace.baseline.performance': "性能基线",
  'menu.Workspace.baseline.functional': "功能基线",

  'menu.Workspace.TestPlan': '测试计划',
  'menu.Workspace.TestPlan.Manage': '计划管理',
  'menu.Workspace.TestPlan.Create': '新建计划',
  'menu.Workspace.TestPlan.Run': '运行计划',
  'menu.Workspace.TestPlan.Edit': '编辑计划',
  'menu.Workspace.TestPlan.View': '计划视图',
  'menu.Workspace.TestPlan.Summary': '计划运行结果汇总',
  'menu.Workspace.TestPlan.Detail': '计划详情',

  'menu.Workspace.TestAnalysis.ResultAnalysis': '结果分析',

  'menu.Workspace.DevOps': 'ws系统配置',
};
