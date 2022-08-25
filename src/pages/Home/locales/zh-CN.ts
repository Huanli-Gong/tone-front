const defaultKey = 'pages.home'

const text =  {
  'title': 'Hi，欢迎使用开源质量协作平台 T-One ！',
  'subTitle': 'T-One（testing in one）提供一站式自动化测试集成、管理、执行、分析，以及跨团队、跨企业质量协作能力。',
  'more.introduction': '更多介绍',
  'recommend.Workspace': '推荐Workspace',

  'tab.all': '全部Workspace',
  'tab.history': '最近访问',
  'tab.joined': '我加入的',
  'tab.created': '我创建的',
  'input.placeholder': '请输入搜索关键字',
  'create.workspace': '新建Workspace',
  'public': '公开',
  'private': '私密',
  'enter': '进入',
   
  'announcement': '公告',
  'view.all': '查看全部',
  'empty.notice': '暂无公告',
  'using.help': '使用帮助',
  'no.help': '暂无帮助',
  'mustRead': '必看',
  'course': '教程',
  'docs': '文档',
  'maintain': '维护', 
  'notice': '通知', 
  'upgrade': '升级', 
  'stop': '暂停',

  'popover.title': '申请加入',
  'join.popover.reason': '申请理由',
  'join.popover.optional': '(选填)',
  'popover.btn.cancel': '(选填)',
  'popover.btn.submit': '提交申请',
  'popover.btn.join': '加入',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})