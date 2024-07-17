/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Drawer, Space, Button, Form, Input, Select, Radio, Spin, message, Divider, Typography, Row, Col } from 'antd'
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useParams, useIntl, FormattedMessage, useAccess } from 'umi'
import { queryBaselineList, createFuncsDetail } from '../service'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'

import Highlighter from 'react-highlight-words'
import { createBaseline } from '@/pages/WorkSpace/BaselineManage/services'
import { requestCodeMessage } from '@/utils/utils'



/** 批量结果加入基线 */
const JoinBaselineBatch: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { formatMessage } = useIntl()
    const { ws_id, id: test_job_id } = useParams() as any
    const access = useAccess()
    const { test_type, onOk } = props

    const [form] = Form.useForm()
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>([])
    const [padding, setPadding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [baselineFuncList, setBaselineFuncList] = useState([])

    const [funcsSelectVal, setFuncsSelectVal] = useState<any>()
    const funcsBaselineSelect: any = useRef(null)


    const getBaselinePerfData = async () => {
        setLoading(true)
        const { data, code } = await queryBaselineList({
            ws_id,
            test_type,
        })
        if (code === 200) {
            const list = data.map((item: any) => ({ label: item.name, key: item.id, value: item.id }))
            test_type === 'functional' && setBaselineFuncList(list)
        }
        setLoading(false)
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

    useImperativeHandle(
        ref, () => ({
            show: (_: any = false) => {
                setVisible(true)
                getBaselinePerfData()
                if (_) {
                    let list: any = []
                    _.forEach((item: any)=> {
                        item.children.forEach((conf: any)=> {
                            if (conf.children) {
                                list = list.concat(conf.children)
                            }
                        })
                    })
                    setSource(list)
                    form.setFieldsValue({ batch_info: list })
                }
                setFuncsSelectVal(undefined)
            }
        }),
    )

    const handleClose = () => {
        form.resetFields()
        setVisible(false)
        setPadding(false)
        setSource([])
        setFuncsSelectVal(undefined)
    }


    const handleOk = () => {
        setPadding(true)
        form.validateFields()
            .then(
                async (values: any) => {
                    // console.log(values)
                    const { baseline_id, batch_info } = values
                    
                    const q = batch_info.map((item: any)=> {
                      const {
                        bug, impact_result, description, desc,
                        test_suite_id, test_case_id, result_id, template_sub_case_result,
                        } = item
                      
                      return (
                        item.result === 'Fail' ?
                        {
                          baseline_id, bug, impact_result, description, desc,
                          ws_id, test_type, test_job_id, test_suite_id, test_case_id, result_id, sub_case_result: template_sub_case_result,
                        } : {
                          baseline_id, desc, impact_result,
                          ws_id, test_type, test_job_id, test_suite_id, test_case_id, result_id, sub_case_result: template_sub_case_result,
                        }
                      )
                    })
                    // console.log({ q })
                    
                    const { code, msg } = await createFuncsDetail({ data: q }) || {}
                    if (code === 200) {
                      message.success(formatMessage({ id: 'operation.success' }))
                      handleClose()
                      onOk()
                    } else {
                      requestCodeMessage(code, msg)
                    }
                    setPadding(false)
                }
            ).catch(err => {
                console.log(err)
                setPadding(false)
            })
    }

    const handleFuncsBaselineSelectSearch = (val: any) => {
        setFuncsSelectVal(val)
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

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            width="1000"
            title={<FormattedMessage id="ws.result.details.batch.join.baseline" />}
            open={visible}
            bodyStyle={{ padding: 0 }}
            onClose={handleClose}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button
                            type="primary"
                            onClick={handleOk}
                            disabled={padding}
                        >
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
                    style={{ background: '#fff', padding: '10px 20px' }}
                >
                    {
                        <div onMouseDown={(e) => e.preventDefault()}>
                            <Form.Item
                                label={<FormattedMessage id="ws.result.details.baseline_id" />}
                                name="baseline_id"
                                rules={[
                                  { required: true, message: formatMessage({ id: 'ws.result.details.baseline_id.empty' })}
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

                    <Form.Item>
                       <Form.List name="batch_info">
                          {(fields) => (
                              <div>
                                  {fields.map((field, index) => {
                                          const styleRight = { paddingRight: 16 }
                                          const styleRequired= { display: 'flex'}
                                          const rowInfo = source[index]
                                          const failResult = rowInfo?.result?.toLowerCase() === 'fail'

                                          return (
                                              <Row key={field.key}>
                                                    <Col style={styleRight} span={5}>
                                                        {!index && <p><span>&nbsp;Test Case</span></p>}
                                                        <Form.Item
                                                          name={[field.name, 'sub_case_name']}>
                                                          <Input disabled={true} bordered={false} style={{ color: 'rgba(0, 0, 0, 0.85)' }}/>
                                                        </Form.Item>
                                                    </Col>

                                                    <Col style={styleRight} span={5}>
                                                         {!index && <p><FormattedMessage id="ws.result.details.bug" /></p>}
                                                         <div style={styleRequired}>
                                                            {failResult && <span className={styles.item_required}>*</span>}
                                                            <Form.Item
                                                                name={[field.name, 'bug']}
                                                                rules={[{
                                                                    required: failResult,
                                                                    message: formatMessage({ id: 'ws.result.details.bug.empty' }),
                                                                    validator(rule, value) {
                                                                        if (failResult) {
                                                                        return value?.trim()? Promise.resolve() : Promise.reject(formatMessage({ id: 'ws.result.details.bug.empty' }))
                                                                        }
                                                                        return Promise.resolve()
                                                                    },
                                                                }]}
                                                            >
                                                                {failResult ?
                                                                    <Input placeholder={formatMessage({ id: 'ws.result.details.bug.placeholder' })}
                                                                        autoComplete="off"
                                                                        disabled={!failResult}
                                                                    />
                                                                    : '-'
                                                                }
                                                            </Form.Item>
                                                          </div>
                                                    </Col>

                                                    <Col style={styleRight} span={4}>
                                                        {!index && <p><FormattedMessage id="ws.result.details.impact_result" /></p>}
                                                        <Form.Item
                                                            name={[field.name, 'impact_result']}
                                                            initialValue={true}
                                                        >
                                                            <Radio.Group disabled={!failResult}>
                                                                <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                                                                <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                                                            </Radio.Group>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col style={styleRight} span={5}>
                                                        {!index && <p><FormattedMessage id="ws.result.details.description" /></p>}
                                                        <Form.Item
                                                            name={[field.name, 'description']}>
                                                            {failResult ?
                                                                <Input.TextArea rows={1} placeholder={formatMessage({ id: 'ws.result.details.description.placeholder' })} 
                                                                   disabled={!failResult}
                                                                />
                                                                : '-'
                                                             }
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        {!index && <p>基线说明</p>}
                                                        <div style={styleRequired}>
                                                            {failResult && <span className={styles.item_required}>*</span>}
                                                            <Form.Item
                                                                name={[field.name, 'desc']}
                                                                rules={[{
                                                                    required: failResult,
                                                                    message: formatMessage({ id: 'please.enter' }),
                                                                }]}
                                                            >
                                                                <Input allowClear placeholder='请输入' />
                                                            </Form.Item>
                                                        </div>
                                                    </Col>
                                              </Row>
                                          )
                                      })
                                  }
                              </div>
                            )
                          }
                       </Form.List>
                    </Form.Item>


                </Form>
            </Spin>
        </Drawer>
    )
}

export default forwardRef(JoinBaselineBatch)