const defaultKey = 'ws.result.details'

const text = {
  'test.result': '测试结果',
  'result.details': '结果详情',
  'provider_name': '机器类型',
  'test_type': '测试类型',
  'job_state': 'Job状态',
  'job_type': 'Job类型',
  'creator_name': '创建人',
  'gmt_created': '创建时间',
  'finish_time': '完成时间',
  'project_name': '所属项目',
  'baseline_job': '基线Job',
  'baseline_test': '测试基线',
  'produce.version': '产品版本',
  'plan_instance_name': '所属计划',
  'job.tag': 'Job标签',
  'test_summary': '备注',
  'test.result.view.log.file': '测试结果详情请查看日志文件',
  'baseline.description': '基线说明',
  'baseline.description.ps': '在这里可以记录对问题的一些官方的比较正式的分析说明，基线说明和基线关联',
  'result.remarks': '结果备注',
  'result.remarks.ps': '在这里可以记录对此次结果的说明，和对基线问题一些修正意见，结果备注和当前结果关联',
  'rerun': '重跑',
  'stop': '停止Job',
  // Chart
  'increase': '上升',
  'decline': '下降',
  'normal': '正常',
  'invalid': '无效',
  'na': 'NA',
  'success': '通过',
  'fail': '失败',
  'skip': '跳过',
  'warn': '警告',
  'count': '全部',
  //
  'instance.released': '实例已释放',
  'machine.has.been.released': '云上机器实例已释放',
  'machine.config.error': '集群机器配置错误',
  'machine.occupied.by.job': '机器被Job占用',
  'occupy.job': '占用Job',

  // Tab
  'tab.testResult': '测试结果',
  'tab.testProgress': '执行过程',
  'tab.testConfig': '测试配置',
  'tab.monitor': '数据监控',
  'tab.log': '日志文件',
  'tab.resultFile': '结果文件',
  'tab.versionInfo': '版本信息',
  'tab.executionDetails': '执行详情',

  // TestResultTable
  'folded.conf': '收起所有Conf',
  'expand.conf': '展开所有Conf',

  'folded.Case': '收起所有Case',
  'expand.Case': '展开所有Case',
  'folded.index': '收起所有指标',
  'expand.index': '展开所有指标',
  'folded.all': '收起所有',
  'expand.all': '展开所有',
  'batch.baseline': '批量对比基线',
  'batch.join.baseline': '批量加入基线',
  'business.count': '总计',
  'business.success': '成功',
  'business.fail': '失败',
  'business_name': '业务名称',
  'the.server': '机器',
  'result': '结果',
  'business_business': '总计/成功/失败',
  'performance': 'Metric总计/上升/下降/正常/无效/NA',
  'functional': '总计/通过/失败/警告/跳过',
  'baseline': '对比基线',
  'baseline_job_id': '基线Job',
  'start_time': '开始时间',
  'end_time': '结束时间',
  'note': '备注',
  'join.baseline': '加入基线',
  // Drawer
  'bug': '缺陷记录',
  'bug.placeholder': '请输入缺陷记录',
  'baseline_id': '基线名称',
  'baseline_id.placeholder': '搜索或创建基线',
  'create.baseline': '新建基线',
  'impact_result': '影响结果',
  'description': '问题描述',
  'description.placeholder': '请输入问题描述信息',
  // Modal
  'test.env': '测试环境',
  'baseline.type': '基线类型',
  'baseline.name': '基线名称',
  'baseline.name.placeholder': '请输入基线名称',
  'baseline.desc': '基线描述(选填)',
  'baseline.desc.placeholder': '请输入基线描述',
  // edit
  'edit.remarks': '编辑备注',
  'please.enter.remarks': '请输入备注信息',
  'baseline.message': '未选择对比基线',
  'baseline.placeholder': '选择对比基线',
  'failed.download.file': '下载文件失败',
  'failed.get.file': '获取文件失败',
  'match.baseline': '匹配基线',
  'aone.bug': 'Aone记录',
  'installed.kernel': '已安装内核',
  'installed.rpm': '已安装RPM',
  'metric': '指标',
  'compared.results': '对比结果',
  'baseline_value': '基线',
  'threshold': '阈值',
  'track_result': '跟踪结果',


  // ProcessTable
  'build.kernel': 'Build内核',
  'package': '包',
  'name': '名称',
  'state': '状态',
  'git_repo': '仓库',
  'git_branch': '分支',
  'cbp_link': 'cbp链接',
  'copied': '已复制到剪切板！',

  'test.preparation': '测试准备',
  'mode': '运行模式',
  'test.server': '测试机器',
  'stage': '步骤',
  'output.results': '输出结果',

  'test.case': '测试用例',
  'put.away.all': '全部收起',
  'expanded.all': '全部展开',
  'env.preparation': '环境准备',
  'env.preparation.details': '环境准备详情',
  'stop.suite': '停止Suite',
  'skip.suite': '跳过suite',
  'restart.server': '重启机器',
  'execute.script': '执行脚本',
  'view.log': '查看日志',
  'log': '日志',
  'suspension': '中止',
  // 'skip': '跳过',
  'monitor': '监控',
  'monitor_link': '链接',
  'failed.info': '失败信息',

  'job.confirm.stop': "停止Job运行后将无法恢复运行，确定要停止吗？",

  // TestSettingTable
  'env.prepare.config': '环境准备配置',
  //----后端返的字段----
  'reclone': '重装机器',
  'kernel_install': '重装内核',
  'reboot': '重启机器',
  'global_variable': '全局变量',
  'rpm': '安装RPM',
  'script': '执行脚本',
  'monitor.config': '监控配置',
  //----------------
  'physical': '物理机',
  'physical.placeholder': '请选择iclone os镜像',
  'app_name.placeholder': '请选择iclone应用模板',
  'vm': '虚拟机',
  'vm.placeholder': '请选择vm配置',
  'install_no': '不安装',
  'install_publish': '安装已发布',
  'install_un': '安装未发布',
  'install_build': 'Build内核',
  // 'env_info.validate': '格式：key=value，多个用空格或换行分割',
  'rpm.add': '+ 添加RPM包',
  'please.enter.rpm': '请输入rpm包链接, 有多个用逗号或换行分割',
  'script.add': '+ 添加执行脚本',
  'please.enter.script': '请输入脚本内容',

  'test.cases.and.config': '测试用例及机器配置',
  'restart': '重启',
  'setup_info': '脚本',
  'restart.before': '重启前',
  'restart.after': '重启后',
  'priority': '执行优先级',
  'variable': '变量',

  'more.configurations': '更多配置',
  //----后端返的字段----
  'cleanup': '清理脚本',
  'job_tag': 'Job标签',
  'notice_subject': '通知主题',
  'email_notice': '邮件通知',
  'ding_notice': '钉钉通知',
  //------------------
  'cleanup.placeholder': '请输入Job的清理脚本',
  'tag': '标签',
  'select.tag': '请选择标签',
  'notice_subject.placeholder': '[T-One] 你的测试已完成{date}',
  'email.message': '请输入正确的邮箱地址',
  'email.placeholder': '默认通知Job创建人，多个邮箱用空格或英文逗号分隔',
  'ding_notice.placeholder': '请输入钉钉token，多个token用空格或英文逗号分隔',
  'report': '测试报告',
  'report.placeholder': '请输入报告名称，例如：{job_name}_report-{report_seq_id}',
  'report.Popover': '报告名称可用占位符：',
  'report_template': '报告模板',
  'report_template.placeholder': '请选择报告模板',
  'callback_api': '回调接口',
  'callback_api.placeholder': '请输入回调接口的URL',

  'new.tag': '新建标签',
  'tag_color': '标签颜色',
  'tag_name': '标签名称',
  'tag_name.already.exists': '标签名称已存在',

  'test.machine.failure': '测试机器故障，请及时处理！',
  'failed.server': '故障机器',
  'channel_type': '控制通道',
  'use_state': '使用状态',
  'real_state': '心跳状态',
  'not.assigned.server': '未分配到测试机器',
  'running,please.wait': '正在运行中，请耐心等待',

  'scheduling.tab': '调度标签',
  'other.information': '其它信息',
  'configuration.name': '配置名称',
  'gmt_modified': '修改时间',
  'server.instance.name': '机器实例名称：{data}',
  'server.configuration.name': '机器配置名称：{data}',
  'cluster.name': '集群名称',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})