import React, { useState, useEffect, useRef } from 'react';
import { useClientSize } from '@/utils/hooks';
import { queryEenvironmentResultList, queryDomainGroup } from './services'
import { history, useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { message, Layout, Row, Select, Modal, Space, Divider, Button, Alert, Spin, Tooltip, Popconfirm, Typography } from 'antd';
import styles from './index.less'
import { PlusOutlined, CaretDownOutlined } from '@ant-design/icons'
import EditMarkDrawer from './EditMark'
import AddJob from './AddJob'
import AddPlan from './AddPlan/ViewCollapse'
import BaseGroupModal from './BaseGroupModal'
import _ from 'lodash'
import ProverEllipsis from './ProverEllipsis'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Scrollbars } from 'react-custom-scrollbars';
import { ReactComponent as ProductIcon } from '@/assets/svg/icon_product.svg'
import { ReactComponent as JiqiIcon } from '@/assets/svg/icon_jiqi.svg'
import { ReactComponent as CompareCollapse } from '@/assets/svg/compare_collapse.svg'
import { ReactComponent as CompareExpand } from '@/assets/svg/compare_expand.svg'
import SaveReport from '../../TestReport/components/SaveReport'
import { getJobRefSuit, handleDomainList, getSelectedDataFn } from './CommonMethod'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import {
    transformFn,
    transformIdFn,
    transformNoGroupIdFn,
    EllipsisRect,
    groupToLocale,
    getListStyle,
    getItemStyle,
    getJobItemStyle
} from './PublicMethod';
import AllJobTable from './AllJobTable';

const { Text } = Typography;
const { Option } = Select;

