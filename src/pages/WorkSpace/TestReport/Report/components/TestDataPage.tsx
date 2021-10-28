import React, { memo } from 'react';
import { Tooltip, Table } from 'antd';
import Performance from './Performance'
import Functional from './Functional'
const TestDataPage = (props: any) => {
    const { groupData, baseIndex, switchReport, btn, domain, identify, setTestItem } = props
    const data = [props.identify] 
    let scrollLength: number = 0
    let columns: any = []
    scrollLength = 361 + 248 * groupData?.length - 1
    for (let i = 0; i < (groupData?.length < 4 ? 4 : groupData?.length); i++) {
        if (i === 0) {
            columns.push({
                title: '',
                width: 361,
                key: 'msg',
                fixed: 'left',
                render: (row: any, index: number) => {
                    return (
                        <div className="right_border">
                            <div className="id_name">对比标识名称</div>
                        </div>
                    )
                }
            })
        }
        if (baseIndex === i) {
            columns.push(
                {
                    title: '',
                    width: 248,
                    render: (row: any, idx: number) => (
                        <div className="right_border">
                            <div className="id_name">
                                <div className="top_test">
                                    <Tooltip placement="topLeft" title={row.base_group.tag}>
                                        {row.base_group.tag}
                                    </Tooltip>
                                </div>
                                <div className="bottom_base">BaseGroup</div>
                            </div>
                        </div>
                    )
                }
            )
        }
        columns.push({
            title: '',
            width: 248,
            render: (row: any) => (
                row.compare_groups.map((item: any, idx: number) => {
                    return (
                        i === idx && <div className="right_border">
                            <div className="id_name">
                                <div className="top_test">
                                    <Tooltip placement="topLeft" title={item.tag}>
                                        {item.tag}
                                    </Tooltip>
                                </div>
                                <div className="bottom_test"></div>
                            </div>
                        </div>
                    )
                })

            )
        })
    }

    return (
        <div>
            <div className="title" id="test_data"><span className="line"></span>测试数据</div>
            {identify !== undefined && !domain?.need_test_summary && !domain?.need_test_env &&
                <div className="table_margin">
                    <Table className="table_bar" size="small" showHeader={false} columns={columns} dataSource={data} scroll={{ x: scrollLength }} pagination={false} rowKey="index" />
                </div>
            }   
            {
                //默认模版
                !switchReport ?
                    <>
                        {domain.perf_item && domain.perf_item.length > 0 && <div className="sub_title" id="perf_item">性能数据</div>}
                        <Performance
                            switchReport={switchReport}
                            btn={btn}
                            setTestItem={setTestItem}
                            identify={identify}
                            data={domain.perf_item}
                            describe={domain.perf_conf}
                            groupData={groupData}
                            baseIndex={baseIndex}
                        />
                        { domain.func_item && domain.func_item.length > 0 && <div className="sub_title" id="func_item">功能数据</div>}
                        <Functional
                            switchReport={switchReport}
                            btn={btn}
                            setTestItem={setTestItem}
                            data={domain.func_item}
                            groupData={groupData}
                            baseIndex={baseIndex}
                        />
                    </>
                    :
                    <>
                        {
                            domain?.need_perf_data &&
                            <>
                                { domain.perf_item && domain.perf_item.length > 0 && <div className="sub_title" id="perf_item">性能数据</div>}
                                <Performance
                                    switchReport={switchReport}
                                    btn={btn}
                                    setTestItem={setTestItem}
                                    identify={identify}
                                    data={domain.perf_item}
                                    describe={domain.perf_conf}
                                    groupData={groupData}
                                    baseIndex={baseIndex}
                                />
                            </>
                        }
                        {
                            domain?.need_func_data &&
                            <>
                                { domain.func_item && domain.func_item.length > 0 && <div className="sub_title" id="func_item">功能数据</div>}
                                <Functional
                                    switchReport={switchReport}
                                    btn={btn}
                                    setTestItem={setTestItem}
                                    data={domain.func_item}
                                    groupData={groupData}
                                    baseIndex={baseIndex}
                                />
                            </>
                        }
                    </>
            }
        </div>
    )
}

export default memo(TestDataPage);



// <div style={{ border:'1px solid #ccc',margin:20 }}>
//                 <span style={{ display:'inline-block',width:361,borderRight:'1px solid #ccc' }}>
//                     <div className="id_name">对比标识名称</div>
//                 </span>
//                 <span style={{ display:'inline-block',width:248,borderRight:'1px solid #ccc' }}>
//                     <div className="id_name">
//                         <div className="top_test">
//                             {/* <Tooltip placement="topLeft" title={row.base_group.tag}>
//                                 {row.base_group.tag}
//                             </Tooltip> */}
//                         </div>
//                         <div className="bottom_base">BaseGroup</div>
//                     </div>
//                 </span>
//                 <span style={{ display:'inline-block',width:248 }}>3</span>
//             </div>