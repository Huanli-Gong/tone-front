const defaultKey = 'pages.home'

const text =  {
 'title': 'Welcome to T-One: an open-source platform of quality collaboration!',
  'subTitle': 'T-One(Testing in One) provides one-stop automatic test integration, management, execution, analysis and quality collaboration capabilities across teams and enterprises.',
  'more.introduction': 'More Introduction',
  'recommend.Workspace': 'Recommended Workspace',
  
  'tab.all': 'All Workspaces',
  'tab.history': 'Recently visited',
  'tab.joined': 'Joined',
  'tab.created': 'Created',
  'input.placeholder': 'Please input search keywords',
  'create.workspace': 'New Workspace',
  'public': 'Public',
  'private': 'Private',
  'enter': 'Enter',
   
  'announcement': 'Announcements',
  'view.all': 'More',
  'empty.notice': 'No announcement',
  'using.help': 'Help',
  'no.help': 'No Document',
  'mustRead': 'Must-read',
  'course': 'Tutorial',
  'docs': 'Document',
  'maintain': 'Service Maintaining', 
  'notice': 'Notice', 
  'upgrade': 'Service Upgrading', 
  'stop': 'Service Suspending',

  'popover.title': 'Apply to join',
  'join.popover.reason': 'Reason',
  'join.popover.optional': '(Optional)',
  'popover.btn.cancel': 'Cancel',
  'popover.btn.submit': 'Submit',
  'popover.btn.join': 'Join',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})