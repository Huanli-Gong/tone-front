import React, { useState, useRef, useEffect, useMemo, memo } from 'react'
import { history, Access, useAccess } from 'umi'

import { Row, Typography, Checkbox, Radio, Space, Col, Card, message, Button, Spin, Input, Tooltip, Divider } from 'antd'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { useClientSize } from '@/utils/hooks'
import SuiteSelectDrawer from './components/SuiteSelectDrawer'
import { createReportTemplate, queryReportTemplateDetails, updateReportTemplate } from './services'
import produce from 'immer'
import { requestCodeMessage } from '@/utils/utils'
import { ReportTemplateContext } from './Provider'
import Catalog from './components/TemplateCatalog'
import TemplateBreadcrumb from './components/TemplateBreadcrumb'

import {
    ProjectTitle, PeddingRow, TemplateBar, ReportBody,
    ReportBodyContainer, ReportIssue, ReportTemplate
} from './styled'

import TestGroup from './components/Group'
import TestItem from './components/Term'

const defaultConf = {
    need_test_suite_description: true,
    need_test_env: true,
    need_test_description: true,
    need_test_conclusion: true,
    show_type: "list",
    test_data: false,
}

const TemplatePage = (props: any) => {
    const { route } = props
    const { ws_id, temp_id } = props.match.params
    const access = useAccess()
    const [loading, setLoading] = useState(false)
    const { height: windowHeight } = useClientSize()
    const suiteSelectRef = useRef<any>()

    const [dataSource, setDataSource] = useState<any>({
        ws_id,
        name: "",
        is_default: false,
        need_test_background: true,
        need_test_method: true,
        need_test_summary: true,
        need_test_conclusion: true,
        need_test_env: true,
        need_env_description: true,
        need_func_data: true,
        need_perf_data: true,
        description: "",
        perf_conf: defaultConf,
        func_conf: defaultConf,
        perf_item: [],
        func_item: [],
    })

    const getTreeKeys = (data: any): any => {
        return data.reduce((pre: any, cur: any) => {
            if (cur.is_group)
                return cur.list.length > 0 ? pre.concat(getTreeKeys(cur.list)) : pre
            if (cur.list && cur.list.length > 0)
                return pre.concat(cur.list.reduce((p: any, c: any) => {
                    return p.concat(c.case_source.map((i: any) => i.test_conf_id))
                }, []))
            return pre
        }, [])
    }

    const [contrl, setContrl] = useState(access.WsMemberOperateSelf())

    const perfKeys = useMemo(() => getTreeKeys(dataSource.perf_item), [dataSource])
    const funcKeys = useMemo(() => getTreeKeys(dataSource.func_item), [dataSource])

    const refreshRowkey = (data: any, parentRowkey: any = null) => {
        const rowkey = parentRowkey ? `${parentRowkey}-` : ''

        return data.map((item: any, index: number) => {
            if (item.list) {
                return {
                    ...item,
                    rowkey: `${rowkey}${index}`,
                    list: refreshRowkey(item.list, `${rowkey}${index}`)
                }
            }
            return { ...item, rowkey: `${rowkey}${index}` }
        })
    }

    const editPageSetData = async () => {
        setLoading(true)
        const { data } = await queryReportTemplateDetails({ ws_id, id: temp_id })
        const { perf_item, func_item, perf_conf, func_conf } = data
        setContrl(access.WsMemberOperateSelf(data.creator))

        const params: any = {
            func_conf: func_conf || defaultConf,
            perf_conf: perf_conf || defaultConf,
            perf_item: refreshRowkey(perf_item),
            func_item: refreshRowkey(func_item)
        }

        // console.log(params)
        document.title = `${data.name} - T-One`
        setDataSource(Object.assign(data, params))
        setLoading(false)
    }

    useEffect(() => {
        if (route.name === 'TemplateEdit') editPageSetData()
        else
            document.title = `创建报告模版 - T-One`
    }, [])

    const handeleCheckboxChange = (name: string, val: boolean) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                draftState[name] = val
            })
        )
    }

    const RenderCheckbox: React.FC<any> = (props) => {
        const { name, title } = props
        return (
            <Checkbox
                {...props}
                id={name}
                disabled={!contrl}
                onChange={({ target }) => handeleCheckboxChange(name, target.checked)}
                checked={dataSource[name]}
            >
                {title}
            </Checkbox>
        )
    }

    const filterFieldData = (data: any, rowkey: string, name: string, field: any) => {
        return produce(
            data,
            (draftState: any) => {
                draftState.list = data.list.map((i: any) => {
                    if (!i.is_group && i.rowkey === rowkey) {
                        return produce(i, (draft: any) => {
                            draft[name] = field
                        })
                    }
                    return i
                })
            }
        )
    }

    const filterData = (item: any, rowkey: string, name: string, field: any) => {
        if (item.rowkey === rowkey)
            return produce(item, (draft: any) => {
                draft[name] = field
            })
        if (item.is_group)
            return filterFieldData(item, rowkey, name, field)
        return item
    }

    const handleFieldChange = (field: any, name: string, rowkey: string, type: string) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    draftState[type] = dataSource[type].map(
                        (item: any) => filterData(item, rowkey, name, field)
                    )
                }
            )
        )
    }

    const removeFieldFilter = (data: any, rowkey: string) => (
        data.reduce((pre: any, cur: any) => {
            if (cur.rowkey === rowkey) return pre
            if (cur.is_group)
                return pre.concat({
                    ...cur,
                    list: removeFieldFilter(cur.list, rowkey)
                })
            return pre.concat(cur)
        }, [])
    )

    const hanldeRemoveField = (rowkey: string, dataType: any) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    draftState[dataType] = removeFieldFilter(dataSource[dataType], rowkey)
                }
            )
        )
    }

    const queryItemData = (cur: any) => ({
        name: `测试项${cur.rowkey - 0 + 1}-${cur.list.length + 1}`,
        rowkey: `${cur.rowkey}-${cur.list.length}`,
        list: [{
            test_suite_id: null,
            suite_show_name: "suite",
            case_source: [],
            rowkey: `${cur.rowkey}-${cur.list.length}-0`
        }]
    })

    const filterGroupList = (data: any, rowkey: string) => {
        return data.reduce((pre: any, cur: any) => {
            if (cur.rowkey === rowkey) {
                if (cur.is_group)
                    return pre.concat({
                        ...cur,
                        list: cur.list.concat(queryItemData(cur))
                    })
                return pre.concat(queryItemData(cur))
            }
            if (cur.is_group) {
                return pre.concat({
                    ...cur,
                    list: filterGroupList(cur.list, rowkey)
                })
            }
            return pre.concat(cur)
        }, [])
    }

    const handleGroupAddTestItem = (rowkey: string, dataType: string) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    draftState[dataType] = filterGroupList(dataSource[dataType], rowkey)
                }
            )
        )
    }

    const changeSuiteName = (item: any, dataType: string, rowkey: string, val: string, id: number) => {
        if ('test_suite_id' in item) {
            if (item.test_suite_id === id)
                return {
                    ...item,
                    suite_show_name: val
                }
        }
        if (item.list && item.list.length > 0) {
            return {
                ...item,
                list: item.list.map((i: any) => changeSuiteName(i, dataType, rowkey, val, id))
            }
        }
        return item
    }

    const hanldeChangeSuiteName = (id: number, dataType: string, rowkey: string, val: string) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    draftState[dataType] = dataSource[dataType].map(
                        (item: any) => changeSuiteName(item, dataType, rowkey, val, id)
                    )
                }
            )
        )
    }

    const filterSuites = (cur: any, isSuite: boolean, data: any) => {
        if ('test_suite_id' in cur) {
            if (isSuite) {
                if (cur.test_suite_id === data.test_suite_id) return
                return cur
            }
            else {
                const caseSource = cur.case_source.filter((i: any) => data.test_conf_id !== i.test_conf_id)
                if (caseSource.length > 0)
                    return {
                        ...cur,
                        case_source: caseSource
                    }
                return
            }
        }

        return {
            ...cur,
            list: cur.list.reduce((p: any, c: any) => {
                const result = filterSuites(c, isSuite, data)
                return result ? p.concat(result) : p
            }, [])
        }
    }

    const handleRemoveSuiteField = (suite: any, dataType: string, isSuite: boolean) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    draftState[dataType] = dataSource[dataType].map((i: any) => filterSuites(i, isSuite, suite))
                }
            )
        )
    }

    const handleAddTestItem = (name: string) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                const rowkey: any = `${dataSource[name].length}`
                draftState[name] = dataSource[name].concat({
                    name: `测试项${rowkey - 0 + 1}`,
                    rowkey,
                    list: [{
                        test_suite_id: null,
                        suite_show_name: "suite",
                        case_source: [],
                        rowkey: `${rowkey}-1`
                    }]
                })
            })
        )
    }

    const handleAddTestGroup = (name: string) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                const rowkey: any = `${dataSource[name].length}`
                draftState[name] = dataSource[name].concat({
                    name: `测试组${rowkey - 0 + 1}`,
                    list: [],
                    is_group: true,
                    rowkey
                })
            })
        )
    }

    const handleSelectSuiteOk = ({ result, rowkey, testType }: any) => handleFieldChange(result, 'list', rowkey, testType)

    // const hanldePreview = () => {
    //     const win: any = window.open("");
    //     setTimeout(function () { win.location.href = `${location.href}/preview` })
    // }

    const checkName = (data: any) => {
        const obj = {}
        for (let x = 0, len = data.length; x < len; x++) {
            const { name } = data[x]
            if (obj[name])
                throw '同级不能同名，请检查！'
            obj[name] = name
        }
    }

    const compare = (data: any) => {
        checkName(data)
        const result = data.reduce((pre: any, cur: any) => {
            if ('test_suite_id' in cur)
                return cur.case_source.length === 0 ? pre : pre.concat(cur)
            if (cur.list.length > 0) {
                const list = compare(cur.list)
                return list.length > 0 ? pre.concat({ ...cur, list }) : pre
            }
            return pre
        }, [])
        return result
    }

    const hanldeSaveOk = async () => {
        if (loading) return
        setLoading(true)
        const { perf_item, func_item, name } = dataSource
        setLoading(false)
        // if (!need_perf_data && !need_func_data)
        //     return message.warning('未添加测试数据！')
        if (!name)
            return message.warning('模板名称不可为空')

        try {
            setLoading(true)
            const perfs = await compare(perf_item)
            const funcs = await compare(func_item)

            const params = {
                ...dataSource,
                perf_item: perfs,
                func_item: funcs
            }

            // console.log(params)
            const data = route.name === 'TemplateEdit' ?
                await updateReportTemplate({ ws_id, id: temp_id, ...params }) :
                await createReportTemplate(params)

            if (data.code === 200)
                history.push(`/ws/${ws_id}/test_report?t=template`)
            else requestCodeMessage(data.code, data.message)
        }
        catch (err:any) {
            message.warning(err)
        }
        setLoading(false)
    }

    const handleConfItemChange = (val: any, name: string, field: string) => {
        setDataSource(
            produce(
                dataSource,
                (draftState: any) => {
                    const params = {
                        ...dataSource[field],
                    }
                    params[name] = val
                    draftState[field] = params
                }
            )
        )
    }

    const ConfigCheckbox: React.FC<any> = ({ field, name, title }) => (
        <Checkbox
            disabled={!contrl}
            onChange={({ target }) => handleConfItemChange(target.checked, name, field)}
            checked={dataSource[field][name]}
        >
            {title}
        </Checkbox>
    )

    const RenderTestBody: React.FC<any> = memo(
        ({ testType }) => {
            let bodyProps: any = { name: '性能测试数据', testRadioName: 'need_perf_data', dataItem: 'perf_item', conf: 'perf_conf' }
            if (testType !== 'performance')
                bodyProps = { name: '功能测试数据', testRadioName: 'need_func_data', dataItem: 'func_item', conf: 'func_conf' }

            return (
                <Card id={bodyProps.dataItem} style={{ marginTop: 20 }} bodyStyle={{ padding: '12px 20px' }}>
                    <Row >
                        <Checkbox
                            checked={dataSource[bodyProps.testRadioName]}
                            disabled={!contrl}
                            onChange={({ target }: any) => handeleCheckboxChange(bodyProps.testRadioName, target.checked)}
                        >
                            <Typography.Text strong style={{ fontSize: 16 }}>{bodyProps.name}</Typography.Text>
                        </Checkbox>
                    </Row>
                    {
                        dataSource[bodyProps.testRadioName] &&
                        <Row style={{ paddingLeft: 24 }}>
                            {
                                bodyProps.name !== '功能测试数据' &&
                                <Col
                                    span={24}
                                    style={{ background: 'rgba(0,0,0,0.03)', padding: 14, marginTop: 12 }}
                                >

                                    <Row style={{ marginBottom: 12, }} gutter={10}>
                                        <Col span={2} style={{ textAlign: 'right' }}>
                                            <Space>
                                                <Typography.Text>基础信息</Typography.Text>
                                                <Tooltip
                                                    placement="bottomLeft"
                                                    color="#fff"
                                                    overlayInnerStyle={{ width: 415, color: '#000' }}
                                                    arrowPointAtCenter
                                                    title={
                                                        <>
                                                            【测试工具】将会自动从Testsuite中获取<br />
                                                            【测试环境】【测试说明】【测试结论】需生成报告后手动填写
                                                        </>
                                                    }
                                                >
                                                    <QuestionCircleOutlined />
                                                </Tooltip>
                                            </Space>
                                        </Col>
                                        <Col span={22}>
                                            <ConfigCheckbox field={bodyProps.conf} title={'测试工具'} name={'need_test_suite_description'} />
                                            <ConfigCheckbox field={bodyProps.conf} title={'测试环境'} name={'need_test_env'} />
                                            <ConfigCheckbox field={bodyProps.conf} title={'测试说明'} name={'need_test_description'} />
                                            <ConfigCheckbox field={bodyProps.conf} title={'测试结论'} name={'need_test_conclusion'} />
                                        </Col>
                                    </Row>
                                    <Row >
                                        <Col span={2}>数据视图样式</Col>
                                        <Col span={22}>
                                            <Radio.Group
                                                disabled={!contrl}
                                                value={dataSource[bodyProps.conf].show_type}
                                                onChange={({ target }) => handleConfItemChange(target.value, 'show_type', bodyProps.conf)}
                                            >
                                                <Radio value={'list'}>列表视图</Radio>
                                                <Radio value={'chart'}>图表视图</Radio>
                                            </Radio.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            }
                            <Col span={24}>
                                {
                                    dataSource[bodyProps.dataItem].map(
                                        (item: any, idx: number) => (
                                            item.is_group ?
                                                <TestGroup key={idx}  {...bodyProps} source={item} /> :
                                                <TestItem key={idx}  {...bodyProps} source={item} />
                                        )
                                    )
                                }
                            </Col>
                            <Divider style={{ margin: '12px 0' }} />
                            <Col span={24}>
                                <span onClick={() => handleAddTestItem(bodyProps.dataItem)}>
                                    <Typography.Link >
                                        <Space>
                                            <PlusOutlined />
                                            测试项
                                        </Space>
                                    </Typography.Link>
                                </span>
                                <Divider type="vertical" />
                                <span onClick={() => handleAddTestGroup(bodyProps.dataItem)}>
                                    <Typography.Link >
                                        <Space>
                                            <PlusOutlined />
                                            测试组
                                        </Space>
                                    </Typography.Link>
                                </span>
                            </Col>
                        </Row>
                    }
                </Card>
            )
        }
    )

    const [collapsed, setCollapsed] = useState(false)

    const hanldeEditIssueInput = (name: string, val: string) => setDataSource(
        produce(
            dataSource,
            (draftState: any) => {
                draftState[name] = val
            }
        )
    )

    const [bodyWidth, setBodyWidth] = useState(1200)
    const bodyRef = useRef<any>(null)

    const hanldePageResize = () => setBodyWidth(bodyRef.current.offsetWidth)

    useEffect(() => {
        const targetNode: any = document.getElementById('report-body-container');
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(hanldePageResize);
        observer.observe(targetNode, config);
        return () => {
            observer.disconnect();
        }
    }, [])

    return (
        <ReportTemplateContext.Provider
            value={{
                dataSource, setDataSource,
                collapsed, setCollapsed,
                contrl, bodyWidth,
                handleFieldChange, hanldeRemoveField,
                handleRemoveSuiteField, hanldeChangeSuiteName,
                handleGroupAddTestItem,
                suiteSelectRef
            }}
        >
            <Spin spinning={loading}>
                <ReportTemplate height={windowHeight - 50} >
                    {/* 目录部分 */}
                    <Catalog {...{ dataSource, setDataSource, collapsed, setCollapsed, contrl }}/>
                    {/* body */}
                    <ReportBodyContainer id={'report-body-container'} collapsed={collapsed}>
                        <ReportBody ref={bodyRef}>
                            {/* breadcrumb */}
                            <TemplateBreadcrumb {...props} />

                            {/* 名称信息 */}
                            <ReportIssue >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Input
                                        style={{ width: '100%' }}
                                        placeholder={'请输入报告模板名称'}
                                        value={dataSource.name}
                                        onChange={({ target }) => hanldeEditIssueInput('name', target.value)}
                                    />
                                    <Input.TextArea
                                        onChange={({ target }) => hanldeEditIssueInput('description', target.value)}
                                        style={{ width: '100%' }}
                                        value={dataSource.description}
                                        placeholder="请输入报告描述，例如：本测试报告为XXX项目的测试报告，目的在于总结测试阶段的测试以及分析测试结果，描述系统是否符合需求（或达到XXX功能目标）。预期参考人员包括用户、测试人员、、开发人员、项目管理者、其他质量管理人员和需要阅读本报告的高层经理。"
                                    />
                                </Space>
                            </ReportIssue>
                            {/* 基础信息 */}
                            <div style={{ marginTop: 20, background: '#fff', padding: '20px 0' }}>
                                <ProjectTitle id="basic">
                                    <Space>
                                        <Typography.Text strong>基础信息</Typography.Text>
                                        <Tooltip
                                            placement="bottomLeft"
                                            color="#fff"
                                            overlayInnerStyle={{ width: 563, color: '#000' }}
                                            arrowPointAtCenter
                                            title={
                                                <span>
                                                    【测试背景】【测试方法】【测试结论】【测试环境(文字描述)】需生成报告后手动填写
                                                    【Summary】【测试环境(机器)】将会自动生成
                                                </span>
                                            }
                                        >
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                </ProjectTitle>
                                <PeddingRow style={{ marginTop: 16 }}>
                                    <RenderCheckbox title={'测试背景'} name={'need_test_background'} />
                                    <RenderCheckbox title={'测试方法'} name={'need_test_method'} />
                                    <RenderCheckbox title={'测试结论'} name={'need_test_conclusion'} />
                                    <RenderCheckbox title={'Summary'} name={'need_test_summary'} />
                                    <RenderCheckbox title={'环境描述'} name={'need_env_description'} />
                                    <RenderCheckbox title={'机器环境'} name={'need_test_env'} />
                                </PeddingRow>
                            </div>
                            {/* 测试数据 */}
                            <div style={{ padding: 20, background: '#fff', marginTop: 20 }} >
                                <ProjectTitle id="test_data">
                                    测试数据
                                </ProjectTitle>
                                <RenderTestBody testType="performance" />
                                <RenderTestBody testType="functional" />
                            </div>
                        </ReportBody>
                    </ReportBodyContainer>

                    <TemplateBar justify="end" align="middle">
                        <Space>
                            {/* {
                                route.name !== 'TemplateCreate' &&
                                <Button onClick={hanldePreview}>预览</Button>
                            } */}
                            {
                                !dataSource.is_default &&
                                <Access accessible={contrl}>
                                    <Button type="primary" onClick={hanldeSaveOk}>
                                        {route.name === 'TemplateEdit' ? '更新报告模版' : '保存报告模版'}
                                    </Button>
                                </Access>
                            }
                        </Space>
                    </TemplateBar>

                    <SuiteSelectDrawer
                        perfKeys={perfKeys}
                        funcKeys={funcKeys}
                        ref={suiteSelectRef}
                        onOk={handleSelectSuiteOk}
                    />
                </ReportTemplate>
            </Spin>
        </ReportTemplateContext.Provider>
    )
}

export default memo(TemplatePage)