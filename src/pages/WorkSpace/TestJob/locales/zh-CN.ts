const defaultKey = 'ws.test.job';

const text = {
    JobTypePreview: 'Job类型预览',
    TemplatePreview: '模板预览',
    TemplateEdit: '模板编辑',

    SaveCreateSubmit: '保存并新建job',
    SaveTemplateModify: '保存修改',
    'copy.link': '复制链接',
    ModifySetting: '修改配置',

    'search.placeholder.template': '搜索模板',
    // message.error
    'please.delete.template': '问题模板，请及时删除',
    'no.template': '暂无模板',
    'use.template.create': '用模板新建',
    'switch.form.mode': '切换表单模式',
    'switch.yaml.mode': '切换yaml模式',

    'create.job': '新建Job',
    'import.config': '导入配置',
    'test.template': '测试模板',
    // ...
    templateForm: '模板信息',
    'template.name': '模板名称',
    'template.message': '仅允许包含字母、数字、下划线、中划线、点，最长64个字符',
    description: '描述',
    'description.placeholder': '请输入模板描述',
    enable: '启用',
    // ...

    basicForm: '基础配置',
    envForm: '环境准备',
    suiteTable: '用例和机器配置',
    moreForm: '更多配置',
    'yaml.test': '验证',
    copy: '复制',
    download: '下载',
    //
    'reset.confirm.info': '重置后将清空所有配置，确认重置吗？',
    reset: '重 置',
    'save.as.template': '存为模板',
    'no.permission, please.refer': '无权限，请参考',
    'help.docs': '帮助文档',
    'submit.test': '提交测试',
    // save Template Drawer
    'template.drawer.title': '存为模板',
    template_name: '模板名称',
    'template_name.rules1': '仅允许包含字母、数字、下划线、中划线、点，最长64个字符',
    'template_name.rules2': '模板名称不能为空',

    // message info
    'machine.cannot.be.empty': '监控机器不能为空',
    'suite.cannot.be.empty': '用例不能为空',
    'operation.success': '操作成功！',
    'save.success': '保存成功',

    'variable.name': '变量名',
    'variable.name.empty': '变量名不能为空',
    'variable.name.repeat': '变量名不能重复',
    'variable.value': '值',
    'variable.value.empty': '值不能为空',
};

export default Object.keys(text).reduce((p, key) => {
    /* @ts-ignore */
    p[`${defaultKey}.${key}`] = text[key];
    return p;
}, {});
