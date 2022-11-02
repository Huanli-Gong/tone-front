const baseKey = 'pages.anolis_home'

const locales = {
    'expand': '收起',
    'open': '展开',

    "notice": "公告",
    "notice.empty.text": "暂无公告",
    "help_doc": "帮助文档",
    "help_doc.empty.text": "暂无帮助",

    "column.ws_name": "Workspace名称",
    "column.ws_owner": "所有者",
    "column.ws_desc": "简介",

    "project_features": "T-One特色",

    "quality_collaboration": "可定制质量协作能力",
    "quality_collaboration.child.1": "多企业、多团队之间的质量协作",
    "quality_collaboration.child.2": "独立部署、分布式业务模型",
    "quality_collaboration.child.3": "基于定制工作台的数据隔离、共享能力",

    "data_analysis": "多维度数据分析能力",
    "data_analysis.child.1": "灵活的聚合型基线、指标跟踪模型",
    "data_analysis.child.2": "时序分析、对比分析等数据分析能力",
    "data_analysis.child.3": "自动缺陷定位诊断能力",

    "process_support": "全周期质量流程支撑能力",
    "process_support.child.1": "OpenAPI接口服务，与外部组件无缝连接",
    "process_support.child.2": "快速搭建CI/CD流程",
    "process_support.child.3": "自定义测试计划，自定义测试报告生成",

    "button.start_test": "进入Workspace",
    "button.apply_join": "申请加入",
    "button.tourist_test": "游客试用",
}

export default Object.keys(locales).reduce((p, key) => {
    p[`${baseKey}.${key}`] = locales[key]
    return p
}, {})
