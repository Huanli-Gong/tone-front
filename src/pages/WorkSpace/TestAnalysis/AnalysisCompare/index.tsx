/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import React, { useState, useEffect, useRef } from 'react';
import { useClientSize } from '@/utils/hooks';
import { queryEenvironmentResultList, queryDomainGroup } from './services'
import { history, useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { message, Layout, Menu, Select, Space, Divider, Button, Alert, Spin, Tooltip, Popconfirm, Typography, Popover } from 'antd';
import type { MenuProps } from "antd"
import styles from './index.less'
import { PlusOutlined, CaretDownOutlined, MoreOutlined } from '@ant-design/icons'
import EditMarkDrawer from './EditMark'
import BaseGroupModal from './BaseGroupModal'
import _ from 'lodash'
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
    getListStyle,
    getItemStyle,
    getJobItemStyle
} from './PublicMethod';
import AllJobTable from './AllJobTable';
import { v4 as uuid } from 'uuid';
import DeleteGroupModal from './Modals/DeleteGroupModal';
import AddGroupItemModal from './Modals/AddGroupItem';

const { Text } = Typography;
const { Option } = Select;

export default (props: any) => {
    const { formatMessage } = useIntl()
    const local = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const { state } = props.location
    let selectedJob: any = _.get(state, `${ws_id}-compareData`)
    selectedJob = selectedJob && _.isArray(JSON.parse(selectedJob)) ? JSON.parse(selectedJob) : []
    selectedJob = transformFn(selectedJob)
    let noGroupJob: any = _.get(state, `${ws_id}-noGroupJobData`)
    noGroupJob = noGroupJob && _.isArray(JSON.parse(noGroupJob)) ? JSON.parse(noGroupJob) : []
    const originType = _.get(state, `${ws_id}-originType`) || ''
    const { height: layoutHeight } = useClientSize()
    const [groupData, setGroupData] = useState<any>(selectedJob)
    const [noGroupData, setNoGroupData] = useState<any>(noGroupJob)
    // const [baselineGroup, setBaselineGroup] = useState(selectedJob[0] || {})
    // const [baselineGroupIndex, setBaselineGroupIndex] = useState<number>(-1)
    const editGroupMark: any = useRef(null)
    const [loading, setLoading] = useState(false)
    const newProductVersionGroup = useRef([]);
    const newNoGroup = useRef([]);
    const [labelBlinking, setLabelBlinking] = useState(false)
    const [currentDelJobDom, setCurrentDelJobDom] = useState<any>(null)
    const [isExpand, seIsExpand] = useState<boolean>(true)
    const [groupingButton, seGroupingButton] = useState<boolean>(false)
    const [groupMethod, setGroupMethod] = useState<any>(null)
    const [isAlertClose, setIsAlertClose] = useState(true)
    const nogroupDom: any = useRef(null)
    const saveReportDraw: any = useRef(null)

    document.title = '配置页-T-One'

    const deleteGroupModalRef: any = useRef(null)
    const addGroupItemModal: any = useRef(null)
    const startCompareModalRef: any = useRef(null)
    const allJobSelectRef: any = useRef(null)

    const baseGroupIndex = React.useMemo(() => {
        return groupData.findIndex(({ is_base_group }: any) => is_base_group)
    }, [groupData])

    useEffect(() => {
        /* 引起热更新新增一个对比组 */
        if (originType !== 'test_result') handleAddJobGroup()
    }, [])

    const handleExpandButtom = () => {
        seIsExpand(!isExpand);
        if (!isExpand) nogroupDom.current.style.left = '0'
        if (isExpand) nogroupDom.current.style.left = '-260px'
    }

    useEffect(() => {
        seGroupingButton(!!groupData.filter((i: any) => i.type === "job").reduce((p: any, c: any) => {
            const { members } = c
            return p.concat(members)
        }, []).length)
        // setBaselineGroup(groupData[baselineGroupIndex === -1 ? 0 : baselineGroupIndex])
    }, [groupData, /* baselineGroupIndex */])

    const getNameRepeatCount = (name: string) => {
        const count = name.trim().match(/\(\d+\)$/)?.[0].replace(/[\(\)]/g, "")
        return count ? + count : 0
    }

    const checkSameTitleAndReturnNew = (arr: any[], title: string) => {
        const trimTitle = title.trim()
        const nameCountArr = arr.filter(i => i.name.trim().replace(/\(\d+\)$/, "") === trimTitle).map(i => getNameRepeatCount(i.name)).sort((a, b) => b - a)
        const hasCount = nameCountArr?.[0]
        return Object.prototype.toString.call(hasCount) === "[object Number]" ? `${trimTitle}(${(hasCount as number) + 1})` : trimTitle
    }

    const versionGroupingFn = (arrGroup: any, newGroup: any) => {
        const arr: [] = arrGroup.filter((item: any) => {
            return item.product_version === arrGroup[0].product_version && item.product_id === arrGroup[0].product_id
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if (remainArr.length) versionGroupingFn(remainArr, newGroup)
        if (!remainArr.length) {
            newGroup = newGroup.map((brr: any) => {
                return {
                    members: brr,
                    product_version: brr[0]?.['product_version'],
                    product_id: brr[0]?.['product_id'],
                    ws_id: brr[0]?.['ws_id'],
                }
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
                return { members: brr, product_version: brr[0]['product_version'], server: brr[0]['server'], ws_id: brr[0]?.['ws_id'] }
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
                    const name = addGroupNameFn(groupDataCopy, obj.product_version)
                    const addGroup = {
                        product_version: obj.product_version,
                        members: obj.members,
                        selectedWsId: obj.ws_id || ws_id,
                        product_id: obj.product_id,
                        name,
                        type: 'job',
                        id: uuid()
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
                    const name = addGroupNameFn(groupDataCopy, obj.product_version)
                    const addGroup = {
                        product_version: obj.product_version,
                        members: obj.members,
                        selectedWsId: obj.ws_id || ws_id,
                        product_id: obj.product_id,
                        name,
                        type: 'job',
                        id: uuid()
                    }
                    groupDataCopy.push(addGroup)
                }
            })
        }
        setGroupMethod(type)
        setGroupData(groupDataCopy)
        /* setBaselineGroup(groupDataCopy[baselineGroupIndex] || {}) */
        setNoGroupData(moreSn)
    }

    const handleAddNoVersionJob = () => {
        allJobSelectRef.current?.show();
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
        // setBaselineGroupIndex(-1)
        // setBaselineGroup({})
        setNoGroupData(results)
    }

    const addGroupNameFn = (arrGroup = groupData, defautTitle = formatMessage({ id: 'analysis.comparison.group' })) => {
        return checkSameTitleAndReturnNew(arrGroup, defautTitle || formatMessage({ id: 'analysis.comparison.group' }))
    }

    const handleAddJobGroup = (type = "") => {
        const arr = _.cloneDeep(groupData)
        const name = addGroupNameFn()
        const addGroup = {
            product_version: undefined,
            product_id: undefined,
            members: [],
            selectedWsId: ws_id,
            name,
            type,
            id: uuid()
        }
        arr.push(addGroup)
        setGroupData(arr)
        /* if (arr.length === 1) {
            setBaselineGroupIndex(0)
            setBaselineGroup(addGroup)
        }

        if (arr.length === 2) {
            setBaselineGroupIndex(-1)
            setBaselineGroup({})
        } */
    }

    const handleGroupClick = (obj: any, num: number) => {
        /* setBaselineGroupIndex(num)
        setBaselineGroup(obj) */
        setGroupData((p: any) => p.map((i: any, idx: number) => ({ ...i, is_base_group: num === idx })))
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
    }
    const handleJobDelClick = (e: any, index: number, num: number) => {
        e.stopPropagation();
        let arr = _.cloneDeep(groupData)
        arr[index].members = arr[index].members.filter((item: any, indexNum: number) => indexNum !== num)
        if (!arr[index].members.length) {
            // 空组时重置组的对比标识
            const name = addGroupNameFn()
            arr[index].product_version = name
            arr[index].name = name
        }
        setGroupData(arr)
        /* setBaselineGroup(arr[baselineGroupIndex]) */
        setCurrentDelJobDom(null)
    }

    React.useEffect(() => {
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify(groupData))
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify(noGroupData))
    }, [groupData, noGroupData, ws_id])

    const handleDelGroup = (obj: any) => {
        setGroupData((p: any) => {
            const list = p.filter((i: any) => i.id !== obj.id)
            // if (list.length === 1) setBaselineGroupIndex(0)
            return list
        })
    }

    const handleEditMarkOk = (obj: any) => {
        setGroupData((p: any) => p.map((i: any) => i.id === obj.id ? obj : i))
    }

    const handleClear = () => {
        setNoGroupData([])
        setGroupData([])
        /* setBaselineGroup({})
        setBaselineGroupIndex(-1) */
    }

    const canCompare = React.useMemo(() => {
        const member: any[] = []
        for (const ele of groupData)
            member.push(ele.members)
        return !(member.length > 0)
    }, [groupData])

    const handleStartAnalysis = () => {
        if (canCompare) return;

        for (let i = 0, len = groupData.length; i < len; i++) {
            const term = groupData[i]
            if (term.members && term.members.length === 0) {
                message.warning(formatMessage({ id: "analysis.comparison.group.compare_data.empty" }))
                return
            }
        }

        /* if (baselineGroupIndex !== -1 && groupData[baselineGroupIndex]?.members?.length === 0) {
            return message.warning(formatMessage({ id: "analysis.comparison.base_group.compare_data.empty" }))
        } */

        let num = 0
        let flag = false
        groupData.forEach((item: any) => {
            if (item.members.length > 0) {
                num++
                flag = item.type === 'baseline'
            }
        })
        if (num > 1 && baseGroupIndex === -1) {
            setLabelBlinking(true)
            const localStr = formatMessage({ id: 'analysis.please.set.the.benchmark.group' })
            return message.warning(localStr)
        }
        if (num === 1 && flag) {
            return message.warning(formatMessage({ id: "analysis.please.add.comparison.group" }))
        }

        if (groupData.length === 1 && baseGroupIndex === -1) {
            setGroupData((p: any) => p.map((i: any) => ({ ...i, is_base_group: true })))
        }

        startCompareModalRef?.current.show()
        return
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
        setLoading(true)
        Promise.all([queryDomainGroupFn(params)])
            .then((result: any) => {
                setLoading(false)
                if (result[0].code === 200) {
                    history.push({
                        pathname: `/ws/${ws_id}/test_analysis/result`,
                        state: {
                            wsId: ws_id,
                            baselineGroupIndex: baseGroupIndex,
                            allGroupData: handleGroupData(),
                            // compareResult: _.cloneDeep(result[0].data),
                            compareGroupData: paramEenvironment,
                            domainGroupResult: result[0].data,
                            testDataParam: suiteData,
                            envDataParam: paramEenvironment,
                        }
                    })
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
        const func_suite = suiteData.func_suite_dic || {}
        const perf_suite = suiteData.perf_suite_dic || {}
        const baseIndex = 0;
        const func_keys = Object.keys(func_suite) || []
        const perf_keys = Object.keys(perf_suite) || []
        const duplicate: any = []
        const newSuiteData = {
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
                            baselineGroupIndex: baseGroupIndex,
                            allGroupData: handleGroupData(),
                            testDataParam: _.cloneDeep(newSuiteData),
                            domainGroupResult: result[1].data,
                            compareGroupData: paramEenvironment,
                            saveReportData: reportData
                        }
                    })
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
        startCompareModalRef.current.hide()
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
        const { baseArr, compareArr } = getJobRefSuit(selData, groupData.map((i: any) => i.members || []).flat(Infinity))
        let groupDataCopy = _.cloneDeep(groupData).filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length)
        let newGroup: any = []
        if (groupDataCopy.length) {
            changeTag(groupDataCopy, [])
            newGroup = newProductVersionGroup.current.flat()
        }

        const arr = groupData.filter((item: any, index: any) => index !== baseGroupIndex).filter((item: any) => _.get(item, 'members') && _.get(item, 'members').length)
        const array = groupData.filter((item: any, index: any) => _.get(item, 'members') && _.get(item, 'members').length)
        let base_group = {}
        let compare_groups = []
        if (array.length === 1) {
            base_group = {
                tag: newGroup[0]?.name || '',
                base_objs: baseArr
            }
        } else {
            // const baseIndex = _.findIndex(newGroup, function (o: any) { return String(o.id) === String(baselineGroup.id) });
            base_group = {
                tag: newGroup.length ? newGroup[baseGroupIndex]?.name : '',
                base_objs: baseArr,
            }

            compare_groups = _.reduce(arr, (groups: any, obj) => {
                const index = _.findIndex(newGroup, function (o: any) { return String(o.id) === String(obj.id) });
                const compareIds = newGroup[index]?.members?.map((i: any) => i.id)

                const groupItem: any = {
                    tag: newGroup[index]?.name,
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

    const ContentMark: React.FC<AnyType> = ({ group }) => {
        const [open, setOpen] = React.useState(false)

        const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
            if (key === "editMark") {
                editGroupMark.current?.show(group)
            }
            if (key === "deleteMark") {
                deleteGroupModalRef.current?.show(group)
            }
            setOpen(false)
        }

        return (
            <Popover
                trigger={["click"]}
                onOpenChange={setOpen}
                open={open}
                overlayClassName={styles.groupOptionIconStyle}
                content={
                    <Menu
                        onClick={handleMenuClick}
                        items={
                            ["editMark", "deleteMark"]
                                .map((i: any) => ({
                                    key: i,
                                    title: formatMessage({ id: `analysis.${i}` }),
                                    label: formatMessage({ id: `analysis.${i}` }),
                                }))
                        }
                    />
                }
            >
                <span className={styles.opreate_button}>
                    <MoreOutlined />
                </span>
            </Popover>
        )
    }

    const handleItemAddOk = (data: any) => {
        setGroupData((p: any[]) => p.map(
            (i: any) => {
                if (data.id === i.id) {
                    if (data?.by_edit === 1)
                        return data
                    return { ...data, name: addGroupNameFn(p, data?.product_version) }
                }
                return i
            }
        ))
    }

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
        const text = snArr.map((val: any) => <span key={uuid()}>{val}<br /></span>)
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
        const realGroup = groupArr[endGroupIndex]
        const arr = _.cloneDeep(realGroup.members)
        const [removed] = groupArr[startGroupIndex].members.splice(startIndex, 1);
        realGroup.members.splice(endIndex, 0, removed);
        const productMark = _.get(realGroup.members[0], 'product_version')
        if ((!arr || !arr.length) && productMark) {
            realGroup.product_version = productMark
            if (realGroup?.by_edit !== 1 && realGroup.name.replace(/\(\d+\)$/, "") !== realGroup.product_version) {
                const name = checkSameTitleAndReturnNew(groupArr, productMark)
                realGroup.name = name
            }
        }
        realGroup.type = groupArr[startGroupIndex].type
        realGroup.selectedWsId = groupArr[startGroupIndex].selectedWsId
        return groupArr;
    };

    const diferentDeorderTwo = (noGoupArr: any, groupArr: any, startIndex: number, endIndex: number, endGroupIndex: number) => {
        const realGroup = groupArr[endGroupIndex]
        const arr = _.cloneDeep(realGroup.members)
        const [removed] = noGoupArr.splice(startIndex, 1);
        realGroup.members.splice(endIndex, 0, removed);
        const productMark = _.get(realGroup.members[0], 'product_version')
        if ((!arr || !arr.length) && productMark) {
            realGroup.product_version = productMark
            if (realGroup?.by_edit !== 1 && realGroup.name.replace(/\(\d+\)$/, "") !== realGroup.product_version) {
                const name = checkSameTitleAndReturnNew(groupArr, productMark)
                realGroup.name = name
            }
        }
        realGroup.type = "job"
        realGroup.product_id = _.get(groupArr[endGroupIndex].members[0], 'product_id')
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
        /* if (baselineGroupIndex === number) setBaselineGroup(groupDataCopy[number])
        if (baselineGroupIndex === desNumber) setBaselineGroup(groupDataCopy[desNumber]) */
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
            /* itemObj.forEach((item: any, num) => {
                if (item && item.id === baselineGroup.id) {
                    setBaselineGroupIndex(num)
                    setBaselineGroup(item)
                }
            }) */
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
                    {(provided: any) => (
                        <div
                            className={styles.second_part}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            {...provided.dragHandleProps}
                            style={getJobItemStyle(provided.droppableProps.style)}
                        >
                            <div className={styles.first_part}>
                                <EllipsisRect
                                    text={item.name}
                                    flag={item.type === 'baseline'}
                                    isBaseGroup={index === baseGroupIndex}
                                />
                                <ContentMark group={groupData[index]} />
                                {
                                    index !== baseGroupIndex &&
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
                        text={item.name}
                        flag={item.type === 'baseline'}
                        isBaseGroup={index === baseGroupIndex}
                    />
                    <ContentMark group={groupData[index]} />
                    {
                        index !== baseGroupIndex &&
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
                        {(provided: any) => (
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
                                                            <Typography.Text ellipsis={{ tooltip: true }}>{obj.name}</Typography.Text>
                                                            <div>
                                                                {
                                                                    obj.name &&
                                                                    <PopoverEllipsis
                                                                        title={obj.name}
                                                                        refData={groupData}
                                                                        customStyle={{ display: 'inline-block', maxWidth: '50%', paddingRight: 8 }}
                                                                    >
                                                                        <>
                                                                            <ProductIcon style={{ marginRight: 2, transform: 'translateY(2px)' }} />
                                                                            {obj.name}
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
                                                                    onOpenChange={_.partial(handleVisibleChange, _, index, num)}
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
                            {(provided: any) => (
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
                                                            <div>
                                                                <Typography.Text ellipsis={{ tooltip: true }}>{obj.name}</Typography.Text>
                                                            </div>
                                                            <div>
                                                                {
                                                                    obj.name &&
                                                                    <PopoverEllipsis title={obj.name} refData={groupData} customStyle={{ display: 'inline-block', maxWidth: '50%', paddingRight: 8 }}>
                                                                        <>
                                                                            <ProductIcon style={{ marginRight: 2, transform: 'translateY(2px)' }} />{obj.name}
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
    };

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
                                                                                onClick={() => addGroupItemModal.current?.show(groupData[index])}
                                                                                className={styles.create_job_type}
                                                                            >
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
                                                {(provided: any) => (
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
                                                            <div onClick={_.partial(handleAddJobGroup, '')} className={styles.popover}>
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
                            <Button
                                type="primary"
                                onClick={handleStartAnalysis}
                                disabled={canCompare}
                            >
                                <FormattedMessage id="operation.ok" />
                            </Button>
                        </Space>
                    </div>
                </div>

                <EditMarkDrawer ref={editGroupMark} onOk={handleEditMarkOk} />

                <DeleteGroupModal
                    ref={deleteGroupModalRef}
                    onOk={handleDelGroup}
                />
                
                <AddGroupItemModal
                    ref={addGroupItemModal}
                    allGroupData={groupData}
                    noGroupData={noGroupData}
                    onOk={handleItemAddOk}
                />

                <BaseGroupModal
                    ref={startCompareModalRef}
                    baselineGroupIndex={baseGroupIndex}
                    onOk={handleSureOk}
                    creatReportOk={handleCreatReportOk}
                    allGroupData={groupData}
                />

                <AllJobTable ref={allJobSelectRef} onOk={handleOk} groupData={groupData} noGroupData={noGroupData} />

                <SaveReport ref={saveReportDraw} onOk={creatReportCallback} allGroup={groupData} />
            </Spin>
        </Layout>
    )
}
