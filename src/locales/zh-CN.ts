import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
  'navbar.lang' : 'En',
  //
  //
  'Drawer.btn.close': '取消',
  'Drawer.btn.ok': '确定',
  'Drawer.btn.confirm': '确认',
  'Drawer.btn.update': '更新',

  'Table.columns.result': '结果',
  'Table.columns.date': '日期',
  'Table.columns.startTime': '开始时间',
  'Table.columns.endTime': '结束时间',
  'Table.columns.operation': '操作',
  'operation.edit': '编辑',
  'operation.delete': '删除',
  'operation.view': '查看',

  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
};
