import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Button, Form, Input, message, Select, Radio, Empty, Popover, Spin } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useRequest } from 'umi'
import { test_type_enum, runList } from '@/utils/utils'
import { validateSuite, member,  addSuite2, editSuite  } from '../../../../../service'
import styles from './index.less'

const viewType = [{ id: 'Type1',name:'所有指标拆分展示(Type1)'}, { id: 'Type2',name:'多Conf同指标合并(Type2)' },{ id: 'Type3',name:'单Conf多指标合并(Type3)' }]

export default forwardRef((props: any, ref: any) => {
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
      message.success('操作成功')
      initialState()
      props.callback({ type: 'suite'})
    } else {
      message.error(msg || '操作失败')
    }
  }
  const handleOk = () => {
    setPadding(true)
    form.validateFields().then(async (values) => {
      const { business_id, id } = editData;
      if (id) {
        const { code, msg } = await editSuite(id, { ...values, domain_list_str: values.domain_list_str.join() })
        defaultOption(code, msg, 'edit')
      } else {
        const { code, msg } = await addSuite2({ business_id, ...values, domain_list_str: values.domain_list_str.join() })
        defaultOption(code, msg, 'add')
      }
      setPadding(false)
    }).catch((err) => {
      setPadding(false)
      // console.log(err)
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
      setNameStatus({status: false, message: data.msg ||'服务器异常，请重试'})
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
              <Button onClick={handleClose}>取消</Button>
              <Button type="primary" disabled={padding || !nameStatus.status} onClick={handleOk}>{editData && editData.name ? '更新' : '确定'}</Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" // 表单布局
        form={form}
      >
        <Form.Item label="测试类型"
          name="test_type"
          rules={[
            {required: true, message: '请选择'},
          ]}>
          <Select placeholder="请选择" onChange={handleTestTypeChange}
            getPopupContainer={node => node.parentNode} 
          >
            {test_type_enum.map((item: any) =>
              <Select.Option key={item.value} value={item.value}>{item.name}</Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item label="名称"
          name="name"
          validateStatus={(!nameStatus.status) ? 'error' : undefined}
          help={(!nameStatus.status && nameStatus.message)}
          rules={[
            { required: true },
          ]}
        >
          <Input autoComplete="off" placeholder="请输入Test Suite名称"
            onBlur={ handleBlur }
            onChange={(e) => {
              if (!e.target.value) {
                setNameStatus({status: false, message: `Test Suite名称不能为空`})
              } else {
                setNameStatus({status: true, message:'' })
                const value = e.target.value
                if (!(value.match(/^[A-Za-z0-9\._-]+$/g) && value.length <= 32)) {
                  setNameStatus({status: false, message: `仅允许包含字母、数字、下划线、中划线、点，最长32个字符` })
                }
              }
            }} />
        </Form.Item>

        <Form.Item label="领域"
          name="domain_list_str"
          rules={[{
              required: true,
              message: '请选择',
          }]}>
          <Select placeholder="请选择领域" mode="multiple" getPopupContainer={node => node.parentNode}>
            {props?.domainList?.map((item: any) => 
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item label="运行模式"
          name="run_mode"
          rules={[
            {required: true, message: '请选择'},
          ]}
        >
          <Select placeholder="请选择运行模式">
            {runList.map((item: any) => 
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            )}
          </Select>
        </Form.Item>
        

        {/************************/}
        {(testType === 'performance') &&
          <Form.Item label="视图类型"
            name="view_type"
            rules={[ {required: true, message: '请选择'}]}
          >
            <Select placeholder="请选择视图类型">
              {viewType.map((item: any, index: number) =>
                <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
              )}
            </Select>
          </Form.Item>
        }

        {(testType === 'functional' || testType === 'performance') && (
          <>
            <Form.Item label="Owner"
              name="emp_id"
              rules={[{ required: true, message: '请选择' }]}
            >
                <Select allowClear
                  notFoundContent={
                    fetchLoading ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }
                  filterOption={false}
                  onSearch={ handleSearch }
                  style={{ width: '100%' }}
                  showArrow={false}
                  showSearch
                  getPopupContainer={ node => node.parentNode }
                >
                  {user?.map((item:any, index:number) =>
                    <Select.Option value={item.emp_id} key={index}>
                      {item.last_name}({item.first_name === "" ?item.last_name : item.first_name}) - {item.emp_id}
                    </Select.Option>
                  )}
                </Select>
            </Form.Item>

            <Form.Item label="默认用例"
              initialValue={1}
              name="is_default"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label={<span>是否认证&nbsp;
                <Popover
                  overlayClassName={styles.cer_tips}
                  content={<div><p>只有认证过得用例才能同步到Testfarm</p></div>} 
                  placement="bottomLeft" 
                  destroyTooltipOnHide={true}>
                    <QuestionCircleOutlined />
                </Popover></span>
              }
              initialValue={0}
              name="certificated"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}
         
        {/************************/}
        <Form.Item label="说明"
          name="doc"
          rules={[
            {required: false },
          ]}
        >
          <Input.TextArea rows={3} placeholder="请输入说明信息" />
        </Form.Item>
        <Form.Item label="备注"
          name="description"
          rules={[
            {required: false },
            {max: 500, message: '限制最长500个字符'},
          ]}
        >
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Drawer>
  )
})
