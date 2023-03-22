const defaultKey = 'job.form'

const text = {
  //----后端返的字段----
  'job_name': 'Job Name',
  'project': 'Project',
  'baseline': 'Test Baseline ',
  'baseline_job': 'Baseline Job',
  //------------------
  'job_name.message': 'Allow letters, numbers, underscores, dashes, {date} placeholders, ".", not Chinese',
  'job_name.limit.message': 'The job name can contain a maximum of 128 characters',
  'project.placeholder': 'Select Project',
  'baseline.placeholder': 'Select the test baseline you want to compare',
  'baseline_job_id.placeholder': 'Select a Job as the baseline',

  //----后端返的字段----
  'reclone': 'Reload Server',
  'kernel_install': 'Reinstall Kernel',
  'reboot': 'Restart Server',
  'global_variable': 'Global Variable',
  'rpm': 'Install RPM',
  'script': 'Execute Script',
  'monitor.config': 'Monitoring Configuration',
  //------------------
  'physical.machine': 'The physical server',
  'iclone.os': 'Select iclone os image',
  'iclone.template': 'Select iclone template',
  'vm': 'The virtual server',
  'vm.config': 'Select VM configuration',
  'uninstall': 'Not Install',
  'install_push': 'Install Released',
  'install_un_push': 'Install Not Released',
  'install_build_kernel': 'Build Kernel',

  'env_info.placeholder': 'Format: key = value, multiple spaces or line breaks',

  'env_info.1': 'Supports defining multiple global variables, requiring the use of spaces and line breaks. [e.g.  x=1 y=2]',
  'env_info.2': 'Support for containing special symbols. [e.g.  expression="a==b"]',
  'env_info.3': 'Supports defining an array. [e.g., fruits=(apple banana lemon)]',
  'env_info.4': `Supports the use of single and double quote nesting. [e.g.  test='The capital letter of a is "A"' or test="The capital letter of a is'A'"]`,
  'env_info.5': `If you want value to be enclosed in quotation marks, use single and double quotation marks together. '. [e.g.  key="'value '" or key='"value"']`,
  'env_info.6': `If value is required to be empty, single or double quotation marks will be passed in. [e.g.  \' \' or " "]`,

  'execution.time': 'Execution time',
  'restart.before': 'Before Reset',
  'restart.after': 'After Reset',
  'rpm.buttonText': '+ Add the RPM package',
  'rpm.placeholder': 'Enter the RPM package link, there are more than one with comma or newline split',
  'script.buttonText': '+ Add an execution script',
  'script.placeholder': 'Enter script',

  // 'monitor.label': '监控配置',
  'add.group.monitor.btn': '+ Add a set of monitors',
  'case.machine': 'The server',
  'custom.machine': 'The custom',
  'custom.machine.message': 'Enter letters, digits, underscores (_), hyphens (-) and dots (.)',
  'input.machine.ip': 'Enter the IP of the monitoring server',
  'address': 'Address',
  'monitor.instructions': 'Monitor instructions',
  'only.monitor.all.use.cases.machine': 'Data monitoring is performed only on machines to which all use cases of the current Job are assigned.',
  'users.can.enter.IP': 'The user can enter the IP',
  'add.machine.monitoring': 'to add a server for monitoring.',

  // more
  //----后端返的字段----
  'cleanup': 'Clean Up Scripts',
  'job_tag': 'Job Tag',
  'notice_subject': 'Notify Theme',
  'email_notice': 'Email Notification',
  'ding_notice': 'DingTalk Notification',
  //-------------------
  'cleanup_info.placeholder': 'Enter the Job clearing script',
  'notice_subject.placeholder': '[T-One] The test completed {date}',
  'email.validator': 'Incorrect format: Separated Multiple email addresses by spaces or commas',
  'email.placeholder': 'The Job creator is notified by default. Separated Multiple email addresses by spaces or commas',
  'ding_token.placeholder': 'Enter a DingTalk token. Separate multiple tokens with spaces or commas',
  'report.label': 'Test Report',
  'report.placeholder': 'Enter a report name, e.g.{job_name}_report-{report_seq_id}',
  'report.tips': 'Report names are available as placeholders：',
  'report_template.label': 'Report Template',
  'report_template.placeholder': 'Select Report Template',
  'callback_api.label': 'Callback Interface',
  'callback_api.help': 'Enter correct callback URL',
  'callback_api.placeholder': 'Enter the URL of the callback interface',
  'callback_api.icons': 'the T-One carries the Job information and proactively requests the API in POST mode when the Job status changes.',
  'callback_api.tips': 'Check the callback  help docs for details',
  'callback_api.help.document': 'help docs for details',
  'job_timeout.label': 'Job Timeout',
  'job_timeout.placeholder': 'Enter the URL of the Job Timeout',

};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})