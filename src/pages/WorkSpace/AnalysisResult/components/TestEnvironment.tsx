import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tooltip, Row, Button, message } from 'antd';
import { history } from 'umi'
import styles from './index.less';
import { compareForm } from '../service';
import Clipboard from 'clipboard'
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import SaveReport from '@/pages/WorkSpace/TestReport/components/SaveReport'
import _ from 'lodash'

const TestEnvironment = (props: any) => {
    const saveReportDraw: any = useRef(null)
    const {
        ws_id,
        baseIndex,
        environmentResult,
        compareResult,
        compareGroupData,
        domainGroupResult,
        groupData,
        testDataParam,
        envDataParam
    } = props

    const data = [props.data]
    const form_search = window.location.search
    const handleShare = useCallback(
        async () => {
            let form_data: any = {
                allGroupData: groupData,
                baselineGroupIndex: baseIndex,
                testDataParam,
                envDataParam
            }
            const data = await compareForm({ form_data })
            // setFormId(data.data)
    
            const clipboard = new Clipboard('.test_result_copy_link', {
                text: function (trigger) {
                    return `${location.href}/?form_id=${data.data}`;
                }
            })
            clipboard.on('success', function (e: any) {
                message.success('复制成功')
                e.clearSelection();
            })
    
            document.querySelector('.test_result_copy_link')?.click()
            clipboard.destroy()
        } , [ groupData , baseIndex ]
    )
    
    useEffect(() => {
        const clipboard = new Clipboard('.copy_link', {
            text: () => window.location.href
        })
        clipboard.on('success', function (e: any) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboard.destroy()
            window.sessionStorage.clear()
        }
    }, [])

    let scrollLength: number = 0
    let columnsEnvironment: any = [
        {
            title: '',
            width: 361,
            key: 'msg',
            fixed: 'left',
            render: (row: any, index: number) => {
                const count = row?.count
                let array = Array.from(Array(count)).map(val => ({}))
                return (
                    <div key={index} className={styles.right_border}>
                        <div className={styles.right_tag}>
                            <span className={styles.tag_text}>对比标识名称</span>
                        </div>
                        <div className={styles.enviroment_title}>信息</div>
                        {
                            array.map((item: any, index: number) => {
                                return (
                                    <div key={index}>
                                        <div className={styles.enviroment_ip_title}>IP/SN</div>
                                        <div className={styles.enviroment_machine_title}>机器</div>
                                        <div className={styles.enviroment_rpm_title}>RPM</div>
                                        <div className={styles.enviroment_machine_title}>GCC</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        },
    ]
    scrollLength = 361 + 248 * groupData?.length - 1
    let columns: any = []
    for (let i = 0; i < (groupData.length < 4 ? 4 : groupData.length); i++) {
        if (baseIndex === i) {
            columns.push(
                {
                    title: '',
                    width: 248,
                    render: (row: any, idx: number) => {
                        const server_info = row?.base_group.server_info
                        const count = row?.count
                        let len = Array.from(Array(count - server_info.length)).map(val => ({}))
                        return (
                            <div className={styles.right_border} key={idx}>
                                <Tooltip placement="topLeft" title={row.base_group.tag}>
                                    <div className={styles.right_tag}>
                                        <span className={styles.tag_text}>{row.base_group.tag}</span>
                                    </div>
                                </Tooltip>
                                <div className={styles.enviroment_title}> <div className={styles.cloumn_title}>BaseGroup</div></div>
                                {
                                    server_info.concat(len).map((item: any, idx: number) => (
                                        <div key={idx} style={{ height: 154 }}>
                                            {
                                                <div key={idx}>
                                                    <div className={styles.enviroment_ip}>
                                                        <a href={`https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${item['ip/sn']}`} target="_blank">
                                                            <span className={styles.enviroment_child}>{item['ip/sn'] || '-'}</span>
                                                        </a>
                                                    </div>
                                                    <Tooltip placement="topLeft" title={item.distro}>
                                                        <div className={styles.enviroment_machine}>
                                                            <span className={styles.enviroment_child}>{item.distro || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip placement="topLeft" title={<div>{item.rpm?.map((i: any, t: number) => (<span key={t}>{i}<br /></span>))}</div>} overlayClassName={styles.tootip_overflow}>
                                                        <div className={styles.enviroment_rpm}>
                                                            <span className={styles.enviroment_child}>{item.rpm || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip placement="topLeft" title={item.gcc}>
                                                        <div className={styles.enviroment_machine}>
                                                            <span className={styles.enviroment_child}>{item.gcc || '-'}</span>
                                                        </div>
                                                    </Tooltip>
                                                </div>
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
                row.compare_groups?.map((item: any, idx: number) => {
                    const len = Array.from(Array(row?.count - item?.server_info.length)).map(val => ({}))
                    return i === idx && <div className={styles.right_border} key={idx}>
                        <Tooltip placement="topLeft" title={item?.tag}>
                            <div className={styles.right_tag}>
                                <span className={styles.tag_text}>{item?.tag}</span>
                            </div>
                        </Tooltip>
                        <div className={styles.enviroment_title}></div>
                        {
                            item?.server_info.concat(len).map((server: any, idx: number) => (
                                <div key={idx} style={{ height: 154 }}>
                                    {
                                        <>
                                            <div className={styles.enviroment_ip}>
                                                <a href={`https://sa.alibaba-inc.com/ops/terminal.html?&source=tone&ip=${server['ip/sn']}`} target="_blank">
                                                    <span className={styles.enviroment_child}>{server['ip/sn']}</span>
                                                </a>
                                            </div>
                                            <Tooltip placement="topLeft" title={server.distro}>
                                                <div className={styles.enviroment_machine}>
                                                    <span className={styles.enviroment_child}>{server.distro}</span>
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="topLeft" title={server.rpm && <div>{server.rpm?.map((i: any, t: any) => (<span key={t}>{i}<br /></span>))}</div>} overlayClassName={styles.tootip_overflow}>
                                                <div className={styles.enviroment_rpm}>
                                                    <span className={styles.enviroment_child}>{server.rpm}</span>
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="topLeft" title={server.gcc}>
                                                <div className={styles.enviroment_machine}>
                                                    <span className={styles.enviroment_child}>{server.gcc}</span>
                                                </div>
                                            </Tooltip>
                                        </>
                                    }
                                </div>
                            ))
                        }
                    </div>
                })
            )
        })

    }
    columnsEnvironment = columnsEnvironment.concat(columns)

    useEffect(() => {
        props.setScrollWidth(scrollLength)
    }, [])

    const creatReportCallback = (reportData: any) => { // suiteData：已选的
        history.push({
            pathname: `/ws/${ws_id}/test_create_report`,
            state: {
                wsId: ws_id,
                environmentResult,
                baselineGroupIndex: baseIndex,
                allGroupData: groupData,
                compareResult: _.cloneDeep(compareResult),
                compareGroupData,
                domainGroupResult,
                saveReportData: reportData
            }
        })
    }
    const handleCreatReportOk = () => { // suiteData：已选的
        saveReportDraw.current?.show({})
    }

    return (
        <div className={styles.environment_warp}>
            <Row justify="space-between">
                <div className={styles.environment_title} >测试环境</div>
                <div>
                    {
                        form_search == '' ? 
                        <>
                            <span className="test_result_copy_link"></span>
                            <span onClick={handleShare} style={{ cursor: 'pointer' }} ><IconLink style={{ marginRight: 5 }} />分享</span>
                        </>
                        :
                        <span className="copy_link" style={{ cursor: 'pointer' }}><IconLink style={{ marginRight: 5 }} />分享</span>
                    }
                    
                    <Button type="primary" onClick={handleCreatReportOk} style={{ marginLeft: 8 }}>生成报告</Button>
                </div>
            </Row>
            <Table
                className="table_bar"
                size="small"
                showHeader={false}
                columns={columnsEnvironment}
                dataSource={data.map((i, index) => ({ ...i, index }))}
                scroll={{ x: scrollLength }}
                pagination={false}
                rowKey="index"
            />
            <SaveReport ref={saveReportDraw} onOk={creatReportCallback} ws_id={ws_id} allGroup={groupData} />
        </div>
    )
}
export default TestEnvironment;




// const data = useMemo(() => {
    //     if (props.data.compare_groups.length >= 1 && props.data.compare_groups.length < 3) {
    //         let arr = []
    //         let base_len = Array.from(Array(props.data.base_group.server_info.length)).map(val => ({}))
    //         let server_info: any = []
    //         server_info.concat(base_len)
    //         let len = Array.from(Array(3)).map(val => ({ server_info, tag: '' }))
    //         arr.push({
    //             compare_groups: props.data.compare_groups.concat(len),
    //             base_group: props.data.base_group,
    //             count: props.data.count,
    //             job_li: props.data.job_li
    //         })
    //         return arr
    //     } else {
    //         return [props.data]
    //     }
    // }, [props.data])