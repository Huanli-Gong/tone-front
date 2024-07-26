/* eslint-disable react-hooks/exhaustive-deps */

import { Drawer, Space, Button, Form, Input, Select, Radio, Spin, message, Divider, Typography, Row, Col, Pagination } from 'antd'
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { FilterFilled } from '@ant-design/icons'

import { Access, useAccess, useParams, useIntl, FormattedMessage } from 'umi'
import EllipsisPopover from '@/components/Public/EllipsisPopover'
import _ from 'lodash'
import { queryCaseResult } from '../../service'
import styles from './index.less'

const CaseTableForm = (props: any, ref: any) => {
  const { formatMessage } = useIntl()
  const { ws_id, id: job_id, share_id } = useParams() as any

  const { suite_id, suite_name,
    test_case_id, conf_name, children,
    test_type, cancelSuite,
  } = props

    // 过滤掉“取消行”
    const cancelRow = cancelSuite?.[suite_id]?.[test_case_id] || []
    // 选中行



  // 存储所有分页表单数据
  const [errInfo, setErrInfo] = useState<any>({ status: 'success', errorMsg: null })
  const [allData, setAllData] = useState<any>([])
  const [loading, setLoading] = useState<any>(false)
  const [paginateData, setPaginateData] = useState<any>({
    page_size: 10,
    page_num: 1,
    data: [],
    total: 0,
  })
  const [form] = Form.useForm()

  const saveData = (res: any, req: any, tempAllData: any[]) => {
    // 数据开始存入的下标位
    const { page_size, page_num } = req
    const startIndex = (page_num - 1) * page_size
    const num = res.data.length

    // 首次开辟空间 && 存储数据
    if (res.total && allData.length === 0) {
      let list = new Array(res.total).fill('')
      list.splice(0, num, ...res.data)
      form.setFieldsValue({ batch_info: res.data || [] })
      setAllData(list)
    } else {
      let list = _.cloneDeep(tempAllData)
      // console.log('cloneDeep:', list, '下标位:', startIndex, num)
      // 判断下标位的老数据，是否有效数据, 若有“有效数据”行覆盖新的数据行
      const newData = list.slice(startIndex, startIndex + num).map((item: any, i: number) => item || res.data[i])
      // console.log('batch_info:', newData)
      list.splice(startIndex, num, ...newData)
      form.setFieldsValue({ batch_info: newData })
      setAllData(list)
      // 校验分页总数据
      allDataValidate(list)

    }
  }

  const refresh = async (params: any, tempAllData: any[]) => {
    const { page_size, page_num } = paginateData
    const defaultKeys = {
      job_id,
      suite_id,
      case_id: test_case_id,
      ws_id,
      share_id
    }
    try {
      setLoading(true)
      const q = { page_size, page_num, ...params, ...defaultKeys }
      const res = await queryCaseResult(q) || {}
      if (res.code === 200) {
        setPaginateData(res)
        saveData(res, q, tempAllData)
      }
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh({}, allData)
  }, [])

  const match_sub_case_result = (str: string) => {
    if (str === 'Pass') return 1
    if (str === 'Fail') return 2
    if (str === 'Stop') return 4
    if (str === 'Skip') return 5
    if (str === 'Warning') return 6
    return str
  }

  // 针对当前页form表单数据进行校验，校验表单&&保存数据
  const paginationChangeValidate = () => {
    return form.validateFields().then(async (values: any) => {
      // 1.当前页form表单数据
      const { batch_info: tempData } = values
      // 2.数据存入容器的对应位置
      const { page_size, page_num } = paginateData
      // console.log('allData:', allData)
      let list = _.cloneDeep(allData)
      const startIndex = (page_num - 1) * page_size
      list.splice(startIndex, tempData.length, ...tempData)
      setAllData(list)
      return list

    }).catch(err => {
      return null
    })
  }

  // 针对全部数据进行校验
  const allDataValidate = (restData: any, isShowError?: boolean)=> {
    if (children) {
      console.log(suite_name, '---', conf_name, '---选行:', children)
    } else {
      console.log(suite_name, '---', conf_name, '---取消行:', cancelRow)
    }
   
    // 过滤掉"空行"、“取消行”, 收集有效行数据
    const t = restData.filter((item: any) => {
      if (item) return children ? children.includes(item.id): !cancelRow.includes(item.id)
      return false
    })
    // 要求要收集够的行
    const total = children || restData.filter((item: any) => !cancelRow.includes(item.id))
    
    // 行数量比较
    if (t.length === total.length) {
      // 收集有效行数据
      setErrInfo({ status: 'success', errorMsg: null })
      return { validate: true, data: t }
    }
    isShowError && setErrInfo({ status: 'error', errorMsg: '未加载完所有的Test Case' })
    return { validate: false, data: null }
  }

  const getFormData = async (_: any) => {
    const restData = await paginationChangeValidate()
    if (restData) {
      const { validate, data } = allDataValidate(restData, true)
      console.log({ validate, data })

      if (validate) {
        // 收集有效行，按后端传参字段名返回
        return data.map((item: any) => {
          const { bug, impact_result, description, desc, id, result } = item
          return (
            result === 'Fail' ? {
              bug, impact_result, description, desc,
              ws_id, test_type, test_job_id: job_id, test_suite_id: suite_id, test_case_id, result_id: id, sub_case_result: match_sub_case_result(result),
            } : {
              desc, impact_result,
              ws_id, test_type, test_job_id: job_id, test_suite_id: suite_id, test_case_id, result_id: id, sub_case_result: match_sub_case_result(result),
            }
          )
        })
      }
      // console.log('case分页未加载完所有')
      return null
    }
    // console.log('表单校验不通过')
    return null
  }

  useImperativeHandle(ref, () => ({
    /** 校验 */
    getFormData,
    resetState() {
      setErrInfo({ status: 'success', errorMsg: null })
      setLoading(false)
      setAllData([])
      setPaginateData({
        page_size: 10,
        page_num: 1,
        data: [],
        total: 0,
      })
      form.resetFields()
    },
  }))

  return (
    <div>
      <div className={styles.conf_name}>
        <span>{conf_name}</span>
        {errInfo.errorMsg && <span style={{ color: '#f00'}}>（{errInfo.errorMsg}）</span>}
      </div>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item style={{ marginBottom: 0 }}>
            <Form.List name="batch_info">
              {(fields) => (
                <div>
                  {fields.map((field, index) => {
                    const styleRight = { paddingRight: 16 }
                    const styleRequired = { display: 'flex' }
                    const { result, id, sub_case_name } = paginateData.data[index] || {}
                    // 判断行是否是选中
                    const isSelected = children ? children.includes(id) : (cancelRow.length ? !cancelRow.includes(id): true)
                    // 判断行是否是fail
                    const failResult = isSelected && result?.toLowerCase() === 'fail'
                    return (
                      <Row key={field.key}>
                        <Col style={styleRight} span={5}>
                          {!index && <p><span>Test Case</span></p>}
                          {/* <Form.Item
                            name={[field.name, 'sub_case_name']}>
                            <Input disabled={true} bordered={false} style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
                          </Form.Item> */}
                          <EllipsisPopover title={sub_case_name}
                            style={{color: isSelected ? 'rgba(0, 0, 0, 0.85)' : '#0000003b' }}
                          />
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
                                    return value?.trim() ? Promise.resolve() : Promise.reject(formatMessage({ id: 'ws.result.details.bug.empty' }))
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
                            {isSelected ?
                              <Radio.Group disabled={!failResult}>
                                <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                                <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                              </Radio.Group>
                              :
                              '-'
                            }
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
                              {isSelected ?
                                <Input allowClear placeholder='请输入' />
                                :
                                '-'
                              }
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

        <Pagination style={{ textAlign: 'right' }}
          size="small"
          pageSize={paginateData.page_size}
          current={paginateData.page_num}
          total={paginateData.total}
          showTotal={(total) => `总共 ${total}`}
          showSizeChanger
          onChange={async (page_num, page_size) => {
            if (page_num !== paginateData.page_num) {
              // console.log('页码改变的回调')
              const restData = await paginationChangeValidate()
              if (restData) refresh({ page_num, page_size }, restData)
            }
          }}
          onShowSizeChange={async (page_num, page_size) => {
            // console.log('pageSize 改变的回调')
            const restData = await paginationChangeValidate()
            if (restData) refresh({ page_num: 1, page_size }, restData)
          }}
          pageSizeOptions={[10, 100]}
        />
      </Spin>
    </div>
  )
}

export default forwardRef(CaseTableForm)