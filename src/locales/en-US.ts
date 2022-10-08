import component from './en-US/component/index';
import common from './en-US/common';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
  'navbar.lang' : '中',
  //
  'delete.tips': 'Delete the prompt',
  'delete.prompt': 'Are you sure you want to delete it?',
  'Table.columns.result': 'Result',
  'Table.columns.date': 'Date',
  'common.startTime': 'Start Time',
  'common.endTime': 'End Time',
  'common.createTime': 'Create Time', // 有疑惑: Creation Time
  'common.finishTime': 'End Time',

  'Table.columns.operation': 'Operation',
  'operation.new': 'New',
  'operation.add': 'Add',
  'operation.create': 'Create',
  'operation.edit': 'Edit',
  'operation.delete': 'Delete',
  'operation.view': 'View',
  'operation.yes': 'Yes',
  'operation.no': 'No',
  'operation.search': 'Search',
  'operation.reset': 'Reset',
  'operation.confirm': 'Confirm',
  'operation.cancel': 'Cancel',
  'operation.ok': 'Confirm',
  'operation.update': 'Update',
  'operation.rerun': 'Rerun',
  'operation.run': 'Run',
  'operation.copy': 'Copy',
  'operation.clear': 'Clear',
  'operation.detail': 'Detail',
  'operation.download': 'Download',
  'operation.save': 'Save',
  'operation.preview': 'Preview',
  'operation.share':'Share',
  'operation.log':'Log',
  'operation.log.off': 'Log out',
  'operation.success': 'Operation is success',
  'operation.failed': 'Operation is failed',  
  'operation.previous': 'Previous',
  'operation.next': 'Next',
  'operation.expand': 'Expand',
  'operation.collapse': 'Collapse',
  'operation.release': 'Release',  
	'operation.open': 'Open',  
  'operation.close': 'Close',
  'operation.confirm.delete': 'Determine to delete',
  'operation.select.all': 'Select all',  
	'operation.filter': 'Filter',
  'operation.pass': 'Pass',  
  'operation.refuse': 'Refuse', 

  'pagination.total.strip': 'Total {data}',
  'all': 'All',
  'selected': 'Selected',
  'selected.item': 'Selected {data}',
  'passed': 'Passed',
  'rejected': 'Rejected',
	'nothing': 'Nothing',

  'please.select': 'Please select',
  'please.enter': 'Please enter',
	'please.enter.message': 'The value can contain a maximum of 32 characters, including letters, digits, underscores (_), hyphens (-), and dots (.)',
  'format.key.value': 'Format: key = value, multiple separated by spaces or newlines',
  'no.data': 'No Data',
  'DEF_COMMON_FORMATE': ' ',

  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...common,
};
