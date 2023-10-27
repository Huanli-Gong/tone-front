/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { history, Access, useAccess, useIntl, FormattedMessage, useParams } from 'umi'

import { Row, Typography, Checkbox, Radio, Space, Col, Card, message, Button, Spin, Input, Divider, Modal } from 'antd'
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { useClientSize } from '@/utils/hooks'
import SuiteSelectDrawer from './components/SuiteSelectDrawer'
import { createReportTemplate, queryReportTemplateDetails, updateReportTemplate } from './services'
import produce from 'immer'
import { requestCodeMessage, useServerConfigArray } from '@/utils/utils'
import { ReportTemplateContext, useProvider } from './Provider'
import Catalog from './components/TemplateCatalog'
import TemplateBreadcrumb from './components/TemplateBreadcrumb'

import {
    ProjectTitle, TemplateBar, ReportBody,
    ReportBodyContainer, ReportIssue, ReportTemplate
} from './styled'
import { v4 as uuidv4 } from 'uuid';
import TestGroup from './components/Group'
import TestItem from './components/Term'

import Preview from './Preview'

const SERVER_INFO_CONFIG = ["ip/sn", "distro", "cpu_info", "memory_info", "disk", "ether", "os", "kernel", "gcc", "glibc"]

const defaultConf = {
    need_test_suite_description: true,
    need_test_env: true,
    need_test_description: true,
    need_test_conclusion: true,
    show_type: "list",
    test_data: false,
}

const funcDefaultConf = {
    need_test_suite_description: false,
    need_test_env: false,
    need_test_description: false,
    need_test_conclusion: false,
    show_type: "list",
    test_data: false,
}

const RenderTestBody: React.FC<any> = ({ testType }) => {
    const { formatMessage } = useIntl()
    const { dataSource, setDataSource, contrl } = useProvider()

    let bodyProps: any = { name: 'performance', testRadioName: 'need_perf_data', dataItem: 'perf_item', conf: 'perf_conf' }

    if (testType !== 'performance')
        bodyProps = { name: 'functional', testRadioName: 'need_func_data', dataItem: 'func_item', conf: 'func_conf' }

    const handleAddTestItem = (name: string) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                draftState[name] = dataSource[name].concat({
                    name: formatMessage({ id: 'report.test.item.num' }, { data: `${dataSource[name].length - 0 + 1}` }),
                    rowkey: uuidv4(),
                    list: [{
                        test_suite_id: null,
                        suite_show_name: "suite",
                        case_source: [],
                        rowkey: uuidv4()
                    }]
                })
            })
        )
    }

    const handleAddTestGroup = (name: string) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                draftState[name] = dataSource[name].concat({
                    name: `${formatMessage({ id: 'report.test.group' })}${dataSource[name].length - 0 + 1}`,
                    list: [],
                    is_group: true,
                    rowkey: uuidv4()
                })
            })
        )
    }

    const handeleCheckboxChange = (name: string, val: boolean | string) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                draftState[name] = val
            })
        )
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

    return (
        <Card id={bodyProps.dataItem} style={{ marginTop: 20 }} bodyStyle={{ padding: '12px 20px' }}>
            <Row >
                <Checkbox
                    checked={dataSource[bodyProps.testRadioName]}
                    disabled={!contrl}
                    onChange={({ target }: any) => handeleCheckboxChange(bodyProps.testRadioName, target.checked)}
                >
                    <Typography.Text strong style={{ fontSize: 16 }}>
                        <FormattedMessage id={`report.${bodyProps.name}.test.data`} />
                    </Typography.Text>
                </Checkbox>
            </Row>
            {
                dataSource[bodyProps.testRadioName] &&
                <Row style={{ paddingLeft: 24 }}>
                    <Col
                        span={24}
                        style={{ background: 'rgba(0,0,0,0.03)', padding: 14, marginTop: 12 }}
                    >
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                        >
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                            >
                                <Space>
                                    <Typography.Text><FormattedMessage id="report.basic.information" /></Typography.Text>
                                </Space>
                                <Space
                                    style={{ width: "100%" }}
                                >
                                    {
                                        [
                                            // ["测试工具", "need_test_suite_description"],
                                            [formatMessage({ id: 'report.test_env' }), "need_test_env"],
                                            [formatMessage({ id: 'report.test.description' }), "need_test_description"],
                                            [formatMessage({ id: 'report.test.conclusion' }), "need_test_conclusion"],
                                        ].map((item: any) => {
                                            const [title, name, text] = item
                                            return (
                                                <ConfigCheckbox
                                                    key={name}
                                                    field={bodyProps.conf}
                                                    title={title}
                                                    name={name}
                                                    text={text}
                                                />
                                            )
                                        })
                                    }
                                </Space>
                                {
                                    bodyProps.name !== 'functional' &&
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ marginRight: 12 }}><FormattedMessage id="report.data.view.style" /></div>
                                        <div>
                                            <Radio.Group
                                                disabled={!contrl}
                                                value={dataSource[bodyProps.conf].show_type}
                                                onChange={({ target }) => handleConfItemChange(target.value, 'show_type', bodyProps.conf)}
                                            >
                                                <Radio value={'list'}><FormattedMessage id="report.list.view" /></Radio>
                                                <Radio value={'chart'}><FormattedMessage id="report.chart.view" /></Radio>
                                            </Radio.Group>
                                        </div>
                                    </div>
                                }

                            </Space>
                        </Space>
                    </Col>

                    <Col span={24}>
                        {
                            dataSource[bodyProps.dataItem].map(
                                (item: any) => (
                                    item.is_group ?
                                        <TestGroup key={item.rowkey}  {...bodyProps} source={item} /> :
                                        <TestItem key={item.rowkey}  {...bodyProps} source={item} />
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
                                    <FormattedMessage id="report.test.item" />
                                </Space>
                            </Typography.Link>
                        </span>
                        <Divider type="vertical" />
                        <span onClick={() => handleAddTestGroup(bodyProps.dataItem)}>
                            <Typography.Link >
                                <Space>
                                    <PlusOutlined />
                                    <FormattedMessage id="report.test.group" />
                                </Space>
                            </Typography.Link>
                        </span>
                    </Col>
                </Row>
            }
        </Card>
    )
}

