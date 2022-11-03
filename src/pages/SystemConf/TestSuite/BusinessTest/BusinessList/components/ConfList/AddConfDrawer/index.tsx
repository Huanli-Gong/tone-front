import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Button, Form, Input, InputNumber, message, Select, Row, Col } from 'antd'
import { MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { addConf, editConf, deleteBusinessConfEditAll } from '../../../../../service'
import { useIntl, FormattedMessage } from 'umi'
import styles from './index.less'
import { filter } from 'lodash';

export default forwardRef((props: any, ref: any) => {
  const { formatMessage } = useIntl()
  const [form] = Form.useForm()
  const [padding, setPadding] = useState(false) // 确定按钮是否置灰
  const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
  const [title, setTitle] = useState('')
  const [editData, setEditData] = useState<any>({}) // 编辑的数据
  const [nameStatus, setNameStatus] = useState({ status: true, message: ''}) // 校验名称是否为空 | 是否超长
  //
  const [handleBulk, setHandleBulk ] = useState<boolean>(true) // 默认展示Bulk
  const [variableDataList, setVariableDataList] = useState<any>([]) // 变量组集合
  const [ciType, setCiType] = useState<any>(null)

  useImperativeHandle(
      ref,
      () => ({
          show: (title: string, data: any = {}) => {
              // console.log('data:', data)
              setVisible(true)
              setTitle(title)
              setEditData(data)
              if (data.id) {
                const varList = JSON.parse(data.var)?.map((item: any, i:number)=> ({ id: i+1, ...item}) )
                if (Array.isArray(varList) && varList.length) {
                  // "变量"字段有数据且不为空数组
                  setVariableDataList( varList )
                } else {
                  // "变量"字段无数据
                  addVariable()
                }
                setCiType(data.ci_type)
                // 数据回填表单控件上
                const resetData = resetEditData(data);
                form.setFieldsValue(resetData)
              } else {
                addVariable()
                // form.setFieldsValue(data)
              }
          }
      })
  )

  // 初始化状态
  const initialState = () => {
    form.resetFields()
    setPadding(false)
    setVisible(false)
    setTitle('')
    setEditData({})
    setNameStatus({ status: true, message: ''})
    setVariableDataList([])
    setCiType(null)
  }
  
  const handleClose = () => {
    initialState()
  }

  const defaultOption = (code: number, msg: string, type: string) => {
    if (code === 200) {
      initialState()
      message.success(formatMessage({id: 'operation.success'}) )
      props.callback({ type });
    } else {
      message.error(msg || formatMessage({id: 'operation.failed'}) )
    }
  }

  // 批量修改
  const handleEditAll = () => {
    form.validateFields().then(async (values) => {
      setPadding(true)
      const { confIds } = props;
      if (confIds?.length) {
        const params = {
          case_id_list: confIds.join(),
          ...values,
          domain_list_str: values.domain_list_str.join(),
        }
        const { code, msg } = await deleteBusinessConfEditAll({...params }) || {}
        defaultOption(code, msg, 'editAll')
      }
    }).catch(err => {
      setPadding(false)
    })
  }

  const handleOk = () => {
    // 触发表单验证
    form.validateFields().then(async (values) => {
      setPadding(true)
      const { test_suite_id } = props;
      
      const tempValues = {}
      const val = getBulkListData2()
      // 使用正则过滤掉values中的[name，val，des]废数据。
      Object.keys(values).forEach((key) => {
        if (!key.match(/^name[0-9]+$/) && !key.match(/^val[0-9]+$/) && !key.match(/^des[0-9]+$/)) {
          tempValues[key] = values[key]
        }
      })
      const params = {
        test_suite_id,
        ...tempValues,
        domain_list_str: values.domain_list_str.join(),
        var: JSON.stringify(val)
      }

      const { id } = editData;
      if (id) {
        const { code, msg } = await editConf({ id, ...params })
        defaultOption(code, msg, 'edit')
      } else {
        const { code, msg } = await addConf({ ...params })
        defaultOption(code, msg, 'add')
      }
      setPadding(false)
    }).catch(err => {
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

  // Bulk切换
  const handleChangeValueStyle = () => {
    setHandleBulk(!handleBulk)
    // 处理数据
    const content = getBulkListData()
    // console.log('restData:', content)
    form.setFieldsValue({ var: JSON.stringify(content, null, 4) })
  }

  // 收集动态表数据，然后数据组装
  const getBulkListData =()=> {
    const values = form.getFieldsValue(true)
    return variableDataList.map((item: any)=> (
      { name: values[`name${item.id}`] || '',
        val: values[`val${item.id}`] || '',
        des: values[`des${item.id}`] || '',
      }
    ))
  }
  // 收集动态表数据，有变量名的变量组
  const getBulkListData2 =()=> {
    const values = form.getFieldsValue(true)
    return variableDataList?.filter((item: any)=> values[`name${item.id}`]).map((item: any)=> (
      { name: values[`name${item.id}`],
        val: values[`val${item.id}`] || '',
        des: values[`des${item.id}`] || '',
      }
    ))
  }

  // 领域、变量表单字段的数据重组
  const resetEditData =(values: any= {})=> {
    const varObj = {}; // 变量表单字段
    JSON.parse(values.var)?.forEach((item: any, i:number)=> {
      varObj[`name${i+1}`]=  item.name;
      varObj[`val${i+1}`]= item.val;
      varObj[`des${i+1}`]= item.des;
    })
    return {
      ...values,
      domain_list_str: values.domain_id_list?.split(',').map((item: any)=> Number(item)) || [],
      ...varObj,
    }
  }

  const validFunction = (rule: any, value: any, callback: any) => {
    try {
        let valid = JSON.parse(value)
        if (Object.prototype.toString.call(valid) === '[object Array]') {
            let len = valid.length
            for (let i = 0; i < len; i++) {
                if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                    callback(formatMessage({id: 'TestSuite.data.format.error'}) );
                    return
                }
            }
        } else {
            callback(formatMessage({id: 'TestSuite.data.format.error'}) );
            return
        }
    } catch (e) {
        callback(formatMessage({id: 'TestSuite.data.format.error'}) );
        return
    }
    callback()
  }

  // 1.动态增
  const addVariable = () => {
    const number = variableDataList.length
    let id = (number && variableDataList[number - 1].id) || 0;
    const item = {
      id: ++id,
      name: '',
      val: '',
      des: '',
    }
    const tempList = variableDataList.concat([item])
    setVariableDataList(tempList)
    
  }
  // 2.动态减
  const removeVariable = (rowId: any) => {
    if (variableDataList.length > 1) {
      const tempList = variableDataList.filter((item: any)=> item.id !== rowId )
      setVariableDataList(tempList)
      form.setFieldsValue({
        [`name${rowId}`]: undefined,
        [`val${rowId}`]: undefined,
        [`des${rowId}`]: undefined })
    }
  }

  // CI类型切换
  const handleCIChange = (value: any) => {
    setCiType(value)
  }
  // CI类型ReactNode 
  const ciTypeElement = (
    <div>
      <Form.Item label={<FormattedMessage id="TestSuite.ci_type"/>}
        name="ci_type"
        rules={[
          {required: true, message: formatMessage({id: 'TestSuite.ci_type.message'}),}
        ]}
        extra={ciType === 'kernel_install' ? <div className={styles.CI_Config_Extra}><FormattedMessage id="only.installs.the.kernel"/></div> : undefined}
        >
        <Select placeholder={formatMessage({id: 'TestSuite.ci_type.message'})} onChange={handleCIChange}>
          {[{value: 'aone'}, {value: 'jenkins'}, {value: 'kernel_install'}, {value: 'script'}].map((item: any) => 
            <Select.Option key={item.value} value={item.value}>{item.value}</Select.Option>
          )}
        </Select>
      </Form.Item>
      <div className={styles.ciTypeElement}>
        {ciType === 'aone' && (
            <>
            <Form.Item label="-Host"
              name="host" rules={[ {required: true, message: formatMessage({id: 'TestSuite.host.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.host.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-Pipeline id"
              name="pipeline_id" rules={[ {required: true, message: formatMessage({id: 'TestSuite.pipeline_id.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.pipeline_id.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-ClientKey"
              name="user" rules={[ {required: true, message: formatMessage({id: 'TestSuite.ClientKey.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.ClientKey.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-AccessSecret"
              name="token" rules={[ {required: true, message: formatMessage({id: 'TestSuite.AccessSecret.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.AccessSecret.message'})} autoComplete="off" />
            </Form.Item>
            </>
          )
        }
        {ciType === 'jenkins' && (
            <>
            <Form.Item label="-Host"
              name="host" rules={[ {required: true, message: formatMessage({id: 'TestSuite.host.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.host.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-Project Name"
              name="project_name" rules={[ {required: true, message: formatMessage({id: 'TestSuite.project_name.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.project_name.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-User"
              name="user" rules={[ {required: true, message: formatMessage({id: 'TestSuite.User.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.User.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-ApiToken"
              name="token" rules={[ {required: true, message: formatMessage({id: 'TestSuite.ApiToken.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.ApiToken.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-BuildParams"
              name="params" rules={[ {required: true, message: formatMessage({id: 'TestSuite.BuildParams.message'}) }]}>
              <Input.TextArea rows={3} placeholder={formatMessage({id: 'TestSuite.BuildParams.message'})} />
            </Form.Item>
            </>
          )
        }
        {ciType === 'script' && (
            <>
            <Form.Item label="-Host"
              name="host" rules={[ {required: true, message: formatMessage({id: 'TestSuite.host.message'}) }]}>
              <Input placeholder={formatMessage({id: 'TestSuite.host.message'})} autoComplete="off" />
            </Form.Item>
            <Form.Item label="-BuildParams(script)"
              name="params" rules={[ {required: true, message: formatMessage({id: 'TestSuite.BuildParams(script).message'}) }]}>
              <Input.TextArea rows={3} placeholder={formatMessage({id: 'TestSuite.BuildParams(script).message'})} />
            </Form.Item>
            </>
          )
        }
      </div>
      <div style={{ height: 10, backgroundColor: '#f5f5f5', margin: '0 -24px 20px' }}></div>
    </div>
  )

  return (
    <Drawer className={styles.addConf_drawer}
      title={<FormattedMessage id={`confDrawer.title.${title}`} />}
      maskClosable
      keyboard={ false }
      width="375"
      onClose={handleClose}
      visible={visible}
      footer={
        <div style={{ textAlign: 'right', }} >
          <Space>
              <Button onClick={handleClose}><FormattedMessage id="operation.cancel"/></Button>
              <Button type="primary" disabled={padding || !nameStatus.status} onClick={editData.editAll ? handleEditAll : handleOk}>
                {(editData?.name || editData.editAll) ? <FormattedMessage id="operation.update"/> : <FormattedMessage id="operation.ok"/>}
              </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" // 表单布局
        form={form}
      >
        {!editData.editAll && //批量操作时，无该部分。
          <Form.Item label="Test Conf"
            name="name"
            validateStatus={(!nameStatus.status) ? 'error' : undefined}
            help={(!nameStatus.status && nameStatus.message)}
            rules={[
              {required: true },
            ]}>
            <Input autoComplete="off" placeholder={formatMessage({id: 'TestConf.name.placeholder'})}
              onChange={(e) => {
                if (!e.target.value) {
                  setNameStatus({ status: false, message: formatMessage({id: 'TestConf.name.cannot.be.empty'}) })
                } else {
                  setNameStatus({ status: true, message: '' })
                  const value = e.target.value
                  if (!(value.match(/^[A-Za-z0-9\._-]+$/g) && value.length <= 32)) {
                    setNameStatus({ status: false, message: formatMessage({id: 'please.enter.message'}) })
                  }
                }
            }} />
          </Form.Item>
        }

        <Form.Item label={<FormattedMessage id="TestSuite.domain"/>}
          name="domain_list_str"
          rules={[
            {required: true, message: formatMessage({id: 'please.select'}) },
          ]}>
          <Select placeholder={formatMessage({id: 'please.select'})} mode="multiple" getPopupContainer={node => node.parentNode}>
            {props?.domainList?.map((item: any) => 
              <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
            )}
          </Select>
       </Form.Item>

        <Form.Item label={<FormattedMessage id="TestSuite.timeout"/>}
          name="timeout"
          rules={[
            {required: true, message: formatMessage({id: 'TestSuite.timeout.message'}) },
          ]}>
          <InputNumber style={{ width: '100%' }} min={ 0 } step={ 1 } placeholder={formatMessage({id: 'please.enter'})} />
        </Form.Item>

        <Form.Item label={<FormattedMessage id="TestSuite.repeat"/>}
          name="repeat"
          rules={[
            {required: true, message: formatMessage({id: 'TestSuite.repeat.message'}) },
          ]}>
          <InputNumber style={{ width: '100%' }} min={ 0 } step={ 1 } placeholder={formatMessage({id: 'please.enter'})} />
        </Form.Item>

        {!editData.editAll && //批量操作时，无该部分。
          <>
            <div>
              <div className={styles.variableLabel}>
                <FormattedMessage id="TestSuite.var"/><span className={styles.Bulk_btn} onClick={handleChangeValueStyle}>{handleBulk ? 'Bulk Edit' : 'Key-Value Edit'}</span>
              </div>
              {handleBulk ?
                <>
                  {variableDataList.map((item: any, index: any)=>
                    <Row key={index}>
                      <Col span={8} className={styles.flexStart}>
                        <Form.Item
                          name={`name${item.id}`}
                          // rules={[
                          //   {required: true, message: '请输入'},
                          // ]}
                          >
                          <Input placeholder={formatMessage({id: 'TestSuite.variable.name'})} autoComplete="off" />
                        </Form.Item>
                        <span style={{ marginTop: 5, padding:'0px 8px' }}>=</span>
                      </Col>
                      <Col span={8} className={styles.flexStart}>
                        <Form.Item
                          name={`val${item.id}`}>
                          <Input placeholder={formatMessage({id: 'TestSuite.default'})} autoComplete="off" />
                        </Form.Item>
                        <span style={{ marginTop: 5, padding:'0px 8px' }}>,</span>
                      </Col>
                      <Col span={8} className={styles.flexStart}>
                        <Form.Item
                          name={`des${item.id}`}>
                          <Input placeholder={formatMessage({id: 'TestSuite.var.desc'})} autoComplete="off" />
                        </Form.Item>
                        <span style={{ marginTop: 5, paddingLeft:'8px' }}>
                          {variableDataList.length > 1 ?
                            <DeleteOutlined onClick={() => removeVariable(item.id)} style={{ color: '#f00' }}/>
                            : <>&emsp;</>
                          }
                        </span>
                      </Col>
                    </Row>
                  )}
                  <a onClick={addVariable}>+ <FormattedMessage id="TestSuite.var.add"/></a>
                </>
                : 
                <Form.Item
                  name="var"
                  rules={[{ validator: validFunction }]}>
                  <Input.TextArea rows={4} style={{ width: '100%' }} placeholder={formatMessage({id: 'TestSuite.format:key=value'})} />
                </Form.Item>
              }
            </div>
              
            <div style={{ height: 10, backgroundColor: '#f5f5f5', margin: '20px -24px'}}></div>
            {props?.test_type === 'business' ? ciTypeElement : null }

            <Form.Item label={<FormattedMessage id="TestSuite.desc"/>}
              name="description">
              <Input.TextArea rows={3} placeholder={formatMessage({id: 'TestSuite.desc.placeholder.s'})} />
            </Form.Item>
          </>
        }
      </Form>
    </Drawer>
  )

})
