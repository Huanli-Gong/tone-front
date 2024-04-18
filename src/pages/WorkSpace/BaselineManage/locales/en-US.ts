import { enUS_locales as importModalEn } from "../components/ImportModal"
import { baseline_detail_enUs } from "../components/RightContent"

export default {
  ...importModalEn,
  ...baseline_detail_enUs,
  // baseline manage
  'baseline.functional': 'Functional Baseline',
  'baseline.performance': 'Performance Baseline',
  'baseline.create.btn': 'Create Baseline',
  'baseline.all.baseline': 'All Baseline',
  'baseline.search.baseline.name': 'Support to search baseline name',
  'baseline.search': 'Search',
  'baseline.delete.prompt1': 'Deleting the baseline may cause the job to not work properly.',
  'baseline.delete.prompt2': 'Please delete it carefully',
  'baseline.baseline_name': 'Baseline Name',
  'baseline.product_version': 'Product Version',
  'baseline.test.env': 'Test Environment',
  'baseline.baseline_desc': 'Baceline Description',
  'baseline.edit.info': 'Edit',
  'baseline.delete.prompt3': 'This operation will delete the current baseline.Please delete it carefully.',

  'baseline.modal.copy.title': 'Baseline Copy',
  'baseline.modal.baseline_name.empty': 'Baseline name cannot be empty.',

  // AddScript
  'baseline.addScript.add': 'Create Baseline Information',
  'baseline.addScript.edit': 'Edit Baseline Information',
  'pages.workspace.baseline.addScript.text.manageType': 'ServerProvider',
  'pages.workspace.baseline.addScript.text.baselineType': 'Baseline Type',
  'pages.workspace.baseline.addScript.label.name': 'Baseline Name',
  'pages.workspace.baseline.addScript.error.name_null': 'Baseline name cannot be empty.',
  'pages.workspace.baseline.addScript.error.name_exists': 'Baseline name already exists.',
  'pages.workspace.baseline.addScript.label.name.placeholder': 'Please enter the baseline name.',
  'pages.workspace.baseline.addScript.label.validator': 'The baseline name must not exceed 100 characters.',
  'pages.workspace.baseline.addScript.label.description': 'Baseline Description（Optional）',
  'pages.workspace.baseline.addScript.label.description.placeholder': 'Please enter baseline description information',
  'baseline.addScript.env': ' ',

  // BaselineDetail
  'pages.workspace.baseline.detail.table.test_suite_name': 'Search to search Test Suite name',

  // BaselineFailDetail
  'pages.workspace.baseline.failDetail.table.sub_case_name': 'FailCase',
  'pages.workspace.baseline.failDetail.table.bug': 'Defect Record',
  'pages.workspace.baseline.failDetail.table.source_job_id': 'Job Source',
  'pages.workspace.baseline.failDetail.table.impact_result': 'Impact Result',
  'pages.workspace.baseline.failDetail.table.description': 'Problem Description',
  'pages.workspace.baseline.failDetail.table.action': 'Operation',

  // BaselineMetricDetail
  'pages.workspace.baseline.metricDetail.table.metric': 'Metric',
  'pages.workspace.baseline.metricDetail.table.baseline_data': 'Baseline Value',
  'pages.workspace.baseline.metricDetail.table.action': 'Operation',
  'pages.workspace.baseline.mertricDetail.data': 'Baseline Dataa',

  // CommentModal
  'pages.workspace.baseline.comment.modal.title': 'Edit FailCase Information',

  // ExpandPerfsTable
  'pages.workspace.baseline.expandPerf.sn': 'SN',
  'pages.workspace.baseline.expandPerf.ip': 'IP',
  'pages.workspace.baseline.expandPerf.sm_name': 'Model',
  'pages.workspace.baseline.expandPerf.run_mode': 'RunMode',
  'pages.workspace.baseline.expandPerf.source_job_id': 'Job Source',
  'pages.workspace.baseline.expandPerf.instance_type': 'Instance Type',
  'pages.workspace.baseline.expandPerf.image': 'Image',
  'pages.workspace.baseline.expandPerf.bandwidth': 'Bandwidth',
  'pages.workspace.baseline.expandPerf.ether': 'Network',

  // ExpandTable
  'pages.workspace.baseline.failDetail': 'FailCase Detail',
  'pages.workspace.baseline.mertricDetail': 'Metric Detail',

  'pages.workspace.baseline.metric.table.view': 'View Info',
  'pages.workspace.baseline.metric.table.expand': 'Collapse Info',
  'pages.Workspace.baseline.metric.expand.title': "Environment Info"
}