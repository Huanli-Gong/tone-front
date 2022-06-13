import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Radio, Tag, Tooltip, Layout, Space, Typography, Popconfirm, message, Tabs, Row, Input, Divider, Form, Col, Select, DatePicker, Button, Modal, Checkbox, Spin } from 'antd';
import { useAccess, Access } from 'umi'
import { useClientSize, writeDocumentTitle } from '@/utils/hooks'
import { DownOutlined, UpOutlined, PlusCircleTwoTone, MinusCircleTwoTone, StarOutlined, StarFilled, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import { ReactComponent as Refresh } from '@/assets/svg/refresh.svg'
import { requestCodeMessage, targetJump } from '@/utils/utils'
import { QusetionIconTootip } from '@/components/Product';
import {
    queryTestResultList,
    deleteJobTest,
    addMyCollection,
    deleteMyCollection,
    queryCreators,
    queryTag,
    queryTestServer,
    queryTestSuite,
    queryJobType,
    queryProjectId,
    queryTestCloudServer
} from './services'
import CommonPagination from '@/components/CommonPagination';

import styles from './index.less'
import { JobListStateTag } from './Details/components/index'
import lodash from 'lodash'
import { stringify } from 'querystring'

import ViewReport from './CompareBar/ViewReport'
import CompareBar from './CompareBar/index'
import Clipboard from 'clipboard'

import ResizeTable from '@/components/ResizeTable'
import moment from 'moment';

const { RangePicker } = DatePicker

const leftOptions = [
    { name: 'JobID', id: 'job_id' },
    { name: 'Job名称', id: 'name' },
    { name: '失败case', id: 'fail_case' }, // 可输入多个
    { name: '创建人', id: 'creators' }, // 可选择多个 // api/auth/user/
    { name: 'Job标签', id: 'tags' }, // 可选择多个 // /api/job/tag/ws_id=xxx  标签
    { name: '状态', id: 'state' },  // Pending（pending）、Running（running）、Success、Fail、Stop  状态
    { name: '测试机', id: 'server' }, // api/server/test_server//? ws_id=4
    { name: 'TestSuite', id: 'test_suite' }, // 可选择多个 // api/case/test_suite/? page_num=4 & page_size=1000
    { name: 'Job类型', id: 'job_type_id' }, // api/job/type/?ws_id=xxx
    { name: '测试类型', id: 'test_type' }, // 功能测试（functional）、性能测试（performance）
    { name: '所属项目', id: 'project_id' } // /api/sys/product/?ws_id=xxx   # 所属项目
];

const timeOptions = [
    { name: '开始时间', id: 'start_time' },
    { name: '完成时间', id: 'end_time' }
]

let initData: any = {};
leftOptions.forEach(item => initData[item.id] = []); // 有用
initData.state = [
    { id: 'success', name: 'Complete', bgColor: '#81BF84' },
    { id: 'running', name: 'Running', bgColor: '#649FF6' },
    { id: 'fail', name: 'Fail', bgColor: '#C84C5A' },
    { id: 'pending', name: 'Pending', bgColor: '#D9D9D9', color: '#1d1d1d' },
    { id: 'stop', name: 'Stop', bgColor: '#D9D9D9', color: '#1d1d1d' },
    { id: 'skip', name: 'Skip', bgColor: '#D9D9D9', color: '#1d1d1d' }
]

const jobStateKeys = [
    { name: '全部', key: 'all_job', val: '', },
    { name: 'Pending', key: 'pending_job', val: 'pending' },
    { name: 'Running', key: 'running_job', val: 'running' },
    { name: 'Complete', key: 'success_job', val: 'success' },
    { name: 'Fail', key: 'fail_job', val: 'fail' },
]

initData.test_type = [{ id: 'functional', name: '功能测试' }, { id: 'performance', name: '性能测试' }, { id: 'business', name: '业务测试' },]

const tagColorFn = (arr: any[]) => {
    return arr.map(item => {
        return (
            <Tag color={item.bgColor} style={{ fontWeight: 500, textAlign: 'center', marginLeft: 3, marginRight: 0, transform: 'translateY(-6px)' }} >{item.name}</Tag>
        )
    })
}

const stateColorFn = (state: any) => {
    if (!state) return <></>
    switch (state.id) {
        case 'success': return <Tag className={styles.stateColorFn} color='#81BF84'  >Complete</Tag>
        case 'running': return <Tag color='#649FF6' className={styles.stateColorFn}>Running</Tag>
        case 'fail': return <Tag color='#C84C5A' className={styles.stateColorFn}>Fail</Tag>
        case 'pending': return <Tag color='#D9D9D9' style={{ color: '#1d1d1d' }} className={styles.stateColorFn}>Pending</Tag>
        case 'stop': return <Tag color='#D9D9D9' style={{ color: '#1d1d1d' }} className={styles.stateColorFn}>Stop</Tag>
        case 'skip': return <Tag color='#D9D9D9' style={{ color: '#1d1d1d' }} className={styles.stateColorFn}>Skip</Tag>
        default: return <></>
    }
}

const queryTypeArr = ['creators', 'tags', 'test_suite', 'job_type_id', 'server', 'project_id']

const tabThree = [
    { tab: '全部Job', key: 'all' },
    { tab: '我创建的Job', key: 'my' },
    { tab: '我的收藏', key: 'collection' }
]
const tabSingle = [
    { tab: '全部Job', key: 'all' },
]
const tagRender = ({ label, closable, onClose, value }: any) => {
    return (
        <Tag
            color={label.props?.color}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label.props?.children || value}
        </Tag>
    )
}

const stateRender = ({ label, value }: any) => {
    return (
        <Tag
            color={label.props?.color}
            closable={false}
            style={{ marginRight: 3 }}
        >
            {label.props?.children || value}
        </Tag>
    )
}

let flag = false
/**
 * 测试结果列表页
 */
