import React, { forwardRef, useState, useEffect } from 'react'
import { Modal, Space, Spin, Alert, Form, Button, message, Input, Tooltip, Select, Typography } from 'antd'
import { FormattedMessage, useIntl, Access, useAccess } from 'umi';
import { isNaN } from 'lodash'
import { queryProductList, queryProjectList } from '@/pages/WorkSpace/Product/services';
import { queryBaselineList, } from '@/pages/WorkSpace/Baseline/services';
import { queryJobTypeList, } from '@/pages/WorkSpace/JobTypeManage/services';
import { switchTestType, switchServerType } from '@/utils/utils';
import { createProject } from '../../services';
import BizUpload from './component/BizUpload';
import styles from './style.less';
const { Option } = Select;

const DrawerForm = forwardRef((props:any, ref:any) => {
  const { ws_id, visible } : any = props
  const access = useAccess();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // 产品数据源
  const [fetching, setFetching] = useState(false);
  // const [productKeyword, setProductKeyword] = useState('');
  const [productPagination, setProductPagination] =  useState({ data: [], total: 0, page_num: 1, page_size: 20 });
  const [productId, setProductId] = useState('');
  // 项目数据源
  const [projectList, setProjectList] = useState([]);
  // 为获取基线数据源
  const [serverType, setServerType] = useState('');
  const [testType, setTestType] = useState('');
  const [hasBaseline, setHasBaseline] = useState(''); // 是否有基线选项。
  const [baselinePagination, setBaselinePagination] =  useState({ data: [], total: 0, page_num: 1, page_size: 20 });
  // Job类型数据源
  const [jobTypeList, setJobTypeList] = useState([]);
  const [jobId, setJobId] = useState('');
  // disabled 提交按钮
  const [submitDisable, setSubmitDisable] = useState(true);


  // 1.请求数据
  const fetchProductList = async(query: any, option="concat") => {
    const tempValue = { ws_id, ...query };
    try {
      setFetching(true)
      const res = await queryProductList(tempValue);
      if (res.code === 200) {
        // 分页数据合并。
        if (option === 'concat') {
          const { data } = productPagination
          res.data = data.concat(res.data || [])
          setProductPagination(res);
        } else if (option === 'reset') {
          // 新的数据。
          setProductPagination(res);
        }

      } else {
        message.error(res.msg || '请求数据失败');
      }
      setFetching(false);
    } catch(e) {
      setFetching(false);
    }
  }
  // 2.请求数据
  const fetchProjectList = async(query: any) => {
    const tempValue = { ws_id, ...query };
    try {
      const res = await queryProjectList(tempValue);
      if (res.code === 200) {
        setProjectList(res.data || []);
      } else {
        message.error(res.msg || '请求数据失败');
      }
    } catch(e) {
      console.log(e)
    }
  }
  // 3.请求数据
  const fetchBaselineList = async(query: any, option="concat") => {
    try {
      const res = await queryBaselineList({ ws_id, server_provider: serverType, test_type: testType, ...query });
      if (res.code === 200) {
        if (option === 'concat') {
          // 分页数据合并。
          const { data } = baselinePagination
          res.data = data.concat(res.data)
          setBaselinePagination(res);
        } else if (option === 'reset') {
          // 新的数据。
          setBaselinePagination(res);
        }
      } else {
        message.error(res.msg || '请求数据失败');
      }
    } catch(e) {
      console.log(e)
    }
  }
  // 4.请求数据
  const fetchJobTypeList = async(query: any) => {
    try {
      const res = await queryJobTypeList({ ws_id, ...query });
      if (res.code === 200) {
        const temp = res.data || [];
        setJobTypeList(temp.filter((key: any)=> key.enable));
      } else {
        message.error(res.msg || '请求数据失败');
      }
    } catch(e) {
      console.log(e)
    }
  }

  useEffect(()=> {
    if (visible) {
      const { page_num, page_size } = productPagination
      fetchProductList({ page_num, page_size }, 'reset');
      fetchJobTypeList({})
    }
  }, [visible])

  // 校验必选项，控制按钮状态。
  const validateFields = () => {
    try {
      const aa = form.getFieldsValue()
      // console.log('validateFields:', aa)
      let flag = false
      Object.keys(aa)?.forEach((item=> {
        if (!aa[item] && item !== 'baseline_id' && item !== 'ip') {
          flag = true
        }
      }))
      setSubmitDisable(flag)
    } catch (err) {
      setSubmitDisable(true)
    }
  }

  useEffect(()=> {
    window.addEventListener("click", validateFields);
    return ()=> {
      window.removeEventListener('click', validateFields)
    }
  }, [])

  // 初始化状态
  const initialState = () => {
    setProductPagination({ data: [], total: 0, page_num: 1, page_size: 20 });
    setProductId('');
    setProjectList([]);
    setServerType('');
    setTestType('');
    setHasBaseline('');
    setBaselinePagination({ data: [], total: 0, page_num: 1, page_size: 20 });
    setJobTypeList([]);
    setJobId('')
  }

  // 取消
  const handleClose = () => {
    initialState();
    form.resetFields();
    props.callback({ title: ''});
  }

  // 确认
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      // 触发上传接口
      const query = { server_type: serverType, test_type: testType, ...values };
      const { code, msg } = await createProject(query);
      if (code === 200) {
        message.success('创建成功');
        // step1.初始化状态、关闭对话框
        initialState();
        form.resetFields();
        props.callback({ title: 'ok'});
      } else {
        message.error(msg || '创建失败');
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }

  // 选产品
  const productOnChange = (value: any) => {
    // case1.重置控件
    setProductId(value);
    form.setFieldsValue({ project_id: undefined });
    // case2.根据选择的产品，请求项目。
    fetchProjectList({ product_id: value })
  }
  // 删除产品
  const handleClear =() => {
    setProductId('');
    form.setFieldsValue({ project_id: undefined });
    //
    validateFields()
  }  
  const handlePopupScroll = ({ target }: any) => {
    const { page_num, page_size, total, } = productPagination
    const { clientHeight, scrollHeight, scrollTop} = target 
    if ( clientHeight + scrollTop + 1 >= scrollHeight  && !isNaN(page_num) && Math.ceil(total/page_size) > page_num ) {
      fetchProductList({ page_num: page_num + 1, page_size }, 'concat')
    }
  }

  // 选job
  const jobOnChange = (value: any) => {
    // case1.重置控件
    setJobId(value)
    form.setFieldsValue({ baseline_id: undefined });
    // case2.根据选择的job，请求基线数据。
    const filterList = jobTypeList.filter((item:any)=> item.id === value)
    if (filterList.length) {
      const { server_type, test_type, has_baseline } = filterList[0];
      setServerType(server_type)
      setTestType(test_type)
      setHasBaseline(has_baseline)
      fetchBaselineList({ server_provider: server_type, test_type, page_num: 1, page_size: 20 }, 'reset');
    }
  }
  const jobOnClear =() => {
    // case1.重置控件
    setJobId('')
    form.setFieldsValue({ baseline_id: undefined });
    //
    validateFields()
  }

  // 基线
  const baselinePopupScroll = ({ target }: any) => {
    const { page_num, page_size, total, } = baselinePagination
    const { clientHeight, scrollHeight, scrollTop} = target 
    if ( clientHeight + scrollTop + 1 >= scrollHeight  && !isNaN(page_num) && Math.ceil(total/page_size) > page_num ) {
      fetchBaselineList({ page_num: page_num + 1, page_size }, 'concat')
    }
  }

  // 做数据收集同步。
  // const onChangedValues = (changedValues, allValues) => {
  //   console.log(changedValues, allValues);
  // }

  const { formatMessage } = useIntl();
  const placeholder = formatMessage({ id: "upload.list.Drawer.select.placeholder" });
  const requiredMessage = formatMessage({ id: 'upload.list.Drawer.select.message'});
  const AuthPop = (
    <Space>
        <Typography.Text>无权限，请参考</Typography.Text>
        <a href="/help_doc/2" target="_blank">帮助文档</a>
    </Space>
)
  return (
    <Modal
      title={<FormattedMessage id="upload.list.Drawer.title" />}
      width={460}
      visible={visible}
      maskClosable={!loading}
      onCancel={!loading ? handleClose : ()=>{}}
      className={styles.drawerWarper}
      footer={
        <div style={{ textAlign: 'right', }}>
          <Space>
            <Button onClick={handleClose} disabled={loading}>
              <FormattedMessage id="Drawer.btn.close" />
            </Button>
            <Access  
              accessible={access.wsRoleContrl()} 
              fallback={
                <Tooltip placement="topLeft" title={AuthPop} color="#fff">
                  <Button type="primary"><FormattedMessage id="Drawer.btn.confirm" /></Button>
                </Tooltip>
              }
            >
              <Button onClick={handleOk} type="primary" disabled={submitDisable || loading}>
                <FormattedMessage id="Drawer.btn.confirm" />
              </Button>
            </Access>
          </Space>
        </div>
      }>
        <div className={styles.contentWarper} ref={ref}>
            <Alert message="文件上传状态，可在列表中查看。" type="info" showIcon style={{marginBottom:20,padding: '4px 15px'}} />
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
                    placeholder="请选择产品名称"
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    getPopupContainer={node => node.parentNode}
                    onChange={productOnChange}
                    onPopupScroll={handlePopupScroll}
                    onClear={handleClear}
                    autoFocus={true}
                    showSearch
                    filterOption={(input, option: any) => {
                      return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }}
                  >
                    {productPagination.data.map((item: any) => (
                      <Option key={item.id} value={item.id}>{item.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                {/** project相关 */}
                <Form.Item label={<FormattedMessage id="upload.list.Drawer.project" />}
                  name="project_id" 
                  rules={[{
                    required: true,
                    message: requiredMessage,
                  }]}>
                  <Select placeholder={'请选择项目'} getPopupContainer={node => node.parentNode}
                    disabled={!productId || !projectList.length}>
                    {projectList.map((item: any) => (
                      <Option key={item.id} value={item.id}>{item.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                {/** ----------end 选项目------------------------ */}

                {/** ----------start 2.选基线------------------------ */}
                <Form.Item label="Job类型" name="job_type_id" rules={[{
                  required: true,
                  message: requiredMessage,
                }]}>
                  <Select allowClear
                    placeholder={'请选择Job类型'}
                    getPopupContainer={node => node.parentNode}
                    onChange={jobOnChange}
                    onClear={jobOnClear}
                    showSearch
                    filterOption={(input, option: any) => {
                      return option.children?.props?.children[0]?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }}
                  >
                    {jobTypeList.map((item: any) => (
                      <Option key={item.id} value={item.id} style={{display: 'flex',justifyContent: 'space-between'}}>
                        <div style={{display: 'flex',justifyContent: 'space-between'}}>
                          <span>{item.name}</span><span>{switchTestType(item.test_type)} | {switchServerType(item.server_type)}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
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
                        placeholder={'请选择基线'}
                        onPopupScroll={baselinePopupScroll}
                        getPopupContainer={node => node.parentNode}
                        disabled={!jobId || !baselinePagination.data?.length}
                        showSearch
                        filterOption={(input, option: any) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {baselinePagination.data?.map((item: any) => (
                          <Option key={item.id} value={item.id}>{item.name}</Option>
                        ))}
                    </Select>
                  </Form.Item>
                  : null}
                {/** ----------end 选基线------------------------ */}
                <Form.Item label='测试机IP'
                  name="ip"
                  rules={[{
                    required: false,
                    // max: 32,
                    // pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
                    // message: '请输入正确格式的IP'
                  }]}
                >
                  <Input placeholder='请输入测试机IP'/>
                </Form.Item>


                <Form.Item label="结果数据" name="file" rules={[{
                  required: true,
                  message: formatMessage({id: 'upload.list.Drawer.upload.message'}),
                }]}
                  extra={formatMessage({id: 'upload.list.Drawer.upload.supportText'}) + ': .tar、.tar.gz'}
                >
                  <BizUpload callback={validateFields} />
                </Form.Item>
                <Form.Item style={{ display: 'none' }}
                  name="ws_id"
                  initialValue={ws_id}
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input type="hidden" />
                </Form.Item>

              </Form>
            </Spin>
        </div>
    </Modal>
  )
});

export default DrawerForm;
