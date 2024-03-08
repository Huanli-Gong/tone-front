import { locales_zh as feedbackLocales } from '@/pages/SystemConf/Question/Feadback'
import { locales_zh as KnowledgeLocales } from "@/pages/SystemConf/Question/Knowledge"

export default {
  ...feedbackLocales,
  ...KnowledgeLocales,
  // 系统级菜单项
  'menu.systemConf': '系统配置',
  'menu.systemConf.joinApprove': '申请审批',
  'menu.systemConf.userManagement': '用户管理',
  'menu.systemConf.workspaceManagement': 'Workspace管理',
  'menu.systemConf.suiteManagement': 'Test Suite管理',
  "menu.systemConf.KernelManage": '内核管理',
  "menu.systemConf.BasicSetting": '基础配置',
  "menu.systemConf.TestParmSetting": 'Master配置',
  "menu.systemConf.DirectRoute": 'DirectRoute',
  "menu.systemConf.question": '答疑助手',
};
