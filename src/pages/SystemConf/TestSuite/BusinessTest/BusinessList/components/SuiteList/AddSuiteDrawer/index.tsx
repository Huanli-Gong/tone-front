import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Button, Form, Input, message, Select, Radio, Empty, Popover, Spin } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { test_type_enum, runList } from '@/utils/utils'
import { validateSuite, member,  addSuite2, editSuite  } from '../../../../../service'
import Owner from '@/components/Owner/index';
import styles from './index.less'

export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl()
  const [form] = Form.useForm()
  const [padding, setPadding] = useState(false) // 确定按钮是否置灰
  const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
  const [title, setTitle] = useState('')
  const [editData, setEditer] = useState<any>({}) // 编辑的数据
  // 校验名称是否为空|是否超长|是否已存在
  const [nameStatus, setNameStatus] = useState({status: true, message: ''}) 
  // 测试类型选项状态
  const [testType, setTestType] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false);
  const [user, setUser] = useState([]);

  const viewType = [
    { id: 'Type1', name: formatMessage({ id: 'TestSuite.view_type.type1' }) }, 
    { id: 'Type2', name: formatMessage({ id: 'TestSuite.view_type.type2' }) },
    { id: 'Type3', name: formatMessage({ id: 'TestSuite.view_type.type3' }) },
  ]

  // 1.请求用户信息
  const getUserList = async (keyword = '') => {
    setFetchLoading(true)
    try {
      const { code, data =[] }: any = await member({ keyword,  scope: 'aligroup' }) || {};
      if (code === 200) {
        setUser(data)
      }
      setFetchLoading(false)
    } catch (e) {
      setFetchLoading(false)
    }
  }

  useImperativeHandle(
      ref,
      () => ({
          show: (title: string, data: any = {}) => {
              setVisible(true)
              setTitle(title)
              setEditer(data)
              const reset = resetEditData(data)
              setTestType(data.test_type)
              form.setFieldsValue(reset)
              //
              getUserList()
          }
      })
  )

  // 领域字段的数据重组
  const resetEditData =(values: any= {})=> {
    return {
      ...values,
      domain_list_str: values.domain_id_list?.split(',').map((item: any)=> Number(item)) || [],
    }
  }

  // 初始化状态
  const initialState = () => {
    form.resetFields()
    setPadding(false)
    setVisible(false)
    setTitle('')
    setEditer({})
    setNameStatus({ status: true, message: ''})
  }
  
  const defaultOption = (code: number, msg: string, type: string) => {
    if (code === 200) {
      message.success(formatMessage({id: 'operation.success'}) )
      initialState()
      props.callback({ type: 'suite'})
    } else {
      message.error(msg || formatMessage({id: 'operation.failed'}) )
    }
  }
  const handleOk = () => {
    setPadding(true)
    form.validateFields().then(async (values) => {
      const { business_id, id } = editData;
      const domain_list_str = values.domain_list_str.join()
      if (id) {
        const { code, msg } = await editSuite(id, { ...values, domain_list_str })
        defaultOption(code, msg, 'edit')
      } else {
        const { code, msg } = await addSuite2({ business_id, ...values, domain_list_str })
        defaultOption(code, msg, 'add')
      }
      setPadding(false)
    }).catch((err) => {
      setPadding(false)
      // 单独校验业务名称
      err?.errorFields?.forEach((item: any)=> {
        if (item.name[0] === 'name') {
          setNameStatus({ status: false, message: item.errors[0] })
        }
      })
    })
  }
  const handleClose = () => {
    initialState()
  }

  // 1.请求校验名称是否已存在
  const fetchValidateSuite = async (name: any, testType: any) => {
    // 区分新增和编辑
    const query = editData.id ? { suite_id: editData.id } : {}
    const data = await validateSuite({ suite_name: name , test_type: testType, ...query}) || {}
    if (data.code === 200) {
      setNameStatus({status: true, message: ''})
    } else {
      setNameStatus({status: false, message: data.msg })
    }
  }
  // 失焦
  const handleBlur = (e: any) => {
    const name = e.target.value.replace(/\s+/g, "")
    if (!name || !testType || !nameStatus.status ) {
      return
    }
    fetchValidateSuite(name, testType)
  }
  // 搜索用户
  const handleSearch = async (word?: any) => {
    if( word ) getUserList( word )
  }
  // 测试类型切换
  const handleTestTypeChange = (value: any) => {
    setTestType(value)
    // if (value === 'business') {
    //   // 如果选项是接入测试，则运行模式只能是“集群”
    //   form.setFieldsValue({ run_mode: 'cluster'})
    // }
    const name = form.getFieldValue('name')
    if (name && nameStatus.status) {
      fetchValidateSuite(name, value)
    }
  }

  return (
    <Drawer className={styles.addConf_drawer}
      title={title}
      maskClosable
      keyboard={ false }
      width="375"
      onClose={handleClose}
      visible={visible}
      footer={
        <div style={{ textAlign: 'right', }} >
          <Space>
              <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
              <Button type="primary" disabled={padding || !nameStatus.status} onClick={handleOk}>{editData && editData.name ? <FormattedMessage id="operation.update"/> : <FormattedMessage id="operation.ok"/>}</Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" // 表单布局
        form={form}
      >
        <Form.Item label={<FormattedMessage id="TestSuite.test_type"/>}
          name="test_type"
          rules={[
            {required: true, message: formatMessage({id: 'please.select'}) },
          ]}>
          <Select placeholder={formatMessage({id: 'please.select'})} onChange={handleTestTypeChange}
            getPopupContainer={node => node.parentNode} 
          >
            {test_type_enum.map((item: any) =>
              <Select.Option key={item.value} value={item.value}>{formatMessage({id: item.value})}</Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item label={<FormattedMessage id="TestSuite.name"/>}
          name="name"
          validateStatus={(!nameStatus.status) ? 'error' : undefined}
          help={(!nameStatus.status && nameStatus.message)}
          rules={[
            { required: true },
          ]}
        >
          <Input autoComplete="off" placeholder={formatMessage({id: 'TestSuite.name.placeholder'})}
            onBlur={ handleBlur }
            onChange={(e) => {
              if (!e.target.value) {
                setNameStatus({status: false, message: formatMessage({id: 'TestSuite.name.cannot.be.empty'}) })
              } else {
                setNameStatus({status: true, message:'' })
                const value = e.target.value
                if (!(value.match(/^[A-Za-z0-9\._-]+$/g) && value.length <= 32)) {
                  setNameStatus({status: false, message: formatMessage({id: 'please.enter.message'}) })
                }
              }
            }} />
        </Form.Item>

        <Form.Item label={<FormattedMessage id="TestSuite.domain"/>}
          name="domain_list_str"
          rules={[{
              required: true,
              message: formatMessage({id: 'please.select'}),
          }]}>
          <Select placeholder={formatMessage({id: 'please.select'})}
            mode="multiple" getPopupContainer={node => node.parentNode}>
            {props?.domainList?.map((item: any) => 
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item label={<FormattedMessage id="TestSuite.run_mode"/>}
          name="run_mode"
          rules={[
            {required: true, message: formatMessage({id: 'please.select'}) },
          ]}
        >
          <Select placeholder={formatMessage({id: 'please.select'})}>
            {runList.map((item: any) => 
              <Select.Option key={item.id} value={item.id}>{formatMessage({id: item.id}) || '-'}</Select.Option>
            )}
          </Select>
        </Form.Item>
        

        {/************************/}
        {(testType === 'performance') &&
          <Form.Item label={<FormattedMessage id="TestSuite.view_type"/>}
            name="view_type"
            rules={[ {required: true, message: formatMessage({id: 'please.select'}) }]}
          >
            <Select placeholder={formatMessage({id: 'please.select'})}>
              {viewType.map((item: any, index: number) =>
                <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
              )}
            </Select>
          </Form.Item>
        }

        {(testType === 'functional' || testType === 'performance') && (
          <>
            <Owner />
            <Form.Item label={<FormattedMessage id="TestSuite.default.case"/>}
              initialValue={1}
              name="is_default"
              rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
            >
              <Radio.Group>
                <Radio value={1}><FormattedMessage id="operation.yes"/> </Radio>
                <Radio value={0}><FormattedMessage id="operation.no"/></Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label={<span><FormattedMessage id="TestSuite.is_certified"/>&nbsp;
                <Popover
                  overlayClassName={styles.cer_tips}
                  content={<div><p><FormattedMessage id="TestSuite.is_certified.ps"/></p></div>} 
                  placement="bottomLeft" 
                  destroyTooltipOnHide={true}>
                    <QuestionCircleOutlined />
                </Popover></span>
              }
              initialValue={0}
              name="certificated"
              rules={[{ required: true, message: formatMessage({id: 'please.select'}) }]}
            >
              <Radio.Group>
                <Radio value={1}><FormattedMessage id="operation.yes"/> </Radio>
                <Radio value={0}><FormattedMessage id="operation.no"/></Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}
         
        {/************************/}
        <Form.Item label={<FormattedMessage id="TestSuite.desc"/>}
          name="doc"
          rules={[
            {required: false },
          ]}
        >
          <Input.TextArea rows={3} placeholder={formatMessage({id: 'TestSuite.desc.placeholder.s'})} />
        </Form.Item>
        <Form.Item label={<FormattedMessage id="TestSuite.remarks"/>}
          name="description"
          rules={[
            {required: false },
            {max: 500, message: formatMessage({id: 'TestSuite.remarks.message'}) },
          ]}
        >
          <Input.TextArea rows={3} placeholder={formatMessage({id: 'TestSuite.please.enter.remarks'})} />
        </Form.Item>
      </Form>
    </Drawer>
  )
})
