const defaultKey = 'right.content'

const text =  {
  'all.read': 'All read',
  'task.notification': 'Job Notification',
  'system.notification': 'System Notification',
  'view.all': 'More',
  'login': 'Login',
  'register': 'Register',

  'center': 'Personal Center',
  'settings': 'Personal Settings',
  'logout': 'Log Out',
  'home.page': 'Home Page',

  // 枚举
  'wait.create': 'Create',
  'wait.delete': 'Cancel',
  'wait.join': 'Join',
  'passed.create': 'Create Application',
  'passed.delete': 'Cancel Application',
  'passed.join': 'Apply',
  'refused.create': 'Create Application',
  'refused.delete': 'Cancel Application',

  // utils
  'join.through.you': 'Pass your application',
  'pass': 'Pass',
  'refuse.you.to.join': 'Reject your application',
  'refuse': 'Refuse', 
  'add.you.as': 'Add you as',
  'set.you.to': 'Set you as',
  'add.you.as.t-one': 'add you as T-One',
  'remove.you': 'remove you as',
  'put': 'put',
  'transfer.to.you': 'Owner transfer to you',

  'job.complete': '[Job] Test completed',
  'plan.complete': '[Plan] Test completed',
  'machine.broken': '[Fault] Test machine faulted',
  'broken.span1': 'Task failed in test preparation phase,the machine may have failed',
  'broken.span2': 'failed',
  'broken.span3': ',Please handle it in time！Affected Job:',
  'broken.span4': 'Affected suites are:',
  'system.announcement': '[Announcement] System Announcements',
  'nothing': 'No',
  'no.notice': 'No Notice',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})