const ConfigCheckbox: React.FC<any> = ({ field, name, title, text }) => {
    const { formatMessage } = useIntl()
    const { dataSource, setDataSource, contrl } = useProvider()

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

    return (
        <Space
            direction="vertical"
            style={{ width: "100%" }}
        >
            <Checkbox
                disabled={!contrl}
                onChange={({ target }) => handleConfItemChange(target.checked, name, field)}
                checked={dataSource[field][name]}
            >
                {title}
            </Checkbox>
            {
                text &&
                <Input.TextArea
                    allowClear
                    placeholder={formatMessage({ id: 'please.enter' })}
                    value={dataSource[field][text]}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    disabled={!dataSource[field][name]}
                    onChange={({ target }: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleConfItemChange(target.value, text, field)
                    }}
                />
            }
        </Space>
    )
}


const RenderCheckbox: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { name, title, desc } = props
    const { dataSource, setDataSource, contrl } = useProvider()

    const { server_info_config } = dataSource
    const reportServerArray = useServerConfigArray()
    const handeleCheckboxChange = (name: string, val: boolean | string | any) => {
        setDataSource(
            produce(dataSource, (draftState: any) => {
                draftState[name] = val
            })
        )
    }

    const checkAll = SERVER_INFO_CONFIG.length === server_info_config.length;
    const indeterminate = server_info_config.length > 0 && server_info_config.length < SERVER_INFO_CONFIG.length;

    return (
        <Space
            direction="vertical"
            style={{ width: "100%", background: "#fff", padding: 20 }}
        >
            <Checkbox
                {...props}
                id={name}
                disabled={!contrl}
                onChange={({ target }) => handeleCheckboxChange(name, target.checked)}
                checked={dataSource[name]}
            >
                {title}
            </Checkbox>
            {
                desc &&
                <Input.TextArea
                    placeholder={formatMessage({ id: 'please.enter' })}
                    allowClear
                    disabled={!dataSource[name]}
                    value={dataSource[desc]}
                    onChange={({ target }: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handeleCheckboxChange(desc, target.value)
                    }}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                />
            }

            {
                name === 'need_test_env' &&
                <>
                    <Divider style={{ margin: '8px 0' }} />
                    <Checkbox
                        indeterminate={indeterminate}
                        onChange={(e) => handeleCheckboxChange('server_info_config', e.target.checked ? SERVER_INFO_CONFIG : [])}
                        checked={checkAll}
                    >
                        全选
                    </Checkbox>
                    <Checkbox.Group
                        onChange={(ls) => handeleCheckboxChange('server_info_config', ls)}
                        disabled={!dataSource[name]}
                        value={server_info_config || []}
                        options={reportServerArray.map(([label, value]) => ({
                            label,
                            value
                        }))}
                    />
                </>
            }
        </Space>
    )
}

