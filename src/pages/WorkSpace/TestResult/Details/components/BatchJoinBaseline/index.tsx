/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Drawer, Space, Button, Form, Input, Select, Radio, Spin, message, Divider, Typography, Row, Col } from 'antd'
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { useParams, useIntl, FormattedMessage, useAccess } from 'umi'
import { queryBaselineList, createFuncsDetail } from '../../service'

import Highlighter from 'react-highlight-words'
import { createBaseline } from '@/pages/WorkSpace/BaselineManage/services'
import { requestCodeMessage } from '@/utils/utils'
import { MetricSelectProvider } from '../../TestRsultTable'
import { queryTestResultSuiteConfList } from '../../service'
import CaseTableForm from './CaseTableForm'
import styles from '../index.less'


const SuiteChildForm: React.FC<any> = (props) => {
  const { handleEffectOk, ...rest } = props

  const ref = React.useRef()
  React.useEffect(() => {
    handleEffectOk(ref)
  }, [])

  return (
    <div style={{ paddingLeft: 20 }}>
      <CaseTableForm
        ref={ref}
        {...rest}
      />
    </div>
  )
}

// 批量加入基线---表单弹框
const JoinBaselineBatch: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
  const { formatMessage } = useIntl()
  const { ws_id, id: test_job_id } = useParams() as any
  const access = useAccess()
  const { suiteData, test_type, onOk } = props
  const { setOSuite, oSuite, setCancelSuite, cancelSuite, } = React.useContext(MetricSelectProvider)

  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [baselineFuncList, setBaselineFuncList] = useState([])

  const [funcsSelectVal, setFuncsSelectVal] = useState<any>()
  const funcsBaselineSelect: any = useRef(null)

  // 批量表单
  const [treeData, setTreeData] = useState<any>([])
  const [refs, setRefs] = React.useState<any>({})

  // 1.基线数据
  const getBaselinePerfData = async () => {
    try {
      const { data, code, msg } = await queryBaselineList({
        ws_id,
        test_type,
      })
      if (code === 200) {
        const list = data.map((item: any) => ({ label: item.name, key: item.id, value: item.id }))
        test_type === 'functional' && setBaselineFuncList(list)
      } else {
        message.error(msg || '基线查询失败')
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * 根据父级id查Conf, 判断过滤Conf
   * @param suiteValue { null | object }
   * @param suite_id { parentId }
   * @returns 当前suite_id 下的 conf
   */
  const getConf = async (suiteValue: any, suite_id: any) => {
    // console.log('getConf:', suiteValue )
    const { data = [] } = await queryTestResultSuiteConfList({ job_id: test_job_id, suite_id, }) || {}
    // null
    if (suiteValue === null) {
      return data.map((item: any) => {
        const { test_case_id, conf_name } = item
        return { test_case_id, conf_name, children: null }
      })
    }
    // object
    const selectedConf = Object.keys(suiteValue)?.map(id => + id) || []
    const list = data.filter((item: any) => selectedConf.includes(item.test_case_id))
    return list.map((item: any) => {
      const { test_case_id, conf_name } = item
      const confValue = suiteValue?.[test_case_id]
      // console.log('confValue:', confValue)
      return {
        test_case_id,
        conf_name,
        children: confValue === null ? null : confValue.map((cs: any) => cs.id),
      }
    })
  }
  // 2.根据id查询 case数据
  const getSelectedDataById = async () => {
    setLoading(true)
    // console.log('oSuite:', oSuite)
    const selectedSuite = Object.keys(oSuite)?.map(id => + id) || []
    const list = suiteData.filter((item: any) => selectedSuite.includes(item.suite_id))
    const res = list.map(async (item: any) => {
      const { suite_id, suite_name } = item
      const suiteId = suite_id
      // null / object
      const suiteValue = oSuite[suiteId]
      const confChildren = await getConf(suiteValue, suiteId)
      return { suite_id, suite_name, children: confChildren }
    })


    let suiteList = []
    for await (let item of res) {
      suiteList.push(item)
    }
    setTreeData(suiteList)
    setLoading(false)
  }

  useImperativeHandle(
    ref, () => ({
      show: (_: any = false) => {
        setVisible(true)
        getBaselinePerfData()
        setFuncsSelectVal(undefined)
        // 遍历请求:批量选中的数据suite\conf\case
        getSelectedDataById()
      }
    }),
  )

  // console.log('refs:', refs)
  const handleEffectOk = (suite_id: any, conf_id: any,  col: any) => {
    setRefs((rf: any)=> ({
      ...rf,
      [suite_id]: {
        ...rf[suite_id],
        [conf_id]: col,
      },
    }))
  }

  // 重置所有子表单
  const resetCaseTableForm = () => {
    const suiteRefs = Object.keys(refs)
    for (let i = 0; i < suiteRefs.length; i++) {
      const sid = suiteRefs[i]
      const refList = Object.keys(refs[sid])
      // console.log('重置--refList:', refList)

      for (let j = 0; j < refList.length; j++) {
        const ref = refs[sid][refList[j]]
        ref?.current?.resetState()
      }
    }
  }




  const handleClose = () => {
    form.resetFields()
    setLoading(false)
    setFuncsSelectVal(undefined)
    setVisible(false)
    resetCaseTableForm()
  }

  // const handleCancel = () => {
  //   // 重置选中行
  //   setOSuite({})
  //   setCancelSuite({})
  // }

  // 合并所有表单数据
  const getFormDataAll = async ()=> {
    let list: any = [], isVerified = true;
    for (let i = 0; i < treeData.length; i++) {
      const { suite_id: sid } = treeData[i]
      const refList = Object.keys(refs[sid])
      // console.log('refList:', refList)

      for (let j = 0; j < refList.length; j++) {
        const ref = refs[sid][refList[j]]
        const formData = await ref?.current?.getFormData()
        // console.log('formData:', formData)
        if (formData) {
          list = list.concat(formData)
        } else if (formData === null) {
          list = []
          isVerified = false
          // break
        }
      }
    }
    console.log('分页表单校验是否通过:', list, isVerified )
    return { list, isVerified }
  }

  const handleOk = async () => {
    setLoading(true)
    const { list, isVerified } = await getFormDataAll()
    form.validateFields().then(async (values: any) => {
      const { baseline_id, } = values
      if (isVerified) {
        // 批量添加基线
        const q = list.map((item: any)=> ({ ...item, baseline_id }))
        const { code, msg } = await createFuncsDetail({ data: q }) || {}
        if (code === 200) {
          message.success(formatMessage({ id: 'operation.success' }))
          handleClose()
          onOk()
        } else {
          requestCodeMessage(code, msg)
        }
      }
      setLoading(false)
    }).catch(err => {
      console.log(err)
      setLoading(false)
    })
  }

  //--------- start Baseline select----------------
  const handleFuncsBaselineSelectSearch = (val: any) => {
    setFuncsSelectVal(val)
  }
  const requestJoinBaseline = async (name: any) => {
    if (!name) return
    const { code, msg, data } = await createBaseline({
      name,
      test_type,
      version: '',
      page_size: 999,
      ws_id,
    })

    if (code === 200) {
      message.success('添加基线成功!!!')
      getBaselinePerfData()
      setFuncsSelectVal(undefined)

    } else {
      requestCodeMessage(code, msg)
    }

    return data
  }
  const handleFuncsBaselineSelectBlur = async () => {
    if (funcsSelectVal) {
      const data = await requestJoinBaseline(funcsSelectVal)
      if (!data) return
      const { id: baseline_id } = data
      if (baseline_id) {
        const baselineNames = form.getFieldValue('baseline_id') || []
        form.setFieldsValue({ baseline_id: baselineNames.concat([baseline_id]) })
      }
      setFuncsSelectVal('')
      funcsBaselineSelect.current.blur()
    }
  }
  //---------- end Baseline select--------------

  return (
    <Drawer
      maskClosable={false}
      keyboard={false}
      width="1050"
      title={<FormattedMessage id="ws.result.details.batch.join.baseline" />}
      open={visible}
      bodyStyle={{ padding: '0 0 20px 0' }}
      onClose={handleClose}
      footer={
        <div style={{ textAlign: 'right', }} >
          <Space>
            <Button disabled={loading} onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
            <Button disabled={loading} type="primary" onClick={handleOk}>
              <FormattedMessage id="operation.ok" />
            </Button>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          style={{ background: '#fff', padding: '10px 20px 0' }}
        >
          {
            <div onMouseDown={(e) => e.preventDefault()}>
              <Form.Item
                label={<FormattedMessage id="ws.result.details.baseline_id" />}
                name="baseline_id"
                rules={[
                  { required: true, message: formatMessage({ id: 'ws.result.details.baseline_id.empty' }) }
                ]}
              >
                <Select
                  placeholder={formatMessage({ id: 'ws.result.details.baseline_id.placeholder' })}
                  mode="multiple"
                  className={styles.select_baseline}
                  allowClear
                  optionLabelProp="label"
                  ref={funcsBaselineSelect}
                  listHeight={160}
                  loading={loading}
                  getPopupContainer={node => node.parentNode}
                  onSearch={handleFuncsBaselineSelectSearch}
                  filterOption={
                    (input, option: any) => option.name.indexOf(input) >= 0
                  }
                  dropdownRender={menu => (
                    <>
                      {menu}
                      {
                        funcsSelectVal && !!funcsSelectVal.length && <>
                          <Divider style={{ margin: '8px 0' }} />
                          {
                            access.IsWsSetting() &&
                            <div
                              style={{ display: 'inline-block', flexWrap: 'nowrap', width: '100%', padding: '0 0 8px 8px' }}
                              onClick={handleFuncsBaselineSelectBlur}
                            >
                              <Space>
                                <PlusOutlined style={{ color: '#1890FF' }} />
                                <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                                  <FormattedMessage id="ws.result.details.create.baseline" />
                                </span>
                              </Space>
                            </div>
                          }
                        </>
                      }
                    </>
                  )}
                  options={
                    baselineFuncList.map((item: any) => ({
                      value: item.value,
                      name: item.label,
                      label: (
                        <Typography.Text ellipsis={{ tooltip: item.label }}>
                          <Highlighter
                            highlightStyle={{ color: '#1890FF', padding: 0, background: 'unset' }}
                            searchWords={[funcsSelectVal]}
                            autoEscape
                            textToHighlight={item.label}
                          />
                        </Typography.Text>
                      )
                    }))
                  }
                />
              </Form.Item>
            </div>
          }
        </Form>

        {treeData.map(({ suite_id, suite_name, children }: any) =>
          <div key={suite_id} style={{ paddingLeft: 20, paddingRight: 20 }}>
            <h3>{suite_name}</h3>
            {children.map((conf: any, i: number) => {
              return (
                <SuiteChildForm
                  key={conf.test_case_id}
                  {...{ suite_id, suite_name, ...conf, test_type, test_job_id, cancelSuite }}
                  handleEffectOk={(ref: any)=> handleEffectOk(suite_id, conf.test_case_id, ref )}
                />
              )
            })
            }
          </div>
        )}
      </Spin>
    </Drawer>
  )
}

export default forwardRef(JoinBaselineBatch)