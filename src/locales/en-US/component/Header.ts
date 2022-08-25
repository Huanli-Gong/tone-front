const defaultKey = 'header'

const text =  {
  'create_job_type_text': 'Create Job Type',
  'create.by.job': 'Create By Job Type',
  'create.by.template': 'Create By Test Template',

  'all': 'All', 
  'functional': 'Functional Test', 
  'performance': 'Performance Test',
  'business': 'Business Test',
  'stability': 'Stability Test',
  // Server Type
  'aligroup': 'IntranetServer',
  'aliyun': 'CloudServer',
  // Test Type
  'test_type.functional': 'Funcational',
  'test_type.performance': 'Performance',
  'test_type.business': 'Business',
  'test_type.stability': 'Stability',
	// Business Type
  'business.functional': 'BizFunctional',
  'business.performance': 'BizPerformance',
  'business.business': 'BizTestcase',
  'business.others': 'Business',
	
	'delete.the.problem.template': 'Template error, please delete it',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})
