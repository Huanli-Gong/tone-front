import React, { useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import styles from './index.less';
import { SettingTextArea } from '@/components/ReportEidt/index';
const TestEnvironment = (props: any) => {
    const data = [ props.data ]
    const { groupData, baseIndex, btn, switchReport, setScrollWidth, domainResult } = props
    // let test_dev_background:any = window.sessionStorage.getItem('test_dev_background')
    const handleChangeVal = (val: any, text: string) => {
        data[0].base_index = baseIndex
        data[0][text] = val
        window.sessionStorage.setItem('test_env', JSON.stringify(data[0]))
    }
    // useEffect(()=>{
    //     data[0].base_index = baseIndex
    //     data[0].text = test_dev_background
    //     window.sessionStorage.setItem('test_env',JSON.stringify(data[0]))
    // },[ data,test_dev_background ])

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
                    const count = row.count
                    let array = Array.from(Array(count)).map(val => ({}))
                    return (
                        <div className="right_border">
                            { !domainResult?.need_test_summary &&
                                <div className="id_name">对比标识名称</div>
                            }
                            {
                                array.map((item: any, idx: number) => {
                                    return (
                                        <div key={idx}>
                                            <div className="ip">IP{`${!BUILD_APP_ENV ? "/SN" : ""}`}</div>
                                            <div className="machine">机型</div>
                                            <div className="machine">RPM</div>
                                            <div className="machine">GCC</div>
                                        </div>
                                    )
                                })
                            }
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
                    render: (row: any, idx: number) => {
                        const server_info = row.base_group.server_info
                        const count = row.count
                        let len = Array.from(Array(count - server_info.length)).map(val => ({}))
                        return (
                            <div className="right_border">
                                { !domainResult?.need_test_summary &&
                                    <div className="id_name">
                                        <div className="top_test">
                                            <Tooltip placement="topLeft" title={row.base_group.tag}>
                                                {row.base_group.tag}
                                            </Tooltip>
                                        </div>
                                        <div className="bottom_base">BaseGroup</div>
                                    </div>
                                }
                                {
                                    server_info.concat(len).map((item: any, idx: number) => (
                                        <div key={idx} style={{ height: 154 }}>
                                            {
                                                <>
                                                    <div className="enviroment_ip">
                                                        <span className="enviroment_child">{item['ip/sn'] || '-'}</span>
                                                    </div>
                                                    <Tooltip placement="topLeft" title={item.distro}>
                                                        <div className="enviroment_machine">
                                                            <span className="enviroment_child">{item.distro || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip placement="topLeft" title={<div>{item.rpm?.map((i:any)=>(<span>{i}<br/></span>))}</div>} overlayClassName={styles.tootip_overflow}> 
                                                        <div className="enviroment_rpm">
                                                            <span className="enviroment_child">{item.rpm || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip placement="topLeft" title={item.gcc}>
                                                        <div className="enviroment_machine">
                                                            <span className="enviroment_child">{item.gcc || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                </>
                                            }
                                        </div>
                                    ))
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
            render: (row: any) => (
                // row.compare_groups.length > 0 ?
                row.compare_groups.map((item: any, idx: number) => {
                    const len = Array.from(Array(row.count - item.server_info.length)).map(val => ({}))
                    return (
                        i === idx && <div className="right_border">
                            { !domainResult?.need_test_summary &&
                                <div className="id_name">
                                    <div className="top_test">
                                        <Tooltip placement="topLeft" title={item.tag}>
                                            {item.tag}
                                        </Tooltip>
                                    </div>
                                    <div className="bottom_test"></div>
                                </div>
                            }
                            {
                                item.server_info.concat(len).map((item: any, idx: number) => (
                                    <div key={idx} style={{ height: 154 }}>
                                        {
                                            <>
                                                <div className="enviroment_ip">
                                                    <span className="enviroment_child">{item['ip/sn'] || '-'}</span>
                                                </div>
                                                <Tooltip placement="topLeft" title={item.distro}>
                                                    <div className="enviroment_machine">
                                                        <span className="enviroment_child">{item.distro || '-'}</span>
                                                    </div>
                                                </Tooltip>
                                                <Tooltip placement="topLeft" title={<div>{item.rpm?.map((i:any)=>(<span>{i}<br/></span>))}</div>} overlayClassName={styles.tootip_overflow}>
                                                    <div className="enviroment_rpm">
                                                        <span className="enviroment_child">{item.rpm || '-'}</span>
                                                    </div>
                                                </Tooltip>
                                                <Tooltip placement="topLeft" title={item.gcc}>
                                                    <div className="enviroment_machine">
                                                        <span className="enviroment_child">{item.gcc || '-'}</span>
                                                    </div>
                                                </Tooltip>
                                            </>
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    )
                })
            )
        })
    }

    useEffect(() => {
        setScrollWidth(scrollLength)
    }, [])

    return (
        <div>
            <div className="title" id="test_env"><span className="line"></span>测试环境</div>
            {
                switchReport 
                ? 
                <>
                <div className="test_dev" id="test_dev">
                    <SettingTextArea
                        name={data[0]?.text || '-'}
                        position="bottom"
                        text="测试环境"
                        btn={btn}
                        onOk={(val: any) => handleChangeVal(val, 'text')}
                    />
                </div>
                <div className="table_margin" id="test_dev">
                    <Table className="table_bar" size="small" showHeader={false} columns={columns} dataSource={data} scroll={{ x: scrollLength }} pagination={false} rowKey="index" />
                </div>
                </>
                :
                <div className="table_margin" id="test_dev">
                    <Table className="table_bar" size="small" showHeader={false} columns={columns} dataSource={data} scroll={{ x: scrollLength }} pagination={false} rowKey="index" />
                </div>
            }
        </div>
    )
}
export default TestEnvironment;