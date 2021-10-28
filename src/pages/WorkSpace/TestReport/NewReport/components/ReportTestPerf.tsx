import React, { useContext, useState, useEffect, useRef, memo, useMemo } from 'react';
import { Space, Popconfirm, Empty } from 'antd';
import { ReportContext } from '../Provider';
import ReportTestFunc from './ReportTestFunc';
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import { ReactComponent as TestGroupIcon } from '@/assets/svg/Report/TestGroup.svg';
import { SettingTextArea } from './EditPublic';
import Performance from './TestDataChild/prefIndex'
import _ from 'lodash';
import { useScroll } from 'ahooks';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import produce from 'immer'
import styled from 'styled-components';
import {
    ModuleWrapper,
    TestDataTitle,
    SubTitle,
    Summary,
    Group,
    TestGroup,
    TestWrapper,
    TestItemText,
    PerfGroupTitle,
    PerfGroupData,
    CloseBtn,
} from '../ReportUI';

type FloatRowState = {
    left: number;
    width: number;
    show: boolean;
    scrollTop: number;
    testDataOffsetTop: number;
    groupOffsetTop: number
}
const GroupBar = styled.div<{ width: number, y: number }>`
    background: #fff;
    position: absolute;
    top: 57px;
    height: 50px;
    // willChange: transform;
    border: 1px solid rgba(0,0,0,0.10);
    z-index: 5;
    width:${({ width }) => width || 0}px;
    transform:translateY(${({ y }) => y || 0}px);
`

const GroupBarWrapper: React.FC<any> = (props) => {
    const { groupRowRef, parentDom, groupLen, envData } = props

    const { top } = useScroll(document.querySelector('#report-body-container') as any)
    

    const floatRow = groupRowRef.current
    const testDataEle = parentDom.current

    if (!floatRow && !testDataEle) return <></>
    const testOffset = (testDataEle as any).offsetTop || 0
    const width = floatRow?.offsetWidth

    const visible = top > (testOffset + floatRow.offsetTop)

    if (visible) {
        return (
            <GroupBar
                width={width}
                y={top - testOffset - floatRow.offsetTop}
            >
                 <Summary style={{ border: 'none', paddingLeft: 34, paddingRight: 31 }}>
                        <Group>
                            <PerfGroupTitle gLen={groupLen}>对比组名称</PerfGroupTitle>
                            {
                                Array.isArray(envData) && envData.length > 0 && envData.map((item: any, idx: number) => {
                                    return (
                                        <PerfGroupData gLen={groupLen} key={idx}>
                                            <Space>
                                                {
                                                    item.is_base &&
                                                    <BaseIcon style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }} title="基准组" />
                                                }
                                            </Space>
                                            <EllipsisPulic title={item.tag} />
                                        </PerfGroupData>
                                    )
                                })
                            }
                        </Group>
                    </Summary>
            </GroupBar>
        )
    }else{
        return <></>
    }
    
}

