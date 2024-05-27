const defaultKey = 'ws.result.list'

const text: any = {
  // select Options
  'job_id': 'Job ID',
  'name': 'Job名称',
  'fail_case': '失败Case',
  'creators': '创建人',
  'tags': 'Job标签',
  'state': '状态',
  'server': '测试机',
  'test_suite': 'Test Suite',
  'job_type_id': 'Job类型',
  'project_id': '所属项目',
  'product_version': '产品版本',
  'test_conf': 'Test Conf',
  'tag_list': '标签',

  'id': "ID",
  'test_type': '测试类型',
  'project_name': '所属项目',
  'test_result': '总计/成功/失败',
  'creator_name': '创建人',
  'end_time': '完成时间',

  'columns.state.reset': "重置",
  'columns.state.title': "列展示",

  'please.placeholder.job_id': '请输入Job ID',
  'please.placeholder.name': '请输入Job名称',
  'please.placeholder.fail_case': '请输入多个失败Case,多个以英文逗号分隔',
  'please.placeholder.creators': '请选择创建人',
  'please.placeholder.tags': '请选择标签',
  'please.placeholder.state': '请选择状态',
  'please.placeholder.server': '请选择测试机',
  'please.placeholder.test_suite': '请选择Test Suite',
  'please.placeholder.job_type_id': '请选择Job类型',
  'please.placeholder.test_type': '请选择测试类型',
  'please.placeholder.project_id': '请选择所属项目',
  'please.placeholder.product_version': '请输入产品版本',
  'please.placeholder.test_conf': '请输入Test Conf',
  'start_time': '开始时间',
  'completion_time': '完成时间',
  // tab
  'all.job': '全部Job',
  'my.job': '我创建的Job',
  'collection': '我的收藏',
  'offline': '离',
  'test_type.Tootip': '总计/成功/失败',
  'test_type.desc1': '功能测试：测试结果中Test Conf结果状态统计。',
  'test_type.desc2': '性能测试：执行结果中Test Conf执行状态统计。',
  'selection.function': '选择作用',
  'report.and.analysis': '报告和分析',
  'batch.delete': '批量删除',
  'collapse.filter': '收起过滤',
  'expand.filter': '展开过滤',
  'select.condition': '选择条件',
  'select.time': '选择时间',


  // compare bar
  'compare.bar': '对比栏',
  'combining.rule': '合并规则：取所有Job的并集数据；',
  'top.ranked': '如果有重复的，排序靠前的Job优先。',
  'create.report': '生成报告',
  'compare.analysis': '对比分析',
  'batch.add.tag.jobs': '批量编辑标签',
  'only.add.system.tag': '（目前只支持系统标签）',
  'report.name': '报告名称',
  'report.name.placeholder': '支持搜索报告名称',
  'gmt_created': '保存时间',
  'view.report': '查看报告',
  'please.add.comparison.group': '请添加对比组数据',

  'reRun.Modal.title': '导入配置',
  'reRun.checked.suite': '同时导入所有测试用例',
  'reRun.checked.fail_case': '仅导入Test Case测试结果为失败的用例',
  'reRun.checked.notice': '同时导入通知配置',
  'reRun.checked.inheriting_machine': '使用原Job使用的机器',
};

export default Object.keys(text).reduce((p: any, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})