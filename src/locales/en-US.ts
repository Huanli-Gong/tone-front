import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',

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