export const reRunCheckedText = '使用原Job使用的机器'
export default (props: any) => {
    const { ws_id } = props.match.params
    const { location: { query } } = props
    writeDocumentTitle(`Workspace.${props.route.name}`)
    const access = useAccess()
    const PAGE_DEFAULT_PARAMS: any = { page_num: 1, page_size: 20, ws_id, state: '', search: null, tab: 'all' }

    const INITIAL_STATE_TIME = [
        '',
        moment(moment().hours(23).minutes(59).seconds(59), 'YYYY-MM-DD HH:mm:ss')
    ]

    let page_default_params_copy = lodash.cloneDeep(PAGE_DEFAULT_PARAMS)

    const [filter, setFilter] = useState(false)
    const [visible, setVisible] = useState(false)
    const [modalData, setModalData] = useState<any>({})
    const [tab, setTab] = useState(query.tab || 'all')
    const [searchInp, setSearchInp] = useState<any>('')
    const [projectData, setProjectData] = useState<any>(initData)
    const [leftSelectProjectList, setLeftSelectProjectList] = useState([])
    const [filterData, setFilterData] = useState({})
    const [filterparmas, setFilterparmas] = useState({})
    const [key, setKey] = useState(1)
    const [formFieldsValue, setFormFieldsValue] = useState<any>({ project: [], time: [] })
    const [form] = Form.useForm()
    const [exportModalForm] = Form.useForm()

    const [tabLoading, setTabLoading] = useState(true)

    const [dataSource, setDataSource] = useState<any>()
    const [isloading, setIsloading] = useState(true)

    const [urlQuery, setUrlQuery] = useState<any>(null)

    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [selectRowData, setSelectRowData] = useState<any>([])

    const [radioValue, setRadioValue] = useState<number>(1)

    const [shareParmas, setShareParmas] = useState('')
    const allReport: any = useRef(null)
    const projectDataCopy = useRef({})
    const serverSelect: any = useRef(null)
    const [serverVal, setServerVal] = useState<any>(null)

    const [loading, setLoading] = useState(true)

    const [pageCountSource, setPageCountSource] = useState<any>()
    // 重跑选项之一
    const [reRunChecked, setReRunChecked] = useState(false)
    const findDefaultVal = (projectName: []) => {
        const crr: Array<any> = []
        projectName.forEach((value: any) => {
            if (value && value.name) crr.push(value.name)
        })
        const arr = leftOptions.filter((item: any) => !crr.includes(item.id))
        return arr
    }
    const [pageParams, setPageParams] = useState<any>(JSON.stringify(query) !== '{}' ? query : PAGE_DEFAULT_PARAMS)

    const DEFAULT_COUNT_PARAMS = { query_count: 1, ws_id, tab: 'all' }
    const queryTestListCount = async (params: any = DEFAULT_COUNT_PARAMS) => {
        setTabLoading(true)
        const { ws_id, query_count, tab } = params
        const data = await queryTestResultList({ ws_id, query_count, tab })
        const { code, msg } = data
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        setPageCountSource(data)
        setTabLoading(false)
    }

    const queryTestListTableData = async (params: any = pageParams) => {
        setLoading(true)
        queryTestListCount({ ...DEFAULT_COUNT_PARAMS, ...params })
        setPageParams(params)
        const data = await queryTestResultList(params)
        const { code, msg } = data
        if (code !== 200) {
            requestCodeMessage(code, msg)
            setLoading(false)
            setPageParams(pageParams)
            return
        }
        setDataSource(data)
        setLoading(false)
    }

    const getPageData = async (params: any = pageParams) => {
        await queryTestListTableData(params)
    }

    const getQueryData = () => {
        if (JSON.stringify(query) !== '{}') {
            const { page_num, ws_id, page_size, tab, search, start_time, end_time, ...projectQuery } = query
            let project: any = []
            let time = []
            let parmasQuery = lodash.cloneDeep(projectQuery)
            let creation_time = {}
            let completion_time = {}
            let filterDataShow = lodash.cloneDeep(projectQuery)
            if (lodash.isArray(start_time) && start_time.length) {
                time.push({
                    name: 'start_time',
                    date: start_time.map((i: any) => i ? moment(i) : '')
                })
                creation_time['start_time'] = start_time[0]
                creation_time['end_time'] = start_time[1]
                filterDataShow.creation_time = creation_time
                parmasQuery.creation_time = JSON.stringify(creation_time)
            }
            if (lodash.isArray(end_time) && end_time.length) {
                time.push({
                    name: 'end_time',
                    date: end_time.map((i: any) => i ? moment(i) : '')
                })
                completion_time['start_time'] = start_time[0]
                completion_time['end_time'] = start_time[1]
                filterDataShow.completion_time = completion_time
                parmasQuery.completion_time = JSON.stringify(completion_time)
            }

            Object.entries(projectQuery).forEach((objArr: any) => {
                if (queryTypeArr.includes(objArr[0])) {
                    queryApi(objArr[0])
                    project.push({ name: objArr[0], id: filterDataShow[`${objArr[0]}_name`] || undefined })
                    filterDataShow[`${objArr[0]}`] = filterDataShow[`${objArr[0]}_name`]
                    delete filterDataShow[`${objArr[0]}_name`]
                    delete parmasQuery[`${objArr[0]}_name`]
                    return
                }
                if (!queryTypeArr.includes(objArr[0]) && !queryTypeArr.includes(objArr[0].slice(0, -5))) {
                    let idVal = objArr[1]
                    let nameVal = objArr[0]
                    if (nameVal === 'state') {
                        const obj = lodash.find(initData.state, ['id', idVal])
                        idVal = obj && obj.name
                        filterDataShow[nameVal] = idVal || undefined
                    }
                    project.push({ name: nameVal, id: idVal || undefined })
                }
            })

            page_default_params_copy = { ...page_default_params_copy, ...parmasQuery }
            setFormFieldsValue({ project, time })
            setFilterData(filterDataShow)
            setFilterparmas(page_default_params_copy)
        }
        return { ...page_default_params_copy, tab }
    }

    const initPage = async () => {
        setIsloading(true)

        const params = getQueryData()
        await getPageData(params)

        setKey(+new Date())
        setIsloading(false)
    }

    /* page init fetch data */
    useEffect(() => {
        initPage()
        return () => {
            setSelectedRowKeys([])
            setSelectRowData([])
            setTab('all')
            filterReset()
        }
    }, [ws_id])

    useEffect(() => {
        setSelectedRowKeys([])
        setSelectRowData([])
    }, [radioValue])

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteJobTest({ job_id: _.id })
        if (code === 200) {
            const selectedKeys = selectedRowKeys.filter((keys: any) => Number(keys) !== Number(_.id))
            const selectRows = selectRowData.filter((obj: any) => obj && Number(obj.id) !== Number(_.id))
            setSelectedRowKeys(selectedKeys);
            setSelectRowData(selectRows);
            // setDataSourceFlag(true)
            message.success('操作成功！')
            setLoading(true)
            getPageData()
        }
        else requestCodeMessage(code, msg)
    }

    const handleClickStar = async (item: any, flag: any) => {
        const { msg, code } = !item.collection ? await addMyCollection({ job_id: item.id }) : await deleteMyCollection({ job_id: item.id })
        if (code !== 200) return requestCodeMessage(code, msg)
        let obj: any = lodash.cloneDeep(dataSource)
        obj.data = obj.data.map((obj: any) => {
            if (obj.id === item.id) obj.collection = flag
            return obj
        })
        if (flag) obj.collection_job = Number(obj.collection_job) + 1
        if (!flag) {
            obj.collection_job = Number(obj.collection_job) - 1
            if (obj.collection_job < 0) obj.collection_job = 0
        }
        setDataSource(obj)

        const data = await queryTestResultList(DEFAULT_COUNT_PARAMS)
        setPageCountSource(data)
    }

    const getText = useCallback((id: string) => {
        switch (id) {
            case 'job_id': return '请输入JobID'
            case 'name': return '请输入Job名称'
            case 'fail_case': return '请输入多个失败case,多个以英文逗号分隔'
            case 'creators': return '请选择创建人'
            case 'tags': return '请选择标签'
            case 'state': return '请选择状态'
            case 'server': return '请选择测试机'
            case 'test_suite': return '请选择TestSuite'
            case 'job_type_id': return '请选择Job类型'
            case 'test_type': return '请选择测试类型'
            case 'project_id': return '请选择所属项目'
            default: return ''
        }
    }, [])

    const projectDataSetKey = (id: any, result: any) => {
        if (result.code === 200) {
            let option: any = result.data && lodash.isArray(result.data) ? result.data : []
            if (option.length) {
                if (id === 'creators')
                    option = option.map((item: any) => ({ ...item, name: item.first_name || item.last_name }))
                if (id === 'tags')
                    option = option.map((item: any) => ({ ...item, bgColor: item.tag_color }))
                if (id === 'project_id')
                    option = option.map((item: any) => ({ ...item, name: `${item.name}（${item.product_name}）` }))
                projectDataCopy.current[id] = option
                setProjectData({ ...projectData, ...projectDataCopy.current, [id]: option }) // 有用
            }
        }
    }

    const queryApi = async (id: any) => {
        let queryFunc: any
        const DEFAULT_QUERY_API_PARAMS = { ws_id, page_size: 999, page_num: 1 }
        if (id === 'server') {
            const promises = [
                queryTestServer({ ws_id, page_size: 999 }),
                queryTestCloudServer({ ws_id, page_size: 999 })
            ];
            const allResultArr = await Promise.allSettled(promises);
            let optionArr: any = []
            allResultArr.forEach((obj: any, index) => {
                const result = obj && obj.value
                // let physicalMachine = {}
                // let virtualMachine = {}
                if (result.code === 200) {
                    let option = result.data && lodash.isArray(result.data) ? result.data : []
                    let virtualOption: any = []
                    if (index === 1) option = option.filter((obj: any) => obj && obj.is_instance)
                    if (option.length) {
                        option = option.map((item: any) => {
                            if (item.sub_server_list && item.sub_server_list.length > 0) {
                                virtualOption = item.sub_server_list.map((child: any) => ({ id: child.id, name: child.ip, provider: child.device_mode }))
                            }
                            // physicalMachine = { id: item.id, name: index === 0 ? item.ip : item.private_ip, provider: index === 0 ? 'aligroup' : 'aliyun' }
                            // virtualMachine = item.sub_server_list.map((child:any)=> ({ id: child.id, name: child.ip, provider: child.device_mode }))
                            return ({ id: item.id, name: index === 0 ? item.ip : item.private_ip, provider: index === 0 ? 'aligroup' : 'aliyun' })
                        })

                        optionArr = [...optionArr, ...option, ...virtualOption]
                    }
                }
            })
            projectDataCopy.current[id] = optionArr
            setProjectData({ ...projectData, ...projectDataCopy.current, [id]: optionArr }) // 有用
            return
        }
        if (id === 'creators') queryFunc = queryCreators
        if (id === 'tags') queryFunc = queryTag
        if (id === 'test_suite') queryFunc = queryTestSuite
        if (id === 'job_type_id') queryFunc = queryJobType
        if (id === 'project_id') queryFunc = queryProjectId

        if (queryFunc) {
            const result = await queryFunc(DEFAULT_QUERY_API_PARAMS)
            projectDataSetKey(id, result)
        }
    }

    const leftHandleChange = async (id: any) => {
        const fieldsValue = lodash.cloneDeep(form.getFieldsValue())
        let project = fieldsValue && lodash.isArray(fieldsValue.project) ? fieldsValue.project : [];
        project = project.map((item: any) => {
            if (item.name === id) delete item.id
            return item;
        })
        fieldsValue.project = project;
        setLeftSelectProjectList(project)
        form.setFieldsValue(fieldsValue)
        queryApi(id)
    }

    const timeHandleChange = async () => {
        form.setFieldsValue(form.getFieldsValue())
    }

    const handleRadioChange = useCallback(
        (e: any) => {
            setRadioValue(e.target.value);
        }, []
    )

    const handleMoreDelCancle = useCallback(
        () => {
            setSelectedRowKeys([])
            setSelectRowData([])
        }, []
    )

    const handleMoreDeleOk = async () => {
        if (!selectedRowKeys.length) return
        const { code, msg } = await deleteJobTest({ job_id_li: selectedRowKeys })
        if (code === 200) {
            setSelectedRowKeys([]);
            setSelectRowData([]);
            // setDataSourceFlag(true)
            message.success('操作成功！')
            const { page_num, page_size } = pageParams
            const { total } = dataSource
            const num = (total - selectedRowKeys.length) / page_size
            const new_page_num = page_num > Math.ceil(num) ? page_num - 1 : page_num
            getPageData({ ...pageParams, page_num: new_page_num >= 1 ? new_page_num : 1 })
        } else requestCodeMessage(code, msg)
    }

    const sortStartTime = (sorter: any) => {
        let newData = lodash.cloneDeep(dataSource)
        switch (sorter.order) {
            case undefined:
                setDataSource(newData)
                break;
            case 'descend':
                setDataSource({
                    ...newData,
                    data: newData?.data.sort(function (a: any, b: any) {
                        return a.start_time < b.start_time ? 1 : -1
                    })
                })
                break;
            case 'ascend':
                setDataSource({
                    ...newData,
                    data: newData?.data.sort(function (a: any, b: any) {
                        return a.start_time > b.start_time ? 1 : -1
                    })
                })
                break;
            default:
                break;
        }
    }

    const columns: any = useMemo(() => {
        return (
            [
                access.wsRoleContrl() && {
                    title: '',
                    width: 30,
                    align: 'center',
                    fixed: 'left',
                    className: 'collection_star result_job_hover_span',
                    render: (_: any) => (
                        <div onClick={() => handleClickStar(_, !_.collection)}>
                            {
                                _.collection ?
                                    <StarFilled className="is_collection_star" style={{ color: '#F7B500' }} /> :
                                    <StarOutlined className="no_collection_star" />
                            }
                        </div>
                    )
                },
                {
                    title: 'JobID',
                    dataIndex: 'id',
                    fixed: 'left',
                    width: 80,
                    ellipsis: true,
                    className: 'result_job_hover_span',
                    render: (_: any) => <span onClick={() => targetJump(`/ws/${ws_id}/test_result/${_}`)}>{_}</span>
                }, {
                    title: 'Job名称',
                    dataIndex: 'name',
                    width: 200,
                    ellipsis: {
                        shwoTitle: false,
                    },
                    className: 'result_job_hover_span',
                    render: (_: any, row: any) => (
                        row.created_from === 'offline' ?
                            <>
                                <span className={styles.offline_flag}>离</span>
                                <Tooltip placement="topLeft" title={_}>
                                    <span onClick={() => targetJump(`/ws/${ws_id}/test_result/${row.id}`)} style={{ cursor: 'pointer' }}>
                                        {_}
                                    </span>
                                </Tooltip>
                            </>
                            :
                            <Tooltip title={_}>
                                <span onClick={() => targetJump(`/ws/${ws_id}/test_result/${row.id}`)} style={{ cursor: 'pointer' }}>
                                    {_}
                                </span>
                            </Tooltip>
                    )
                }, {
                    title: '状态',
                    width: 120,
                    dataIndex: 'state',
                    render: (_: any, row: any) => <JobListStateTag {...row} />
                }, {
                    title: '测试类型',
                    width: 100,
                    dataIndex: 'test_type',
                    ellipsis: true,
                }, {
                    title: (
                        <QusetionIconTootip
                            placement="bottomLeft"
                            title={'总计/成功/失败'}
                            desc={
                                <ul style={{ paddingInlineStart: 'inherit', paddingTop: 15 }}>
                                    <li>功能测试：测试结果中TestConf结果状态统计。</li>
                                    <li>性能测试：执行结果中TestConf执行状态统计。</li>
                                </ul>
                            }
                        />
                    ),
                    dataIndex: 'test_result',
                    width: 140,

                    render: (_: any) => {
                        const result = JSON.parse(_)
                        if (lodash.isNull(result)) {
                            return (
                                <Row>
                                    <Col span={8} style={{ color: "#1890FF" }} >-</Col>
                                    <Col span={8} style={{ color: "#52C41A" }} >-</Col>
                                    <Col span={8} style={{ color: "#FF4D4F" }} >-</Col>
                                </Row>
                            )
                        } else {
                            return (
                                <Row>
                                    <Col span={8} style={{ color: "#1890FF" }} >{result.total}</Col>
                                    <Col span={8} style={{ color: "#52C41A" }} >{result.pass}</Col>
                                    <Col span={8} style={{ color: "#FF4D4F" }} >{result.fail}</Col>
                                </Row>
                            )
                        }
                    }
                }, {
                    title: '所属项目',
                    width: 120,
                    dataIndex: 'project_name',
                    ellipsis: {
                        shwoTitle: false,
                    },
                    render: (_: any) => (
                        <Tooltip title={_ || '-'} placement="topLeft">
                            {_ || '-'}
                        </Tooltip>
                    )
                }, {
                    title: '创建人',
                    width: 80,
                    ellipsis: {
                        shwoTitle: false,
                    },
                    dataIndex: 'creator_name',
                    render: (_: any) => (
                        <Tooltip title={_ || '-'} placement="topLeft">
                            {_ || '-'}
                        </Tooltip>
                    )
                }, {
                    title: '开始时间',
                    width: 180,
                    dataIndex: 'start_time',
                    ellipsis: {
                        shwoTitle: false,
                    },
                    sorter: true,
                    render: (_: any) => (
                        <Tooltip title={_ || '-'} placement="topLeft">
                            {_ || '-'}
                        </Tooltip>
                    )
                }, {
                    title: '完成时间',
                    width: 180,
                    ellipsis: {
                        shwoTitle: false,
                    },
                    dataIndex: 'end_time',
                    render: (_: any) => (
                        <Tooltip title={_ || '-'} placement="topLeft">
                            {_ || '-'}
                        </Tooltip>
                    )
                },
                access.wsRoleContrl() &&
                {
                    title: '操作',
                    width: 160,
                    fixed: 'right',
                    render: (_: any) => {
                        const disableStyle = { color: '#ccc', cursor: 'no-drop' }
                        const commonStyle = { color: '#1890FF', cursor: 'pointer' }
                        return (
                            <Space>
                                <Access accessible={access.wsRoleContrl(_.creator)}
                                    fallback={
                                        <Space>
                                            <Typography.Text style={disableStyle}>重跑</Typography.Text>
                                            <Typography.Text style={disableStyle}>删除</Typography.Text>
                                        </Space>
                                    }
                                >
                                    <Space>
                                        <span onClick={_.created_from === 'offline' ? undefined : () => handleTestReRun(_)}>
                                            <Typography.Text style={_.created_from === 'offline' ? disableStyle : commonStyle}>重跑</Typography.Text>
                                        </span>
                                        <Popconfirm
                                            title="确定要删除吗？"
                                            onConfirm={() => handleDelete(_)}
                                            okText="确认"
                                            cancelText="取消"
                                        >
                                            <Typography.Text style={commonStyle}>
                                                删除
                                            </Typography.Text>
                                        </Popconfirm>
                                    </Space>
                                </Access>
                                <ViewReport viewAllReport={allReport} dreType="left" ws_id={ws_id} jobInfo={_} origin={'jobList'} />
                            </Space>
                        )
                    }
                }
            ].filter(Boolean)
        )
    }, [dataSource])


    const handleTestReRun = (row: any) => {
        setModalData(row)
        setVisible(true)
    }

    const handleOpenFilter = () => {
        if (!filter) {
            const data = lodash.cloneDeep(formFieldsValue)
            if (formFieldsValue && !formFieldsValue.project.length) {
                data.project = [{ name: 'job_id', id: undefined }]
            }
            if (formFieldsValue && !formFieldsValue.time.length) {
                data.time = [{ name: 'start_time', date: INITIAL_STATE_TIME }]
            }
            setLeftSelectProjectList(data.project)
            form.setFieldsValue(data)
        }
        setFilter(!filter)
    }

    const handleClear = () => {
        setLeftSelectProjectList([])
        setFormFieldsValue({ project: [], time: [] })
        setFilterData({})
        setFilterparmas({})
        setUrlQuery(null)
        setShareParmas(location.origin + location.pathname)
        queryTestListTableData({ ...PAGE_DEFAULT_PARAMS, search: searchInp, tab })
    }

    const handleRefresh = (e: any) => {
        e.stopPropagation()
        queryTestListTableData()
    }

    const hanldeClickShare = () => {
        const clipboard = new Clipboard('.test_analysis_copy_link', { text: () => shareParmas })
        clipboard.on('success', function (e: any) {
            message.success('复制成功')
            e.clearSelection();
        });

        (document.querySelector('.test_analysis_copy_link') as any).click()
        clipboard.destroy()
    }

    const filterReset = useCallback(
        (data?: any) => {
            setLoading(true)
            setLeftSelectProjectList([])
            if (!data) {
                setFormFieldsValue({ project: [], time: [] })
                setFilterData({})
                setFilterparmas({})
                setFilter(false)
            }

            setSearchInp('')
        }, []
    )

    const handleFormData = (values: any, projectData: any) => {
        let time = values && lodash.isArray(values.time) ? values.time : []
        let project = values && lodash.isArray(values.project) ? values.project : []

        let creation_time: any = {};
        let completion_time: any = {};
        time.forEach((item: any) => {
            if (item.name === 'start_time' && lodash.isArray(item.date) && item.date[0] && lodash.isString(item.date[0])) {
                creation_time.start_time = moment(item.date[0]).format('YYYY-MM-DD HH:mm:ss')
                creation_time.end_time = moment(item.date[1]).format('YYYY-MM-DD HH:mm:ss')
            }
            if (item.name === 'end_time' && lodash.isArray(item.date) && item.date[0] && lodash.isString(item.date[0])) {
                completion_time.start_time = moment(item.date[0]).format('YYYY-MM-DD HH:mm:ss')
                completion_time.end_time = moment(item.date[1]).format('YYYY-MM-DD HH:mm:ss')
            }
            if (item.name === 'start_time' && lodash.isArray(item.date) && item.date[0] && !lodash.isString(item.date[0])) {
                creation_time.start_time = item.date[0].format('YYYY-MM-DD HH:mm:ss')
                creation_time.end_time = item.date[1].format('YYYY-MM-DD HH:mm:ss')
            }
            if (item.name === 'end_time' && lodash.isArray(item.date) && item.date[0] && !lodash.isString(item.date[0])) {
                completion_time.start_time = item.date[0].format('YYYY-MM-DD HH:mm:ss')
                completion_time.end_time = item.date[1].format('YYYY-MM-DD HH:mm:ss')
            }
        })

        const parmas: any = {};
        const filterData: any = {};
        project.forEach((item: any) => {
            if (item && item.name && item.id) {
                const key = item.name
                parmas[key] = item.id
                if (item.id) filterData[key] = item.id

                if (key === 'job_id') {
                    parmas[key] = lodash.isNaN(Number(item.id)) ? item.id : Number(item.id)
                }
                if (key === 'job_type_id' || key === 'test_type' || key === 'state') {
                    const jobType = projectData[key].filter((obj: any) => obj.name === item.id)[0]
                    if (jobType) {
                        parmas[key] = lodash.isNaN(Number(jobType.id)) ? jobType.id : Number(jobType.id)
                    }
                }
                if (key === 'server') {
                    const jobType = projectData[key].filter((obj: any) => obj.name === item.id)[0]
                    if (jobType) {
                        // parmas[key] = lodash.isNaN(Number(jobType.name)) ? { server_id: jobType.name, provider: jobType.provider } : { server_id: Number(jobType.name), provider: jobType.provider } 有用
                        parmas[key] = lodash.isNaN(Number(jobType.name)) ? jobType.name : Number(jobType.name)
                        // 是传对象还是json对象？
                    }
                }

                if (key === 'project_id') {
                    const jobType = projectData[key].filter((obj: any) => obj.name === item.id)[0]
                    if (jobType) {
                        parmas[key] = lodash.isNaN(Number(jobType.id)) ? jobType.id : Number(jobType.id)
                    }
                }
                if (key === 'creators' || key === 'tags' || key === 'test_suite') {
                    const idArr: any = []
                    projectData[key].forEach((obj: any) => {
                        if (lodash.includes(item.id, obj.name)) {
                            idArr.push(obj.id)
                        }
                    })
                    if (idArr.length) parmas[key] = idArr
                    if (!idArr.length) delete filterData[key]
                }
                if (lodash.isArray(item.id)) {
                    parmas[key] = parmas[key].map((val: any) => lodash.isNaN(Number(val)) ? val : Number(val))
                }
                if (lodash.isArray(item.id)) parmas[key] = JSON.stringify(parmas[key])
            }
        })
        if (creation_time.start_time) {
            parmas.creation_time = creation_time
            filterData.creation_time = creation_time
        }
        if (completion_time.start_time) {
            parmas.completion_time = completion_time
            filterData.completion_time = completion_time
        }
        const valuesCopy: any = {}
        Object.keys(values).forEach(keyName => {
            const key = keyName === 'project' ? 'id' : 'date'
            valuesCopy[keyName] = values[keyName].filter((obj: any) => {
                return obj.name && obj[key]
            })
        })
        return { valuesCopy, parmas, filterData, projectDataNew: projectData }
    }
    // 过滤
    const handleFilter = () => {
        form.validateFields() // 触发表单验证，返回Promise
            .then(async (values: any) => {
                const { parmas, valuesCopy, filterData } = handleFormData(values, projectData)
                const { page_num, page_size, ws_id, state } = pageParams
                const fetchParams = { page_num, page_size, ws_id, state, ...parmas, search: searchInp, tab }
                queryTestListTableData(fetchParams)
                //getPageData()
                setLeftSelectProjectList(valuesCopy.project)
                setFilterData(filterData)
                setFilterparmas(fetchParams)
                setFormFieldsValue(valuesCopy)
                // setFilter(!filter)
                setUrlQuery({ formValues: valuesCopy, selFilterParms: parmas })
                setServerVal(null)
            })
            .catch(err => console.log(err))
    }

    useMemo(() => {
        if (urlQuery) {
            const { formValues: { project, time }, selFilterParms } = urlQuery
            let obj = lodash.cloneDeep({ ...pageParams, ...selFilterParms })
            project.forEach((i: any) => {
                if (queryTypeArr.includes(i.name)) obj[`${i.name}_name`] = i.id
            })
            time.forEach((i: any) => { if (i.name) obj[i.name] = lodash.isArray(i.date) ? i.date.map((x: any) => x ? moment(x).format('YYYY-MM-DD HH:mm:ss') : '') : [] })
            delete obj.creation_time
            delete obj.completion_time
            let newObj = {}
            if ('start_time' in obj) {
                if (obj.start_time[0] === '') {
                    // const { page_num, page_size, search, state,tab,ws_id } = obj
                    // newObj = { page_num, page_size, search, state, tab, ws_id }
                    newObj = {
                        ...obj,
                        start_time: null
                    }
                } else {
                    newObj = {
                        ...obj,
                    }
                }
            }
            stringify(newObj)
            setShareParmas(location.origin + location.pathname + '?' + stringify(newObj))
        }
    }, [urlQuery])

    useEffect(() => {
        if (JSON.stringify(query) !== '{}')
            setShareParmas(location.href)
    }, [query])

    const getSelcetProject = (key: any) => {
        if (key === 'creation_time') return '开始时间'
        if (key === 'completion_time') return '结束时间'
        const obj = lodash.find(leftOptions, item => item.id === key);
        if (obj) return obj['name']
        return ''
    }

    const handleRestFilter = useCallback(
        () => {
            setServerVal(null)
            form.setFieldsValue({ project: [{ name: 'job_id', id: undefined }], time: [{ name: 'start_time', date: [] }] })
        }, []
    )

    const handleModalCancel = useCallback(
        () => {
            setModalData({})
            setVisible(false)
            setReRunChecked(false)
            exportModalForm.resetFields()
        }, []
    )

    const handleModalOk = () => {
        exportModalForm.validateFields()
            .then(values => {
                let obj: any = {}
                Object.keys(values).forEach(
                    key => {
                        if (values[key])
                            obj[key] = 1
                    }
                )
                const search = JSON.stringify(obj) !== '{}' ? `?${stringify(obj)}` : ''
                window.open(`/ws/${ws_id}/test_job/${modalData.id}/import${search}`)
            })
    }

    const handleTabClick = useCallback(
        (tabKey: string) => {
            filterReset()
            setTab(tabKey)
            getPageData({ ...PAGE_DEFAULT_PARAMS, tab: tabKey })
        }, []
    )

    const getLeftOptions = (options: any, fieldsValue: any, index: number, isTimeForm?: boolean) => {
        let project = fieldsValue && fieldsValue.project;
        if (isTimeForm) project = fieldsValue && fieldsValue.time;

        project = lodash.isArray(project) ? project : [];
        const arr = options.map((item: any) => {
            const fromIndex = lodash.findIndex(project, function (o: any) { return o && o.name == item.id });
            if (fromIndex !== -1 && fromIndex !== index) {
                item.disabled = true
                return item
            }
            item.disabled = false
            return item
        })
        return arr
    }

    const testServerSetFormDataFn = (val: any) => {
        const formCopy = lodash.cloneDeep(form.getFieldsValue())
        formCopy.project = formCopy.project.map((item: any) => {
            if (item.name === 'server') item.id = val || undefined
            return item
        })
        form.setFieldsValue({ ...formCopy })
    }

    const onChange = useCallback(
        (e: any) => {
            const val = e.target.value || ''
            testServerSetFormDataFn(val)
            setServerVal(val)
        }, []
    )

    const handleFuncsBaselineSelectSearch = useCallback((val: any) => setServerVal(val), [])
    const isValidIp = (ip: any) => {
        return /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(ip)
    }
    const handleFuncsBaselineSelectBlur = () => {
        if (!isValidIp(serverVal)) {
            testServerSetFormDataFn('')
        } else {
            testServerSetFormDataFn(serverVal)
        }
    }

    const handleFuncsBaselineSelectChange = useCallback(
        () => {
            testServerSetFormDataFn('')
            setServerVal('')
        }, []
    )

    const getRightReactNode = (field: any, index: number, project: any) => {
        const name = project[index] && project[index].name;
        let childrenNode = (<Input allowClear={true} placeholder={getText(name) || "请输入过滤条件"} autoComplete="off" />)
        if (project.length && name !== 'job_id' && name !== 'name' && name !== 'fail_case' && lodash.isArray(projectData[name])) {
            let arr: any[] = projectData[name];
            arr = arr.filter(val => lodash.get(val, 'name') && val.name.trim() !== '')
            arr = lodash.uniqBy(arr, 'name');
            const multiple: any = name === 'creators' || name === 'tags' || name === 'test_suite' ? 'multiple' : ''
            if (name === 'tags' || name === 'state') {
                childrenNode = (
                    <Select
                        allowClear={true}
                        mode={multiple}
                        tagRender={name === 'tags' ? tagRender : stateRender}
                        placeholder={getText(name)}
                        optionFilterProp="children">
                        {
                            arr.map(
                                (item: any) => (
                                    <Select.Option
                                        value={item.name}
                                    >
                                        <Tag color={item.bgColor} style={{ color: item.color ? item.color : '' }}>{item.name}</Tag>
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                )
            }
            else if (name === 'server') {
                const selServer = serverVal === null ? project[index] && project[index].id : serverVal
                childrenNode = (
                    <Select
                        allowClear={true}
                        mode="multiple"
                        className={styles.select_baseline}
                        placeholder={getText(name)}
                        optionLabelProp="label"
                        ref={serverSelect}
                        getPopupContainer={node => node.parentNode}
                        onSearch={handleFuncsBaselineSelectSearch}
                        onBlur={handleFuncsBaselineSelectBlur}
                        onChange={handleFuncsBaselineSelectChange}
                        dropdownRender={() => {
                            return (
                                <div style={{ maxHeight: 300, overflow: 'auto' }} className={styles.select_text}>
                                    <Radio.Group onChange={onChange} value={serverVal}>
                                        {arr.map(
                                            (item: any) => (
                                                <Radio
                                                    value={item.name}
                                                    className={item.name === selServer && styles.sel_server}
                                                >
                                                    {item.name}
                                                </Radio>
                                            )
                                        )}
                                    </Radio.Group>
                                </div>
                            )
                        }}
                    />
                )
            }
            else {
                childrenNode = (
                    <Select
                        showSearch
                        allowClear={true}
                        mode={multiple}
                        placeholder={getText(name)}
                        filterOption={(input, option: any) => {
                            return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }}
                        optionFilterProp="children"
                    >
                        {
                            arr.map(
                                (item: any) => (
                                    <Select.Option
                                        value={item.name}
                                    >
                                        {item.name}
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                )
            }
        }

        return (
            <Form.Item name={[field.name, 'id']}>
                {childrenNode}
            </Form.Item>
        )
    }

    const deletefn = (key: any) => {
        const isTimeForm = key === 'creation_time' || key === 'completion_time'
        const data = lodash.cloneDeep(filterData)
        const parmas = lodash.cloneDeep(filterparmas)
        delete data[key]
        delete parmas[key]
        setFilterData(data)
        setFilterparmas(parmas)
        queryTestListTableData(parmas)
        const fieldsValue = lodash.cloneDeep(formFieldsValue)
        let project = fieldsValue && lodash.isArray(fieldsValue.project) ? fieldsValue.project : [];
        let keyName = 'project'
        if (isTimeForm) {
            project = fieldsValue && fieldsValue.time;
            keyName = 'time'
        }
        project = project.filter((item: any) => {
            if (key === 'creation_time') return item.name !== 'start_time'
            if (key === 'completion_time') return item.name !== 'end_time'
            return item.name !== key
        })
        fieldsValue[keyName] = project;
        if (!isTimeForm) {
            setLeftSelectProjectList(project)
        }
        setFormFieldsValue(fieldsValue)
    }

    const { height: layoutHeight } = useClientSize()

    const selectedChange = (record: any, selected: any) => {
        if (!record) {
            setSelectedRowKeys([])
            setSelectRowData([])
            return;
        }
        // 去掉未选组的job 开始
        let arrKeys = lodash.cloneDeep(selectedRowKeys)
        let arrData = lodash.cloneDeep(selectRowData)

        if (selected) {
            arrKeys = [...arrKeys, record.id]
            arrData = [...arrData, record]
        } else {
            arrKeys = arrKeys.filter((keys: any) => Number(keys) !== Number(record.id))
            arrData = arrData.filter((obj: any) => obj && Number(obj.id) !== Number(record.id))
        }
        setSelectedRowKeys(arrKeys);
        setSelectRowData(arrData);
    }

    const allSelectFn = (allData: any) => {
        // const arr = _.isArray(allData.data) ? allData.data : []
        const arr = lodash.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys([...selectedRowKeys, ...keysArr])
        setSelectRowData([...selectRowData, ...arr])
    }

    const cancleAllSelectFn = (allData: any) => {
        const arr = lodash.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys(lodash.difference(selectedRowKeys, keysArr))
        setSelectRowData(lodash.differenceBy(selectRowData, arr, 'id'))
    }

    const rowSelection: any = access.wsRoleContrl() ? {
        selectedRowKeys,
        onSelect: selectedChange,
        // getCheckboxProps: (record: any) => {
        //     let flag = false
        //     if (radioValue === 1) flag = record.state !== 'success' && record.state !== 'fail'
        //     return ({
        //         disabled: flag, // Column configuration not to be checked
        //         name: record.name,
        //     })
        // },
        preserveSelectedRowKeys: false,
        hideSelectAll: radioValue === 1 ? true : false,
        onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
            if (selected) {
                allSelectFn(changeRows)
                return
            } else {
                cancleAllSelectFn(changeRows)
            }
        },
    } : undefined;

    let heightVal = radioValue === 2 ? layoutHeight - 50 - 57 : layoutHeight - 50 - 106
    if (radioValue === 1 && !selectedRowKeys.length) heightVal = layoutHeight - 50

    let tabMarginBottom = 0
    if (radioValue === 1 && selectedRowKeys.length > 0) tabMarginBottom = 106
    if (radioValue === 2) tabMarginBottom = 56

    const handleSearchList = () => {
        queryTestListTableData({ ...pageParams, search: searchInp })
    }
    const tabsKey = access.wsRoleContrl() ? tabThree : tabSingle
    return (
        <Layout.Content
            style={{
                // height: heightVal,
                minHeight: layoutHeight - 50,
                // overflowY: 'scroll',
                background: "#fff"
            }}
            className={styles.result_container}
        >
            <Spin spinning={isloading}>
                <Layout.Content style={{ background: '#fff', minHeight: heightVal - 82 }}>
                    <Tabs
                        defaultActiveKey={tab}
                        onTabClick={handleTabClick}
                        className={styles.result_tabs}
                        key={key}
                        style={{ paddingBottom: tabMarginBottom }}
                    >
                        {

                            tabsKey.map(
                                (item: any) => (
                                    <Tabs.TabPane
                                        key={item.key}
                                        tab={

                                            <div
                                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                className={styles.result_tab_item}
                                            >
                                                <span style={{ marginRight: 4 }}>{item.tab}</span>
                                                <span
                                                    className={
                                                        `${tab}_job` === item.key ?
                                                            styles.result_tab_nums_active :
                                                            styles.result_tab_nums
                                                    }
                                                >
                                                    {
                                                        pageCountSource ?
                                                            pageCountSource[`${item.key === 'all' ? 'ws' : item.key}_job`] : 0
                                                    }
                                                </span>
                                            </div>
                                        }
                                    >
                                        <Spin spinning={tabLoading}>
                                            <Row justify="space-between" style={{ paddingLeft: 20, paddingRight: 20, marginBottom: filter || Object.keys(filterData).length ? 20 : 0 }}>
                                                <Space size="large">
                                                    {
                                                        jobStateKeys.map((item: any) => (
                                                            <span
                                                                className={pageParams.state === item.val ? styles.result_state_active : styles.result_state}
                                                                key={item.key}
                                                                onClick={
                                                                    () => queryTestListTableData({ ...pageParams, state: item.val, page_num: 1, page_size: 20 })
                                                                }
                                                            >
                                                                {`${item.name}(${pageCountSource ? pageCountSource[item.key] : 0})`}
                                                            </span>
                                                        ))
                                                    }
                                                </Space>
                                                <Space>
                                                    {
                                                        access.wsRoleContrl() &&
                                                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                                                            <Typography.Text ellipsis={true} style={{ paddingRight: 5 }}>选择作用：</Typography.Text>
                                                            <Radio.Group onChange={handleRadioChange} value={radioValue}>
                                                                <Radio value={1}>报告和分析</Radio>
                                                                {access.canWsAdmin() && <Radio value={2}>批量删除</Radio>}
                                                            </Radio.Group>
                                                        </div>
                                                    }
                                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
                                                        <Input
                                                            style={{ width: 160 }}
                                                            allowClear
                                                            value={searchInp}
                                                            onChange={({ target }) => setSearchInp(target.value)}
                                                            onPressEnter={() => handleSearchList()}
                                                        />
                                                        <span
                                                            className={styles.search_input_style}
                                                            onClick={() => handleSearchList()}
                                                        >
                                                            <SearchOutlined />
                                                        </span>
                                                    </div>
                                                    <div onClick={handleOpenFilter} style={{ cursor: 'pointer' }}>
                                                        {
                                                            filter ?
                                                                <Space>收起过滤<UpOutlined /></Space> :
                                                                <Space>展开过滤<DownOutlined /></Space>
                                                        }
                                                    </div>
                                                </Space>
                                            </Row>
                                            <Divider style={{ display: filter || Object.keys(filterData).length ? 'block' : 'none' }} />
                                            {
                                                filter &&
                                                <Form
                                                    form={form}
                                                    className={styles.filter_form}
                                                    /* initialValues={{
                                                        project: [{ name: '', id: '' }],
                                                        time: []
                                                    }} */
                                                    labelCol={{ span: 3 }}
                                                    colon={false}
                                                >
                                                    <Row gutter={20} style={{ paddingLeft: 20, paddingRight: 20 }}>
                                                        <Col span={12}>
                                                            <Form.Item label="选择条件" labelAlign="left">
                                                                {
                                                                    <Form.List name="project">
                                                                        {
                                                                            (fields, { add, remove }) => {
                                                                                // 添加后左侧初始值设置
                                                                                if (flag) {
                                                                                    const data = lodash.cloneDeep(form.getFieldsValue())
                                                                                    let project = data.project || []

                                                                                    project = project.map((obj: any) => {
                                                                                        if (!obj || (obj && !obj.name)) {
                                                                                            obj = {}
                                                                                            const name = findDefaultVal(project)[0] && findDefaultVal(project)[0]['id']
                                                                                            obj.name = name
                                                                                            obj.id = undefined
                                                                                            if (queryTypeArr.includes(name)) queryApi(name)
                                                                                        }

                                                                                        return obj
                                                                                    })

                                                                                    data.project = project

                                                                                    setLeftSelectProjectList(data.project)
                                                                                    form.setFieldsValue(data)
                                                                                    flag = false
                                                                                }

                                                                                return fields.map(
                                                                                    (field: any, index: number) => (
                                                                                        <Row gutter={20} style={{ marginBottom: 8 }} key={field.key}>
                                                                                            {/*左边 */}
                                                                                            <Col span={5}>
                                                                                                <Form.Item name={[field.name, 'name']}>
                                                                                                    <Select onChange={leftHandleChange}>
                                                                                                        {
                                                                                                            getLeftOptions(lodash.cloneDeep(leftOptions), form.getFieldsValue(), index).map(
                                                                                                                (item: any) => (
                                                                                                                    <Select.Option
                                                                                                                        value={item.id}
                                                                                                                        disabled={item.disabled}
                                                                                                                    >
                                                                                                                        {item.name}
                                                                                                                    </Select.Option>
                                                                                                                )
                                                                                                            )
                                                                                                        }
                                                                                                    </Select>
                                                                                                </Form.Item>
                                                                                            </Col>
                                                                                            {/*右边 */}
                                                                                            <Col span={18}>
                                                                                                <Row align="middle">
                                                                                                    <Col span={20}>
                                                                                                        {getRightReactNode(field, index, leftSelectProjectList)}
                                                                                                    </Col>
                                                                                                    {
                                                                                                        (index === fields.length - 1 && index < leftOptions.length - 1) &&
                                                                                                        // 添加按钮
                                                                                                        <PlusCircleTwoTone
                                                                                                            onClick={() => {
                                                                                                                add()
                                                                                                                flag = true
                                                                                                            }}
                                                                                                            style={{ marginLeft: 11, cursor: 'pointer' }}
                                                                                                        />
                                                                                                    }
                                                                                                    {
                                                                                                        fields.length > 1 &&
                                                                                                        // 删除按钮
                                                                                                        <MinusCircleTwoTone
                                                                                                            style={{ marginLeft: 11, cursor: 'pointer' }}
                                                                                                            twoToneColor="#E02020"
                                                                                                            onClick={() => remove(field.name)}
                                                                                                        />
                                                                                                    }
                                                                                                </Row>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    )
                                                                                )
                                                                            }
                                                                        }
                                                                    </Form.List>
                                                                }
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12} style={{ position: 'relative' }}>
                                                            <Form.Item label="时间选择">
                                                                <Form.List name="time">
                                                                    {
                                                                        (fields, { add, remove }) => {

                                                                            return fields.map(
                                                                                (field: any, index: number) => (
                                                                                    <Row gutter={20} style={{ marginBottom: 8 }} key={field.key}>
                                                                                        <Col span={5} >
                                                                                            <Form.Item name={[field.name, 'name']}>
                                                                                                <Select onChange={timeHandleChange}>
                                                                                                    {
                                                                                                        getLeftOptions(lodash.cloneDeep(timeOptions), form.getFieldsValue(), index, true).map(
                                                                                                            (item: any) => (
                                                                                                                <Select.Option
                                                                                                                    value={item.id}
                                                                                                                    disabled={item.disabled}
                                                                                                                >
                                                                                                                    {item.name}
                                                                                                                </Select.Option>
                                                                                                            )
                                                                                                        )
                                                                                                    }
                                                                                                </Select>
                                                                                            </Form.Item>
                                                                                        </Col>
                                                                                        <Col span={19}>
                                                                                            <Row align="middle">
                                                                                                <Form.Item
                                                                                                    name={[field.name, 'date']}
                                                                                                    initialValue={INITIAL_STATE_TIME}
                                                                                                >
                                                                                                    <RangePicker
                                                                                                        size="middle"
                                                                                                        showTime={{ format: 'HH:mm:ss' }}
                                                                                                        disabledDate={
                                                                                                            (current: any) => {
                                                                                                                return moment().isBefore(current, 'days')
                                                                                                            }
                                                                                                        }
                                                                                                        format="YYYY-MM-DD HH:mm:ss"
                                                                                                    />
                                                                                                </Form.Item>
                                                                                                {
                                                                                                    (index === fields.length - 1 && index < timeOptions.length - 1) &&
                                                                                                    <PlusCircleTwoTone
                                                                                                        className={styles.add_time_icon}
                                                                                                        onClick={() => add()}
                                                                                                        style={{ marginLeft: 10, cursor: 'pointer' }}
                                                                                                    />
                                                                                                }
                                                                                                {
                                                                                                    fields.length > 1 &&
                                                                                                    <MinusCircleTwoTone
                                                                                                        className={styles.add_time_icon}
                                                                                                        twoToneColor="#E02020"
                                                                                                        style={{ marginLeft: 10, cursor: 'pointer' }}
                                                                                                        onClick={() => remove(field.name)}
                                                                                                    />
                                                                                                }
                                                                                            </Row>
                                                                                        </Col>
                                                                                    </Row>
                                                                                )
                                                                            )
                                                                        }
                                                                    }
                                                                </Form.List>
                                                            </Form.Item>
                                                        </Col>
                                                        <Divider dashed style={{ margin: '6px 0 12px 0' }} />
                                                        <Col span={12}>
                                                            <Form.Item label=" ">
                                                                <Space>
                                                                    <Button type="primary" onClick={lodash.partial(handleFilter, null)}>过滤</Button>
                                                                    <Button onClick={handleRestFilter}>重置</Button>
                                                                    <span className="test_analysis_copy_link" onClick={hanldeClickShare} style={{ cursor: 'pointer' }}>
                                                                        <CopyLink style={{ marginRight: 3 }} />
                                                                        <span>分享</span>
                                                                    </span>
                                                                </Space>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            }
                                            {/* {
                                                !filter && <Row style={{ paddingLeft: 20, paddingRight: 20 }}>
                                                    <Col span={24}>
                                                        <ul className={styles.select_program} style={{ display: Object.keys(filterData).length ? 'flex' : 'none' }}>
                                                            <li className={`${styles.data_list} ${styles.data_title}`}>
                                                                <Typography.Text>已选条件</Typography.Text>
                                                            </li>
                                                            {
                                                                Object.keys(filterData).map(item => {
                                                                    let val = ''
                                                                    if (lodash.isArray(filterData[item])) {
                                                                        filterData[item].forEach((itemData: any) => val = `${val}、${itemData}`)
                                                                    }
                                                                    if (item === 'creation_time' || item === 'completion_time') {
                                                                        val = `开始日期：${filterData[item]['start_time']} —— 结束日期：${filterData[item]['end_time']}`
                                                                    }
                                                                    if (val.trim()[0] === '、') val = val.trim().substring(1)
                                                                    let programData = lodash.isArray(filterData[item]) || Object.prototype.toString.call(filterData[item]) === '[object Object]' ? val : filterData[item]

                                                                    if (item === 'tags') {
                                                                        if (!filterData[item].length) return;
                                                                        const selectTagArr = projectData[item].filter((obj: any) => obj.name && lodash.includes(filterData[item], obj.name))
                                                                        return (
                                                                            <li key={item} className={styles.data_list}>
                                                                                <Tooltip title={`${getSelcetProject(item)}: ${programData}`} overlayStyle={{ wordBreak: 'break-all' }}>
                                                                                    <Button className={styles.button}>
                                                                                        {`${getSelcetProject(item)}:`} {tagColorFn(selectTagArr)}
                                                                                        <CloseOutlined className={styles.delete_icon} onClick={lodash.partial(deletefn, item)} />
                                                                                    </Button>
                                                                                </Tooltip>
                                                                            </li>
                                                                        )
                                                                    }
                                                                    if (item === 'state') {
                                                                        const selectStateArr = projectData[item].filter((obj: any) => obj.name && filterData[item] === obj.name)
                                                                        if (!selectStateArr.length) return
                                                                        return (
                                                                            <li key={item} className={styles.data_list}>
                                                                                <Tooltip title={`${getSelcetProject(item)}: ${programData}`} overlayStyle={{ wordBreak: 'break-all' }}>
                                                                                    <Button className={styles.button}>
                                                                                        {`${getSelcetProject(item)}:`} {stateColorFn(selectStateArr[0])}
                                                                                        <CloseOutlined className={styles.delete_icon} onClick={lodash.partial(deletefn, item)} />
                                                                                    </Button>
                                                                                </Tooltip>
                                                                            </li>
                                                                        )
                                                                    }
                                                                    return (
                                                                        <li key={item} className={styles.data_list}>
                                                                            <Tooltip title={`${getSelcetProject(item)}: ${programData}`} overlayStyle={{ wordBreak: 'break-all' }}>
                                                                                <Button className={styles.button}>{`${getSelcetProject(item)}: ${programData}`} <CloseOutlined className={styles.delete_icon} onClick={lodash.partial(deletefn, item)} /></Button>
                                                                            </Tooltip>
                                                                        </li>
                                                                    )
                                                                }
                                                                )
                                                            }
                                                            <li className={`${styles.data_list} ${styles.data_clear}`} onClick={handleClear}>
                                                                <span>清除所有</span>
                                                            </li>
                                                            <li className={`${styles.data_list} ${styles.data_refresh_filter}`} onClick={handleRefresh}>
                                                                <Refresh className={styles.share_refresh} />
                                                                刷新
                                                            </li>
                                                            <li className={`${styles.data_list} ${styles.data_share}`}>
                                                                <span className="test_analysis_copy_link" onClick={hanldeClickShare} style={{ cursor: 'pointer' }}>
                                                                    <CopyLink className={styles.share_icon} />
                                                                    <span>分享</span>
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </Col>
                                                </Row>
                                            } */}
                                            <Spin spinning={loading}>
                                                <div style={{ padding: '0 20px', marginTop: 8, background: '#fff', width: '100%' }}>
                                                    <ResizeTable
                                                        rowSelection={rowSelection}
                                                        rowKey='id'
                                                        columns={columns}
                                                        rowClassName={styles.result_table_row}
                                                        dataSource={dataSource?.data}
                                                        onChange={(pagination: any, filters: any, sorter: any) => sortStartTime(sorter)}
                                                        pagination={false}
                                                        scroll={{ x: '100%' }}
                                                        size="small"
                                                    />
                                                    <CommonPagination
                                                        total={dataSource?.total}
                                                        largePage={true}
                                                        currentPage={pageParams.page_num}
                                                        pageSize={pageParams.page_size}
                                                        onPageChange={
                                                            (page_num, page_size) => {
                                                                queryTestListTableData({ ...pageParams, page_num, page_size })
                                                            }
                                                        }
                                                    />
                                                </div>
                                            </Spin>
                                        </Spin>
                                    </Tabs.TabPane>
                                )
                            )
                        }
                    </Tabs>
                    <div
                        className={styles.bottom_box}
                        style={{
                            display: radioValue === 2 || selectedRowKeys.length ? 'block' : 'none'
                        }}
                    >
                        {
                            radioValue === 2 ?
                                <div className={styles.more_job_del_bottom}>
                                    <span>
                                        <span>已选择</span>
                                        <span className={styles.text_num}>{`${selectRowData.length}`}</span>
                                        <span>项</span>
                                    </span>
                                    <span>
                                        <Space>
                                            <Button onClick={handleMoreDelCancle}>取消</Button>
                                            <Button type="primary" onClick={handleMoreDeleOk} disabled={!selectedRowKeys.length}>批量删除</Button>
                                        </Space>
                                    </span>
                                </div>
                                : <CompareBar
                                    selectedChange={selectedChange}
                                    allSelectedRowKeys={selectedRowKeys}
                                    allSelectRowData={selectRowData}
                                    wsId={ws_id}
                                    setIsloading={setIsloading}
                                />
                        }

                    </div>
                </Layout.Content>
                <Modal
                    visible={visible}
                    width={487}
                    title="导入配置"
                    okText="确认"
                    cancelText="取消"
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    className={styles.run_modal}
                    maskClosable={false}
                >
                    <Row style={{ backgroundColor: '#fff', height: 66, marginBottom: 10, paddingLeft: 20 }} align="middle" >
                        <Col span={4} style={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}>Job名称</Col>
                        <Col span={18}>{modalData.name}</Col>
                    </Row>
                    <Row style={{ backgroundColor: '#fff', height: 93, paddingLeft: 20 }} align="middle">
                        <Form form={exportModalForm}>
                            <Form.Item valuePropName="checked" name="suite">
                                <Checkbox onChange={(e: any) => {
                                    const { checked } = e.target
                                    setReRunChecked(checked)
                                    if (!checked) exportModalForm.setFieldsValue({ inheriting_machine: false })
                                }}>同时导入测试用例</Checkbox>
                            </Form.Item>
                            <Form.Item valuePropName="checked" name="notice">
                                <Checkbox>同时导入通知配置</Checkbox>
                            </Form.Item>
                            <Form.Item valuePropName="checked" name="inheriting_machine">
                                <Checkbox disabled={!reRunChecked}>{reRunCheckedText}</Checkbox>
                            </Form.Item>
                        </Form>
                    </Row>
                </Modal>
            </Spin>
        </Layout.Content>
    )
}
