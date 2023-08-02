const { BUILD_APP_ENV } = process.env

const routes = [
	{
		path: '/',
		name: 'home',
		component: BUILD_APP_ENV === "opensource" ? "./Home" : "./AnolisHome"
	},
	{
		path: '/job/:job_id',
		component: './RedirectJob',
	},
	{
		path: '/personCenter',
		name: 'PersonCenter',
		hideInMenu: true,
		component: './PersonCenter',
	},
	{
		name: 'Dashboard',
		path: '/dashboard',
		component: './DashBoard/index',
		access: 'IsAdmin',
	},
	{
		path: '/refenerce/:type',
		//name: 'RefenerceDetail',
		hideInMenu: true,
		component: '@/pages/RefenerceDetail',
	},
	{
		name: 'systemConf',
		path: '/system',
		component: './SystemConf/MenuLayout',
		//showInWs: false,
		access: 'IsSysTestAdmin',
		routes: [
			{
				path: '/system/approve',
				name: 'joinApprove',
				component: './SystemConf/JoinApprove',
				access: 'IsAdmin',
			},
			{
				path: '/system/workspace',
				name: 'workspaceManagement',
				component: './SystemConf/WorkspaceManagement',
				access: 'IsAdmin',
			},
			{
				path: '/system/user',
				name: 'userManagement',
				component: './SystemConf/UserManagement',
				access: 'IsAdmin',
			},
			{
				path: '/system/suite',
				name: 'suiteManagement',
				component: './SystemConf/TestSuite',
				access: 'IsSysTestAdmin',
			},
			{
				path: '/system/kernel',
				name: 'KernelManage',
				component: '@/pages/SystemConf/KernelManage',
				access: 'IsSysTestAdmin',
			},
			{
				path: '/system/basic',
				name: 'BasicSetting',
				component: '@/pages/SystemConf/BasicSetting',
				access: 'IsAdmin',
			},
			{
				path: '/system/testfarm',
				name: 'TestParmSetting',
				component: '@/pages/SystemConf/TestParmSetting',
				access: 'IsAdmin',
			},
			{
				path: '*',
				hideInMenu: true,
				name: 'DirectRoute',
				redirect: '/'
			}
		],
	},
	{
		path: '/message',
		showInWs: true,
		hideInMenu: true,
		component: './TaskMessage',
	},
	{
		path: '/share/report/:report_id',
		hideInMenu: true,
		name: 'ShareReport',
		component: '@/pages/WorkSpace/TestReport/NewReport'
	},
	{
		path: '/share/analysis_result/:form_id',
		hideInMenu: true,
		component: '@/pages/WorkSpace/TestAnalysis/AnalysisResult'
	},
	{
		path: '/ws/:ws_id',
		name: 'Workspace',
		component: '@/pages/WorkSpace',
		wrappers: [
			'@/wrappers/WorkspaceAuth',
		],
		routes: [
			{
				path: '/ws/:ws_id/dashboard',
				name: 'Dashboard',
				inNav: true,
				hasLeftNav: false,
				routes: [
					{
						path: '/ws/:ws_id/dashboard',
						component: './WorkSpace/Dashboard',
					},
					{
						path: '/ws/:ws_id/dashboard/:project_id',
						component: './WorkSpace/Dashboard/Project',
					},
					{
						path: '*',
						redirect: '/ws/:ws_id/dashboard'
					}
				]
			},
			{
				path: '/ws/:ws_id/test_job/:jt_id',
				inNav: true,
				name: 'TestJob',
				routes: [{
					path: '/ws/:ws_id/test_job/:jt_id',
					component: './WorkSpace/TestJob',
					hideInMenu: true,
					name: 'TestJob',
				},
				{
					path: '/ws/:ws_id/test_job/:jt_id/template',
					name: 'TestTemplate',
					hideInMenu: true,
					component: './WorkSpace/TestJob',
				},
				{
					path: '/ws/:ws_id/test_job/:jt_id/import',
					component: './WorkSpace/TestJob',
					hideInMenu: true,
					name: 'TestExport',
				},
				{
					path: '/ws/:ws_id/test_job/:jt_id/preview',
					name: 'JobTypePreview',
					hideInMenu: true,
					layout: false,
					component: './WorkSpace/TestJob',
				},]
			},
			{
				path: '/ws/:ws_id/test_result',
				inNav: true,
				name: 'TestResult',
				hasLeftNav: false,
				routes: [
					{
						path: '/ws/:ws_id/test_result',
						hideInMenu: true,
						name: 'TestResult',
						component: "@/pages/WorkSpace/TestResult/JobList"
					},
					{
						path: '/ws/:ws_id/test_result/:id',
						hideInMenu: true,
						component: '@/pages/WorkSpace/TestResult/Details',
					}
				]
			},
			{
				path: '/ws/:ws_id/workspace/initSuccess',
				hasLeftNav: false,
				inNav: true,
				component: './WorkSpace/CreateWorkspace/WsInitSucess',
			},
			{
				path: '/ws/:ws_id/test_analysis',
				name: 'TestAnalysis',
				inNav: true,
				hasLeftNav: false,
				routes: [
					{
						path: '/ws/:ws_id/test_analysis/compare',
						name: 'CompareAnalysis',
						component: '@/pages/WorkSpace/TestAnalysis/AnalysisCompare',
					},
					{
						path: '/ws/:ws_id/test_analysis/result',
						hideInMenu: true,
						name: 'ResultCompareAnalysis',
						component: '@/pages/WorkSpace/TestAnalysis/AnalysisResult',
					},
					{
						path: '/ws/:ws_id/test_analysis/time',
						name: 'TimeAnalysis',
						component: '@/pages/WorkSpace/TestAnalysis/AnalysisTime'
					},
				]
			},
			{
				path: '/ws/:ws_id/test_plan',
				name: 'TestPlan',
				// hideInMenu : true,
				inNav: true,
				routes: [
					{
						path: '/ws/:ws_id/test_plan/:plan_id/edit',
						hideInMenu: true,
						name: 'Edit',
						component: '@/pages/WorkSpace/TestPlan/PlanForm',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_plan/:plan_id/run',
						hideInMenu: true,
						name: 'Run',
						component: '@/pages/WorkSpace/TestPlan/PlanForm',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_plan/create',
						hideInMenu: true,
						name: 'Create',
						component: '@/pages/WorkSpace/TestPlan/PlanForm',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_plan',
						name: 'Manage',
						component: '@/pages/WorkSpace/TestPlan',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_plan/view',
						name: 'View',
						component: '@/pages/WorkSpace/TestPlan/PlanView',
					},
					{
						path: '/ws/:ws_id/test_plan/view/summary/:plan_id',
						hideInMenu: true,
						name: 'Summary',
						component: '@/pages/WorkSpace/TestPlan/PlanView/ViewSummary',
					},
					{
						path: '/ws/:ws_id/test_plan/view/detail/:plan_id',
						hideInMenu: true,
						name: 'Detail',
						component: '@/pages/WorkSpace/TestPlan/PlanView/ViewDetail',
					},
					{
						path: '*',
						redirect: '/'
					}
				]
			},
			{
				path: '/ws/:ws_id/test_create_report',
				name: 'CreateReport',
				hideInMenu: true,
				inNav: true,
				component: '@/pages/WorkSpace/TestReport/NewReport',
				access: 'IsWsSetting',
			},

			{
				path: '/ws/:ws_id/test_report',
				inNav: true,
				name: 'TestReport',
				hideChildrenInMenu: true,
				routes: [
					{
						path: '/ws/:ws_id/test_report',
						component: '@/pages/WorkSpace/TestReport',
						name: 'Report',
					},
					{
						path: '/ws/:ws_id/test_report/compare',
						hideInMenu: true,
						name: 'CompareAnalysisConf',
						component: '@/pages/WorkSpace/TestAnalysis/AnalysisCompare',
					},
					{
						path: '/ws/:ws_id/test_report/template',
						name: 'TemplateCreate',
						component: '@/pages/WorkSpace/TestReport/Template',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_report/template/:temp_id',
						name: 'TemplateEdit',
						component: '@/pages/WorkSpace/TestReport/Template',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_report/template/:temp_id/preview',
						name: 'ReportTemplatePreview',
						layout: false,
						component: '@/pages/WorkSpace/TestReport/Template/Preview',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/test_report/:report_id',
						name: 'Report',
						component: '@/pages/WorkSpace/TestReport/NewReport',
					},
					{
						path: '/ws/:ws_id/test_report/:report_id/edit',
						name: 'EditReport',
						component: '@/pages/WorkSpace/TestReport/NewReport',
						access: 'IsWsSetting',
					},

					{
						path: '*',
						redirect: '/',
					}
				]
			},
			{
				path: '/ws/:ws_id/suite_search',
				inNav: true,
				name: 'TestSuiteSearch',
				hasLeftNav: false,
				routes: [
					{
						path: '/ws/:ws_id/suite_search',
						name: 'IndexPage',
						hideInMenu: true,
						component: '@/pages/WorkSpace/TestSuiteSearch/List/DefaultPageList',
					},
					{
						path: '/ws/:ws_id/suite_search/conf_Details',
						hideInMenu: true,
						name: 'ConfDetail',
						component: '@/pages/WorkSpace/TestSuiteSearch/Details/ConfDetails',
					},
					{
						path: '/ws/:ws_id/suite_search/suite_Details',
						hideInMenu: true,
						name: 'SuiteDetail',
						component: '@/pages/WorkSpace/TestSuiteSearch/Details/SuiteDetails',
					},
					{
						path: '/ws/:ws_id/suite_search/key',
						name: 'TestSuiteSearchResult',
						hideInMenu: true,
						inNav: true,
						component: '@/pages/WorkSpace/TestSuiteSearch/List/SearchPageList',
					}
				]
			},
			// 离线测试
			{
				path: '/ws/:ws_id/offline_test',
				name: 'Upload',
				inNav: true,
				component: './WorkSpace/TestUpload',
			},
			{
				path: '/ws/:ws_id/config',
				name: 'WorkspaceConfig',
				access: 'WsBtnPermission',
				routes: [
					{
						path: '/ws/:ws_id/config/basic',
						name: 'BasicConfig',
						component: './WorkSpace/BasicConfig',
						access: 'WsBtnPermission',
					},
					{
						path: '/ws/:ws_id/config/member',
						name: 'MemberManage',
						component: './WorkSpace/MemberManage',
						access: 'WsBtnPermission'
					},
					{
						path: '/ws/:ws_id/config/join',
						name: 'JoinDetail',
						component: './WorkSpace/JoinDetail',
						access: 'WsBtnPermission',
					}
				]
			},
			{
				path: '/ws/:ws_id/job',
				name: 'JobConfig',
				access: 'IsWsSetting',
				routes: [
					{
						path: '/ws/:ws_id/job/types/create',
						hideInMenu: true,
						name: 'CreateJobType',
						hasLeftNav: false,
						component: './WorkSpace/JobTypeManage/CreateJobType',
					},
					{
						path: '/ws/:ws_id/job/types',
						exact: true,
						name: 'JobTypeManage',
						access: 'WsMemberNoPermission',
						component: './WorkSpace/JobTypeManage',
					},
					{
						path: '/ws/:ws_id/job/templates',
						name: 'TestTemplateManage',
						component: './WorkSpace/TestTemplateManage',
						access: 'IsWsSetting',
						exact: true
					},
					{
						path: '/ws/:ws_id/job/tags',
						name: 'TagManage',
						component: './WorkSpace/TagManage',
						access: 'WsMemberNoPermission',
						exact: true
					},
					{
						path: '/ws/:ws_id/job/update/:jt_id',
						hideInMenu: true,
						hasLeftNav: false,
						exact: true,
						name: 'JobTypeUpdate',
						access: 'WsMemberNoPermission',
						component: './WorkSpace/JobTypeManage/CreateJobType',
					},
				]
			},
			{
				path: "/ws/:ws_id/baseline",
				name: "baseline",
				access: "IsWsSetting",
				routes: [
					{
						path: "/ws/:ws_id/baseline/functional",
						component: "@/pages/WorkSpace/BaselineManage",
						name: "functional",
					},
					{
						path: "/ws/:ws_id/baseline/performance",
						component: "@/pages/WorkSpace/BaselineManage",
						name: "performance",
					},
					{
						hideInMenu: true,
						path: "*",
						redirect: "/ws/:ws_id/baseline/functional",
					}
				]
			},
			{
				path: '/ws/:ws_id/device',
				name: 'DeviceManage',
				access: 'IsWsSetting',
				routes: [
					{
						path: '/ws/:ws_id/device/group',
						name: 'GroupManage',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/GroupManage',
						access: 'IsWsSetting',

					},
					{
						path: '/ws/:ws_id/device/cloud',
						name: 'CludeManage',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/CloudManage',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/device/tag',
						name: 'DispatchTag',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/DispatchTag',
						access: 'IsWsSetting',
					},
					{
						path: '/ws/:ws_id/device/CloudConfig',
						name: 'CloudConfig',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/CloudConfig',
						access: 'WsMemberNoPermission',
					}
				]
			},
			{
				path: '/ws/:ws_id/message',
				inNav: true,
				//layout: false,
				hideInMenu: true,
				component: './TaskMessage',
			},
			{
				path: '/ws/:ws_id/refenerce/:type',
				//name: 'RefenerceDetail',
				inNav: true,
				hideInMenu: true,
				component: '@/pages/WorkSpace/RefenerceDetail',
			},
			{ //Test suite管理
				path: '/ws/:ws_id/test_suite',
				name: 'TestSuiteManage',
				component: './WorkSpace/TestSuiteManage',
				access: 'IsWsSetting',
			},
			{
				path: '/ws/:ws_id/new_suite/:test_type',
				name: 'TestSuiteCreate',
				layout: false,
				hideInMenu: true,
				inNav: true,
				component: './WorkSpace/TestSuiteManage/TestSuiteCreate',
				access: 'WsMemberNoPermission',
			},
			{ //产品管理
				path: '/ws/:ws_id/product',
				name: 'Product',
				component: '@/pages/WorkSpace/Product',
				access: 'WsMemberNoPermission',
			},
			{
				path: '/ws/:ws_id/test_template',
				hideInMenu: true,
				inNav: true,
				layout: false,
				routes: [
					{
						path: '/ws/:ws_id/test_template/:jt_id/edit',
						name: 'TemplateEdit',
						hideInMenu: true,
						layout: false,
						component: '@/pages/WorkSpace/TestJob'
					},
					{
						path: '/ws/:ws_id/test_template/:jt_id/preview',
						name: 'TemplatePreview',
						hideInMenu: true,
						layout: false,
						component: '@/pages/WorkSpace/TestJob'
					},
					{
						path: '*',
						redirect: '/'
					}
				]
			},
			{
				path: '/ws/:ws_id/devOps',
				access: 'WsMemberNoPermission',
				name: 'DevOps',
				component: '@/pages/WorkSpace/DevOps'
			},
			{
				hideInMenu: true,
				inNav: true,
				hasLeftNav: false,
				name: "401",
				path: "/ws/:ws_id/401",
				component: "@/pages/401"
			},
			{
				hideInMenu: true,
				inNav: true,
				hasLeftNav: false,
				name: "500",
				path: "/ws/:ws_id/500",
				component: "@/pages/500"
			},
			{
				hideInMenu: true,
				inNav: true,
				hasLeftNav: false,
				name: "404",
				component: "@/pages/404"
			}
		]
	},
	BUILD_APP_ENV === 'opensource' &&
	{
		path: '/login',
		layout: false,
		hiseInMenu: true,
		component: './Login'
	},
	{
		path: '/:doc_type(help_doc|notice)',
		hideInMenu: true,
		routes: [
			{
				path: '/:doc_type(help_doc|notice)/create',
				access: 'IsAdmin',
				layout: false,
				exact: true,
				component: './DOC/Create',
			},
			{
				path: '/:doc_type(help_doc|notice)/edit/:doc_id?',
				access: 'IsAdmin',
				component: './DOC/Create',
			},
			{
				path: '/:doc_type(help_doc|notice)/:doc_id?',
				component: './DOC',
			},
			{
				redirect: '/'
			}
		]
	},
	{
		path: '/workspace/create',
		layout: false,
		hideInMenu: true,
		component: './WorkSpace/CreateWorkspace',
		access: 'ApplyPrivate',
	},
	{
		path: '/401',
		hideInMenu: true,
		name: 'server.401',
		component: './401',
	},
	{
		path: '/500',
		hideInMenu: true,
		name: 'server.500',
		component: './500',
	},
	{
		path: '/404',
		hideInMenu: true,
		name: 'server.404',
		component: './404',
	},
	{
		path: '*',
		redirect: '/'
	}
].filter(Boolean)

export default routes
