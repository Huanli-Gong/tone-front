import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClientSize } from '@/utils/hooks';
import { queryCompareResultList, queryEenvironmentResultList, queryDomainGroup } from './services'
import { history } from 'umi'

import { message, Layout, Row, Select , Modal, Space, Divider, Button, Tag, Alert, Spin, Tooltip, Popconfirm,Typography } from 'antd';
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import EditMarkDrawer from './EditMark'
// import Draggable from 'react-draggable';
import AddJob from './AddJob'
import AddBaseline from './AddBaseline'
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
import { ReactComponent as BaseIcon } from '@/assets/svg/BaseIcon.svg'
import SaveReport from '../../TestReport/components/SaveReport'
import {handleCompareOk,getJobRefSuit} from './CommonMethod'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
// import { writeDocumentTitle } from '@/utils/hooks';
const {Text} = Typography;
const { Option } = Select;
const transformFn: any = (arr: any) => {
    return arr.map((item: any, index:number) => {
        item.product_version = item.product_version || item.name
        if (_.isArray(item.members) && item.members[0]) {
            // const defaultVersion = item.members[0].product_version || item.members[0].version
            // item.product_version = defaultVersion
            const defaultVersion = item.members[0].product_version || item.members[0].version
            if(defaultVersion) item.product_version = defaultVersion
        }
        item.id = +new Date() + index
        return item
    })
}

