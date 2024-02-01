const defaultKey = 'select.suite'

const text = {
  'select.case': 'Select Case',
  'selected': 'Selected Test Suite',
  'removed': 'Has been removed, please reconfigure the machine before executing!',
  'existent': 'Machine does not exist, please reconfigure the machine!',
  'please.select.case': 'Select Case',

  // 业务测试(选择用例)
  'drawer.title': 'Case List',
  'drawer.checkbox': 'Select All',
  'search.placeholder': 'Enter',
  'domain': 'Domain：',
  'all.btn': 'All',
  'random': 'Random',
  // 'expand': 'Collapse ',
  // 'open': 'Expand ',
  'business.name': 'Business Name',
  'no.case': 'No case',
  'add.case': 'Add case',

  'standalone': 'Standalone',
  'cluster': 'Cluster',
  'advanced.config': 'Advanced Configuration',
  'selectAll.suites': 'Select all Suite',
  'selectAll.conf': 'Select all Conf',
  'select.suite/conf': 'Select Suite/Conf',
  'batch.config': 'Batch Configuration',
  'restart': 'Restart',
  'script': 'Script',
  'before.restart': '[Pre Execution script]',
  'after.restart': '[Post Execution script]',
  'monitor': 'Monitor',
  'priority': 'Priority',
  'config': 'Config',
  'variable': 'Variable',
  'timeout': "Timeout 0-864000（ (s)",
  'table.timeout': "Timeout (s)",

  // Suite Select Drawer
  'vertical.message': 'If multiple values are displayed, enter a new value to cover all values. If no value is entered, the original value is retained',
  'variable.name': 'Variable Name：',
  'variable.desc': 'Variable Desc：',
  'value': 'Value',
  'need_reboot': 'Restart Before Execution',
  'setup_info': 'Script Before Execution',
  'setup_info.placeholder': 'Multiple scripts have been configured, careful operation',
  'please.enter': 'Enter',
  'cleanup_info': 'Script After Execution',
  'cleanup_info.placeholder': 'Multiple scripts have been configured, careful operation',
  'monitor.console': 'Monitoring Configuration',
  'monitor.item': 'Select Monitoring Items',
  'monitor.data': 'Data Monitoring',
  'monitor.the.server': 'Select Monitoring Server',
  'the.server.one': '机器一',
  'add.group.monitor': '+ Add a set of monitors',
  'priority.desc': 'The execution priority ranges from 1 to 20. A larger value indicates a higher priority',
  'multiple.values': 'Several numerical',

  'the.server': 'Server',
  'the.server.desc': 'Apply to all Conf under the selected Suite ',
  'the.server.pool': 'Server Pool',
  'self.owned.server': 'Self-sustaining Machines',
  'instance': 'Specify Server Instances',
  'setting': 'Specify Server Configuration',
  'server_object_id': 'Specify',
  'server_tag_id': 'Tag',
  'randomly.schedule': 'Scheduling machines randomly from the server pool',
  // Server Message
  'instance.message': 'Select Server Instance',
  'setting.message': 'Select Server Configuration',
  'server_object_id.message': 'Select Server',
  'server_tag_id.message': 'Select the scheduling tag',
  'custom_channel': 'Select Server Type',
  'agent.select': 'Select Server Type(agent)',
  'custom_ip': 'Enter IP/SN',
  'enter.ip': 'Enter IP',
  'deploy.toneagent': 'Deploy ToneAgent',
  'repeat.tootip1': 'Applies to all Conf files under the Suite selected, range 1-10000',
  'repeat.tootip2': 'Range 1-10000',

  "table.is_delete.alart": "The selected example does not exist or there are no failed cases in the rerun job.",
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})