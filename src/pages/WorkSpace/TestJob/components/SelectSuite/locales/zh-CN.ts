const defaultKey = 'select.suite'

const text = {
  'select.case': '选择用例',
  'selected': '已选Test Suite',
  'removed': '已被移除，请重新配置机器后执行!',
  'existent': '机器不存在，请重新配置机器!',
  'please.select.case': '请先选择用例',

  // 业务测试(选择用例)
  'drawer.title': '用例列表',
  'drawer.checkbox': '全选',
  'search.placeholder': '请输入',
  'domain': '领域：',
  'all.btn': '全部',
  'random': '随机',
  // 'expand': '收起',
  // 'open': '展开',
  'business.name': '业务名称',
  'no.case': '暂无用例',
  'add.case': '添加用例',

  'standalone': '单机测试',
  'cluster': '集群测试',
  'advanced.config': '高级配置',
  'selectAll.suites': '全选Suite',
  'selectAll.conf': '全选Conf',
  'select.suite/conf': '请选择Suite/Conf',
  'batch.config': '批量配置',
  'restart': '重启',
  'script': '脚本',
  'before.restart': '[执行前脚本]',
  'after.restart': '[执行后脚本]',
  'monitor': '监控',
  'priority': '执行优先级',
  'config': '配置',
  'variable': '变量',
  'timeout': "最大运行时长（秒）",

  // Suite Select Drawer
  'vertical.message': '显示多个数值，输入新值覆盖所有，不输入则保留原值',
  'variable.name': '变量名：',
  'variable.desc': '变量说明：',
  'value': '值',
  'need_reboot': '执行前重启',
  'setup_info': '执行前脚本',
  'setup_info.placeholder': '已配置多种脚本，请谨慎操作',
  'please.enter': '请输入',
  'cleanup_info': '执行后脚本',
  'cleanup_info.placeholder': '已配置多种脚本，请谨慎操作',
  'monitor.console': '监控配置',
  'monitor.item': '请选择监控项',
  'monitor.data': '数据监控',
  'monitor.the.server': '请选择监控机器',
  'the.server.one': '机器一',
  'add.group.monitor': '+ 添加一组监控',
  'priority.desc': '执行优先级范围1-20,数值越大优先级越高',
  'multiple.values': '多个数值',

  'the.server': '机器',
  'the.server.desc': '对选中Suite下所有Conf生效',
  'the.server.pool': '机器池',
  'self.owned.server': '自持有机器',
  'instance': '指定机器实例',
  'setting': '指定机器配置',
  'server_object_id': '指定',
  'server_tag_id': '标签',
  'randomly.schedule': '随机从机器池调度机器',
  // Server Message
  'instance.message': '请选择机器实例',
  'setting.message': '请选择机器配置',
  'server_object_id.message': '请选择机器',
  'server_tag_id.message': '请选择调度标签',
  'custom_channel': '请选择机器类型',
  'agent.select': '请选择机器类型(agent)',
  'custom_ip': '请输入IP/SN',
  'enter.ip': '请输入IP',
  'deploy.toneagent': '部署ToneAgent',
  'repeat.tootip1': '对选中Suite下所有Conf生效，范围1-10000',
  'repeat.tootip2': '范围1-10000',

  "table.is_delete.alart": "所选用例不存在或重跑job中无失败用例",
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})