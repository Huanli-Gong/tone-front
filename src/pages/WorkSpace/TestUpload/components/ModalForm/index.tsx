/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, useState, useEffect } from 'react'
import { Modal, Space, Spin, Alert, Form, Button, message, Input, Select, Row } from 'antd'
import { useParams, FormattedMessage, useIntl } from 'umi';
import { queryJobTypeList, } from '@/pages/WorkSpace/JobTypeManage/services';
import { switchTestType, switchServerType } from '@/utils/utils';
import { createProject } from '../../services';
import BizUpload from './component/BizUpload';
import styles from './style.less';

const DrawerForm = forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl();
  const { ws_id } = useParams() as any
  const { visible, baselines, projects, products }: any = props
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // 产品数据源
  const [serverType, setServerType] = useState('');
  const [testType, setTestType] = useState('');
  const [hasBaseline, setHasBaseline] = useState(''); // 是否有基线选项。
  // Job类型数据源
  const [jobTypeList, setJobTypeList] = useState([]);
  const [jobId, setJobId] = useState('');
  // disabled 提交按钮
  const [submitDisable, setSubmitDisable] = useState(true);

  const $project_id = Form.useWatch("project_id", form)
  const $product_id = Form.useWatch("product_id", form)

  const projectList = React.useMemo(() => {
    if (!projects.length) return []
    if (Object.prototype.toString.call($product_id) !== '[object Number]') return []
    return projects.filter(({ product_id }: any) => product_id === $product_id)
  }, [projects, $product_id])

  React.useEffect(() => {
    if ($project_id) {
      for (let len = projects.length, i = 0; i < len; i++) {
        const { id, product_version } = projects[i]
        if (id === $project_id) {
          form.setFieldValue("product_version", product_version)
        }
      }
    }
  }, [$project_id, projects])

  // 4.请求数据
  const fetchJobTypeList = async (query: any) => {
    try {
      const res = await queryJobTypeList({ ws_id, ...query });
      if (res.code === 200) {
        const temp = res.data || [];
        setJobTypeList(temp.filter((key: any) => key.enable));
      } else {
        message.error(res.msg || formatMessage({ id: 'request.failed' }));
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchJobTypeList({})
    }
  }, [visible])

  // 校验必选项，控制按钮状态。
  const validateFields = () => {
    try {
      const aa = form.getFieldsValue()
      // console.log('validateFields:', aa)
      let flag = false
      Object.keys(aa)?.forEach((item => {
        if (!aa[item] && item !== 'baseline_id' && item !== 'ip') {
          flag = true
        }
      }))
      setSubmitDisable(flag)
    } catch (err) {
      setSubmitDisable(true)
    }
  }

  useEffect(() => {
    window.addEventListener("click", validateFields);
    return () => {
      window.removeEventListener('click', validateFields)
    }
  }, [])

  // 初始化状态
  const initialState = () => {
    setServerType('');
    setTestType('');
    setHasBaseline('');
    setJobTypeList([]);
    setJobId('')
  }

  // 取消
  const handleClose = () => {
    initialState();
    form.resetFields();
    props.callback({ title: '' });
  }

  // 确认
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      // 触发上传接口
      const { product_version } = values
      if (!product_version.trim()) {
        form.setFields([{
          name: "product_version",
          value: null,
          errors: [formatMessage({ id: "upload.list.Drawer.product_version.message" })]
        }])
        return
      }
      setLoading(true);
      const query = { ws_id, server_type: serverType, test_type: testType, ...values, product_version: product_version.trim(), };
      const { code, msg } = await createProject(query);
      setLoading(false);
      if (code === 200) {
        message.success(formatMessage({ id: 'request.create.success' }));
        // step1.初始化状态、关闭对话框
        initialState();
        form.resetFields();
        props.callback({ title: 'ok' });
      } else {
        message.error(msg || formatMessage({ id: 'request.create.failed' }));
      }
    }).catch(() => {
      setLoading(false);
    });
  }

  // 选产品
  const productOnChange = () => {
    // case1.重置控件
    form.setFieldsValue({ project_id: undefined });
    // case2.根据选择的产品，请求项目。
    // fetchProjectList({ product_id: value })
  }
  // 删除产品
  const handleClear = () => {
    form.setFieldsValue({ project_id: undefined });
    validateFields()
  }


  // 选job
  const jobOnChange = (value: any) => {
    // case1.重置控件
    setJobId(value)
    form.setFieldsValue({ baseline_id: undefined });
    // case2.根据选择的job，请求基线数据。
    const filterList = jobTypeList.filter((item: any) => item.id === value)
    if (filterList.length) {
      const { server_type, test_type, has_baseline } = filterList[0];
      setServerType(server_type)
      setTestType(test_type)
      setHasBaseline(has_baseline)
      // fetchBaselineList({ test_type, page_num: 1, page_size: 20 }, 'reset');
    }
  }
  const jobOnClear = () => {
    // case1.重置控件
    setJobId('')
    form.setFieldsValue({ baseline_id: undefined });
    //
    validateFields()
  }

  const requiredMessage = formatMessage({ id: 'please.select' });

  return (
    <Modal
      title={<FormattedMessage id="upload.list.Drawer.title" />}
      width={460}
      open={visible}
      maskClosable={!loading}
      onCancel={!loading ? handleClose : () => { }}
      className={styles.drawerWarper}
      footer={
        <div style={{ textAlign: 'right', }}>
          <Space>
            <Button onClick={handleClose} disabled={loading}>
              <FormattedMessage id="operation.cancel" />
            </Button>
            <Button onClick={handleOk} type="primary" disabled={submitDisable || loading}>
              <FormattedMessage id="operation.confirm" />
            </Button>
          </Space>
        </div>
      }
    >
      <div className={styles.contentWarper} ref={ref}>
        <Alert message={<FormattedMessage id="upload.list.Drawer.upload.Alert" />} type="info" showIcon style={{ marginBottom: 20, padding: '4px 15px' }} />
        <Spin spinning={loading}>
          <Form form={form}
            layout="vertical"
          >
            {/** ----------start 1.选项目------------------------ */}
            <Form.Item label={<FormattedMessage id="upload.list.Drawer.product" />}
              name="product_id"
              rules={[{
                required: true,
                message: requiredMessage,
              }]}>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder={<FormattedMessage id="upload.list.Drawer.product.placeholder" />}
                // notFoundContent={fetching ? <Spin size="small" /> : null}
                getPopupContainer={node => node.parentNode}
                onChange={productOnChange}
                // onPopupScroll={handlePopupScroll}
                onClear={handleClear}
                autoFocus={true}
                showSearch
                filterOption={(input, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }}
                options={
                  products?.map((item: any) => ({
                    value: item.id,
                    label: item.name
                  }))
                }
              />
            </Form.Item>

            {/** project相关 */}
            <Form.Item
              label={<FormattedMessage id="upload.list.Drawer.project" />}
              name="project_id"
              rules={[{
                required: true,
                message: requiredMessage,
              }]}>
              <Select
                placeholder={<FormattedMessage id="upload.list.Drawer.project.placeholder" />}
                getPopupContainer={node => node.parentNode}
                disabled={!$product_id || !projectList?.length}
                showSearch
                filterOption={(input, option: any) => {
                  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }}
                options={
                  projectList?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  }))
                }
              />
            </Form.Item>
            {/** ----------end 选项目------------------------ */}

            <Form.Item
              label={formatMessage({ id: "upload.list.Drawer.product_version" })}
              name="product_version"
              rules={[{
                required: true,
                message: formatMessage({ id: "upload.list.Drawer.product_version.message" })
              }]}
            >
              <Input
                placeholder={formatMessage({ id: "upload.list.Drawer.product_version.placeholder" })}
                disabled={!$project_id}
                allowClear
              />
            </Form.Item>
            {/** ----------start 2.选基线------------------------ */}
            <Form.Item label={<FormattedMessage id="upload.list.Drawer.job_type" />}
              name="job_type_id"
              rules={[{
                required: true,
                message: requiredMessage,
              }]}>
              <Select allowClear
                placeholder={<FormattedMessage id="upload.list.Drawer.job_type.placeholder" />}
                getPopupContainer={node => node.parentNode}
                onChange={jobOnChange}
                onClear={jobOnClear}
                showSearch
                filterOption={(input, option: any) => {
                  return option.search?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }}
                options={
                  jobTypeList?.map((item: any) => ({
                    value: item.id,
                    search: item.name,
                    label: (
                      <Row justify={"space-between"}>
                        <span>{item.name}</span>
                        <span>{switchTestType(item.test_type, formatMessage)} | {switchServerType(item.server_type, formatMessage)}</span>
                      </Row>
                    )
                  }))
                }
              />
            </Form.Item>

            {hasBaseline ?
              <Form.Item label={<FormattedMessage id="upload.list.Drawer.baseline" />}
                name="baseline_id"
                rules={[{
                  required: false,
                  message: requiredMessage,
                }]}>
                <Select
                  allowClear={true}
                  placeholder={<FormattedMessage id="upload.list.Drawer.baseline.placeholder" />}
                  // onPopupScroll={baselinePopupScroll}
                  getPopupContainer={node => node.parentNode}
                  disabled={!jobId || !baselines?.length}
                  showSearch
                  filterOption={(input, option: any) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={
                    baselines?.map((item: any) => ({
                      label: item.name,
                      value: item.id
                    }))
                  }
                />
              </Form.Item>
              : null}
            {/** ----------end 选基线------------------------ */}
            <Form.Item label={<FormattedMessage id="upload.list.Drawer.ip" />}
              name="ip"
              rules={[{
                required: false,
              }]}
            >
              <Input placeholder={formatMessage({ id: 'upload.list.Drawer.ip.placeholder' })} />
            </Form.Item>


            <Form.Item label={<FormattedMessage id="upload.list.Drawer.result" />}
              name="file"
              rules={[{
                required: true,
                message: formatMessage({ id: 'upload.list.Drawer.upload.message' }),
              }]}
              extra={formatMessage({ id: 'upload.list.Drawer.upload.supportText' }) + ': .tar、.tar.gz'}
            >
              <BizUpload callback={validateFields} />
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </Modal >
  )
});

export default DrawerForm;
