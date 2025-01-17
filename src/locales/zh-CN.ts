import component from './zh-CN/component/index';
import common from './zh-CN/common';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
  'navbar.lang': 'En',
  //
  'delete.tips': '删除提示',
  'delete.prompt': '确定要删除吗？',
  'Table.columns.result': '结果',
  'Table.columns.date': '日期',
  'common.startTime': '开始时间',
  'common.endTime': '结束时间',
  'common.createTime': '创建时间',
  'common.finishTime': '完成时间',

  'Table.columns.operation': '操作',
  'operation.new': '新增',
  'operation.add': '添加',
  'operation.create': '创建',
  'operation.edit': '编辑',
  'operation.modify': '修改',
  'operation.delete': '删除',
  'operation.view': '查看',
  'operation.yes': '是',
  'operation.no': '否',
  'operation.search': '搜索',
  'operation.reset': '重置',
  'operation.confirm': '确认',
  'operation.cancel': '取消',
  'operation.ok': '确定',
  'operation.update': '更新',
  'operation.rerun': '重跑',
  'operation.run': '运行',
  'operation.copy': '复制',
  'operation.clear': '清空',
  'operation.detail': '详情',
  'operation.download': '下载',
  'operation.save': '保存',
  'operation.preview': '预览',
  'operation.share': '分享',
  'operation.log': '日志',
  'operation.sync.name': '同步名称',
  'operation.log.off': '注销',
  'operation.success': '操作成功',
  'operation.failed': '操作失败',
  'operation.previous': '上一步',
  'operation.next': '下一步',
  'operation.expand': '展开',
  'operation.collapse': '收起',
  'operation.release': '释放',
  'operation.not.release': '不释放',
  'operation.open': '开启',
  'operation.close': '关闭',
  'operation.confirm.delete': '确定删除',
  'operation.confirm.copy': '确定复制',
  'operation.select.all': '全选',
  'operation.filter': '过滤',
  'operation.pass': '通过',
  'operation.refuse': '拒绝',
  'operation.hidden': '隐藏',
  'operation.confirm.delete.content': '确定删除{data}吗？',

  'pagination.total.strip': '共 {data} 条',
  'all': '全部',
  'selected': '已选择',
  'selected.item': '已选择{data}项',
  'passed': '已通过',
  'rejected': '已拒绝',
  'nothing': '无',

  'please.select': '请选择',
  'please.enter': '请输入',
  'please.enter.message': '仅允许包含字母、数字、下划线、中划线、点，最长32个字符',
  'please.enter.message64': '仅允许包含字母、数字、下划线、中划线、点，最长64个字符',
  'format.key.value': '格式：key=value，多个用空格或换行分割',
  'no.data': '暂无数据',
  'DEF_COMMON_FORMATE': ' ',
  "page.500.desc": "系统异常，请联系管理员",
  "page.401.desc": "您没有访问权限。",
  'page.500.button': "返回首页",

  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...common,
};