const transformIdFn = (selectedJob: any) => {
    const arr = selectedJob.filter((obj: any) => obj && _.isArray(obj.members)).map((value: any, index: number) => {
        const members = value.members.filter((val: any) => val).map((item: any, k: number) => {

            if (!item.job_id) return { ...item, id: `${index}-${item.id}-${k}`, job_id: item.id }
            return { ...item, id: `${index}-${item.id}-${k}` }
        })
        return {
            ...value,
            id: `group-${index}`,
            members
        }
    })

    return arr
}
const transformNoGroupIdFn = (selectedJob: any) => {
    const arr = selectedJob.filter((val: any) => val).map((item: any, k: number) => {
        if (!item.job_id) return { ...item, id: `${item.id}-${k}`, job_id: item.id }
        return { ...item, id: `${item.id}-${k}` }
    })
    return arr
}
const EllipsisRect = (props:any) => {
    const {text,flag,isBaseGroup} = props
    const dom = <span className={isBaseGroup ? `${styles.workspace_name} ${styles.base_workspace_name}` : `${styles.workspace_name}`}>
        {flag ? <Tag color='#0089FF' className={styles.baselineColorFn}>基</Tag> : ''}
        {text}
    </span>
    return (
        <>
            {isBaseGroup && <span title='基准组' style={{ paddingRight: 4, transform: 'translateY(-12px)', width: 16, display: 'inline-block' }}><BaseIcon title='基准组' /></span>}
            <Tooltip title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                {dom}
            </Tooltip >
        </>
    )
}
export default (props: any) => {
    const {state} = props.location
    let selectedJob: any = _.get(state,'compareData')
    selectedJob = selectedJob && _.isArray(JSON.parse(selectedJob)) ? JSON.parse(selectedJob) : []
    selectedJob = transformFn(selectedJob)

    let noGroupJob: any = _.get(state,'noGroupJobData')
    noGroupJob = noGroupJob && _.isArray(JSON.parse(noGroupJob)) ? JSON.parse(noGroupJob) : []

    const originType = _.get(state,'originType') || ''

    const {height: layoutHeight} = useClientSize()
    const { ws_id } = props.match.params
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
    const [bounds, setBounds] = useState<any>({ left: 0, top: 0, bottom: 0, right: 0 })
    const [loading, setLoading] = useState(false)
    const draggleRef = useRef(null);
    const newProductVersionGroup = useRef([]);
    const newNoGroup = useRef([]);
    const [ labelBlinking,setLabelBlinking ] = useState(false)
    const [visibleBaseGroup, setVisibleBaseGroup] = useState(false)
    const [currentDelJobDom,setCurrentDelJobDom] = useState<any>(null)
    const [isExpand,seIsExpand] = useState<boolean>(true)
    const [groupingButton,seGroupingButton] = useState<boolean>(false)
    const [groupMethod,setGroupMethod] = useState<any>(null)
    const [isAlertClose,setIsAlertClose] = useState(true)
    const nogroupDom:any = useRef(null)
    const saveReportDraw: any = useRef(null)
    useEffect(() =>{
        if (originType !== 'test_result') handleAddJobGroup()
    },[])
    const handleExpandButtom = () =>{
        seIsExpand(!isExpand);
        if(!isExpand)  nogroupDom.current.style.left = '0'
        if(isExpand)  nogroupDom.current.style.left = '-260px'
    }
    useEffect(() =>{
     if(groupData.length) seGroupingButton(true)
     if(!groupData.length) seGroupingButton(false)
     if( baselineGroupIndex === -1) setBaselineGroup(groupData[0])
    },[groupData,baselineGroupIndex])

    document.title = '配置页-T-One'
    const versionGroupingFn = (arrGroup:any, newGroup:any) => {
        const arr:[] = arrGroup.filter((item: any) => {
           return item.product_version === arrGroup[0].product_version && item.product_id === arrGroup[0].product_id
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if(remainArr.length) versionGroupingFn(remainArr,newGroup)
        if(!remainArr.length) {
            
              newGroup = newGroup.map((brr:any) => {
                return {members: brr,product_version:brr[0]['product_version']}
            })
            newNoGroup.current = newGroup
        }
    }
    const snGroupingFn = (arrGroup:any, newGroup:any) => {
        const arr:[] = arrGroup.filter((item: any) => {
           return item.product_version === arrGroup[0].product_version && item.server === arrGroup[0].server && item.product_id === arrGroup[0].product_id
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if(remainArr.length) snGroupingFn(remainArr,newGroup)
        if(!remainArr.length) {
              newGroup = newGroup.map((brr:any) => {
                return {members: brr,product_version:brr[0]['product_version'],server:brr[0]['server'] }
            })
            newNoGroup.current = newGroup
        }
    }

    const handleGrouping = (type: string) => {
        let groupDataCopy = _.cloneDeep(groupData)
        let noGroupDataCopy = _.cloneDeep(noGroupData)
        const moreSn:any = []
        if(noGroupDataCopy.length && type === 'version'){
            versionGroupingFn(noGroupDataCopy,[])
             newNoGroup.current.forEach((obj:any) =>{
                const matchGroup = _.find(groupDataCopy, function(o) { return o.product_version === obj.product_version && o.product_id === obj.product_id }); // 产品版本 + 产品id 都相同时才分到同一个组里
                if(matchGroup) {
                    matchGroup.members = [...matchGroup.members,...obj.members]
                    const index = _.findIndex(groupDataCopy, function(o:any) { return o.id === matchGroup.id; });
                    if(index !== -1) groupDataCopy[index] = matchGroup
                }
                if(!matchGroup) {
                    const name = addGroupNameFn(groupDataCopy) || `对比组${groupDataCopy.length + 1}`
                    const addGroup = {
                        product_version: obj.product_version || name,
                        members: obj.members,
                        name,
                        type:'job',
                        id: +new Date() + groupDataCopy.length
                    }
                    groupDataCopy.push(addGroup)
                }
            })
        }

        if(noGroupDataCopy.length && type === 'sn'){
            const singleSn:any = []
            noGroupDataCopy.forEach((item:any) => {
                if(item.server && item.server.split(',').length === 1) singleSn.push(item)
                if (!item.server || item.server.split(',').length !== 1) moreSn.push(item)
            })
            if(singleSn.length) snGroupingFn(singleSn, [])
            if(!singleSn.length) newNoGroup.current = []
            // 判断已有组的机器是否相同
            groupDataCopy = groupDataCopy.map((item: any) => {
                let isSnSame = false
                let snArr:any = []
                item.members.forEach((val: any) => {
                    if(_.get(val, 'server')) snArr.push(_.get(val, 'server'))
                })
                snArr = _.uniq(snArr);
                if(snArr.length === 1 && snArr[0].split(',').length === 1) isSnSame = true
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
        window.sessionStorage.setItem('compareData', JSON.stringify(groupDataCopy))
        window.sessionStorage.setItem('noGroupJobData', JSON.stringify(moreSn))
    }
    const cancleGrouping = () =>{
        let noGroupDataCopy = _.cloneDeep(noGroupData)
        groupData.forEach((item:any) => noGroupDataCopy = [...noGroupDataCopy,...item.members])
        setGroupMethod(null)
        setGroupData([])
        setBaselineGroupIndex(-1)
        setBaselineGroup({})
        setNoGroupData(noGroupDataCopy)
        window.sessionStorage.setItem('compareData', JSON.stringify([]))
        window.sessionStorage.setItem('noGroupJobData', JSON.stringify(noGroupDataCopy))
    }

    const onStart = (event: any, uiData: any) => {
        const { clientWidth, clientHeight } = window?.document?.documentElement;
        const targetRect = draggleRef?.current?.getBoundingClientRect();
        setBounds({
            left: -targetRect?.left + uiData?.x,
            right: clientWidth - (targetRect?.right - uiData?.x),
            top: -targetRect?.top + uiData?.y,
            bottom: clientHeight - (targetRect?.bottom - uiData?.y),
        })
    }

    const addGroupNameFn = (arrGroup = groupData) => {
        const arr = arrGroup.map((item:any) => item.product_version && item.product_version.trim())
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
        if(arr.length === 1) {
            setBaselineGroupIndex(0)
            setBaselineGroup(addGroup)
        }
        
        if(arr.length === 2) {
            setBaselineGroupIndex(-1)
            setBaselineGroup({})
        }
        window.sessionStorage.setItem('compareData', JSON.stringify(arr))
    }

    const handleGroupClick = (obj:any, num:number) => {
        setBaselineGroupIndex(num)
        setBaselineGroup(obj)
       
    }
    const handleNoGroupJobDel = (num:number) =>{
        setCurrentDelJobDom(`ongroup${num}`)
    }
    const handleJobDel = (index: number, num: number) =>{
        setCurrentDelJobDom(`${index}${num}`)
    }
    const handleVisibleChange = (visible: any) => {
        if(!visible) setCurrentDelJobDom(null)
    }
    const handleNoGroupJobDelClick = (e: any, num: number) => {
        e.stopPropagation();
        let arr = _.cloneDeep(noGroupData)
        arr = arr.filter((item: any, indexNum: number) => indexNum !== num)
        setNoGroupData(arr)
        setCurrentDelJobDom(null)
        window.sessionStorage.setItem('noGroupJobData', JSON.stringify(arr)) 
    }
    const handleJobDelClick = (e: any, index: number, num: number) => {
        e.stopPropagation();
        let arr = _.cloneDeep(groupData)
        arr[index].members = arr[index].members.filter((item: any, indexNum: number) => indexNum !== num)
        if(!arr[index].members.length) {
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
        window.sessionStorage.setItem('compareData', JSON.stringify(arr)) 
    }

    const handleEditMark = () => {
        editGroupMark.current?.show(
            '编辑组名称', 
            _.cloneDeep(currentEditGroup), 
            groupData[currentEditGroupIndex].members[0].product_version
        )
    }
    const handleDelGroup = () => {
        let arr = _.cloneDeep(groupData)
        arr = arr.filter((item: any, index: number) => index !== currentEditGroupIndex)
        window.sessionStorage.setItem('compareData', JSON.stringify(arr))
        
        if(currentEditGroupIndex === baselineGroupIndex && arr.length !== 1) {
            setBaselineGroupIndex(-1)
            setBaselineGroup({})
        }
        if(arr.length === 1) {
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
    const handleEllipsis = (obj:any, num:number) => {
        setCurrentEditGroup(obj)
        setCurrentEditGroupIndex(num)
    }
    const handleEditMarkOk = (obj:any) => {
        setCurrentEditGroup(obj)
        const arr = _.cloneDeep(groupData)
        arr[currentEditGroupIndex] = obj
        if (currentEditGroupIndex === baselineGroupIndex) setBaselineGroup(obj)
        setGroupData(arr)
        window.sessionStorage.setItem('compareData', JSON.stringify(arr))
    }
    const handleClear = () => {
        setNoGroupData([])
        setGroupData([])
        setBaselineGroup({})
        setBaselineGroupIndex(-1)
        setCurrentEditGroup({})
        setCurrentEditGroupIndex(0)
        window.sessionStorage.setItem('compareData', JSON.stringify([]))
        window.sessionStorage.setItem('noGroupJobData', JSON.stringify([]))
    }

    const isSureOk = () => {
        let member:any = []
        groupData.forEach((ele:any) => {
            member = member.concat(ele.members)
        })
        // if(JSON.stringify(currentEditGroup) !== '{}'){
        //     if(groupData.length && baselineGroupIndex === -1 && currentEditGroup.members.length ) return false
        // }
        if(member.length > 0) return false
        return true
    }

    const handleStartAnalysis = () => {
        if(isSureOk()) return;
        let num = 0
        groupData.forEach((item:any)=>{
            if(item.members.length > 0) num++
        })
        if(num > 1 && baselineGroupIndex === -1) {
            setLabelBlinking(true)
            return message.warning('请先设置基准组')
        }
        setVisibleBaseGroup(true)
        // compareSuite.current?.show('选择BaseGroup对比的内容', baselineGroup)
    }

    useEffect(()=>{
        let timer:any;
        if(labelBlinking){
            timer = setTimeout(() => {
                setLabelBlinking(false)
            }, 3000);
        }else{
            clearTimeout(timer)
        }
    },[ labelBlinking ])
    // const queryCompareResultFn = function* (paramData: any) {
    //     yield queryCompareResultList(paramData)

    // }
    // const queryEenvironmentResultFn = function* (paramData: any) {
    //     yield queryEenvironmentResultList(paramData)

    // }
    const queryDomainGroupFn = async (paramData: any) => {
        const result = await queryDomainGroup(paramData)
        return result

    }
    const queryCompareResultFn = async (paramData: any) => {
        const result = await queryCompareResultList(paramData)
        return result

    }
    const queryEenvironmentResultFn = async (paramData: any) => {
        const result = await queryEenvironmentResultList(paramData)
        return result

    }
    const handleGroupData = () => {
        return groupData.filter((item:any) => _.get(item,'members') && _.get(item,'members').length)
    }
    const handleSureOk = (suiteData: any) => { // suiteData：已选的
        setVisibleBaseGroup(false);
        setLoading(true)
        const confIdArr:any = handleCompareOk(suiteData).confIdArr
        const paramCompare = handleCompareOk(suiteData).paramData
        // queryCompareResultFn(paramCompare), queryEenvironmentResultFn(paramEenvironment)
        const paramEenvironment = handlEenvironment(suiteData)
        Promise.all([queryDomainGroupFn(confIdArr)])
            .then((result: any) => {
                setLoading(false)
                if (result[0].code === 200) {
                    history.push({
                        pathname: `/ws/${ws_id}/test_analysis/result`,
                        state: {
                            wsId: ws_id,
                            // environmentResult: result[1].data,
                            baselineGroupIndex: baselineGroupIndex,
                            allGroupData: handleGroupData(),
                            // compareResult: _.cloneDeep(result[0].data),
                            compareGroupData: paramEenvironment,
                            domainGroupResult: result[0].data,
                            testDataParam:paramCompare,
                            envDataParam:paramEenvironment,
                        }
                    })
                    window.sessionStorage.setItem('compareData', JSON.stringify(groupData))
                    return
                }
                // if (result[1].code === 1358) {
                //     message.error('请添加对比组数据')
                //     return
                // }
                // if (result[0].code !== 200) {
                //     message.error(result[0].msg)
                //     return
                // }
                // if (result[1].code !== 200) {
                //     message.error(result[1].msg)
                // }
            })
            .catch((e) => {
                setLoading(false)
                message.error('请求失败')
                console.log(e)
            })
    }
    const creatReportCallback = (reportData:any,suiteData: any) => { // suiteData：已选的
        setLoading(true)
        const confIdArr:any = handleCompareOk(suiteData).confIdArr
        const paramCompare:any = handleCompareOk(suiteData).paramData
        const paramEenvironment = handlEenvironment(suiteData)

        Promise.all([queryCompareResultFn(paramCompare), queryEenvironmentResultFn(paramEenvironment),queryDomainGroupFn(confIdArr)])
            .then((result: any) => {
                setLoading(false)
                if (result[0].code === 200 && result[1].code === 200 && result[2].code === 200) {

                    history.push({
                        pathname: `/ws/${ws_id}/test_create_report`,
                        state: {
                            wsId: ws_id,
                            environmentResult: result[1].data,
                            baselineGroupIndex: baselineGroupIndex,
                            allGroupData: handleGroupData(),
                            compareResult: _.cloneDeep(result[0].data),
                            compareGroupData: paramEenvironment,
                            domainGroupResult: result[2].data,
                            saveReportData: reportData
                        }
                    })
                    window.sessionStorage.setItem('compareData', JSON.stringify(groupData))
                    return
                }
                if (result[1].code === 1358) {
                    message.error('请添加对比组数据')
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
                message.error('请求失败')
                console.log(e)
            })
    }
    const handleCreatReportOk = (suiteData: any) => { // suiteData：已选的
        setVisibleBaseGroup(false);
        saveReportDraw.current?.show(suiteData)
    }
   
    const changeTag = (arrGroup:any, newGroup:any) => {
        const arr:[] = arrGroup.filter((item: any) => {
           return item.product_version === arrGroup[0].product_version
        })
        newGroup.push(arr)
        const remainArr = _.xorWith(arrGroup, arr, _.isEqual); // 取补集
        if(remainArr.length) changeTag(remainArr,newGroup)
        if(!remainArr.length) {
            newGroup = newGroup.map((brr:[]) => {
                if(brr.length < 2) return brr
                return brr.map((item:any,index:number) => ({...item,product_version:`${item.product_version}(${++index})`}))
            })
            newProductVersionGroup.current = newGroup
        }
    }
    const baseAssemble = (baseObj:any,arr:any) => {
        let brr: any = []
        let baseMembers = _.get(arr, 'members')
        baseMembers = _.isArray(baseMembers) ? baseMembers : []
        baseMembers = baseMembers.filter((val: any) => val)
        const flag = arr?.type === 'baseline'
        baseMembers.forEach((item: any) => {
            if (!flag) {
                brr.push({ is_job: 1, obj_id: item.id, suite_data: baseObj[item.id] || {}})
            }
            if (flag) {
                brr.push({ is_job: 0, obj_id: item.id, baseline_type: item.test_type === 'functional' ? 'func' : 'perf', suite_data: baseObj[item.id] || {}})
            }
        })
        return brr;
    }
    const handlEenvironment = (selData:any) => {
        const {obj:baseObj,trr:compareArr} = getJobRefSuit(selData)
        let groupDataCopy = _.cloneDeep(groupData).filter((item:any) => _.get(item,'members') && _.get(item,'members').length)
        let newGroup:any = []
        if(groupDataCopy.length){
            changeTag(groupDataCopy,[])
            newGroup = newProductVersionGroup.current.flat()
        }
        
        const arr = groupData.filter((item: any, index: any) => index !== baselineGroupIndex).filter((item:any) => _.get(item,'members') && _.get(item,'members').length)
        const array = groupData.filter((item: any, index: any) => _.get(item,'members') && _.get(item,'members').length)
        let base_group = {}
        let compare_groups = []
        if(array.length === 1){
            base_group = {
                tag: newGroup[0]?.product_version || '',
                base_objs: baseAssemble(baseObj,arr[0]),
            }
        }else{
            const baseIndex = _.findIndex(newGroup, function(o:any) { return String(o.id) === String(baselineGroup.id) });
            base_group = {
                tag: newGroup.length ? newGroup[baseIndex]?.product_version : '',
                base_objs: baseAssemble(baseObj,baselineGroup),
            }
    
            compare_groups = _.reduce(arr, (groups: any, obj, num:number) => {
                const compare_objs: any = []
                let members = _.get(obj, 'members')
                members = _.isArray(members) ? members : []
                members = members.filter((val: any) => val)
    
                const flag = obj.type === 'baseline'
                members.forEach((item: any) => {
                    if (!flag) {
                        compare_objs.push({ is_job: 1, obj_id: item.id, suite_data: (compareArr[num] && compareArr[num][item.id]) || {}})
                    }
                    if (flag) {
                        compare_objs.push({ is_job: 0, obj_id: item.id,baseline_type: item.test_type === 'functional' ? 'func' : 'perf', suite_data: compareArr[num][item.id] })
                    }
                })
                const index = _.findIndex(newGroup, function(o:any) { return String(o.id) === String(obj.id) });
                const groupItem: any = {
                    tag: newGroup[index]?.product_version,
                    // tag: newGroup[index]?.product_version || '-',
                    base_objs: compare_objs
                }
                groups.push(groupItem)
                // groups.push(compare_objs)
                return groups
            }, []);
        }
        const paramData = {
            base_group,
            compare_groups
        }
        return paramData
        // const generObj = queryCompareResultFn(paramData)
        // const excuteResult: any = generObj.next();
        // excuteResult.value.then((result: any) => {
        //     const { code, msg } = result;
        //     defaultOption(code, msg);
        // })
    }

    const handleAddBaseline = (e: any, obj: any, index: number) => {
        // e.stopPropagation();
        setCurrentEditGroup(obj)
        setCurrentEditGroupIndex(index)
        setVisibleAddGroupItem(true)
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
        //setBaselineGroupIndex(0)
        if (currentEditGroupIndex === baselineGroupIndex) setBaselineGroup(obj)
        setCurrentEditGroup(obj)
        setGroupData(arr)
        setVisibleAddGroupItem(false);
        window.sessionStorage.setItem('compareData', JSON.stringify(arr))
    }
    
    const addGroupTypeFn = () => {
        if(!currentEditGroup) return
        if (currentEditGroup.type === 'baseline') {
            return <AddBaseline ws_id={ws_id} onOk={handleAddGroupItemOk} onCancel={handleAddGroupItemCancel} currentGroup={currentEditGroup} />
        }
        if (currentEditGroup.type === 'plan') {
            return <AddPlan ws_id={ws_id} onOk={handleAddGroupItemOk} onCancel={handleAddGroupItemCancel} currentGroup={currentEditGroup} />
        }
        return <AddJob ws_id={ws_id} onOk={handleAddGroupItemOk} onCancel={handleAddGroupItemCancel} currentGroup={currentEditGroup} allGroup={groupData} allNoGroupData={noGroupData}/>
    }

    const contentMark = (
        <div>
            <p onClick={_.partial(handleEditMark)}>编辑组名称</p>
            <p onClick={_.partial(showModal)}>移除此组</p>
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
                <span onMouseOver={handleMouseOver} style={{color: '#1890FF', boxSizing:'border-box',display: 'inline-block',maxWidth: '50%',overflow: 'hidden',textOverflow: 'ellipsis',whiteSpace: 'nowrap'}}>
                    <JiqiIcon style={{marginRight: 2}}/>
                    {snArr[0]}
                </span>
            </Tooltip>
        )
    }

    const reorderGroup = (list:any, startIndex:number, endIndex:number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const reorder = (list:any, startIndex:number, endIndex:number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const diferentDeorderOne = (groupArr:any, startIndex:number, endIndex:number,startGroupIndex:number,endGroupIndex:number) => {
        const arr = _.cloneDeep(groupArr[endGroupIndex].members)
        const [removed] = groupArr[startGroupIndex].members.splice(startIndex, 1);
        groupArr[endGroupIndex].members.splice(endIndex, 0, removed);
        const productMark = _.get(groupArr[endGroupIndex].members[0],'product_version')
        if ((!arr || !arr.length) && productMark) {
            groupArr[endGroupIndex].product_version = productMark
        }
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
    const diferentDeorderThree = (groupArr:any,noGoupArr:any, startIndex:number, endIndex:number,startGroupIndex:number) => {
        const [removed] = groupArr[startGroupIndex].members.splice(startIndex, 1);
        noGoupArr.splice(endIndex, 0, removed);
        return {groupArr,noGoupArr}
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
        if(result.source.droppableId !== result.destination.droppableId && result.destination.droppableId === 'noGroup') {
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
        // dropped outside the list2
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
                if (item.id === baselineGroup.id) {
                    setBaselineGroupIndex(num)
                    setBaselineGroup(item)
                }
            })
            setGroupData(itemObj)

        } else {
            onDragEnd(result)
        }
    }

    const getListStyle = (draggableStyle:any) => ({
        // background: isDraggingOver ? 'lightblue' : 'lightgrey',
        display: 'flex',
        alignItems: 'flex-start',
        // overflow: 'auto',
        overflowY: 'hidden',
        userSelect: 'none',
        outline: 'none',
        ...draggableStyle
    });
    const getItemStyle = (draggableStyle:any) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        outline: 'none',
        // padding: grid * 2,
        marginRight: 16,
        // change background colour if dragging
        // background: isDragging ? 'lightgreen' : 'grey',

        // styles we need to apply on draggables
        ...draggableStyle,
    });
    const getJobItemStyle = (draggableStyle: any) => ({
        userSelect: 'none',
        outline: 'none',
        ...draggableStyle
    });
    const newGroupData = transformIdFn(_.cloneDeep(groupData))
    const newNoGroupData = transformNoGroupIdFn(noGroupData)

    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 329 + 8 - 22 - 5,
    }

    const groupItemReact = (item: any, index: number) => {
        if (!_.get(item, 'members').length) {
            return (
                <Droppable key={`Group${index}`} droppableId={`Group${index}`} index={index} type={`1`}>
                    {(provided: any, snapshot: any) => (

                        <div className={styles.second_part} ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps} style={getJobItemStyle(provided.droppableProps.style)}>
                            <div className={styles.first_part}>
                                <EllipsisRect text={item.product_version} flag={item.type === 'baseline'} isBaseGroup={index === baselineGroupIndex && groupData.length > 1}/>
                                <span className={styles.opreate_button}> 
                                    <ProverEllipsis current={groupData[index]} currentIndex={index} contentMark={contentMark} handleEllipsis={handleEllipsis} currentEditGroupIndex={currentEditGroupIndex} />
                                </span>
                                {index !== baselineGroupIndex && <span className={labelBlinking ? styles.baseTag : styles.baseGroupColorFn} onClick={_.partial(handleGroupClick, groupData[index], index)}>
                                    设为基准组
                                </span>}
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
                    <EllipsisRect text={item.product_version} flag={item.type === 'baseline'} isBaseGroup={index === baselineGroupIndex && groupData.length > 1}/>
                    <span className={styles.opreate_button}>
                        <ProverEllipsis current={groupData[index]} currentIndex={index} contentMark={contentMark} handleEllipsis={handleEllipsis} currentEditGroupIndex={currentEditGroupIndex} />
                    </span>
                    {index !== baselineGroupIndex && <span className={labelBlinking ? styles.baseTag : styles.baseGroupColorFn} onClick={_.partial(handleGroupClick, groupData[index], index)}>
                        设为基准组
                    </span>}
                </div>

                <Divider className={styles.line} />
                <ul>
                    <Droppable key={`Group${index}`} droppableId={`Group${index}`} index={index} type={`1`}>
                        {(provided: any, snapshot: any) => (
                            <Scrollbars autoHeightMax={ isAlertClose ? scroll.height + 64 - 20: scroll.height + 64 + 32} autoHeight>
                                <div className={styles.second_part} ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps} style={getJobItemStyle(provided.droppableProps.style)}>

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
                                                                {obj.product_version && <PopoverEllipsis title={obj.product_version} refData={groupData} customStyle={{ display: 'inline-block', maxWidth: '50%', paddingRight: 8 }}>
                                                                    <>
                                                                    <ProductIcon style={{ marginRight: 2,transform: 'translateY(2px)' }} />{obj.product_version}
                                                                    </>
                                                                </PopoverEllipsis>}
                                                                {getSnDom(snArr)}
                                                            </div>
                                                            <div>
                                                                <span>{`#${obj.job_id}`}</span>
                                                                <span>{obj.creator_name}</span>
                                                                <Popconfirm
                                                                    title='你确定要删除该Job吗？'
                                                                    onConfirm={_.partial(handleJobDelClick, _, index, num)}
                                                                    okText="确认"
                                                                    cancelText="取消"
                                                                    arrowPointAtCenter={true}
                                                                    trigger="click"
                                                                    onVisibleChange={_.partial(handleVisibleChange, _, index, num)}
                                                                >
                                                                    <span
                                                                        style={{ opacity: currentDelJobDom === `${index}${num}` ? 1 : 0 }}
                                                                        className={styles.compare_job_delete} onClick={_.partial(handleJobDel, index, num)}>删除</span>
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
                                <div>自动分组：<span className={styles.cancle_group} onClick={cancleGrouping} style={{display: groupingButton ? 'inline-block': 'none'}}>撤销</span>
                                </div>
                                <div className={styles.button}>
                                    <Select onChange={handleGrouping} value={groupMethod} disabled={groupingButton} placeholder="请选择自动分组方式">
                                        <Option value="version">按产品版本</Option>
                                        <Option value="sn">按机器</Option>
                                    </Select>
                                </div>
                            </div>

                            <Divider className={styles.line} />
                            <div style={{height:layoutHeight - 50 - 56 - 94 - 43}}></div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )
        }
        return (
            <>
                <div className={styles.group_type}>
                    <div>自动分组：<span className={styles.cancle_group} onClick={cancleGrouping} style={{display: groupingButton ? 'inline-block': 'none'}}>撤销</span>
                    </div>
                    <div className={styles.button}>
                        <Select onChange={handleGrouping} value={groupMethod} disabled={groupingButton} placeholder="请选择自动分组方式">
                            <Option value="version">按产品版本</Option>
                            <Option value="sn">按机器</Option>
                        </Select>
                    </div>

                </div>
                <Divider className={styles.line} />
                <ul>
                    <Scrollbars autoHeightMax={scroll.height - 94 + 68 + 80 + 5} autoHeight={true}>
                        <Droppable key={`noGroup${newNoGroupData.length}`} droppableId={`noGroup`} index={newNoGroupData.length} type={`1`}>
                            {(provided: any, snapshot: any) => (
                                <div className={styles.second_part} ref={provided.innerRef} {...provided.droppableProps} {...provided.dragHandleProps} style={{...getJobItemStyle(provided.droppableProps.style),height:scroll.height - 94 + 68 + 80}}>

                                    { newNoGroupData.map((obj: any, num: number) => {
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
                                                                    title='你确定要删除该Job吗？'
                                                                    onConfirm={_.partial(handleNoGroupJobDelClick, _, num)}
                                                                    okText="确认"
                                                                    cancelText="取消"
                                                                    arrowPointAtCenter={true}
                                                                    trigger="click"
                                                                    onVisibleChange={_.partial(handleVisibleChange)}
                                                                >
                                                                    <span
                                                                        style={{ opacity: currentDelJobDom === `ongroup${num}` ? 1 : 0 }}
                                                                        className={styles.compare_job_delete} onClick={_.partial(handleNoGroupJobDel, num)}>删除</span>
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
            </>
        )
    }
    const handleAlertClose = () => {
        setIsAlertClose(false)
    }
    const getContainerWidth = () => {
        // if (originType === 'test_result') return isExpand ? 'calc(100% - 276px)' : 'calc(100% - 16px)'
        // return 'calc(100% - 20px)'
        if (originType === 'test_result') return isExpand ? innerWidth - 276 - 20 : innerWidth - 16 - 20
        if(newGroupData.length > 4) return '100%'
        return innerWidth - 40
    }
   
    return (
        <Layout style={{ paddingRight:20,paddingBottom: 20, height: layoutHeight - 50, minHeight: 0, overflow: 'auto', background: '#f5f5f5' }} className={styles.compare_job}>
            <Spin spinning={loading}>
                <div className={styles.content} style={{height: layoutHeight - 50 - 56}}>
                    <DragDropContext onDragEnd={onGroupDragEnd} >
                        <Droppable droppableId={'droppable1'} direction="horizontal">
                            {(provided:any, snapshot:any) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                        ...getListStyle(provided.droppableProps.style),
                                        width: '100%'
                                        // float: 'left',
                                    }}
                                >
                                    <div style={{ width: isExpand ? '276px' : '16px', height: layoutHeight - 50 - 56 - 5,display: originType === 'test_result' ? 'block' : 'none' }} className={styles.nogroup_content}>
                                        <Draggable isDragDisabled={true} key={`waitGroup-${noGroupData.length}`} draggableId={`waitGroup-${newNoGroupData.length}`} index={newNoGroupData.length}>
                                            {(provided: any, snapshot: any) => {
                                                return (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={styles.expand_box}
                                                        style={{ ...getItemStyle(provided.draggableProps.style), transform: 'translate(0, 0)' }}>
                                                        <div className={`${styles.group_info} ${styles.nogroup_info}`} ref={nogroupDom} style={{ height: layoutHeight - 50 - 56 - 5,left: 0 }}>
                                                            <div className={styles.rightExpandButtom} onClick={handleExpandButtom}>
                                                                {isExpand ? <CompareCollapse /> : <CompareExpand />}
                                                            </div>
                                                            <div className={styles.first_part}>
                                                                {`待分组区(${noGroupData.length})`}
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
                                            <span className={styles.title_text}>对比分析</span>
                                            <Text>提供多种数据对比分析能力，支持job在线聚合对比分析方式</Text>
                                        </div>
                                        {isAlertClose && <Alert
                                            onClose={handleAlertClose}
                                            message="合并规则：取所有Job的并集数据；如果有重复的，排序靠前的Job优先。"
                                            type="info"
                                            showIcon
                                            closable
                                            style={{ width: getContainerWidth(), transition: 'width ease 0.3s' }} />}
                                        <div className={styles.group_box} style={{marginTop: 20}}>
                                            {
                                                newGroupData.map((item: any, index: number) => {
                                                    return (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided: any, snapshot: any) => {
                                                                return (
                                                                    <div
                                                                        // style={{ height: 50 }}
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={{
                                                                            height: 50,
                                                                            // marginTop: isAlertClose ? 86 : 38,
    
                                                                            ...getItemStyle(provided.draggableProps.style)
                                                                        }}>
                                                                        <div
                                                                            className={styles.group_info}
                                                                            style={{ left: `${index * 312}px` }}
                                                                        >
                                                                            {groupItemReact(item, index)}
                                                                            {
                                                                                item.type === 'baseline' ?
                                                                                    <div
                                                                                        style={{ cursor: 'pointer' }}
                                                                                        onClick={_.partial(handleAddBaseline, _, groupData[index], index)}
                                                                                        className={styles.create_job_type}>
                                                                                        添加基线
                                                                                    </div> :
                                                                                    <div
                                                                                        style={{ cursor: 'pointer' }}
                                                                                        onClick={_.partial(handleAddGroupItem, groupData[index], index)}
                                                                                        className={styles.create_job_type}>
                                                                                        添加Job
                                                                                    </div>
                                                                            }

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
                                                                // marginTop: isAlertClose ? 86 : 38,
                                                            }
                                                        }>
                                                        <div className={styles.create_group} style={{ left: groupData.length ? `${(groupData.length) * 312}px` : 0, height: scroll.height + 82, width: 105 }}>
                                                            <div onClick={_.partial(handleAddJobGroup, 'job')} className={styles.popover}>
                                                                <PlusOutlined style={{ fontSize: 14, marginRight: 8 }} />新建对比组
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
                            <Button onClick={handleClear}>清空</Button>
                            <Button type="primary" onClick={handleStartAnalysis} disabled={isSureOk()}>确定</Button>
                        </Space>
                    </div>
                </div>

                <EditMarkDrawer ref={editGroupMark} onOk={handleEditMarkOk} />
                <Modal
                    title="删除提示"
                    visible={visible}
                    width={480}
                    className={styles.baseline_del_modal}
                    destroyOnClose={true}
                    onCancel={handleCancel}
                    footer={
                        <Row justify="end">
                            <Space>
                                <Button onClick={handleCancel}>取消</Button>
                                <Button onClick={handleDelGroup} type="primary" danger>删除</Button>
                            </Space>
                        </Row>
                    }
                >
                    <span>{`你确定要删除组【${currentEditGroup && currentEditGroup.product_version}】吗？`}</span>
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
                            {currentEditGroup && currentEditGroup.product_version}
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
                // modalRender={modal => (
                // <Draggable
                //     disabled={disabled}
                //     bounds={bounds}
                //     onStart={(event: any, uiData: any) => onStart(event, uiData)}
                // >
                //     <div ref={draggleRef}>{modal}</div>
                // </Draggable>
                // )}
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
                            选择基准组对比的内容
                    </div>
                    }
                    centered={true}
                    visible={visibleBaseGroup}
                    width={1000}
                    className={styles.baseline_del_modal}
                    // onOk={handleAddGroupItemOk}
                    onCancel={handleBaseGroupModalCancle}
                    maskClosable={false}
                    destroyOnClose={true}
                    wrapClassName={`${styles.job_Modal} ${styles.baseline_group_modal}`}
                // modalRender={modal => (
                // <Draggable
                //     disabled={disabled}
                //     bounds={bounds}
                //     onStart={(event: any, uiData: any) => onStart(event, uiData)}
                // >
                //     <div ref={draggleRef}>{modal}</div>
                // </Draggable>
                // )}
                >
                    <BaseGroupModal
                        baselineGroupIndex={baselineGroupIndex}
                        baselineGroup={baselineGroup}
                        handleCancle={handleBaseGroupModalCancle}
                        onOk={handleSureOk}
                        creatReportOk={handleCreatReportOk}
                        allGroupData={groupData} />
                </Modal>
                <SaveReport ref={saveReportDraw} onOk={creatReportCallback} ws_id = {ws_id} allGroup={groupData}/>
            </Spin>
        </Layout>
    )
}
