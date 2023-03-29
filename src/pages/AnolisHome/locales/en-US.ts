const baseKey = 'pages.anolis_home'

const locales = {
    'expand': 'Collapse ',
    'open': 'Expand ',

    "notice": "Announcements",
    "notice.empty.text": "No announcement",
    "help_doc": "Help",
    "help_doc.empty.text": "No Document",

    "column.ws_name": "Workspace Name",
    "column.ws_owner": "Owner",
    "column.ws_desc": "Introduction",

    "project_features": "T-One Features",

    "quality_collaboration": "Customizable Quality Collaboration Capabilities",
    "quality_collaboration.child.1": "Quality collaboration between multiple enterprises and teams",
    "quality_collaboration.child.2": "Independently deployed, distributed business model",
    "quality_collaboration.child.3": "Data isolation and sharing capabilities based on customized workbenches",

    "data_analysis": "Multi-dimensional Data Analysis Capabilities",
    "data_analysis.child.1": "Flexible aggregated baseline, metric tracking model",
    "data_analysis.child.2": "Data analysis capabilities such as time series analysis and comparative analysis",
    "data_analysis.child.3": "Automatic defect location and diagnosis capabilities",

    "process_support": "Full-cycle Quality Process Support Capability",
    "process_support.child.1": "OpenAPI interface service, seamless connection with external components",
    "process_support.child.2": "Quickly set up CI/CD processes",
    "process_support.child.3": "Custom test plans, custom test report generation",

    "button.join": "Join",
    "button.enter": "Enter",
    "button.apply_join": "Apply to Join",

    "no_pub_tooltip_title": "Private Workspace is not accessible to non members",
}

export default Object.keys(locales).reduce((p, key) => {
    p[`${baseKey}.${key}`] = locales[key]
    return p
}, {})
