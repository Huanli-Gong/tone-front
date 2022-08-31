const defaultKey = 'ws.result.list'

const text =  {
  // select Options
  'job_id': 'JobID',
  'name': 'Job Name',
  'fail_case': 'Failed Cases',
  'creators': 'Creator',
  'tags': 'Job Tag',
  'state': 'State',
  'server': 'Testing Machine',
  'test_suite': 'TestSuite',
  'job_type_id': 'Job Type',
  'test_type': 'Test Type',
  'project_id': 'Project',
  'please.placeholder.job_id': 'Enter JobID',
  'please.placeholder.name': 'Enter JobName',
  'please.placeholder.fail_case': 'Enter multiple failed cases,separated by commas (,)',
  'please.placeholder.creators': 'Select Creator',
  'please.placeholder.tags': 'Select Tags',
  'please.placeholder.state': 'Select State',
  'please.placeholder.server': 'Select Testing Machine',
  'please.placeholder.test_suite': 'Select TestSuite',
  'please.placeholder.job_type_id': 'Select JobType',
  'please.placeholder.test_type': 'Select Test Type',
  'please.placeholder.project_id': 'Select Project',
  'start_time': 'Start time',
  'completion_time': 'Completion Time',
  // tab
  'all.job': 'All Job',
  'my.job': 'Created Job',
  'collection': 'Collected Job',
  'offline': 'Offline',
  'test_type.Tootip': 'All/Success/Failure',
  'test_type.desc1': 'Function tests: Collect statistics about TestConf results in test results.',
  'test_type.desc2': 'Performance test: Collect statistics on TestConf execution status in the execution result',
  'selection.function': 'Select Action',
  'report.and.analysis': 'Reporting and Analysis',
  'batch.delete': 'Batch Delete',
  'collapse.filter': 'Folded Filter',
  'expand.filter': 'Expansion Filtering',
  'select.condition': 'Select Criteria ',
  'select.time': 'Select Time',


  // compare bar
  'compare.bar': 'Compare Bar',
  'combining.rule': 'Merge rule: Take the union data of all jobs;',
  'top.ranked': 'If there are duplicates, the Job with the highest order takes precedence.',
  'create.report': 'Generate Report',
  'compare.analysis': 'Compare and analysis', 
  'report.name': 'Report Name',
  'report.name.placeholder': 'Search by report name is supported.',
  'gmt_created': 'Save Time',
  'view.report': 'Check Report',
  'please.add.comparison.group': 'Add comparison group data',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})