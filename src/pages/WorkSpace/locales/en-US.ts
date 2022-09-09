import { aligroupServer, aliyunServer, GROUP_MANAGE, CLOUD_MANAGE } from '@/utils/utils';

export default {
  'menu.WorkspaceConfig': 'Workspace配置',
  'menu.WorkspaceConfig.BasicConfig': '基础配置',
  'menu.WorkspaceConfig.MemberManage': '成员管理',
  'menu.WorkspaceConfig.JoinDetail': '审批管理',

  'menu.JobConfig': 'Job配置',
  'menu.JobConfig.JobTypeManage': 'Job类型管理',
  'menu.JobConfig.TagManage': 'Job标签管理', // ''
  'menu.JobConfig.TestTemplateManage': 'Job模板管理',

  'menu.Baseline': '基线管理',
  'menu.Baseline.GroupBaseline': `${aligroupServer}基线`,
  //   'menu.Baseline.GroupBaseline': '内网基线',
  //   'menu.Baseline.ClusterBaseline': '云上基线',
  'menu.Baseline.ClusterBaseline': `${aliyunServer}基线`,

  'menu.TestSuiteManage': 'Test Suite管理',
  'menu.WorkspaceCreate': '创建工作台',
  'menu.TestSuiteCreate': '创建Test suite',
  'menu.PersonCenter': '个人中心',

  'menu.HelpDoc': '帮助文档',
  'menu.NoticeDoc': '公告',

  'menu.DeviceManage': '机器管理',
  'menu.DeviceManage.CludeManage': CLOUD_MANAGE,
  //   'menu.DeviceManage.CludeManage': '云上机器',
  'menu.DeviceManage.GroupManage': GROUP_MANAGE,
  //   'menu.DeviceManage.GroupManage': '内网机器',
  'menu.DeviceManage.DispatchTag': '调度标签',
  'menu.DeviceManage.CloudConfig': '云资源配置',
  //   'menu.DeviceManage.CloudConfig': '云上测试配置',

  'menu.Workspace.TestSuiteSearch.IndexPage': '用例检索',
  'menu.Workspace.TestSuiteSearch.ConfDetail': 'Conf详情',
  'menu.Workspace.TestSuiteSearch.SuiteDetail': 'Suite详情',
  'menu.Product': '产品管理',

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
  'Workspace.Baseline.GroupBaseline': `${aligroupServer}基线`,
  //   'Workspace.Baseline.GroupBaseline': '内网基线',
  //   'Workspace.Baseline.ClusterBaseline': '云上基线',
  'Workspace.Baseline.ClusterBaseline': `${aliyunServer}基线`,

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
  //   'Workspace.DeviceManage.CloudConfig': '云上测试配置',

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
  'Workspace.TestReport.Template': 'Report Template',
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

  //    Test Report Template
  'TestReport.Title.Summary': 'Summary',
  'TestReport.Title.ReportCreatedAt': '创建报告时间',
  'TestReport.Title.name': '报告模版名称',
  'TestReport.Title.Description': '描述',
  'TestReport.Title.TestEnv': '测试环境',
  'TestReport.Title.TestData': '测试数据',
  'TestReport.Title.FuncData': '功能数据',
  'TestReport.Title.PerfData': '性能数据',

  'TestReport.Checkbox.TestBackground': '测试背景',
  'TestReport.Checkbox.TestMethod': '测试方法',
  'TestReport.Checkbox.CustomConclusion': '自定义结论',
  'TestReport.Checkbox.TestSummary': '自动Summary',
  'TestReport.Checkbox.TestTool': '测试工具',
  'TestReport.Checkbox.TestEnv': '测试环境',
  'TestReport.Checkbox.TestDescription': '测试说明',
  'TestReport.Checkbox.TestConclusion': '测试结论',

  'TestReport.Radio.Show': '显示',
  'TestReport.Radio.Hide': '不显示',
  'TestReport.Radio.ListView': '列表视图',
  'TestReport.Radio.ChartView': '图表视图',

  'TestReport.Button.SelectSuite': '选择用例',
  'TestReport.Button.AddProject': '添加测试项',
  'TestReport.Button.Add': '添加',
  'TestReport.Button.Preview': '预览',
  'TestReport.Button.TemplateSave': '保存模版',

  'TestReport.Menu.TestGroup': '测试组',
  'TestReport.Menu.TestProject': '测试项',

  'TestReport.Drawer.Title': '用例列表',
  'TestReport.Drawer.Button.Cancel': '取消',
  'TestReport.Drawer.Button.Confirm': '确定',
  'TestReport.Drawer.Text.Domain': '领域',

  'TestPlan.tab.name': '计划管理',
  'TestPlan.Table.name': '计划名称',
  'TestPlan.Table.cron_info': '触发规则',
  'TestPlan.Table.enable': '启用',
  'TestPlan.Table.creator_name': '创建人',
  'TestPlan.Table.gmt_created': '创建时间',
  'TestPlan.Table.option': '操作',
  'TestPlan.Table.option.run': '运行',
  'TestPlan.Table.option.view': '查看',
  'TestPlan.Table.option.copy': '复制',
  'TestPlan.Table.option.edit': '编辑',
  'TestPlan.Table.option.delete': '删除',
  'TestPlan.Table.popConfirm.ok': '确认',
  'TestPlan.Table.popConfirm.cancel': '取消',

  'TestPlan.SettingDrawer.title': '计划配置',

  'TestPlan.SettingDrawer.nav.EnvInfo': '环境信息',
  'TestPlan.SettingDrawer.nav.testSetting': '测试配置',
  'TestPlan.SettingDrawer.nav.TouchSetting': '触发配置',

  'TestPlan.SettingDrawer.button.EditSetting': '编辑配置',
  'TestPlan.SettingDrawer.button.RunningPlan': '运行计划',

  'TestPlan.SettingDrawer.name': '名称',
  'TestPlan.SettingDrawer.project_name': 'Project',
  'TestPlan.SettingDrawer.description': '描述',
  'TestPlan.SettingDrawer.subject': '通知主题',
  'TestPlan.SettingDrawer.email_info': '邮件通知',
  'TestPlan.SettingDrawer.ding_talk_info': '钉钉通知',
  'TestPlan.SettingDrawer.enable': '启用',
  'TestPlan.SettingDrawer.func_baseline_name': '功能基线',
  'TestPlan.SettingDrawer.perf_baseline_name': '性能基线',

  'TestPlan.SettingDrawer.code_repo': '代码仓库',
  'TestPlan.SettingDrawer.compile_branch': '编译分支',
  'TestPlan.SettingDrawer.cpu_arch': 'CpuArch',
  'TestPlan.SettingDrawer.commit_id': 'Commit ID',
  'TestPlan.SettingDrawer.build_config': 'Build config',
  'TestPlan.SettingDrawer.build_machine': 'Build machine',

  'TestPlan.SettingDrawer.kernel': 'kernel包',
  'TestPlan.SettingDrawer.devel': 'devel包',
  'TestPlan.SettingDrawer.headers': 'headers包',
  'TestPlan.SettingDrawer.hotfix': 'hotfix',
  'TestPlan.SettingDrawer.kernel_version': '内核版本',

  'TestPlan.SettingDrawer.rpm_info': '全局RPM',
  'TestPlan.SettingDrawer.env_info': '全局变量',

  'TestPlan.Create.cron_info': '触发规则',

  'TestPlan.Create.Process.BaseSetting': '基础配置',
  'TestPlan.Create.Process.TestSetting': '测试配置',
  'TestPlan.Create.Process.CronSetting': '触发配置',

  'TestPlan.Create.Button.Next': '下一步',
  'TestPlan.Create.Button.Preview': '上一步',
  'TestPlan.Create.Button.push': '发布',
  'TestPlan.Create.Button.edit': '编辑',
  'TestPlan.Create.Button.running': '运行',

  'TestPlan.Create.ruleMessage.name':
    '允许字母、数字、下划线、中划线，“.”，不允许中文，最多64个字符',

  'TestPlan.Create.label.PlanDescription': '计划描述',
  'TestPlan.Create.label.TestBaseline': '测试基线',
  'TestPlan.Create.label.TestObject': '被测对象',

  'PlanView.tab.name': '计划视图',

  'PlanView.table.name': '计划名称',
  'PlanView.table.state': '状态',
  'PlanView.table.total': '总计',
  'PlanView.table.pass': '成功',
  'PlanView.table.fail': '失败',
  'PlanView.table.trigger_name': '触发者',
  'PlanView.table.start_time': '开始时间',
  'PlanView.table.end_time': '完成时间',
  'PlanView.table.option': '操作',
  'PlanView.table.option.detail': '详情',
  'PlanView.table.option.delete': '删除',
  'PlanView.table.option.title': '确认删除该计划吗？',
  'PlanView.table.option.ok': '确定',
  'PlanView.table.option.cancel': '取消',

  'PlanView.collapse.trigger_count': '触发次数：',
  'PlanView.collapse.success_count': '成功：',
  'PlanView.collapse.fail_count': '失败：',
  'PlanView.collapse.next_time': '下次触发时间：',
  'PlanView.collapse.viewAll': '查看全部',
};
