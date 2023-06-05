const defaultKey = 'ws.result.list'

const text: any = {
  // select Options
  'job_id': 'Job ID',
  'name': 'Job Name',
  'fail_case': 'Fail Case',
  'creators': 'Creator',
  'tags': 'Job Tag',
  'state': 'State',
  'server': 'Test Server', // 'Testing Machine',
  'test_suite': 'Test Suite',
  'job_type_id': 'Job Type',
  'test_type': 'Test Type',
  'project_id': 'Project',
  'please.placeholder.job_id': 'Enter Job ID',
  'please.placeholder.name': 'Enter Job Name',
  'please.placeholder.fail_case': 'Enter multiple failed cases,separated by commas (,)',
  'please.placeholder.creators': 'Select Creator',
  'please.placeholder.tags': 'Select Tags',
  'please.placeholder.state': 'Select State',
  'please.placeholder.server': 'Select Test Server',
  'please.placeholder.test_suite': 'Select Test Suite',
  'please.placeholder.job_type_id': 'Select Job Type',
  'please.placeholder.test_type': 'Select Test Type',
  'please.placeholder.project_id': 'Select Project',
  'start_time': 'Start Time',
  'completion_time': 'End Time',

  'id': "ID",
  'project_name': 'Project',
  'product_version': 'Product Version',

  'test_result': 'All/Success/Fail',
  'creator_name': 'Creator',
  'end_time': 'End Time',

  'columns.state.reset': "Reset",
  'columns.state.title': "Column display",

  // tab
  'all.job': 'All Jobs',
  'my.job': 'Created Jobs',
  'collection': 'Collected Jobs',
  'offline': 'Offline',
  'test_type.Tootip': 'All/Success/Fail',
  'test_type.desc1': 'Functional: Collect statistics about TestConf results in test results.',
  'test_type.desc2': 'Performance: Collect statistics on TestConf execution status in the execution result.',
  'selection.function': 'Select Action',
  'report.and.analysis': 'Report / Analysis',
  'batch.delete': 'Batch Delete',
  'collapse.filter': 'Filters',
  'expand.filter': 'Filters',
  'select.condition': 'Select Criteria ',
  'select.time': 'Select Time',


  // compare bar
  'compare.bar': 'Compare Bar',
  'combining.rule': 'Merge rule: Take the union data of all jobs;',
  'top.ranked': 'If there are duplicates, the Job with the highest order takes precedence.',
  'create.report': 'Generate Report',
  'compare.analysis': 'Compare And Analysis',
  'report.name': 'Report Name',
  'report.name.placeholder': 'Search by report name is supported.',
  'gmt_created': 'Save Time',
  'view.report': 'Report',
  'please.add.comparison.group': 'Add comparison group data',

  'reRun.Modal.title': 'Import Configuration',
  'reRun.checked.suite': 'Import all cases at the same time',
  'reRun.checked.fail_case': 'Just import failed Testcase',
  'reRun.checked.notice': 'Import notification configuration at the same time',
  'reRun.checked.inheriting_machine': 'Use the machine used by the original Job',
};

export default Object.keys(text).reduce((p: any, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})