export default (props: any) => {
    const { formatMessage } = useIntl()
    const local = getLocale() === 'en-US'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { ws_id } = useParams() as any
    const { state } = props.location
    let selectedJob: any = _.get(state, `${ws_id}-compareData`)
    selectedJob = selectedJob && _.isArray(JSON.parse(selectedJob)) ? JSON.parse(selectedJob) : []
    selectedJob = transformFn(selectedJob)
    let noGroupJob: any = _.get(state, `${ws_id}-noGroupJobData`)
    noGroupJob = noGroupJob && _.isArray(JSON.parse(noGroupJob)) ? JSON.parse(noGroupJob) : []
    const originType = _.get(state, 'originType') || ''
    const { height: layoutHeight } = useClientSize()
    const [groupData, setGroupData] = useState<any>(selectedJob)
    const [noGroupData, setNoGroupData] = useState<any>(noGroupJob)
    const [currentEditGroup, setCurrentEditGroup] = useState<any>({})
    const [currentEditGroupIndex, setCurrentEditGroupIndex] = useState<number>(0)
    const [baselineGroup, setBaselineGroup] = useState(selectedJob[0] || {})
    const [baselineGroupIndex, setBaselineGroupIndex] = useState<number>(-1)
    const [visible, setVisible] = useState(false);
    const [visibleAddGroupItem, setVisibleAddGroupItem] = useState(false);
    const editGroupMark: any = useRef(null)
    const [disabled, setDisabled] = useState(true)
    const [loading, setLoading] = useState(false)
    const newProductVersionGroup = useRef([]);
    const newNoGroup = useRef([]);
    const [labelBlinking, setLabelBlinking] = useState(false)
    const [visibleBaseGroup, setVisibleBaseGroup] = useState(false)
    const [currentDelJobDom, setCurrentDelJobDom] = useState<any>(null)
    const [isExpand, seIsExpand] = useState<boolean>(true)
    const [groupingButton, seGroupingButton] = useState<boolean>(false)
    const [groupMethod, setGroupMethod] = useState<any>(null)
    const [isAlertClose, setIsAlertClose] = useState(true)
    const nogroupDom: any = useRef(null)
    const saveReportDraw: any = useRef(null)
    useEffect(() => {
        if (originType !== 'test_result') handleAddJobGroup()
    }, [])
    const handleExpandButtom = () => {
        seIsExpand(!isExpand);
        if (!isExpand) nogroupDom.current.style.left = '0'
        if (isExpand) nogroupDom.current.style.left = '-260px'
    }
    useEffect(() => {
        if (groupData.length) seGroupingButton(true)
        if (!groupData.length) seGroupingButton(false)
        if (baselineGroupIndex === -1) setBaselineGroup(groupData[0])
    }, [groupData, baselineGroupIndex])

    document.title = '配置页-T-One'
    const versionGroupingFn = (arrGroup: any, newGroup: any) => {
        const arr: [] = arrGroup.filter((item: any) => {
            return item.product_version === arrGroup[0].product_version && item.product_id === arrGroup[0].product_id
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if (remainArr.length) versionGroupingFn(remainArr, newGroup)
        if (!remainArr.length) {
            newGroup = newGroup.map((brr: any) => {
                return { members: brr, product_version: brr[0]['product_version'] }
            })
            newNoGroup.current = newGroup
        }
    }
    const snGroupingFn = (arrGroup: any, newGroup: any) => {
        const arr: [] = arrGroup.filter((item: any) => {
            return item.product_version === arrGroup[0].product_version && item.server === arrGroup[0].server && item.product_id === arrGroup[0].product_id
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if (remainArr.length) snGroupingFn(remainArr, newGroup)
        if (!remainArr.length) {
            newGroup = newGroup.map((brr: any) => {
                return { members: brr, product_version: brr[0]['product_version'], server: brr[0]['server'] }
            })
            newNoGroup.current = newGroup
        }
    }

    const handleGrouping = (type: string) => {
        let groupDataCopy = _.cloneDeep(groupData)
        let noGroupDataCopy = _.cloneDeep(noGroupData)
        const moreSn: any = []
        if (noGroupDataCopy.length && type === 'version') {
            versionGroupingFn(noGroupDataCopy, [])
            newNoGroup.current.forEach((obj: any) => {
                const matchGroup = _.find(groupDataCopy, function (o) { return o.product_version === obj.product_version && o.product_id === obj.product_id }); // 产品版本 + 产品id 都相同时才分到同一个组里
                if (matchGroup) {
                    matchGroup.members = [...matchGroup.members, ...obj.members]
                    const index = _.findIndex(groupDataCopy, function (o: any) { return o.id === matchGroup.id; });
                    if (index !== -1) groupDataCopy[index] = matchGroup
                }
                if (!matchGroup) {
                    const name = addGroupNameFn(groupDataCopy) || `对比组${groupDataCopy.length + 1}`
                    const addGroup = {
                        product_version: obj.product_version || name,
                        members: obj.members,
                        name,
                        type: 'job',
                        id: +new Date() + groupDataCopy.length
                    }
                    groupDataCopy.push(addGroup)
                }
            })
        }

        if (noGroupDataCopy.length && type === 'sn') {
            const singleSn: any = []
            noGroupDataCopy.forEach((item: any) => {
                if (item.server && item.server.split(',').length === 1) singleSn.push(item)
                if (!item.server || item.server.split(',').length !== 1) moreSn.push(item)
            })
            if (singleSn.length) snGroupingFn(singleSn, [])
            if (!singleSn.length) newNoGroup.current = []
            // 判断已有组的机器是否相同
            groupDataCopy = groupDataCopy.map((item: any) => {
                let isSnSame = false
                let snArr: any = []
                item.members.forEach((val: any) => {
                    if (_.get(val, 'server')) snArr.push(_.get(val, 'server'))
                })
                snArr = _.uniq(snArr);
                if (snArr.length === 1 && snArr[0].split(',').length === 1) isSnSame = true
                return { ...item, isSnSame }
            })
            newNoGroup.current.forEach((obj: any) => {
                const matchGroup = _.find(groupDataCopy, function (o) { return o.product_version === obj.product_version && o.isSnSame && o.members[0]['server'] === obj.server }); // 找到相同的产品版本、SN
                if (matchGroup) {
                    matchGroup.members = [...matchGroup.members, ...obj.members]
                    const index = _.findIndex(groupDataCopy, function (o: any) { return o.id === matchGroup.id; });
                    if (index !== -1) groupDataCopy[index] = matchGroup
                }
                if (!matchGroup) {
                    const name = addGroupNameFn(groupDataCopy) || `对比组${groupDataCopy.length + 1}`
                    const addGroup = {
                        product_version: obj.product_version || name,
                        members: obj.members,
                        name,
                        type: 'job',
                        id: +new Date() + groupDataCopy.length
                    }
                    groupDataCopy.push(addGroup)
                }
            })
        }
        setGroupMethod(type)
        setGroupData(groupDataCopy)
        setBaselineGroup(groupDataCopy[baselineGroupIndex] || {})
        setNoGroupData(moreSn)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(groupDataCopy))
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify(moreSn))
    }

    const handleAddNoVersionJob = () => {
        setIsModalOpen(true);
    }

    const cancleGrouping = () => {
        const hasGroups = groupData.filter((item: any) => item.type !== 'baseline')
        const allNoGroups = hasGroups.reduce((p: any, c: any) => p.concat(c.members), []).concat(noGroupData)

        const results = Object.entries(allNoGroups.reduce((p: any, c: any) => {
            const { id } = c
            p[id] = c
            return p
        }, {})).map(i => {
            const [, r] = i
            return r
        })

        setGroupMethod(null)
        setGroupData(groupData.filter((item: any) => item.type === 'baseline'))
        setBaselineGroupIndex(-1)
        setBaselineGroup({})
        setNoGroupData(results)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify([]))
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify(results))
    }

    const addGroupNameFn = (arrGroup = groupData) => {
        const arr = arrGroup.map((item: any) => item.product_version && item.product_version.trim())
        for (let i = 0; i < arrGroup.length; i++) {
            if (!arr.includes(`对比组${i + 1}`)) return `对比组${i + 1}`
        }
        return ''
    }
    const handleAddJobGroup = (type = 'job') => {
        const arr = _.cloneDeep(groupData)
        const name = addGroupNameFn() || `对比组${groupData.length + 1}`
        const addGroup = {
            product_version: name,
            members: [],
            name,
            type,
            id: +new Date() + groupData.length
        }
        arr.push(addGroup)
        setGroupData(arr)
        if (arr.length === 1) {
            setBaselineGroupIndex(0)
            setBaselineGroup(addGroup)
        }

        if (arr.length === 2) {
            setBaselineGroupIndex(-1)
            setBaselineGroup({})
        }
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(arr))
    }

    const handleGroupClick = (obj: any, num: number) => {
        setBaselineGroupIndex(num)
        setBaselineGroup(obj)

    }
    const handleNoGroupJobDel = (num: number) => {
        setCurrentDelJobDom(`ongroup${num}`)
    }
    const handleJobDel = (index: number, num: number) => {
        setCurrentDelJobDom(`${index}${num}`)
    }
    const handleVisibleChange = (visible: any) => {
        if (!visible) setCurrentDelJobDom(null)
    }
    const handleNoGroupJobDelClick = (e: any, num: number) => {
        e.stopPropagation();
        let arr = _.cloneDeep(noGroupData)
        arr = arr.filter((item: any, indexNum: number) => indexNum !== num)
        setNoGroupData(arr)
        setCurrentDelJobDom(null)
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify(arr))
    }
    const handleJobDelClick = (e: any, index: number, num: number) => {
        e.stopPropagation();
        let arr = _.cloneDeep(groupData)
        arr[index].members = arr[index].members.filter((item: any, indexNum: number) => indexNum !== num)
        if (!arr[index].members.length) {
            // 空组时重置组的对比标识
            const name = addGroupNameFn() || `对比组${arr.length + 1}`
            arr[index].product_version = name
            arr[index].name = name
        }
        setGroupData(arr)
        setCurrentEditGroup(arr[index])
        setCurrentEditGroupIndex(index)
        setBaselineGroup(arr[baselineGroupIndex])
        setCurrentDelJobDom(null)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(arr))
    }

    const handleEditMark = () => {
        const localStr = formatMessage({ id: 'analysis.edit.mark.name' })
        editGroupMark.current?.show(
            localStr,
            _.cloneDeep(currentEditGroup),
            groupData[currentEditGroupIndex].members[0]?.product_version
        )
    }
    const handleDelGroup = () => {
        let arr = _.cloneDeep(groupData)
        arr = arr.filter((item: any, index: number) => index !== currentEditGroupIndex)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(arr))

        if (currentEditGroupIndex === baselineGroupIndex && arr.length !== 1) {
            setBaselineGroupIndex(-1)
            setBaselineGroup({})
        }
        if (arr.length === 1) {
            setBaselineGroupIndex(0)
            setBaselineGroup(arr[0] || {})
        }
        setVisible(false);
        setGroupData(arr)
        setCurrentEditGroup({})
        setCurrentEditGroupIndex(0)
    }

    const showModal = () => {
        setVisible(true);
    };
    const handleCancel = () => {
        setVisible(false);
        destroyAll()
    };

    const destroyAll = () => {
        Modal.destroyAll();
    }
    const handleEllipsis = (obj: any, num: number) => {
        setCurrentEditGroup(obj)
        setCurrentEditGroupIndex(num)
    }
    const handleEditMarkOk = (obj: any) => {
        setCurrentEditGroup(obj)
        const arr = _.cloneDeep(groupData)
        arr[currentEditGroupIndex] = obj
        if (currentEditGroupIndex === baselineGroupIndex) setBaselineGroup(obj)
        setGroupData(arr)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(arr))
    }
    const handleClear = () => {
        setNoGroupData([])
        setGroupData([])
        setBaselineGroup({})
        setBaselineGroupIndex(-1)
        setCurrentEditGroup({})
        setCurrentEditGroupIndex(0)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify([]))
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify([]))
    }

    const isSureOk = () => {
        let member: any = []
        groupData.forEach((ele: any) => {
            member = member.concat(ele.members)
        })
        if (member.length > 0) return false
        return true
    }

    const handleStartAnalysis = () => {
        if (isSureOk()) return;
        let num = 0
        let flag = false
        groupData.forEach((item: any) => {
            if (item.members.length > 0) {
                num++
                flag = item.type === 'baseline'
            }
        })
        if (num > 1 && baselineGroupIndex === -1) {
            setLabelBlinking(true)
            const localStr = formatMessage({ id: 'analysis.please.set.the.benchmark.group' })
            return message.warning(localStr)
        }
        if (num === 1 && flag) {
            return message.warning(formatMessage({ id: "analysis.please.add.comparison.group" }))
        }

        setVisibleBaseGroup(true)
        return
        // compareSuite.current?.show('选择BaseGroup对比的内容', baselineGroup)
    }

    useEffect(() => {
        let timer: any;
        if (labelBlinking) {
            timer = setTimeout(() => {
                setLabelBlinking(false)
            }, 3000);
        } else {
            clearTimeout(timer)
        }
    }, [labelBlinking])

    const queryDomainGroupFn = async (paramData: any) => {
        const result = await queryDomainGroup(paramData)
        return result
    }

    const queryEenvironmentResultFn = async (paramData: any) => {
        const result = await queryEenvironmentResultList(paramData)
        return result
    }

    const handleGroupData = () => {
        return groupData.filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length)
    }
    const handleSureOk = (suiteData: any) => { // suiteData：已选的
        const params: any = handleDomainList(suiteData)
        const paramEenvironment = handlEenvironment(suiteData)

        setVisibleBaseGroup(false);
        setLoading(true)
        Promise.all([queryDomainGroupFn(params)])
            .then((result: any) => {
                setLoading(false)
                if (result[0].code === 200) {
                    history.push({
                        pathname: `/ws/${ws_id}/test_analysis/result`,
                        state: {
                            wsId: ws_id,
                            baselineGroupIndex: baselineGroupIndex,
                            allGroupData: handleGroupData(),
                            // compareResult: _.cloneDeep(result[0].data),
                            compareGroupData: paramEenvironment,
                            domainGroupResult: result[0].data,
                            testDataParam: suiteData,
                            envDataParam: paramEenvironment,
                        }
                    })
                    window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(groupData))
                    return
                }
            })
            .catch((e) => {
                setLoading(false)
                message.error(formatMessage({ id: 'request.failed' }))
                console.log(e)
            })

    }
    const creatReportCallback = (reportData: any, suiteData: any) => { // suiteData：已选的
        setLoading(true)
        let func_suite = suiteData.func_suite_dic || {}
        let perf_suite = suiteData.perf_suite_dic || {}
        const baseIndex = 0;
        let func_keys = Object.keys(func_suite) || []
        let perf_keys = Object.keys(perf_suite) || []
        const duplicate: any = []
        let newSuiteData = {
            func_suite_dic: getSelectedDataFn(
                func_suite,
                groupData,
                baseIndex,
                func_keys,
                duplicate
            ),
            perf_suite_dic: getSelectedDataFn(
                perf_suite,
                groupData,
                baseIndex,
                perf_keys,
                duplicate
            )
        }
        const paramEenvironment = handlEenvironment(suiteData)
        const params: any = handleDomainList(suiteData)
        Promise.all([queryEenvironmentResultFn(paramEenvironment), queryDomainGroupFn(params)])
            .then((result: any) => {
                setLoading(false)
                if (result[0].code === 200 && result[1].code === 200) {
                    history.push({
                        pathname: `/ws/${ws_id}/test_create_report`,
                        state: {
                            environmentResult: result[0].data,
                            baselineGroupIndex: baselineGroupIndex,
                            allGroupData: handleGroupData(),
                            testDataParam: _.cloneDeep(newSuiteData),
                            domainGroupResult: result[1].data,
                            compareGroupData: paramEenvironment,
                            saveReportData: reportData
                        }
                    })
                    window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(groupData))
                    return
                }
                if (result[1].code === 1358) {
                    const localStr = formatMessage({ id: 'analysis.please.add.comparison.group' })
                    message.error(localStr)
                    return
                }
                if (result[0].code !== 200) {
                    message.error(result[0].msg)
                    return
                }
                if (result[1].code !== 200) {
                    message.error(result[1].msg)
                }
            })
            .catch((e) => {
                setLoading(false)
                message.error(formatMessage({ id: 'request.failed' }))
                console.log(e)
            })
    }
    const handleCreatReportOk = (suiteData: any) => { // suiteData：已选的
        setVisibleBaseGroup(false);
        saveReportDraw.current?.show(suiteData)
    }

    const changeTag = (arrGroup: any, newGroup: any) => {
        const arr: [] = arrGroup.filter((item: any) => {
            return item.product_version === arrGroup[0].product_version
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if (remainArr.length) changeTag(remainArr, newGroup)
        if (!remainArr.length) {
            newGroup = newGroup.map((brr: []) => {
                if (brr.length < 2) return brr
                return brr.map((item: any, index: number) => ({ ...item, product_version: `${item.product_version}(${++index})` }))
            })
            newProductVersionGroup.current = newGroup
        }
    }

    const handlEenvironment = (selData: any) => {
        const { baseArr, compareArr } = getJobRefSuit(selData)
        let groupDataCopy = _.cloneDeep(groupData).filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length)
        let newGroup: any = []
        if (groupDataCopy.length) {
            changeTag(groupDataCopy, [])
            newGroup = newProductVersionGroup.current.flat()
        }

        const arr = groupData.filter((item: any, index: any) => index !== baselineGroupIndex).filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length)
        const array = groupData.filter((item: any, index: any) => _.get(item, 'members') && _.get(item, 'members').length)
        let base_group = {}
        let compare_groups = []
        if (array.length === 1) {
            base_group = {
                tag: newGroup[0]?.product_version || '',
                base_objs: baseArr
            }
        } else {
            const baseIndex = _.findIndex(newGroup, function (o: any) { return String(o.id) === String(baselineGroup.id) });
            base_group = {
                tag: newGroup.length ? newGroup[baseIndex]?.product_version : '',
                base_objs: baseArr,
            }

            compare_groups = _.reduce(arr, (groups: any, obj) => {
                const index = _.findIndex(newGroup, function (o: any) { return String(o.id) === String(obj.id) });
                const compareIds = newGroup[index]?.members?.map((i: any) => i.id)

                const groupItem: any = {
                    tag: newGroup[index]?.product_version,
                    base_objs: compareArr.reduce((p, c) => {
                        const { obj_id } = c
                        if (compareIds.includes(obj_id))
                            return p.concat(c)
                        return p
                    }, [])
                }
                groups.push(groupItem)
                return groups
            }, []);
        }
        const paramData = {
            base_group,
            compare_groups
        }
        return paramData
    }

    const handleAddGroupItem = (obj: any, index: number) => {
        setCurrentEditGroup(obj)
        setCurrentEditGroupIndex(index)
        setVisibleAddGroupItem(true)
    }

    const handleAddGroupItemCancel = () => {
        setVisibleAddGroupItem(false);
        destroyAll()
    }

    const handleBaseGroupModalCancle = () => {
        setVisibleBaseGroup(false);
        destroyAll()
    }

    const handleAddGroupItemOk = (obj: any) => {
        if ((!obj.product_version || obj.product_version === obj.name) && _.isArray(obj.members)) {
            if (obj.type === 'baseline' && obj.members[0] && obj.members[0].version) {
                obj.product_version = obj.members[0].version
            }
            if ((obj.type === 'job' || obj.type === 'plan') && obj.members[0] && obj.members[0].product_version) {
                obj.product_version = obj.members[0].product_version
            }
        }
        const arr = _.cloneDeep(groupData)
        arr[currentEditGroupIndex] = obj
        if (currentEditGroupIndex === baselineGroupIndex) setBaselineGroup(obj)
        setCurrentEditGroup(obj)
        setGroupData(arr)
        setVisibleAddGroupItem(false);
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(arr))
    }

    const addGroupTypeFn = () => {
        if (!currentEditGroup) return
        if (currentEditGroup.type === 'plan') {
            return (
                <AddPlan
                    onOk={handleAddGroupItemOk}
                    onCancel={handleAddGroupItemCancel}
                    currentGroup={currentEditGroup}
                />
            )
        }
        return (
            <AddJob
                onOk={handleAddGroupItemOk}
                onCancel={handleAddGroupItemCancel}
                currentGroup={currentEditGroup}
                allGroup={groupData}
                allNoGroupData={noGroupData}
            />
        )
    }

    const contentMark = (
        <div>
            <p onClick={_.partial(handleEditMark)}><FormattedMessage id="analysis.editMark" /></p>
            <p onClick={_.partial(showModal)}><FormattedMessage id="analysis.deleteMark" /></p>
        </div>
    )
    const handleMouseOver = (e: any) => {
        e.stopPropagation()
    }
    const getSnDom = (snArr: any) => {
        if (!snArr.length) return ''
        if (snArr.length === 1) return (
            <PopoverEllipsis title={snArr[0]} refData={groupData} customStyle={{ display: 'inline-block', maxWidth: '50%' }}>
                <>
                    <JiqiIcon style={{ marginRight: 2 }} />
                    {snArr[0]}
                </>
            </PopoverEllipsis>
        )
        const text = snArr.map((val: any) => <span>{val}<br /></span>)
        if (snArr.length > 1) return (
            <Tooltip placement="right" title={text}>
                <span onMouseOver={handleMouseOver} style={{ color: '#1890FF', boxSizing: 'border-box', display: 'inline-block', maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <JiqiIcon style={{ marginRight: 2 }} />
                    {snArr[0]}
                </span>
            </Tooltip>
        )
        return
    }

    const reorderGroup = (list: any, startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const reorder = (list: any, startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const diferentDeorderOne = (groupArr: any, startIndex: number, endIndex: number, startGroupIndex: number, endGroupIndex: number) => {
        const arr = _.cloneDeep(groupArr[endGroupIndex].members)
        const [removed] = groupArr[startGroupIndex].members.splice(startIndex, 1);
        groupArr[endGroupIndex].members.splice(endIndex, 0, removed);
        const productMark = _.get(groupArr[endGroupIndex].members[0], 'product_version')
        if ((!arr || !arr.length) && productMark) {
            groupArr[endGroupIndex].product_version = productMark
        }
        groupArr[endGroupIndex].type = groupArr[startGroupIndex].type
        return groupArr;
    };

    const diferentDeorderTwo = (noGoupArr: any, groupArr: any, startIndex: number, endIndex: number, endGroupIndex: number) => {
        const arr = _.cloneDeep(groupArr[endGroupIndex].members)
        const [removed] = noGoupArr.splice(startIndex, 1);
        groupArr[endGroupIndex].members.splice(endIndex, 0, removed);
        const productMark = _.get(groupArr[endGroupIndex].members[0], 'product_version')
        if ((!arr || !arr.length) && productMark) {
            groupArr[endGroupIndex].product_version = productMark
        }
        return { groupArr, noGoupArr }
    };

    const diferentDeorderThree = (groupArr: any, noGoupArr: any, startIndex: number, endIndex: number, startGroupIndex: number) => {
        const [removed] = groupArr[startGroupIndex].members.splice(startIndex, 1);
        noGoupArr.splice(endIndex, 0, removed);
        return { groupArr, noGoupArr }
    };

    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        let groupDataCopy = _.cloneDeep(groupData)
        let noGroupDataCopy = _.cloneDeep(noGroupData)
        let number = result.source.droppableId.replace('Group', '')
        let desNumber = result.destination.droppableId.replace(new RegExp('Group', 'g'), '')
        number = Number(number)
        desNumber = Number(desNumber)

        // 已分组的组内元素拖动
        if (result.source.droppableId === result.destination.droppableId && result.source.droppableId !== 'noGroup') {
            const members = reorder(
                groupDataCopy[number].members,
                result.source.index, // 原位置下标
                result.destination.index // 拖拽后的目标位置下标
            );
            groupDataCopy[number].members = members
        }
        // 未分组的组内元素拖动
        if (result.source.droppableId === result.destination.droppableId && result.source.droppableId === 'noGroup') {
            const arr = reorder(
                noGroupDataCopy,
                result.source.index, // 原位置下标
                result.destination.index, // 拖拽后的目标位置下标
            );
            noGroupDataCopy = arr
        }
        // 已分组的跨组元素拖动
        if (result.source.droppableId !== result.destination.droppableId && result.source.droppableId !== 'noGroup' && result.destination.droppableId !== 'noGroup') {
            const groupArrCopy = _.cloneDeep(groupDataCopy)
            const start = groupArrCopy[number].members[0]
            const end = groupArrCopy[desNumber].members[0]
            if (end && start && (_.get(start, 'product_version') !== _.get(end, 'product_version') || _.get(start, 'product_id') !== _.get(end, 'product_id'))) return;

            const arr = diferentDeorderOne(
                groupDataCopy,
                result.source.index, // 原位置下标，指job
                result.destination.index, // 拖拽后的目标位置下标，指job
                number, // 原位置组，指组
                desNumber // 目标组位置，指组
            );
            groupDataCopy = arr
        }
        // 元素从未分组拖到已分组
        if (result.source.droppableId !== result.destination.droppableId && result.source.droppableId === 'noGroup') {
            const groupArrCopy = _.cloneDeep(groupDataCopy)
            const noGoupArrCopy = _.cloneDeep(noGroupDataCopy)
            const start = noGoupArrCopy[result.source.index]
            const end = groupArrCopy[desNumber].members[0]
            if (end && start && (_.get(start, 'product_version') !== _.get(end, 'product_version') || _.get(start, 'product_id') !== _.get(end, 'product_id'))) return;
            const obj: any = diferentDeorderTwo(
                noGroupDataCopy,
                groupDataCopy,
                result.source.index, // 原位置下标，指job
                result.destination.index, // 拖拽后的目标位置下标，指job
                desNumber // 目标组位置，指组
            );
            noGroupDataCopy = obj.noGoupArr
            groupDataCopy = obj.groupArr
        }
        // 元素从已分组拖到未分组
        if (result.source.droppableId !== result.destination.droppableId && result.destination.droppableId === 'noGroup') {
            const obj = diferentDeorderThree(
                groupDataCopy,
                noGroupDataCopy,
                result.source.index, // 原位置下标，指job
                result.destination.index, // 拖拽后的目标位置下标，指job
                number, // 原位置组，指组
            );
            noGroupDataCopy = obj.noGoupArr
            groupDataCopy = obj.groupArr
        }
        setGroupData(groupDataCopy)
        setNoGroupData(noGroupDataCopy)
        if (baselineGroupIndex === number) setBaselineGroup(groupDataCopy[number])
        if (baselineGroupIndex === desNumber) setBaselineGroup(groupDataCopy[desNumber])
    }

    const onGroupDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }
        if (result.type === 'DEFAULT') {
            const groupDataCopy = _.cloneDeep(groupData)
            const itemObj = reorderGroup(
                groupDataCopy,
                result.source.index,
                result.destination.index
            );
            itemObj.forEach((item: any, num) => {
                if (item && item.id === baselineGroup.id) {
                    setBaselineGroupIndex(num)
                    setBaselineGroup(item)
                }
            })
            setGroupData(itemObj)
        } else {
            onDragEnd(result)
        }
    }

    const newGroupData = transformIdFn(_.cloneDeep(groupData))
    const newNoGroupData = transformNoGroupIdFn(noGroupData)

    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 329 + 8 - 22 - 5,
    }

    const groupItemReact = (item: any, index: number) => {
        if (!_.get(item, 'members').length) {
            return (
                <Droppable
                    key={`Group${index}`}
                    droppableId={`Group${index}`}
                    index={index}
                    type={`1`}
                >
                    {(provided: any, snapshot: any) => (
                        <div
                            className={styles.second_part}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            {...provided.dragHandleProps}
                            style={getJobItemStyle(provided.droppableProps.style)}
                        >
                            <div className={styles.first_part}>
                                <EllipsisRect
                                    text={item.product_version}
                                    flag={item.type === 'baseline'}
                                    isBaseGroup={index === baselineGroupIndex && groupData.length > 1}
                                />
                                <span className={styles.opreate_button}>
                                    <ProverEllipsis
                                        current={groupData[index]}
                                        currentIndex={index}
                                        contentMark={contentMark}
                                        handleEllipsis={handleEllipsis}
                                        currentEditGroupIndex={currentEditGroupIndex}
                                    />
                                </span>
                                {
                                    index !== baselineGroupIndex &&
                                    <span
                                        className={labelBlinking ? styles.baseTag : styles.baseGroupColorFn}
                                        onClick={_.partial(handleGroupClick, groupData[index], index)}
                                    >
                                        <FormattedMessage id="analysis.set.benchmark.group" />
                                    </span>
                                }
                            </div>
                            <Divider className={styles.line} />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable >
            )
        }

        return (
            <>
                <div className={styles.first_part}>
                    <EllipsisRect
                        text={item.product_version}
                        flag={item.type === 'baseline'}
                        isBaseGroup={index === baselineGroupIndex && groupData.length > 1}
                    />
                    <span className={styles.opreate_button}>
                        <ProverEllipsis
                            current={groupData[index]}
                            currentIndex={index}
                            contentMark={contentMark}
                            handleEllipsis={handleEllipsis}
                            currentEditGroupIndex={currentEditGroupIndex}
                        />
                    </span>
                    {
                        index !== baselineGroupIndex &&
                        <span
                            className={labelBlinking ? styles.baseTag : styles.baseGroupColorFn}
                            onClick={_.partial(handleGroupClick, groupData[index], index)}
                        >
                            <FormattedMessage id="analysis.set.benchmark.group" />
                        </span>
                    }
                </div>

                <Divider className={styles.line} />
                <ul>
                    <Droppable
                        key={`Group${index}`}
                        droppableId={`Group${index}`}
                        index={index}
                        type={`1`}
                    >
                        {(provided: any, snapshot: any) => (
                            <Scrollbars autoHeightMax={isAlertClose ? scroll.height + 64 - 20 : scroll.height + 64 + 32} autoHeight>
                                <div
                                    className={styles.second_part}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    {...provided.dragHandleProps}
                                    style={getJobItemStyle(provided.droppableProps.style)}
                                >
                                    {item && item.members.map((obj: any, num: number) => {
                                        if (!obj) return ''
                                        let snArr = _.get(obj, 'server') && obj.server.split(',')
                                        snArr = _.isArray(snArr) ? snArr : []
                                        return (
                                            <Draggable key={obj.id} draggableId={obj.id} index={num}>
                                                {(provided: any) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={getJobItemStyle(provided.draggableProps.style)}
                                                    >
                                                        <li key={obj.job_id} style={{ background: '#fff' }}>
                                                            <div>{obj.name}</div>
                                                            <div>
                                                                {
                                                                    obj.product_version &&
                                                                    <PopoverEllipsis
                                                                        title={obj.product_version}
                                                                        refData={groupData}
                                                                        customStyle={{ display: 'inline-block', maxWidth: '50%', paddingRight: 8 }}
                                                                    >
                                                                        <>
                                                                            <ProductIcon style={{ marginRight: 2, transform: 'translateY(2px)' }} />
                                                                            {obj.product_version}
                                                                        </>
                                                                    </PopoverEllipsis>
                                                                }
                                                                {getSnDom(snArr)}
                                                            </div>
                                                            <div>
                                                                <span>{`#${obj.job_id}`}</span>
                                                                <span>{obj.creator_name}</span>
                                                                <Popconfirm
                                                                    title={<FormattedMessage id="analysis.delete.job.prompt" />}
                                                                    onConfirm={_.partial(handleJobDelClick, _, index, num)}
                                                                    okText={<FormattedMessage id="operation.confirm" />}
                                                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                                                    arrowPointAtCenter={true}
                                                                    trigger="click"
                                                                    onVisibleChange={_.partial(handleVisibleChange, _, index, num)}
                                                                >
                                                                    <span
                                                                        style={{ opacity: currentDelJobDom === `${index}${num}` ? 1 : 0 }}
                                                                        className={styles.compare_job_delete} onClick={_.partial(handleJobDel, index, num)}>
                                                                        <FormattedMessage id="operation.delete" />
                                                                    </span>
                                                                </Popconfirm>
                                                            </div>
                                                        </li>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </div>
                            </Scrollbars>
                        )}

                    </Droppable>
                </ul>
            </>
        )
    }

    const noGroupReact = () => {
        if (!newNoGroupData.length) {
            return (
                <Droppable key={`noGroup${newNoGroupData.length}`} droppableId={`noGroup`} index={newNoGroupData.length} type={`1`}>
                    {(provided: any, snapshot: any) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps} style={getJobItemStyle(provided.droppableProps.style)}>
                            <div className={styles.group_type}>
                                <div><FormattedMessage id="analysis.auto.group" />
                                    <span className={styles.cancle_group} onClick={cancleGrouping} style={{ display: groupingButton ? 'inline-block' : 'none' }}>
                                        <FormattedMessage id="analysis.revoke" />
                                    </span>
                                </div>
                                <div className={styles.button}>
                                    <Select onChange={handleGrouping} value={groupMethod} disabled={groupingButton}
                                        placeholder={<FormattedMessage id="analysis.select.group.placeholder" />}>
                                        <Option value="version"><FormattedMessage id="analysis.product.version" /></Option>
                                        <Option value="sn"><FormattedMessage id="analysis.by.machine" /></Option>
                                    </Select>
                                </div>
                            </div>
                            <Divider className={styles.line} />
                            <div className={styles.addJobBtn} onClick={handleAddNoVersionJob} >
                                <Space>
                                    {
                                        formatMessage({ id: "analysis.table.add.job" })
                                    }
                                    <CaretDownOutlined />
                                </Space>
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )
        }
        return (
            <>
                <div className={styles.group_type}>
                    <div><FormattedMessage id="analysis.auto.group" />
                        <span className={styles.cancle_group} onClick={cancleGrouping} style={{ display: groupingButton ? 'inline-block' : 'none' }}>
                            <FormattedMessage id="analysis.revoke" />
                        </span>
                    </div>
                    <div className={styles.button}>
                        <Select onChange={handleGrouping} value={groupMethod} disabled={groupingButton} placeholder={formatMessage({ id: 'analysis.select.group.placeholder' })}>
                            <Option value="version"><FormattedMessage id="analysis.product.version" /></Option>
                            <Option value="sn"><FormattedMessage id="analysis.by.machine" /></Option>
                        </Select>
                    </div>

                </div>
                <Divider className={styles.line} />
                <ul>
                    <Scrollbars autoHeightMax={scroll.height - 94 + 68 + 80 + 5} autoHeight={true}>
                        <Droppable key={`noGroup${newNoGroupData.length}`} droppableId={`noGroup`} index={newNoGroupData.length} type={`1`}>
                            {(provided: any, snapshot: any) => (
                                <div className={styles.second_part} ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps} style={{ ...getJobItemStyle(provided.droppableProps.style), height: scroll.height - 94 + 68 + 80 }}>

                                    {newNoGroupData.map((obj: any, num: number) => {
                                        if (!obj) return ''
                                        let snArr = _.get(obj, 'server') && obj.server.split(',')
                                        snArr = _.isArray(snArr) ? snArr : []
                                        return (
                                            <Draggable key={obj.id} draggableId={obj.id} index={num}>
                                                {(provided: any) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={getJobItemStyle(provided.draggableProps.style)}
                                                    >
                                                        <li key={obj.job_id} style={{ background: '#fff' }}>
                                                            <div>{obj.name}</div>
                                                            <div>
                                                                {obj.product_version && <PopoverEllipsis title={obj.product_version} refData={groupData} customStyle={{ display: 'inline-block', maxWidth: '50%', paddingRight: 8 }}>
                                                                    <>
                                                                        <ProductIcon style={{ marginRight: 2, transform: 'translateY(2px)' }} />{obj.product_version}
                                                                    </>
                                                                </PopoverEllipsis>}

                                                                {getSnDom(snArr)}
                                                            </div>
                                                            <div>
                                                                <span>{`#${obj.job_id}`}</span>
                                                                <span>{obj.creator_name}</span>
                                                                <Popconfirm
                                                                    title={<FormattedMessage id="analysis.delete.job.prompt" />}
                                                                    onConfirm={_.partial(handleNoGroupJobDelClick, _, num)}
                                                                    okText={<FormattedMessage id="operation.confirm" />}
                                                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                                                    arrowPointAtCenter={true}
                                                                    trigger="click"
                                                                    onVisibleChange={_.partial(handleVisibleChange)}
                                                                >
                                                                    <span
                                                                        style={{ opacity: currentDelJobDom === `ongroup${num}` ? 1 : 0 }}
                                                                        className={styles.compare_job_delete} onClick={_.partial(handleNoGroupJobDel, num)}>
                                                                        <FormattedMessage id="operation.delete" />
                                                                    </span>
                                                                </Popconfirm>
                                                            </div>
                                                        </li>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </Scrollbars>
                </ul>
                <div className={styles.addJobBtn} onClick={handleAddNoVersionJob} >
                    <Space>
                        {
                            formatMessage({ id: "analysis.table.add.job" })
                        }
                        <CaretDownOutlined />
                    </Space>
                </div>
            </>
        )
    }

    const handleAlertClose = () => {
        setIsAlertClose(false)
    }

    const getContainerWidth = () => {
        if (originType === 'test_result') return isExpand ? innerWidth - 276 - 20 : innerWidth - 16 - 20
        if (newGroupData.length > 4) return '100%'
        return innerWidth - 40
    }

    const handleOk = (obj: any) => {
        setNoGroupData(obj)
        setIsModalOpen(false);
    };

    const handleJobCancel = () => {
        setIsModalOpen(false);
    }

    return (
        <Layout style={{ paddingRight: 20, paddingBottom: 20, height: layoutHeight - 50, minHeight: 0, overflow: 'auto', background: '#f5f5f5' }} className={styles.compare_job}>
            <Spin spinning={loading}>
                <div className={styles.content} style={{ height: layoutHeight - 50 - 56 }}>
                    <DragDropContext onDragEnd={onGroupDragEnd} >
                        <Droppable droppableId={'droppable1'} direction="horizontal">
                            {(provided: any, snapshot: any) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                        ...getListStyle(provided.droppableProps.style),
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ width: isExpand ? '276px' : '16px', height: layoutHeight - 50 - 56 - 5 }} className={styles.nogroup_content}>
                                        <Draggable isDragDisabled={true} key={`waitGroup-${noGroupData.length}`} draggableId={`waitGroup-${newNoGroupData.length}`} index={newNoGroupData.length}>
                                            {(provided: any, snapshot: any) => {
                                                return (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={styles.expand_box}
                                                        style={{ ...getItemStyle(provided.draggableProps.style), transform: 'translate(0, 0)' }}>
                                                        <div
                                                            className={`${styles.group_info} ${styles.nogroup_info}`}
                                                            ref={nogroupDom}
                                                            style={{ height: layoutHeight - 50 - 56 - 5, left: 0 }}
                                                        >
                                                            <div className={styles.rightExpandButtom} onClick={handleExpandButtom}>
                                                                {isExpand ? <CompareCollapse /> : <CompareExpand />}
                                                            </div>
                                                            <div className={styles.first_part}>
                                                                <FormattedMessage id="analysis.area.to.grouped" />({noGroupData.length})
                                                            </div>
                                                            <Divider className={styles.line} />
                                                            {noGroupReact()}
                                                        </div>
                                                    </div>
                                                )
                                            }}
                                        </Draggable>
                                    </div>

                                    <div style={{ marginLeft: originType === 'test_result' ? 0 : 20 }} className={styles.group_content}>
                                        <div className={styles.compare_title}>
                                            <span className={styles.title_text}><FormattedMessage id="analysis.title" /></span>
                                            <Text><FormattedMessage id="analysis.subTitle" /></Text>
                                        </div>
                                        {isAlertClose && <Alert
                                            onClose={handleAlertClose}
                                            message={<FormattedMessage id="analysis.isAlertClose" />}
                                            type="info"
                                            showIcon
                                            closable
                                            style={{ width: getContainerWidth(), transition: 'width ease 0.3s' }} />}
                                        <div className={styles.group_box} style={{ marginTop: 20 }}>
                                            {
                                                newGroupData.map((item: any, index: number) => {
                                                    return (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided: any, snapshot: any) => {
                                                                return (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={{
                                                                            height: 50,
                                                                            ...getItemStyle(provided.draggableProps.style)
                                                                        }}>
                                                                        <div
                                                                            className={styles.group_info}
                                                                            style={{ left: `${index * 312}px` }}
                                                                        >
                                                                            {groupItemReact(item, index)}
                                                                            <div
                                                                                style={{ cursor: 'pointer' }}
                                                                                onClick={_.partial(handleAddGroupItem, groupData[index], index)}
                                                                                className={styles.create_job_type}>
                                                                                {item.type === 'baseline' ? <FormattedMessage id="analysis.add.baseline" /> : <FormattedMessage id="analysis.add.job" />}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }}
                                                        </Draggable>
                                                    )
                                                })
                                            }
                                            <Draggable isDragDisabled={true} key={`create-${newGroupData.length}`} draggableId={`create-${newGroupData.length}`} index={newGroupData.length}>
                                                {(provided: any, snapshot: any) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={
                                                            {
                                                                ...getItemStyle(provided.draggableProps.style),
                                                            }
                                                        }>
                                                        <div
                                                            className={styles.create_group}
                                                            style={{ left: groupData.length ? `${(groupData.length) * 312}px` : 0, height: scroll.height + 82, width: local ? 220 : 110 }}
                                                        >
                                                            <div onClick={_.partial(handleAddJobGroup, 'job')} className={styles.popover}>
                                                                <PlusOutlined style={{ fontSize: 14, marginRight: 8 }} /><FormattedMessage id="analysis.create.comparison.group" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        </div>
                                    </div>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                <div className={styles.footer_part}>
                    <div className={styles.bottom}>
                        <Space>
                            <Button onClick={handleClear}><FormattedMessage id="operation.clear" /></Button>
                            <Button type="primary" onClick={handleStartAnalysis} disabled={isSureOk()}><FormattedMessage id="operation.ok" /></Button>
                        </Space>
                    </div>
                </div>

                <EditMarkDrawer ref={editGroupMark} onOk={handleEditMarkOk} />
                <Modal
                    title={<FormattedMessage id="delete.prompt" />}
                    visible={visible}
                    width={480}
                    className={styles.baseline_del_modal}
                    destroyOnClose={true}
                    onCancel={handleCancel}
                    footer={
                        <Row justify="end">
                            <Space>
                                <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                                <Button onClick={handleDelGroup} type="primary" danger><FormattedMessage id="operation.delete" /></Button>
                            </Space>
                        </Row>
                    }
                >
                    <span><FormattedMessage id="analysis.are.you.sure.delete.group" />{`【${currentEditGroup && groupToLocale(currentEditGroup.product_version)}】`}</span>
                </Modal>
                <Modal
                    title={
                        <div
                            style={{
                                width: '100%',
                                cursor: 'move',
                            }}
                            onMouseOver={() => {
                                if (disabled) {
                                    setDisabled(false)
                                }
                            }}
                            onMouseOut={() => {
                                setDisabled(true)
                            }}
                        >
                            {currentEditGroup && groupToLocale(currentEditGroup.product_version)}
                        </div>
                    }
                    centered={true}
                    visible={visibleAddGroupItem}
                    width={1000}
                    className={styles.baseline_del_modal}
                    onOk={handleAddGroupItemOk}
                    onCancel={handleAddGroupItemCancel}
                    maskClosable={false}
                    destroyOnClose={true}
                    wrapClassName={styles.job_Modal}
                >
                    {addGroupTypeFn()}
                </Modal>
                <Modal
                    title={
                        <div
                            style={{
                                width: '100%',
                                cursor: 'move',
                            }}
                            onMouseOver={() => {
                                if (disabled) {
                                    setDisabled(false)
                                }
                            }}
                            onMouseOut={() => {
                                setDisabled(true)
                            }}
                        >
                            <FormattedMessage id="analysis.select.benchmark.group" />
                        </div>
                    }
                    centered={true}
                    visible={visibleBaseGroup}
                    width={1000}
                    className={styles.baseline_del_modal}
                    onCancel={handleBaseGroupModalCancle}
                    maskClosable={false}
                    destroyOnClose={true}
                    wrapClassName={`${styles.job_Modal} ${styles.baseline_group_modal}`}
                >
                    <BaseGroupModal
                        baselineGroupIndex={baselineGroupIndex}
                        baselineGroup={baselineGroup}
                        handleCancle={handleBaseGroupModalCancle}
                        onOk={handleSureOk}
                        creatReportOk={handleCreatReportOk}
                        allGroupData={groupData} />
                </Modal>
                <Modal
                    title={
                        formatMessage({ id: "analysis.select.job" })
                    }
                    visible={isModalOpen}
                    centered={true}
                    width={1000}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={null}
                    onOk={handleOk}
                    onCancel={handleJobCancel}
                >
                    <AllJobTable onOk={handleOk} onCancel={handleJobCancel} noGroupData={noGroupData} />
                </Modal>
                <SaveReport ref={saveReportDraw} onOk={creatReportCallback} allGroup={groupData} />
            </Spin>
        </Layout>
    )
}
