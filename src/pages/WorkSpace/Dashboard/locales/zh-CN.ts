const defaultKey = 'ws.dashboard'

const text =  {
  'total_product': '总产品/总项目',
  'total_job': 'Job总数',
  'total_conf': 'TestConf总数',
  'server_use_num': '机器使用数',

  // 产品列表
  'product_list': '产品列表',
  '24h': '近24h',
  '48h': '近48h',
  'oneWeek': '近一周',
  'all.job': '所有Job',

  'product_create.time': '创建于',
  'empty.project_list': '产品中还没有项目',
  'product.create': '立刻创建',
  //
  'fail.reason': '有job失败',
  'success.reason': '所有job均成功',
  'pending.reason': '有job(创建于所选时间段)当前状态还在运行中，或者pending状态',
  'no.job': '没有job',
  'job.result': '结果(成功/失败)',

  // 列表详情
  'list.details': '列表详情',
  'trend.chart': '趋势图',
  'today': '今天',
  'one.month': '一个月',
  'job.success.failure': 'Job成功/失败',
  'case.failed': '用例失败',
  // job table
  'job.id': 'JobID',
  'job.name': 'Job名称',
  'job.state': '状态',
  'please.select.state': '请选择状态',
  'job.test_type': '测试类型',
  'job.test_result': '总计/成功/失败',
  'job.project_name': '所属项目',
  'job.creator_name': '创建人',
  'job.start_time': '开始时间',
  'job.end_time': '完成时间',
  'operation.rerun': '重跑',
  // Modal
  'rerun.Modal.title': '导入配置',
  'Modal.operation': 'Job名称',
  'import.test.cases': '同时导入测试用例',
  'import.notification.config': '同时导入通知配置',
  // report table
  'view.report': '查看报告',
  'report.name': '报告名称',
  'report.creator_name': '创建人',
  'report.gmt_created': '保存时间',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})
