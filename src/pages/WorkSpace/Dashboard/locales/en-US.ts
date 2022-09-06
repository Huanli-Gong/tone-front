const defaultKey = 'ws.dashboard'

const text =  {
  'total_product': 'Total Products / Projects',
  'total_job': 'Total Jobs',
  'total_conf': 'Total Testconfs',
  'server_use_num': 'Total Testservers',

  // 产品列表
  'product_list': 'Products',
  '24h': 'Late 24hs',
  '48h': 'Late 48hs',
  'oneWeek': 'Late one week',
  'all.job': 'All Jobs',

  'product_create.time': 'Created at',
  'empty.project_list': 'No project',
  'product.create': 'Create',
  //
  'fail.reason': 'Some job failed',
  'success.reason': 'All job succeed',
  'pending.reason': 'Some job is already running or pending',
  'no.job': 'No job',
  'job.result': 'Result(Success/Fail)',

  // 列表详情
  'list.details': 'List details',
  'trend.chart': 'Trend chart',
  'today': 'Today',
  'one.month': 'One month',
  'job.success.failure': 'Job succeed/failed',
  'case.failed': 'Testcase failed',
  // job table
  'job.id': 'Job ID',
  'job.name': 'Job Name',
  'job.state': 'State',
  'please.select.state': 'Select State',
  'job.test_type': 'Test type',
  'job.test_result': 'Total/Success/Fail',
  'job.project_name': 'Project',
  'job.creator_name': 'Creator',
  'job.start_time': 'Start Time',
  'job.end_time': 'End Time',
  'operation.rerun': 'Rerun',
  // Modal
  'rerun.Modal.title': 'Import configuration',
  'Modal.operation': 'Job name',
  'import.test.cases': 'Import testcases',
  'import.notification.config': 'Import notification configuration',
  // report table
  'view.report': 'View report',
  'report.name': 'Name',
  'report.creator_name': 'Creator',
  'report.gmt_created': 'Created at',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})
