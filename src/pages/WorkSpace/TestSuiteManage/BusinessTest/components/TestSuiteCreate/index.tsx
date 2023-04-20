import React, { useState, useEffect, useCallback } from 'react';
import { Table, PageHeader, Layout, Button, Row, Space, Select, Input, Typography, Modal, Tooltip, Spin, message } from 'antd'
import { history } from 'umi'
import { PlusCircleFilled, MinusCircleFilled, CaretRightFilled, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { ReactComponent as UnFullExpand } from '@/assets/svg/un_full.svg'
import { unionBy, cloneDeep } from 'lodash'
import CodeViewer from '@/components/CodeViewer'
import { saveSuiteCaseList, queryWsCaseConfirm } from '@/pages/WorkSpace/TestSuiteManage/TestSuiteCreate/service'
import { queryDomains, queryBusinessSuite, queryWorkspaceBusinessSuite } from '../../../service'
import styles from './index.less'
import { useClientSize } from '@/utils/hooks';

/**
 * 组件废弃：因为数据结构由三级改为了二级。
 * @module TestSuite管理
 * @description ws级-添加用例
 * @function 半选、可选、不可选。['halfSelected','optional','notOptional']
 */
export default (props: any) => {
  const { ws, test_type } = props.location.query
  // 右边数据
  const [rightDataSource, setRightDataSource] = useState<any[]>([])
  const [queryParams, setQueryParams] = useState({ domain: '', name: '' })
  // 左边数据
  const [leftDataSource, setLeftDataSource] = useState<any>([])
  // 展开
  const [expandRows, setExpandRows] = useState<Array<number>>([])
  const [expandRowsL2, setExpandRowsL2] = useState<Array<number>>([])


  const [padding, setPadding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [domainList, setDomainList] = useState<any>([])
  const [domainValue, setDomainValue] = useState<any>('')
  const [searchInp, setSearchInp] = useState<any>('')
  const [delType, setDelType] = useState<any>('suite')
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [leftTableLoading, setLeftTableLoading] = useState(true)


  // 1.领域数据
  const getDomains = async () => {
    const { data: domains } = await queryDomains()
    setDomainList(domains)
  }

  let timer: any = null
  useEffect(() => {
    getDomains()
    return () => {
      clearTimeout(timer)
    }
  }, [])

  // 二级展开
  const onExpandLevel2 = async (record: any) => {
    setExpandRowsL2([+ record.id])
  }
  // 一级展开
  const onExpand = async (record: any) => {
    setExpandRows([+ record.id])
  }


  // ---------------------------
  const handleDelete = async () => {
    let suiteIdList: number[] = []
    let caseIdList: number[] = []
    leftDataSource.forEach((suite: any) => {
      if (suite.test_case_list && suite.test_case_list.length > 0)
        caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
      else
        if (suite.addCaseCount === 'all')
          suiteIdList.push(suite.id)
    })

    if (ws) {
      const data = await saveSuiteCaseList({
        case_id_list: caseIdList.toString(),
        ws_id: ws,
        suite_id_list: suiteIdList.toString(),
        test_type
      })
      if (data.code === 200) {
        message.success('操作成功')
        history.go(-1)
      }
      else
        message.error('提交失败，请重试!')
    }
  }
  const handleCancel = () => {
    setDeleteVisible(false)
    history.go(-1)
  }
  const handleDetail = () => {
    let suiteIdList: number[] = []
    let caseIdList: number[] = []
    leftDataSource.forEach(
      (suite: any) => {
        if (suite.test_case_list && suite.test_case_list.length > 0)
          caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
        else
          if (suite.addCaseCount === 'all')
            suiteIdList.push(suite.id)
      }
    )
    window.open(`/ws/${ws}/refenerce/1/?test_type=${test_type}&name=${delType}&id=${caseIdList.toString()}/`)
  }
  // ---------------------------

  // 保存
  const handleSave = async () => {
    let suiteIdList: number[] = []
    let caseIdList: number[] = []
    leftDataSource.forEach(
      (suite: any) => {
        if (suite.test_case_list && suite.test_case_list.length > 0)
          caseIdList = caseIdList.concat(...suite.test_case_list.map((item: { id: any }) => item.id))
        else
          if (suite.addCaseCount === 'all')
            suiteIdList.push(suite.id)
      }
    )
    const data = await queryWsCaseConfirm({
      flag: 'pass',
      ws_id: ws,
      suite_id_list: suiteIdList.toString(),
      case_id_list: caseIdList.toString(),
      test_type
    })
    if (data.code == 200) {
      setDeleteVisible(true)
    } else {
      handleDelete()
    }
  }
  // 条件搜索
  const handleTestSuiteSearch = () => {
    const suiteSearchFn = () => setQueryParams({ ...queryParams, name: searchInp })
    timer && clearTimeout(timer)
    timer = setTimeout(suiteSearchFn, 300)
  }
  // 选择领域
  const handleTestSuiteSelect = (domain: string) => {
    setQueryParams({ ...queryParams, domain })
    setDomainValue(domain)
  }

  const handleBackPage = useCallback(
    () => {
      history.go(-1)
    },
    []
  )

  // -----------左右两边数据比较 start------------
  // 3.
  const compareLevel3 = (leftData: any = {}, rightData: any) => {
    const resetItem = rightData.test_case_list.map((rightItem: any) => {
      const leftItem = leftData?.test_case_list?.filter((item: any) => item.id === rightItem.id) || []
      if (leftItem.length) {
        return { ...leftItem[0], selectStatus: 'notOptional' }
      }
      return { ...rightItem, selectStatus: 'optional' }
    }) || []

    // 判断上一级的选中状态
    let parentStatus = ''
    let StatusArray = resetItem.map((item: any) => item.selectStatus)
    if (StatusArray.includes('notOptional') && StatusArray.includes('optional')) {
      parentStatus = 'halfSelected'
    } else if (StatusArray.includes('notOptional')) {
      parentStatus = 'notOptional'
    } else if (StatusArray.includes('optional')) {
      parentStatus = 'optional'
    }
    return { test_case_list: resetItem, selectStatus: parentStatus }
  }
  // 2.
  const compareLevel2 = (leftData: any = {}, rightData: any) => {
    const resetItem = rightData.test_suite_list.map((rightItem: any) => {
      const leftItem = leftData?.test_suite_list?.filter((item: any) => item.id === rightItem.id) || []
      const tempObject = leftItem.length ? leftItem[0] : {}

      const { test_case_list = [], selectStatus } = compareLevel3(tempObject, rightItem)
      return { ...rightItem, test_case_list, selectStatus: leftItem.length ? selectStatus : 'optional' }
    }) || []

    // 判断上一级的选中状态
    let parentStatus = ''
    let StatusArray = resetItem.map((item: any) => item.selectStatus)
    if (StatusArray.includes('notOptional') && !StatusArray.includes('halfSelected') && !StatusArray.includes('optional')) {
      // 子集全是不可选
      parentStatus = 'notOptional'
    } else if (StatusArray.includes('optional') && !StatusArray.includes('halfSelected') && !StatusArray.includes('notOptional')) {
      // 子集全是可选
      parentStatus = 'optional'
    } else {
      parentStatus = 'halfSelected'
    }
    return { test_suite_list: resetItem, selectStatus: parentStatus }
  }
  // 1.
  const compareLevel1 = (leftData: any = [], rightData: any) => {
    return rightData.map((rightItem: any) => {
      const leftItem = leftData?.filter((item: any) => item.id === rightItem.id) || []
      const tempObject = leftItem.length ? leftItem[0] : {}
      const { test_suite_list = [], selectStatus } = compareLevel2(tempObject, rightItem)
      return { ...rightItem, test_suite_list, selectStatus: leftItem.length ? selectStatus : 'optional' }
    }) || []
  }
  // -----------左右两边数据比较 end--------------

  // 下拉框领域切换函数
  const getTestSuiteList = async () => {
    let leftTableData: any = leftDataSource || []
    setLoading(true)
    if (leftDataSource.length === 0 && ws) {
      setLeftTableLoading(true)
      const res = await queryWorkspaceBusinessSuite({ ws_id: ws, scope: 'brief' })
      leftTableData = res.data || []
    }
    // 右基准遍历
    const { data = [] } = await queryBusinessSuite(queryParams)
    const rightTableData = compareLevel1(leftTableData, data)
    setRightDataSource(rightTableData)
    setLeftDataSource(leftTableData)
    setLoading(false)
    setLeftTableLoading(false)
  }

  useEffect(() => {
    getTestSuiteList()
  }, [queryParams])

  // -------------添加的相关方法 start---------------
  // 根据子集 判断 父级的选中状态
  const JudgehigherLevelStatus = (baseData: any = []) => {
    let StatusArray = baseData.map((item: any) => item.selectStatus)
    if (StatusArray.includes('notOptional') && !StatusArray.includes('halfSelected') && !StatusArray.includes('optional')) {
      // 子集全是不可选
      return 'notOptional'
    } else if (StatusArray.includes('optional') && !StatusArray.includes('halfSelected') && !StatusArray.includes('notOptional')) {
      // 子集全是可选
      return 'optional'
    }
    return 'halfSelected'
  }
  const operationLevel3 = (business_id: any, suite_id: any, conf_id: any) => {
    // case1.寻找数组下标
    let k = 0;
    let n = 0;
    let o = 0;
    let tempList = rightDataSource;
    rightDataSource.forEach((item, i) => {
      if (item.id === business_id) {
        k = i;
        item.test_suite_list.forEach((key: any, j: number) => {
          if (key.id === suite_id) {
            n = j;
            key.test_case_list?.forEach((itemsKey: any, m: number) => {
              if (itemsKey.id === conf_id) {
                o = m;
              }
            })
          }
        })
      }
    })
    tempList[k].test_suite_list[n].test_case_list[o].selectStatus = 'notOptional';
    // case2.判断上一级的选中状态
    let parentStatus2 = JudgehigherLevelStatus(tempList[k].test_suite_list[n].test_case_list)
    tempList[k].test_suite_list[n].selectStatus = parentStatus2;
    let parentStatus1 = JudgehigherLevelStatus(tempList[k].test_suite_list)
    tempList[k].selectStatus = parentStatus1;
    // console.log('tempList', tempList, n, o )
    const list = cloneDeep(tempList)
    setRightDataSource(list)
  }
  const operationLevel2 = (business_id: any, suite_id: any) => {
    // case1.寻找数组下标
    let k = 0;
    let n = 0;
    let list: any = [];
    let tempList = rightDataSource;
    rightDataSource.forEach((item, i) => {
      if (item.id === business_id) {
        k = i;
        item.test_suite_list.forEach((key: any, j: number) => {
          if (key.id === suite_id) {
            n = j;
            list = key.test_case_list?.map((itemsKey: any) => ({ ...itemsKey, selectStatus: 'notOptional' }))
          }
        })
      }
    })
    tempList[k].test_suite_list[n].test_case_list = list;
    tempList[k].test_suite_list[n].selectStatus = 'notOptional';
    // case2.判断上一级的选中状态
    let parentStatus = JudgehigherLevelStatus(tempList[k].test_suite_list)
    tempList[k].selectStatus = parentStatus;
    // console.log('tempList', tempList)
    setRightDataSource([...tempList])
  }
  const operationLevel1 = (business_id: any) => {
    const list = rightDataSource.map((item) => {
      if (item.id === business_id) {
        const { test_suite_list = [] } = compareLevel2(item, item)
        return { ...item, test_suite_list, selectStatus: 'notOptional' }
      }
      return item
    })
    setRightDataSource(list)
  }
  const resetLevel1 = (business_id: any) => {
    const addItem = rightDataSource.filter((item: any) => item.id === business_id)
    const tempList = leftDataSource.concat(addItem).sort((a, b) => a.id - b.id)
    setLeftDataSource(tempList)
  }
  const resetLevel2 = (business_id: any, suite_id: any) => {
    setLeftTableLoading(true)
    const addItem = rightDataSource.filter((item: any) => item.id === business_id)[0]
    // 判断父级是否存在
    let k;
    leftDataSource.forEach((item: any, index: number) => { if (item.id === business_id) { k = index; } })
    let tempList = leftDataSource
    if (k || k === 0) {
      // 父级数据已存在
      let suitItem = addItem.test_suite_list.filter((item: any) => item.id === suite_id)[0]
      tempList[k].test_suite_list.push(suitItem)
      tempList[k].test_suite_list.sort((a, b) => a.id - b.id)
      const list = cloneDeep(tempList)
      setLeftDataSource(list)
    } else {
      // 父级数据还没有
      let item = {
        id: addItem.id,
        name: addItem.name,
        test_suite_list: addItem.test_suite_list.filter((item: any) => item.id === suite_id)
      }
      tempList.push(item)
      tempList.sort((a, b) => a.id - b.id)
      setLeftDataSource([...tempList])
    }
    setLeftTableLoading(false)
  }
  const resetLevel3 = (business_id: any, suite_id: any, conf_id: any) => {
    setLeftTableLoading(true)
    let tempList = leftDataSource
    const addItem = rightDataSource.filter((item: any) => item.id === business_id)[0]
    const suiteItem = addItem.test_suite_list.filter((item: any) => item.id === suite_id)[0]
    const confItem = suiteItem.test_case_list.filter((item: any) => item.id === conf_id)

    // 判断父级是否存在
    let k;
    leftDataSource.forEach((item: any, index: number) => { if (item.id === business_id) { k = index; } })
    if (k || k === 0) {
      // 父级数据已存在
      let m;
      leftDataSource[k].test_suite_list.forEach((item: any, index: number) => { if (item.id === suite_id) { m = index; } })
      if (m || m === 0) {
        // suit级也已存在
        tempList[k].test_suite_list[m].test_case_list.push(confItem[0])
        tempList[k].test_suite_list[m].test_case_list.sort((a, b) => a.id - b.id)
      } else {
        // suit级不存在
        tempList[k].test_suite_list.push({ ...suiteItem, test_case_list: confItem })
      }
      const list = cloneDeep(tempList)
      // console.log('list1:', list)
      setLeftDataSource(list)

    } else {
      // 父级数据没有
      let item = {
        id: addItem.id,
        name: addItem.name,
        test_suite_list: [{
          id: suiteItem.id,
          name: suiteItem.name,
          test_case_list: confItem,
        }]
      }
      // console.log('item2:', item)

      tempList.push(item)
      const list = cloneDeep(tempList)
      setLeftDataSource(list)
    }
    setLeftTableLoading(false)
  }
  //---------------添加的相关方法 end-----------------

  // 1.添加
  const handleAdd = (params: any = {}) => {
    const { business_id, suite_id, conf_id } = params;
    if (conf_id && suite_id && business_id) { //操作三级数据
      // console.log('params', params)
      // 1.重置右边数据状态 && 重组左边数据
      operationLevel3(business_id, suite_id, conf_id);
      resetLevel3(business_id, suite_id, conf_id);
    } else if (suite_id && business_id) { //操作二级数据
      operationLevel2(business_id, suite_id);
      resetLevel2(business_id, suite_id);
    } else if (business_id) { // 操作一级数据
      operationLevel1(business_id);
      resetLevel1(business_id)
    }
  }
  // 2.删除
  const handleMinus = (params: any = {}) => {
    const { business_id, suite_id, conf_id } = params;
    if (conf_id && suite_id && business_id) {
      //操作三级数据
      minusOperationLevel3(business_id, suite_id, conf_id);
    } else if (suite_id && business_id) {
      //操作二级数据
      minusOperationLevel2(business_id, suite_id);
    } else if (business_id) {
      //操作一级数据
      minusOperationLevel1(business_id);
    }
  }

  // --------------删除相关方法 start----------------
  const minusOperationLevel1 = (business_id: any) => {
    const list = leftDataSource.filter((item: any) => item.id !== business_id)
    setLeftDataSource(list);
    const rightTableData = compareLevel1(list, rightDataSource)
    setRightDataSource(rightTableData);
  }
  const minusOperationLevel2 = (business_id: any, suite_id: any) => {
    const list: any = [];
    leftDataSource.forEach((element: any) => {
      const test_suite_list = element.test_suite_list.filter((item: any) => item.id !== suite_id)
      list.push({ ...element, test_suite_list })
    });
    setLeftDataSource(list);
    const rightTableData = compareLevel1(list, rightDataSource)
    setRightDataSource(rightTableData);
  }
  const minusOperationLevel3 = (business_id: any, suite_id: any, conf_id: any) => {
    const list: any = [];
    leftDataSource.forEach((element: any) => {
      const suiteList: any = []
      element.test_suite_list.forEach((item: any) => {
        const test_case_list: any = []
        item.test_case_list.forEach((key: any) => {
          if (key.id !== conf_id) {
            test_case_list.push(key)
          }
        })

        // 必须根集有数据才能视为选中(中)
        if (test_case_list.length) {
          suiteList.push({ ...item, test_case_list })
        }
      })
      list.push({ ...element, test_suite_list: suiteList })
    });

    // console.log('list:', list )
    setLeftDataSource(list);
    const rightTableData = compareLevel1(list, rightDataSource)
    setRightDataSource(rightTableData);
  }
  // --------------删除相关方法 end------------------
  const { height: layoutHeight } = useClientSize()

  // 获取页面可用高度
  useEffect(() => {
    return () => {
      clearTimeout(timer)
    }
  }, []);

  const toolTipSetting = {
    ellipsis: {
      shwoTitle: false,
    },
    render: (_: any) => {
      if (_ && _ !== '[]') {
        return (
          <Tooltip placement={_ && _.length > 100 ? 'left' : 'top'} title={_ && _ !== '[]' ? _ : '-'} >
            <span>{_ && _ !== '[]' ? _ : '-'}</span>
          </Tooltip>
        )
      }
      return <span>-</span>
    }
  }

  return (
    <Layout.Content style={{ height: layoutHeight, overflow: 'hidden' }}>
      <PageHeader
        className={styles.suite_nav_bar}
        title="Test Suite管理"
        onBack={handleBackPage}
        extra={
          <Button type="primary" onClick={handleSave} disabled={padding}>保存</Button>
        }
      />

      <Layout style={{ height: 'calc(100% - 50px)' }}>
        <Row style={{ padding: 20, height: '100%', background: '#f5f5f5' }}>
          {/* left  */}
          <div className={styles.suite_left_wrapper} style={{ height: innerHeight - 50 - 40 }}>
            <PageHeader title="已添加" />
            <Spin spinning={leftTableLoading}>
              <Table className={styles.right_table_style}
                size="small"
                columns={[{ title: '业务名称', dataIndex: 'name' }]}
                dataSource={leftDataSource}
                expandable={{
                  onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                  expandedRowKeys: expandRows,
                  expandedRowRender: (record: any) => {
                    const { id: business_id } = record
                    return (
                      <>
                        {leftDataSource?.length === 0 ?
                          <div style={{ textAlign: 'center', marginTop: 192 }}>
                            <Typography.Text>点击右侧&nbsp;</Typography.Text>
                            <PlusCircleFilled style={{ color: '#1890ff' }} />
                            <Typography.Text>，从系统用例中添加用例到Workspace</Typography.Text>
                          </div>
                          :
                          <Table className={styles.right_table_style}
                            size="small"
                            columns={[
                              { title: 'Test Suite', dataIndex: 'name' },
                            ]}
                            dataSource={record.test_suite_list}
                            expandable={{
                              expandedRowKeys: expandRowsL2,
                              onExpand: (_, record) => _ ? onExpandLevel2(record) : setExpandRowsL2([]),
                              expandedRowRender: (_: any) => {
                                const { id: suite_id } = _;
                                return (
                                  <Table
                                    locale={{ emptyText: '暂无数据' }}
                                    size="small"
                                    rowKey="id"
                                    dataSource={_.test_case_list || []}
                                    columns={[{
                                      render: (row: any) => (
                                        <Space>
                                          <MinusCircleFilled
                                            style={{ color: 'red' }}
                                            onClick={() => handleMinus({ business_id, suite_id, conf_id: row.id })}
                                          />
                                          <Typography.Text>{row.name}</Typography.Text>
                                        </Space>
                                      )
                                    }]}
                                    pagination={false}
                                  />
                                )
                              },
                              expandIcon: ({ expanded, onExpand, record }: any) => (
                                <Space>
                                  <MinusCircleFilled style={{ color: 'red' }} onClick={() => handleMinus({ business_id, suite_id: record.id })} />
                                  <CaretRightFilled rotate={expanded ? 90 : 0} onClick={(e: any) => onExpand(record, e)} />
                                </Space>
                              )
                            }}
                            rowKey="id"
                            pagination={false}
                          />
                        }
                      </>
                    )
                  },
                  expandIcon: ({ expanded, onExpand, record }: any) => (
                    <Space>
                      <MinusCircleFilled style={{ color: 'red' }} onClick={() => handleMinus({ business_id: record.id })} />
                      <CaretRightFilled rotate={expanded ? 90 : 0} onClick={(e: any) => onExpand(record, e)} />
                    </Space>
                  )
                }}
                rowKey="id"
                pagination={false}
                scroll={{ y: innerHeight - 90 - 72 - 39 }}
              />
            </Spin>
          </div>


          {/* right */}
          <div className={styles.suite_right_wrapper} style={{ height: innerHeight - 50 - 40 }}>
            <PageHeader title={`功能用例列表`}
              extra={
                <Space>
                  <Select value={domainValue}
                    onSelect={handleTestSuiteSelect}
                    style={{ width: 148 }}
                  >
                    <Select.Option value="">全部领域</Select.Option>
                    {domainList?.map((item: any) =>
                      <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                    )}
                  </Select>

                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                    <Input
                      style={{ width: 160, height: 32 }}
                      allowClear
                      value={searchInp}
                      onChange={({ target }) => setSearchInp(target.value)}
                      onPressEnter={handleTestSuiteSearch}
                      placeholder="搜索TestSuites"
                    />
                    <span className={styles.search_input_style} onClick={handleTestSuiteSearch}>
                      <SearchOutlined />
                    </span>
                  </div>
                </Space>
              }
            />
            <Table className={styles.left_table_style}
              loading={loading}
              rowKey="id"
              size="small"
              dataSource={rightDataSource}
              columns={[
                { title: '业务名称', dataIndex: 'name', },
                {
                  title: '描述',
                  dataIndex: 'description',
                  ellipsis: {
                    shwoTitle: false,
                  }, 
                  render(text: any) {
                    return (
                      text ?
                        <Tooltip placement='leftTop' arrowPointAtCenter overlayClassName={styles.tooltipCss} color="#fff" title={<CodeViewer code={text} />} >
                          <span>{text}</span>
                        </Tooltip> : '-'
                    )
                  }
                }
              ]}
              pagination={false}
              scroll={{ y: innerHeight - 90 - 72 - 39 }}
              expandable={{
                expandedRowKeys: expandRows,
                onExpand: (_, record) => _ ? onExpand(record) : setExpandRows([]),
                expandedRowRender: (record: any) => {
                  const { id: business_id } = record
                  //二级表格
                  return (
                    <Table
                      locale={{ emptyText: '暂无数据' }}
                      size="small"
                      rowKey="id"
                      dataSource={record.test_suite_list}
                      columns={[
                        { title: 'Test Suite', dataIndex: 'name', ...toolTipSetting },
                        { title: '测试类型', dataIndex: 'test_type', ...toolTipSetting },
                        { title: '变量', dataIndex: 'var', ...toolTipSetting },
                        { title: '说明', dataIndex: 'description', ...toolTipSetting }
                      ]}
                      pagination={false}
                      expandable={{
                        expandedRowKeys: expandRowsL2,
                        onExpand: (_, record) => _ ? onExpandLevel2(record) : setExpandRowsL2([]),
                        expandedRowRender: (record: any) => {
                          const { id: suite_id } = record
                          //三级表格
                          return (
                            <Table
                              locale={{ emptyText: '暂无数据' }}
                              size="small"
                              rowKey="id"
                              dataSource={record.test_case_list}
                              columns={[
                                {
                                  title: 'Test conf', render: (_: any, row: any) => (
                                    <Space>
                                      <PlusCircleFilled
                                        style={{ color: _.selectStatus === 'optional' ? '#1890ff' : '#eee', cursor: 'pointer' }}
                                        onClick={() => _.selectStatus === 'optional' && handleAdd({ business_id, suite_id, conf_id: row.id })}
                                      />
                                      <Typography.Text>{_.name}</Typography.Text>
                                    </Space>
                                  )
                                },
                                { title: '变量', dataIndex: 'var', ...toolTipSetting },
                                { title: '说明', dataIndex: 'description', ...toolTipSetting }
                              ]}
                              showHeader={false}
                              pagination={false}
                            />
                          )
                        },
                        expandIcon: ({ expanded, onExpand, record }: any) => {
                          const { selectStatus } = record
                          return (
                            <Space>
                              {/*二级表格前面的添加图标*/}
                              {selectStatus === 'halfSelected' ?
                                <UnFullExpand
                                  style={{ fontSize: 14, width: 14, height: 14, cursor: 'pointer' }}
                                  onClick={() => handleAdd({ business_id, suite_id: record.id })}
                                /> :
                                <PlusCircleFilled
                                  style={{ color: selectStatus === 'optional' ? '#1890ff' : '#eee' }}
                                  onClick={() => selectStatus === 'optional' && handleAdd({ business_id, suite_id: record.id })}
                                />
                              }
                              <CaretRightFilled
                                rotate={expanded ? 90 : 0}
                                style={{ cursor: 'pointer' }}
                                onClick={(e: any) => onExpand(record, e)}
                              />
                            </Space>
                          )
                        }
                      }}

                    />
                  )
                },
                expandIcon: ({ expanded, onExpand, record }: any) => {
                  const { selectStatus } = record
                  return (
                    <Space>
                      {/*一级表格前面的添加图标*/}
                      {selectStatus === 'halfSelected' ?
                        <UnFullExpand //半选(子代数据中有数据已添加过)
                          style={{ fontSize: 14, width: 14, height: 14, cursor: 'pointer' }}
                          onClick={() => handleAdd({ business_id: record.id })}
                        />
                        :
                        <PlusCircleFilled // 不可选｜可选(子代数据中无数据添加过)
                          style={{ color: selectStatus === 'optional' ? '#1890ff' : '#eee' }}
                          onClick={() => selectStatus === 'optional' && handleAdd({ business_id: record.id })}
                        />
                      }
                      <CaretRightFilled
                        rotate={expanded ? 90 : 0}
                        style={{ cursor: 'pointer' }}
                        onClick={(e: any) => onExpand(record, e)}
                      />
                    </Space>
                  )
                }
              }}
            />
          </div>
        </Row>
      </Layout>
      <Modal
        title="删除提示"
        centered={true}
        visible={deleteVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" onClick={handleDelete}>确定删除</Button>,
          <Button key="back" type="primary" onClick={handleCancel}>取消</Button>
        ]}
        width={600}
        maskClosable={false}
      >
        <div style={{ color: 'red', marginBottom: 5 }}>
          <ExclamationCircleOutlined style={{ marginRight: 4 }} />
          要删除的{delType == 'suite' ? 'Suite' : 'Conf'}被运行中的job或测试模板引用，请谨慎删除！！
        </div>
        <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>删除{delType == 'suite' ? 'suite' : 'conf'}影响范围：运行中的job、测试模板、对比分析报告</div>
        <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
      </Modal>
    </Layout.Content>
  )
}