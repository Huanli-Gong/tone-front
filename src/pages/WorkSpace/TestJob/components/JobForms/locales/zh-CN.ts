const defaultKey = 'job.form'

const text = {
  //----后端返的字段----
  'job_name': 'Job名称',
  'project': 'Project选择',
  'baseline': '测试基线',
  'baseline_job': '基线Job',
  //------------------
  'job_name.message': '允许字母、数字、下划线、中划线、{date}占位符，“.”，不允许中文',
  'job_name.limit.message': 'Job名称最长不超出128字符',
  'project.placeholder': '请选择Project',
  'baseline.placeholder': '请选择需要对比的测试基线',
  'baseline_job_id.placeholder': '请选择一个Job作为基线',

  //----后端返的字段----
  'reclone': '重装机器',
  'kernel_install': '重装内核',
  'reboot': '重启机器',
  'global_variable': '全局变量',
  'rpm': '安装RPM',
  'script': '执行脚本',
  'monitor.config': '监控配置',
  //------------------
  'physical.machine': '物理机',
  'iclone.os': '请选择iclone os镜像',
  'iclone.template': '请选择iclone应用模板',
  'vm': '虚拟机',
  'vm.config': '请选择vm配置',
  'uninstall': '不安装',
  'install_push': '安装已发布',
  'install_un_push': '安装未发布',
  'install_build_kernel': 'Build内核',

  'env_info.placeholder': '格式：key=value，多个用空格或换行进行分割',
  'env_info.li1': '定义多个全局变量，请使用空格和换行分割',
  'env_info.li2': '必须是字母、数字和下划线组合',
  'env_info.li3': '支持 value 中有双等号',
  'env_info.li4': '可以定义一个数组（使用括号）',
  'env_info.li5': 'value中包含空格，则必须用双引号括起来',
  'execution.time': '执行时机',
  'restart.before': '重启前',
  'restart.after': '重启后',
  'rpm.buttonText': '+ 添加RPM包',
  'rpm.placeholder': '请输入rpm包链接，多个用英文逗号或换行分割',
  'script.buttonText': '+ 添加执行脚本',
  'script.placeholder': '请输入脚本内容',

  // 'monitor.label': '监控配置',
  'add.group.monitor.btn': '+ 添加一组监控',
  'case.machine': '本机',
  'custom.machine': '自定义',
  'custom.machine.message': '请输入英文大小写、数字、特殊字符下划线、中划线和点',
  'input.machine.ip': '请输入监控机器的IP',
  'address': '地址',
  'monitor.instructions': '监控说明',
  'only.monitor.all.use.cases.machine': '仅对当前Job的所有用例分配到的机器进行数据监控。',
  'users.can.enter.IP': '用户可通过手动输入IP',
  'add.machine.monitoring': '的方式，添加机器进行监控。',

  // more
  //----后端返的字段----
  'cleanup': '清理脚本',
  'job_tag': 'Job标签',
  'notice_subject': '通知主题',
  'email_notice': '邮件通知',
  'ding_notice': '钉钉通知',
  //-------------------
  'cleanup_info.placeholder': '请输入Job的清理脚本',
  'notice_subject.placeholder': '[T-One] 你的测试已完成{date}',
  'email.validator': '格式错误：多个邮箱用空格或英文逗号分隔',
  'email.placeholder': '默认通知Job创建人，多个邮箱用空格或英文逗号分隔',
  'ding_token.placeholder': '请输入钉钉token，多个token用空格或英文逗号分隔',
  'report.label': '测试报告',
  'report.placeholder': '请输入报告名称，例如：{job_name}_report-{report_seq_id}',
  'report.tips': '报告名称可用占位符：',
  'report_template.label': '报告模板',
  'report_template.placeholder': '请选择报告模板',
  'callback_api.label': '回调接口',
  'callback_api.help': '请输入正确的回调接口URL',
  'callback_api.placeholder': '请输入回调接口的URL',
  'callback_api.icons': 'T-one平台会在Job状态发生变化时携带该Job信息并以POST方式主动请求该API。',
  'callback_api.tips': '详细信息请查看',
  'callback_api.help.document': '回调接口帮助文档',
  'job_timeout.label': 'Job超时时间',
  'job_timeout.placeholder': '请输入Job超时时间',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})