const ReportTestPref = () => {
    const { btnState, obj, setObj, allGroupData, envData, domainResult, btnConfirm, setEditBtn, bodyRef } = useContext(ReportContext)
    let group = allGroupData?.length
    // const [bodyWidth, setBodyWidth] = useState(1200)
    const [suite, setSuite] = useState([])
    const testDataRef = useRef(null)
    // const [fixedRow, setFixedRow] = useState<FloatRowState>({
    //     left: 0,
    //     width: 0,
    //     show: false,
    //     scrollTop: 0,
    //     testDataOffsetTop: 0,
    //     groupOffsetTop: 0
    // })

    //let dataSource =  _.cloneDeep(domainResult?.perf_item) 
    const data = useMemo(() => {
        if (Array.isArray(domainResult.perf_item)) {
            return domainResult.perf_item
        }
    }, [domainResult])

    const [dataSource, setDataSource] = useState<any>([])
    useEffect(() => {
        setDataSource(data)
    }, [data])

    /* 
        ** 编辑测试项 测试组
    */
    const filterFieldData = (data: any, name: string, field: any, rowKey: string) => {
        return produce(
            data,
            (draftState: any) => {
                draftState.list = data.list.map((i: any) => {
                    if (!i.is_group && i.rowKey == rowKey) {
                        return produce(i, (draft: any) => {
                            draft.name = field
                        })
                    }
                    return i
                })
            }
        )
    }

    const filterData = (item: any, name: string, field: any, rowKey: string) => {
        if (item.rowKey == rowKey)
            return produce(item, (draft: any) => {
                draft.name = field
            })
        if (item.is_group)
            return filterFieldData(item, name, field, rowKey)
        return item
    }
    const handleFieldChange = (field: any, name: string, rowKey: string) => {
        setDataSource(dataSource.map((item: any) => filterData(item, name, field, rowKey)))
    }
    const filterGroup = (item: any, name: string, field: any, rowKey: string) => {
        if (item.rowKey == rowKey) {
            return item.name = field
        }
        return item
    }
    const handleGroupChange = (field: any, name: string, rowKey: string) => {
        setEditBtn(true)
        setDataSource(dataSource.map((item: any) => filterGroup(item, name, field, rowKey)))
    }
    /* 
        ** 删除测试项 测试组
    */
    const handleDelete = (name: string, domain: any, rowKey: any) => {
        setEditBtn(true)
        if (name === 'group') {
            setDataSource(dataSource.map((i: any, idx: number) => {
                let ret: any = []
                if (i.is_group) {
                    i.list.map((b: any) => {
                        if (b.rowKey === rowKey) {
                            ret = i.list.filter((c: any) => c.name !== domain)
                        }
                    })
                    return {
                        ...i,
                        list: ret,
                    }
                }
                return {
                    ...i,
                }
            }))
        } else {
            setDataSource(dataSource.filter((item: any) => item.name !== domain && item.rowKey !== rowKey))
        }
    }

    const simplify = (child: any, idx: number, listId: number, name: string) => {
        let suite_list: any = []
        child.list?.map((suite: any, suiteId: number) => {
            let conf_list: any = []
            suite.conf_list.map((conf: any, index: number) => {
                conf_list.push({
                    conf_id: conf.conf_id,
                    conf_name: conf.conf_name,
                    conf_source: {
                        is_job: conf.is_job,
                        obj_id: conf.obj_id,
                    },
                    compare_conf_list: conf.conf_compare_data,
                    metric_list: conf.metric_list
                })
            })
            suite_list.push({
                suite_id: suite.suite_id,
                suite_name: suite.suite_name,
                //show_type: !switchReport ? 0 : describe?.show_type == 'list' ? 0 : 1,
                test_suite_description: suite.test_suite_description || '-',
                test_env: '',
                test_description: '',
                test_conclusion: '',
                conf_list: conf_list,
                rowKey: name == 'group' ? `${idx}-${listId}-${suiteId}` : `${idx}-${suiteId}`
            })
        })
        return suite_list;
    }

    useEffect(() => {
        let new_pref_data: any = []
        if (dataSource !== undefined && dataSource.length > 0) {
            dataSource.map((item: any, idx: number) => {
                if (item.is_group) {
                    item.list?.map((child: any, listId: number) => {
                        let suite_list = suite.length > 0 ? suite : simplify(child, idx, listId, 'group')
                        new_pref_data.push({
                            name: `${item.name}:${child.name}`,
                            suite_list,
                        })
                    })
                } else {
                    let suite_list = suite.length > 0 ? suite : simplify(item, idx, 0, 'item')
                    new_pref_data.push({
                        name: item.name,
                        suite_list,
                    })
                }
            })
        }
        obj.test_item.perf_data = new_pref_data
        setObj({
            ...obj,
        })
    }, [dataSource, suite])

    // const hanldePageResize = () => setBodyWidth(bodyRef.current.offsetWidth)

    // useEffect(() => {
    //     // Select the node that will be observed for mutations
    //     const targetNode: any = document.getElementById('report-body-container');
    //     // Options for the observer (which mutations to observe)
    //     const config = { attributes: true, childList: true, subtree: true };
    //     // Callback function to execute when mutations are observed
    //     // Create an observer instance linked to the callback function
    //     const observer = new MutationObserver(hanldePageResize);
    //     // Start observing the target node for configured mutations
    //     observer.observe(targetNode, config);
    //     // Later, you can stop observing
    //     return () => {
    //         observer.disconnect();
    //     }
    // }, [])

    const groupRowRef = useRef<any>(null)

    // const hanldeScrollChange = ({ target }: any) => {
    //     const floatRow = groupRowRef.current

    //     const testDataEle = document.querySelector('#test_data')
    //     const testOffset = (testDataEle as any).offsetTop || 0

    //     setFixedRow({
    //         left: floatRow?.offsetLeft ,
    //         width: floatRow?.offsetWidth,
    //         show: target.scrollTop > (testOffset + floatRow.offsetTop),
    //         scrollTop: target.scrollTop,
    //         groupOffsetTop: floatRow.offsetTop,
    //         testDataOffsetTop: testOffset,
    //     })
    // }

    // useEffect(() => {
    //     setFixedRow({
    //         ...fixedRow,
    //         left: groupRowRef.current?.offsetLeft,
    //         width: groupRowRef.current?.offsetWidth
    //     })
    // }, [groupRowRef.current, collapsed])

    // useEffect(() => {
    //     const queryObj: any = document.querySelector('#report-body-container')
    //     const debounced = _.debounce(hanldeScrollChange, 10 );
    //     queryObj.addEventListener('scroll', debounced)
    //     return () => {
    //         queryObj.removeEventListener('scroll', debounced)
    //         // debounced.cancel
    //     }
    // }, [groupRowRef.current, collapsed])

    return (
        <ModuleWrapper style={{ width: group > 4 ? group * 300 : 1180, position: 'relative' }} id="test_data" ref={testDataRef}>
            <SubTitle><span className="line"></span>测试数据</SubTitle>
            <Summary ref={groupRowRef} style={{ paddingLeft: 34, paddingRight: 31 }}>
                <Group>
                    <PerfGroupTitle gLen={group}>对比组名称</PerfGroupTitle>
                    {
                        Array.isArray(envData) && envData.length > 0 && envData.map((item: any, idx: number) => {
                            return (
                                <PerfGroupData gLen={group} key={idx}>
                                    <Space>
                                        {item.is_base ? <BaseIcon style={{ marginRight: 4, marginTop: 17 }} title="基准组" /> : null}
                                    </Space>
                                    <EllipsisPulic title={item.tag} />
                                </PerfGroupData>
                            )
                        })
                    }
                </Group>
            </Summary>
            <GroupBarWrapper
                groupRowRef={groupRowRef}
                parentDom={testDataRef}
                envData={envData}
                groupLen={group}
            />
            {/* {
                <div
                    style={{
                        width: fixedRow.width,
                        background: '#fff',
                        position: 'absolute',
                        top: 57,
                        height: 50,
                        border: '1px solid rgba(0,0,0,0.10)',
                        zIndex: 5,
                        transform: `translateY(${fixedRow.show ? fixedRow.scrollTop - fixedRow.testDataOffsetTop - fixedRow.groupOffsetTop : 0}px)`
                    }}
                >
                    <Summary style={{ border: 'none', paddingLeft: 34, paddingRight: 31 }}>
                        <Group>
                            <PerfGroupTitle gLen={group}>对比组名称</PerfGroupTitle>
                            {
                                Array.isArray(envData) && envData.length > 0 && envData.map((item: any, idx: number) => {
                                    return (
                                        <PerfGroupData gLen={group} key={idx}>
                                            <Space>
                                                {
                                                    item.is_base &&
                                                    <BaseIcon style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }} title="基准组" />
                                                }
                                            </Space>
                                            <EllipsisPulic title={item.tag} />
                                        </PerfGroupData>
                                    )
                                })
                            }
                        </Group>
                    </Summary>
                </div>
            } */}
            {
                (domainResult.is_default || (!domainResult.is_default && domainResult.need_perf_data)) &&
                <>
                    <TestDataTitle id="perf_item">性能测试</TestDataTitle>
                    <TestWrapper>
                        {
                            Array.isArray(dataSource) && dataSource.length > 0 ?
                                dataSource?.map((item: any, idx: number) => {
                                    return (
                                        <div key={idx}>
                                            {
                                                item.is_group ?
                                                    <>
                                                        <TestGroup id={`pref_item-${item.rowKey}`}>
                                                            <TestGroupIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                                                            <TestItemText>
                                                                <SettingTextArea
                                                                    name={item.name}
                                                                    btnConfirm={btnConfirm}
                                                                    isInput={true}
                                                                    fontStyle={{
                                                                        fontSize: 14,
                                                                        fontFamily: 'PingFangSC-Medium',
                                                                        color: 'rgba(0,0,0,0.85)'
                                                                    }}
                                                                    btn={btnState}
                                                                    onOk={(val: any) => handleGroupChange(val, item.name, item.rowKey)}
                                                                />
                                                            </TestItemText>
                                                            <Popconfirm
                                                                title='确认要删除吗！'
                                                                onConfirm={() => handleDelete('item', item.name, item.rowKey)}
                                                                cancelText="取消"
                                                                okText="删除"
                                                            >
                                                                {btnState && <CloseBtn />}
                                                            </Popconfirm>
                                                        </TestGroup>
                                                        {
                                                            item.list.map((child: any, id: number) => {
                                                                return (
                                                                    <Performance
                                                                        child={child}
                                                                        name="group"
                                                                        key={id}
                                                                        id={child.rowKey}
                                                                        dataSource={dataSource}
                                                                        setDataSource={setDataSource}
                                                                        setSuite={setSuite}
                                                                        onDelete={handleDelete}
                                                                        onChange={handleFieldChange}
                                                                    />
                                                                )
                                                            })
                                                        }
                                                    </> : <Performance
                                                        child={item}
                                                        name="item"
                                                        id={item.rowKey}
                                                        dataSource={dataSource}
                                                        setSuite={setSuite}
                                                        setDataSource={setDataSource}
                                                        onDelete={handleDelete}
                                                        onChange={handleFieldChange}
                                                    />
                                            }
                                        </div>
                                    )
                                })
                                :
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                    </TestWrapper>
                </>
            }
            {
                domainResult.is_default && <ReportTestFunc />
            }
            {
                (!domainResult.is_default && domainResult.need_func_data) && <ReportTestFunc />
            }
        </ModuleWrapper>
    )
}
export default memo(ReportTestPref);