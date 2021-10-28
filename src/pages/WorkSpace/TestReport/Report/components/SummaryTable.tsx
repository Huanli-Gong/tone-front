import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

const SummaryTable = (props: any) => {
    const { groupData, baseIndex, setScrollWidth, compareResult } = props
    let data = [props.data.summary]
    let scrollLength: number = 0
    let columns: any = []
    scrollLength = 361 + 248 * groupData?.length - 1
    for (let i = 0; i < (groupData?.length < 4 ? 4 : groupData?.length); i++) {
        if (i === 0) {
            columns.push({
                width: 361,
                fixed: 'left',
                render: (row: any, index: number) => {
                    return (
                        <div className="right_border" key={index}>
                            <div className="id_name">对比标识名称</div>
                            {
                                compareResult.perf_data_result &&
                                <>
                                    <div className="per_test">性能测试</div>
                                    <div className="empty"></div>
                                </>
                            }
                            {
                                compareResult.func_data_result &&
                                <>
                                    <div className="per_test">功能测试</div>
                                    <div className="empty"></div>
                                </>
                            }
                        </div>
                    )
                }
            })
        }
        if (baseIndex === i) {
            columns.push(
                {
                    width: 248,
                    render: (row: any, idx: number) => {
                        // const server_info = row.base_group.server_info
                        // const count = row.count
                        // let len = Array.from(Array(count - server_info.length)).map(val => ({}))
                        return (
                            <div key={idx} className="right_border">
                                <div className="id_name">
                                    <div className="top_test">{row.base_group.tag}</div>
                                    <div className="bottom_base">BaseGroup</div>
                                </div>
                                {
                                    compareResult.perf_data_result &&
                                    <>
                                        <div className="per_test">总计/上升/下降</div>
                                        <div className="empty">
                                            <span className="all_case">-</span>
                                            <span className="success_case">-</span>
                                            <span className="fail_case">-</span>
                                        </div>
                                    </>
                                }
                                {
                                    compareResult.func_data_result &&
                                    <>
                                        <div className="per_test">总计/通过/失败</div>
                                        <div className="empty">
                                            <span className="all_case">{row.base_group.all === 0 ? 0 : row.base_group.all || '-'}</span>
                                            <span className="success_case">{row.base_group.success === 0 ? 0 : row.base_group.success || '-'}</span>
                                            <span className="fail_case">{row.base_group.fail === 0 ? 0 : row.base_group.fail || '-'}</span>
                                        </div>
                                    </>
                                }
                            </div>
                        )
                    }
                }
            )
        }
        columns.push({
            title: '',
            width: 248,
            render: (row: any,) => (
                // row?.compare_groups.length > 0 ?
                row.compare_groups.map((item: any, idx: number) => (
                    i === idx && <div className="right_border" key={idx}>
                        <div className="id_name">
                            <div className="top_test">{item.tag}</div>
                            <div className="bottom_test"></div>
                        </div>
                        {
                            compareResult.perf_data_result &&
                            <>
                                <div className="per_test">总计/上升/下降</div>
                                <div className="empty">
                                    <span className="all_case">{item.perf_data.all === 0 ? 0 : item.perf_data.all || '-'}</span>
                                    <span className="success_case">{item.perf_data.increase === 0 ? 0 : item.perf_data.increase || '-'}</span>
                                    <span className="fail_case">{item.perf_data.decline === 0 ? 0 : item.perf_data.decline || '-'}</span>
                                </div>
                            </>
                        }
                        {
                            compareResult.func_data_result &&
                            <>
                                <div className="per_test">总计/通过/失败</div>
                                <div className="empty">
                                    <span className="all_case">{item.func_data.all === 0 ? 0 : item.func_data.all || '-'}</span>
                                    <span className="success_case">{item.func_data.success === 0 ? 0 : item.func_data.success || '-'}</span>
                                    <span className="fail_case">{item.func_data.fail === 0 ? 0 : item.func_data.fail || '-'}</span>
                                </div>
                            </>
                        }
                    </div>
                ))
                // :
                // <div >
                //         <div className="id_name">
                //             <div className="top_test"></div>
                //             <div className="bottom_test"></div>
                //         </div>
                //         {
                //             compareResult.perf_data && JSON.stringify(compareResult.perf_data) !== '{}' &&
                //             <>
                //                 <div className="per_test"></div>
                //                 <div className="empty">
                //                     <span className="all_case"></span>
                //                     <span className="success_case"></span>
                //                     <span className="fail_case"></span>
                //                 </div>
                //             </>
                //         }
                //         {
                //             compareResult.func_data && JSON.stringify(compareResult.func_data) !== '{}' &&
                //             <>
                //                 <div className="per_test"></div>
                //                 <div className="empty">
                //                     <span className="all_case"></span>
                //                     <span className="success_case"></span>
                //                     <span className="fail_case"></span>
                //                 </div>
                //             </>
                //         }
                //     </div>
            )
        })
    }
    useEffect(() => {
        setScrollWidth(scrollLength)
    }, [])

    return (
        <div className="table_margin">
            <Table className="table_bar" size="small" showHeader={false} columns={columns} dataSource={data} scroll={{ x: scrollLength }} pagination={false} rowKey="index" />
        </div>
    )
}
export default SummaryTable;