const TemplatePage: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { route } = props
    const { ws_id, temp_id } = useParams() as any
    const access = useAccess()
    const [loading, setLoading] = useState(false)
    const [isPreview, setIsPreview] = React.useState(false)
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
        func_conf: funcDefaultConf,
        perf_item: [],
        func_item: [],
        server_info_config: SERVER_INFO_CONFIG
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

    const refreshRowkey = (data: any) => {
        return data.map((item: any) => {
            if (item.list) {
                return {
                    ...item,
                    rowkey: uuidv4(),
                    list: refreshRowkey(item.list)
                }
            }
            return { ...item, rowkey: uuidv4() }
        })
    }

    const editPageSetData = async () => {
        setLoading(true)
        const { data } = await queryReportTemplateDetails({ ws_id, id: temp_id })

        const {
            perf_item, func_item, perf_conf, func_conf,
            server_info_config
        } = data
        setContrl(access.WsMemberOperateSelf(data.creator))

        const params: any = {
            server_info_config: server_info_config ? JSON.parse(server_info_config?.replace(/\'/g, '"')) : SERVER_INFO_CONFIG,
            func_conf: func_conf || funcDefaultConf,
            perf_conf: perf_conf || defaultConf,
            perf_item: refreshRowkey(perf_item),
            func_item: refreshRowkey(func_item)
        }

        document.title = `${data.name} - T-One`
        setDataSource(Object.assign(data, params))
        setLoading(false)
    }

    const createPageSetData = async () => {
        setContrl(access.IsWsSetting())
    }

    useEffect(() => {
        if (route.name === 'TemplateEdit') editPageSetData()
        if (route.name === 'TemplateCreate') createPageSetData()
        else {
            document.title = `${formatMessage({ id: 'report.create.report.template' })} - T-One`
            setLoading(false)
        }
        return () => {
            setLoading(true)
        }
    }, [route.name])

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

    const queryItemData = (cur: any, idx: number) => {
        const len = cur.list.length
        return {
            name: formatMessage({ id: 'report.test.item.num' }, { data: `${idx + 1}-${len + 1}` }),
            rowkey: uuidv4(),
            list: [{
                test_suite_id: null,
                suite_show_name: "suite",
                case_source: [],
                rowkey: uuidv4()
            }]
        }
    }

    const filterGroupList = (data: any, rowkey: string) => {
        return data.reduce((pre: any, cur: any, idx: number) => {
            if (cur.rowkey === rowkey) {
                if (cur.is_group)
                    return pre.concat({
                        ...cur,
                        list: cur.list.concat(queryItemData(cur, idx))
                    })
                return pre.concat(queryItemData(cur, idx))
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


    const handleSelectSuiteOk = ({ result, rowkey, testType }: any) => handleFieldChange(result, 'list', rowkey, testType)

    const checkName = (data: any) => {
        const obj: any = {}
        for (let x = 0, len = data.length; x < len; x++) {
            const { name } = data[x]
            if (obj[name]) {
                throw formatMessage({ id: 'report.please.check' })
            }
            obj[name] = name
        }
    }

    const compare = (data: any) => {
        checkName(data)
        /* 
           // 清空空项逻辑 
        const result = data.reduce((pre: any, cur: any) => {
            if ('test_suite_id' in cur)
                return cur.case_source.length === 0 ? pre : pre.concat(cur)
            if (cur.list.length > 0) {
                const list = compare(cur.list)
                return list.length > 0 ? pre.concat({ ...cur, list }) : pre
            }
            return pre
        }, []) */

        // 空项不清空逻辑
        const result = data.reduce((pre: any, cur: any) => {
            const { list } = cur
            if ('test_suite_id' in cur)
                return cur.case_source.length === 0 ? pre : pre.concat(cur)
            if (list && list.length > 0) {
                return pre.concat({ ...cur, list: compare(list) })
            }
            return pre.concat(cur)
        }, [])
        return result
    }

    const handleFormSave = async (params: any) => {
        setLoading(true)

        const data = route.name === 'TemplateEdit' ?
            await updateReportTemplate({ ws_id, id: temp_id, ...params }) :
            await createReportTemplate(params)

        if (data.code === 200)
            history.push(`/ws/${ws_id}/test_report?t=template`)
        else requestCodeMessage(data.code, data.message)
        setLoading(false)
    }

    const hasSuiteCheck = (conf_list: any[]) => {
        for (let x of conf_list) {
            const { is_group, list } = x
            if (is_group) {
                const $boolean = hasSuiteCheck(list)
                if ($boolean) return true
            }
            else
                if (list.length > 0) return true
        }
        return false
    }

    const hanldeSaveOk = async () => {
        if (loading) return
        const { perf_item, func_item, name } = dataSource
        // if (!need_perf_data && !need_func_data)
        //     return message.warning('未添加测试数据！')
        if (!name)
            return message.warning(formatMessage({ id: 'report.template.cannot.be.empty' }))

        try {
            const perfs = await compare(perf_item)
            const funcs = await compare(func_item)

            const isHasSuite = hasSuiteCheck(perfs.concat(funcs))

            const params = {
                ...dataSource,
                perf_item: perfs,
                func_item: funcs
            }
            if (isHasSuite) return handleFormSave(params)

            Modal.confirm({
                title: formatMessage({
                    id: `report.template.confirm.title`,
                    defaultMessage: "提示"
                }),
                centered: true,
                content: formatMessage({
                    id: `report.template.confirm.content`,
                    defaultMessage: "测试项缺少用例，是否继续保存？"
                }),
                icon: <ExclamationCircleFilled />,
                async onOk() {
                    handleFormSave(params)
                },
                onCancel() {
                    setLoading(false)
                },
            });
        }
        catch (err: any) {
            message.warning(err)
            setLoading(false)
        }
    }

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
                    <Catalog {...{ dataSource, setDataSource, collapsed, setCollapsed, contrl }} />
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
                                        placeholder={formatMessage({ id: 'report.name.input' })}
                                        value={dataSource.name}
                                        onChange={({ target }) => hanldeEditIssueInput('name', target.value)}
                                    />
                                    <Input.TextArea
                                        onChange={({ target }) => hanldeEditIssueInput('description', target.value)}
                                        style={{ width: '100%' }}
                                        value={dataSource.description}
                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                        placeholder={formatMessage({ id: 'report.description.textArea' })}
                                    />
                                </Space>
                            </ReportIssue>
                            {/* 基础信息 */}
                            <Space
                                direction="vertical"
                                style={{ width: "100%", marginTop: 20 }}
                                size={20}
                            >
                                {
                                    [
                                        [formatMessage({ id: 'report.test.background' }), "need_test_background", "background_desc"],
                                        [formatMessage({ id: 'report.test.method' }), "need_test_method", "test_method_desc"],
                                        [formatMessage({ id: 'report.test.conclusion' }), "need_test_conclusion", "test_conclusion_desc"],
                                        ["Summary", "need_test_summary"],
                                        [formatMessage({ id: 'report.env.description' }), "need_env_description", "env_description_desc"],
                                        [formatMessage({ id: 'report.server.env' }), "need_test_env"],
                                    ].map((item: any) => {
                                        const [title, name, desc] = item
                                        return (
                                            <RenderCheckbox
                                                key={name}
                                                title={title}
                                                name={name}
                                                desc={desc}
                                            />
                                        )
                                    })
                                }
                            </Space>
                            {/* 测试数据 */}
                            <div style={{ padding: 20, background: '#fff', marginTop: 20 }} >
                                <ProjectTitle id="test_data">
                                    <FormattedMessage id="report.test.data" />
                                </ProjectTitle>
                                {
                                    ["performance", "functional"].map((i) => (
                                        <RenderTestBody key={i} testType={i} />
                                    ))
                                }
                            </div>
                        </ReportBody>
                    </ReportBodyContainer>

                    <TemplateBar justify="end" align="middle">
                        <Space>
                            <Button onClick={() => setIsPreview(true)}><FormattedMessage id="operation.preview" /></Button>
                            {
                                !dataSource.is_default &&
                                <Access accessible={contrl}>
                                    <Button type="primary" onClick={hanldeSaveOk}>
                                        {route.name === 'TemplateEdit' ? <FormattedMessage id="report.update.report.template" /> : <FormattedMessage id="report.save.report.template" />}
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
            {
                isPreview &&
                <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, top: 0, zIndex: 9999 }}>
                    <Preview {...props} dataSet={dataSource} setIsPreview={setIsPreview} />
                </div>
            }
        </ReportTemplateContext.Provider>
    )
}

export default TemplatePage