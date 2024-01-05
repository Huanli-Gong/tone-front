const defaultKey = 'ws.test.job'

const text = {
  'JobTypePreview': 'Job Type Preview',
  'TemplatePreview': 'Template Preview',
  'TemplateEdit': 'Template Edit',

  'SaveCreateSubmit': 'Save and Create',
  'SaveTemplateModify': 'Save',
  'copy.link': 'Copy Link',
  'ModifySetting': 'Modify',

  'search.placeholder.template': 'Search',
  // message.error
  'please.delete.template': 'Template error, please delete it',
  'no.template': 'No templates',
  'use.template.create': 'Create by Template',
  'switch.form.mode': 'Switch Form Mode',
  'switch.yaml.mode': 'Switch Yaml Mode',

  'create.job': 'Create Job',
  'import.config': 'Import Configuration',
  'test.template': 'Test Template',
  // ...
  'templateForm': 'Template Info',
  'template.name': 'Template name',
  'template.message': 'The value can contain a maximum of 64 characters, including letters, digits, underscores (_), hyphens (-), and dots (.)',
  'description': 'Description',
  'description.placeholder': 'Please enter template description',
  'enable': 'Enable',
  // ...

  'basicForm': 'Basic Configuration',
  'envForm': 'Environmental Preparation Configuration',
  'suiteTable': 'Case And Server Configuration',
  'moreForm': 'More Configuration',
  'yaml.test': 'Verify',
  'copy': 'Copy',
  'download': 'Download',
  //
  'reset.confirm.info': 'All configurations will be cleared after the reset.Are you sure to reset?',
  'reset': 'Reset',
  'save.as.template': 'Save As Template',
  'no.permission, please.refer': 'No permission.Please refer to',
  'help.docs': 'help docs',
  'submit.test': 'Submit The Test',
  // save Template Drawer
  'template.drawer.title': 'Save As Template',
  'template_name': 'Template Name',
  'template_name.rules1': 'The value can contain a maximum of 64 characters, including letters, digits, underscores (_), hyphens (-), and dots (.)',
  'template_name.rules2': 'The template name cannot be empty.',

  // message info
  'machine.cannot.be.empty': 'The monitor server cannot be empty',
  'suite.cannot.be.empty': 'The cases cannot be empty',
  'operation.success': 'Operation is successful!',
  'save.success': 'Save successful!',

  'variable.name': 'variable name',
  'variable.name.empty': 'name cannot be empty',
  'variable.name.repeat': 'name cannot be repeat',
  'variable.value': 'value',
  'variable.value.value': 'valuecannot be empty',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})


