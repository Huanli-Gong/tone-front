const defaultKey = 'job.form'

const text =  {
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
  'env_info.li1': 'To define multiple global variables, use spaces and newline segmentation',
  'env_info.li2': 'Must be a combination of letters, numbers and underscores',
  'env_info.li3': 'Support double equal sign in value',
  'env_info.li4': 'You can define an array (use parentheses)',
  'env_info.li5': 'the value contains spaces, it must be enclosed in double quotation marks',
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