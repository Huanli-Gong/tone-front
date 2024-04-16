import { aligroupServer_baseline_en, aliyunServer_baseline_en, GROUP_MANAGE_en, CLOUD_MANAGE_en } from '@/utils/utils';

export default {

  'Workspace.WorkspaceConfig': 'WS Config', // 'Workspace Config',
  'Workspace.WorkspaceConfig.BasicConfig': 'Basic Config',
  'Workspace.WorkspaceConfig.MemberManage': 'MemberManage',
  'Workspace.WorkspaceConfig.JoinDetail': 'Approval Manage',

  'Workspace.JobConfig': 'Job Config',
  'Workspace.JobConfig.JobTypeManage': 'Job Type Manage',
  'Workspace.JobConfig.TagManage': 'Tag Manage', // ''
  'Workspace.JobConfig.TestTemplateManage': 'Test Template Manage',
  'Workspace.JobConfig.JobTypeUpdate': 'Edit Job Type',
  'Workspace.JobConfig.CreateJobType': 'Create Job Type',
  'Workspace.JobTypePreview': 'Preview Job Type',
  'Workspace.Dashboard': 'Dashboard',

  'Workspace.Baseline': 'Baseline',
  'Workspace.Baseline.GroupBaseline': aligroupServer_baseline_en, //这是引用变量不用翻译
  'Workspace.Baseline.ClusterBaseline': aliyunServer_baseline_en, //这是引用变量不用翻译

  'Workspace.baseline': 'Baseline',
  'Workspace.baseline.performance': 'Performance Baseline',
  'Workspace.baseline.functional': 'Functional Baseline',

  'Workspace.DevOps': 'Other Config',

  'Workspace.TestSuiteManage': 'Test Suite Manage',
  'Workspace.WorkspaceCreate': 'Create Workbench',
  'Workspace.TestSuiteCreate': 'Create Test Suite',
  'Workspace.PersonCenter': 'Person Center',

  'Workspace.DeviceManage': 'Device Manage',
  //   'Workspace.DeviceManage.CludeManage': '云上机器',
  'Workspace.DeviceManage.CludeManage': CLOUD_MANAGE_en, //这是引用变量不用翻译
  'Workspace.DeviceManage.GroupManage': GROUP_MANAGE_en, //这是引用变量不用翻译
  //   'Workspace.DeviceManage.GroupManage': '内网机器',
  'Workspace.DeviceManage.DispatchTag': 'Dispatch Tag',
  'Workspace.DeviceManage.CloudConfig': `Cloud Config`,
  //   'Workspace.DeviceManage.CloudConfig': '云上测试配置',

  'Workspace.Product': 'Product Manage',

  'Workspace.TestJob': 'Create Job',
  'Workspace.TestTemplate': 'Job Template',
  'Workspace.TestExport': 'Export Config',

  'Workspace.TestResult': 'Test Result',
  'Workspace.TestResult.TestResult': 'Test Result',
  'Workspace.TemplateEdit': 'Edit Template',
  'Workspace.TemplatePreview': 'Preview Template',

  'Workspace.TestReport.Report': 'Test Report',
  'Workspace.TestReport': 'Tesst Report',
  'Workspace.TestReport.TemplateCreate': 'Create Report Template',
  'Workspace.TestReport.Template': 'Report Template',
  'Workspace.CreateReport': 'Generate Report',
  'Workspace.TestReport.ReportTemplatePreview': 'Preview Report Template',

  'Workspace.TestAnalysis': 'Test Analysis',

  'Workspace.TestSuiteSearch.IndexPage': 'Search TestSuite',
  'Workspace.IndexPage': 'Search Test Suite',
  'Workspace.ConfDetail': 'Conf Detail',
  'Workspace.SuiteDetail': 'Suite Detail',

  'Workspace.TestAnalysis.TestAnalysis': 'Test Analysis',
  'Workspace.TestAnalysis.CompareAnalysis': 'Compare And Analysis',
  'Workspace.TestAnalysis.CompareAnalysisConf': 'Config',
  'Workspace.TestAnalysis.ResultCompareAnalysis': 'Result',
  'Workspace.TestAnalysis.TimeAnalysis': 'Time Analysis',

  'Workspace.TestPlan': 'Test Plan',
  'Workspace.TestPlan.Manage': 'Plan Manage',
  'Workspace.TestPlan.Create': 'Create Plan',
  'Workspace.TestPlan.Run': 'Run Plan',
  'Workspace.TestPlan.Edit': 'Edit Plan',
  'Workspace.TestPlan.View': 'Plan View',
  'Workspace.TestPlan.Summary': 'Results Summary',
  'Workspace.TestPlan.Detail': 'Plan Detail',
};
