const { BUILD_APP_ENV } = process.env

const routes = [
	{
		path: '/',
		name: 'home',
		component: './Home',
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
		access: 'canSysTestAdmin',
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
		access: 'canSysTestAdmin',
		routes: [
			{
				path: '/system/approve',
				name: 'joinApprove',
				component: './SystemConf/JoinApprove',
				access: BUILD_APP_ENV ? 'hiddenRoute' : 'canSuperAdmin',
			},
			{
				path: '/system/workspace',
				name: 'workspaceManagement',
				component: './SystemConf/WorkspaceManagement',
				access: 'canSuperAdmin',
			},
			{
				path: '/system/user',
				name: 'userManagement',
				component: './SystemConf/UserManagement',
				access: 'canSuperAdmin',
			},
			{
				path: '/system/suite',
				name: 'suiteManagement',
				component: './SystemConf/TestSuite',
				access: 'canSysTestAdmin',
			},
			{
				path: '/system/kernel',
				name: 'KernelManage',
				component: '@/pages/SystemConf/KernelManage',
				access: 'canSysTestAdmin',
			},
			{
				path: '/system/basic',
				name: 'BasicSetting',
				component: '@/pages/SystemConf/BasicSetting',
				access: 'canSysTestAdmin',
			},
			{
				path: '/system/testfarm',
				name: 'TestParmSetting',
				component: '@/pages/SystemConf/TestParmSetting',
				access: 'canSysTestAdmin',
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
		name: 'helpDoc',
		hideInMenu: true,
		path: '/help_doc',

		routes: [
			{
				path: '/help_doc',
				routes: [
					{
						path: '/help_doc',
						component: './HelpDocument',
					},
					{
						path: '/help_doc/new',
						access: 'canSysTestAdmin',
						component: './HelpDocument/EditOrNew',
					},
					{
						path: '/help_doc/:help_id',
						component: './HelpDocument',
					},
					{
						path: '/help_doc/:help_id/edit',
						access: 'canSysTestAdmin',
						component: './HelpDocument/EditOrNew',
					},
					{
						path: '*',
						component: './404',
					}
				]
			},
		]
	},
	{
		name: 'helpDoc',
		hideInMenu: true,
		path: '/notice',
		routes: [
			{
				path: '/notice',
				routes: [
					{
						path: '/notice',
						component: './HelpDocument',
					},
					{
						path: '/notice/new',
						access: 'canSysTestAdmin',
						component: './HelpDocument/EditOrNew',
					},
					{
						path: '/notice/:help_id',
						component: './HelpDocument',
					},
					{
						path: '/notice/:help_id/edit',
						access: 'canSysTestAdmin',
						component: './HelpDocument/EditOrNew',
					},
					{
						path: '*',
						component: './404',
					}
				]
			},
		]
	},
	{
		path: '/message',
		//layout: false,
		showInWs: true,
		hideInMenu: true,
		// access: 'loginAndMsgAccess',
		component: './TaskMessage',
	},

	{
		path: '/ws/:ws_id/message',
		//layout: false,
		hideInMenu: true,
		access: 'loginAndMsgAccess',
		component: './TaskMessage',
	},
	{
		path: '/ws/:ws_id/refenerce/:type',
		//name: 'RefenerceDetail',
		hideInMenu: true,
		component: '@/pages/WorkSpace/RefenerceDetail',
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
						component: '@/pages/WorkSpace/TestResult',
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
						component: '@/pages/WorkSpace/TestPlan/PlanForm'
					},
					{
						path: '/ws/:ws_id/test_plan/:plan_id/run',
						hideInMenu: true,
						name: 'Run',
						component: '@/pages/WorkSpace/TestPlan/PlanForm'
					},
					{
						path: '/ws/:ws_id/test_plan/create',
						hideInMenu: true,
						name: 'Create',
						component: '@/pages/WorkSpace/TestPlan/PlanForm',
					},
					{
						path: '/ws/:ws_id/test_plan',
						name: 'Manage',
						component: '@/pages/WorkSpace/TestPlan',
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
						component: '@/pages/WorkSpace/TestPlan/PlanView/ViewDetail'
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
				component: '@/pages/WorkSpace/TestReport/NewReport'
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
						component: '@/pages/WorkSpace/TestReport/Template'
					},
					{
						path: '/ws/:ws_id/test_report/template/:temp_id',
						name: 'TemplateEdit',
						component: '@/pages/WorkSpace/TestReport/Template',
					},
					{
						path: '/ws/:ws_id/test_report/template/:temp_id/preview',
						name: 'ReportTemplatePreview',
						layout: false,
						component: '@/pages/WorkSpace/TestReport/Template/Preview',
					},
					{
						path: '/ws/:ws_id/test_report/:report_id',
						name: 'Report',
						component: '@/pages/WorkSpace/TestReport/NewReport'
					},
					{
						path: '/ws/:ws_id/test_report/:report_id/edit',
						name: 'EditReport',
						component: '@/pages/WorkSpace/TestReport/NewReport'
					},
					// {
					// 	path: '/ws/:ws_id/test_report/report',
					// 	component: '@/pages/WorkSpace/TestReport/NewReport',
					// 	name: 'Report',
					// },
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
						path: '/ws/:ws_id/suite_search/key/:keyword',
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
				routes: [
					{
						path: '/ws/:ws_id/config',
						name: 'BasicConfig',
						component: './WorkSpace/BasicConfig',
						access: 'canWsAdmin',
					},
					{
						path: '/ws/:ws_id/config/member',
						name: 'MemberManage',
						component: './WorkSpace/MemberManage',
						access: 'canWsAdmin'
					},
					{
						path: '/ws/:ws_id/config/join',
						name: 'JoinDetail',
						component: './WorkSpace/JoinDetail',
						access: BUILD_APP_ENV ? 'hiddenRoute' : 'canWsAdmin',
					}
				]
			},
			{
				path: '/ws/:ws_id/job',
				name: 'JobConfig',
				access: 'canWsAdmin',
				routes: [
					{
						path: '/ws/:ws_id/job/types',
						exact: true,
						name: 'JobTypeManage',
						component: './WorkSpace/JobTypeManage',
					},
					{
						path: '/ws/:ws_id/job/templates',
						name: 'TestTemplateManage',
						component: './WorkSpace/TestTemplateManage',
						exact: true
					},
					{
						path: '/ws/:ws_id/job/tags',
						name: 'TagManage',
						component: './WorkSpace/TagManage',
						exact: true
					},
					{
						path: '/ws/:ws_id/job/create',
						hideInMenu: true,
						name: 'CreateJobType',
						hasLeftNav: false,
						component: './WorkSpace/JobTypeManage/CreateJobType',
					},
					{
						path: '/ws/:ws_id/job/update/:jt_id',
						hideInMenu: true,
						hasLeftNav: false,
						exact: true,
						name: 'JobTypeUpdate',
						component: './WorkSpace/JobTypeManage/CreateJobType',
					},
				]
			},
			{ //基线管理
				path: '/ws/:ws_id/baseline',
				name: 'Baseline',
				// hideInMenu : true ,
				component: '@/pages/WorkSpace/Baseline',
				access: 'canWsAdmin',
				routes: [
					{
						path: '/ws/:ws_id/baseline/group',
						name: 'GroupBaseline',
						component: '@/pages/WorkSpace/Baseline/Group'
					},
					{
						path: '/ws/:ws_id/baseline/cluster',
						name: 'ClusterBaseline',
						component: '@/pages/WorkSpace/Baseline/Group'
					}
				]
			},
			{
				path: '/ws/:ws_id/device',
				name: 'DeviceManage',
				access: 'canWsAdmin',
				routes: [
					{
						path: '/ws/:ws_id/device/group',
						name: 'GroupManage',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/GroupManage'
					},
					{
						path: '/ws/:ws_id/device/cloud',
						name: 'CludeManage',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/CloudManage'
					},
					{
						path: '/ws/:ws_id/device/tag',
						name: 'DispatchTag',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/DispatchTag',
					},
					{
						path: '/ws/:ws_id/device/CloudConfig',
						name: 'CloudConfig',
						exact: true,
						component: '@/pages/WorkSpace/DeviceManage/CloudConfig',
					}
				]
			},
			{ //Test suite管理
				path: '/ws/:ws_id/test_suite',
				name: 'TestSuiteManage',
				component: './WorkSpace/TestSuiteManage',
				access: 'canWsAdmin',
			},
			{
				path: '/ws/:ws_id/new_suite/:test_type',
				name: 'TestSuiteCreate',
				layout: false,
				hideInMenu: true,
				inNav: true,
				component: './WorkSpace/TestSuiteManage/TestSuiteCreate',
			},
			{ //产品管理
				path: '/ws/:ws_id/product',
				name: 'Product',
				component: '@/pages/WorkSpace/Product',
				access: 'canWsAdmin',
			},
			{
				path: '/ws/:ws_id/test_template',
				hideInMenu: true,
				inNav: true,
				layout: false,
				access: 'canWsAdmin',
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
				access: 'canWsAdmin',
				name: 'DevOps',
				component: '@/pages/WorkSpace/DevOps'
			},
			{
				path: '*',
				hideInMenu: true,
				name: 'DirectRoute',
				redirect: '/'
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
		path: '/workspace/create',
		layout: false,
		hideInMenu: true,
		component: './WorkSpace/CreateWorkspace',
		access: 'canSuperAdmin'
	},
	{
		path: '/401',
		layout: false,
		hideInMenu: true,
		component: './401',
	},
	{
		path: '/500',
		layout: false,
		hideInMenu: true,
		name: 'server.500',
		component: './500',
	},
	{
		path: '/404',
		layout: false,
		hideInMenu: true,
		name: 'nofoundpage.404',
		component: './404',
	},
	{
		path: '*',
		redirect: '/'
	}
].filter(Boolean)

export default routes
