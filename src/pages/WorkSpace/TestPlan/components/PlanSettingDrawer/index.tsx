import React, { useState, forwardRef, useImperativeHandle } from 'react'
import styled from 'styled-components'
import { Drawer, Row, Col, Space, Button, message, Badge } from 'antd'

import { queryTestPlanDetails } from '@/pages/WorkSpace/TestPlan/services'
import { history } from 'umi'
import { aligroupServer, aliyunServer, requestCodeMessage } from '@/utils/utils'

const leftWidth = `160px`

const PropItem = styled.div`
    width:100%;
    display: flex;
    align-items: center;

    .setting_label {
        width : ${leftWidth}; 
        font-weight: 600;
        display: inline-block;
        font-size: 14px;
        color: rgba(0,0,0,0.85);
        text-align : right;
        margin-right: 12px;
    }

    .setting_link,
    .setting_text {
        width : calc( 100% - ${leftWidth} - 12px );
        overflow: hidden;
        display: inline-block;
        height: 24px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`

const DrawerNavbar = styled.div`
    position: relative;
    height: 1px;
    border-top: 1px dashed rgba(0,0,0,0.15);
    margin-bottom: 22px;
    width: 100%;
    span {
        position: absolute;
        left: 0;
        top: 0;
        padding-right: 10px;
        background: #FFFFFF;
        transform:translate(0, -50%);
        font-size: 16px;
        font-family: PingFangSC-Medium;
        color: rgba(0 , 0 , 0 , .85);
        float: left;
        display: table-cell;
        margin: 0 auto;
        &::before {
            float: left;
            content :'';
            height: 16px;
            width: 2px;
            background: #1890FF;
            margin-top: 6px;
            margin-right: 10px;
        }
    }
`
const SettingSpaceItem: React.FC<any> = ({ name = '', val = '', isLink = false }) => (
    <PropItem>
        <b className="setting_label">{name}</b>
        {
            val ? isLink ? <a className="setting_link">{val}</a> : <span className="setting_text">{val}</span> :
                <>无</>
        }
    </PropItem>
)

const PrepSpaceItem: React.FC<any> = ({ name = '', val = '', isLink = false }) => (
    val &&
    <PropItem>
        <b className="setting_label">{name}</b>
        {
            val ? isLink ? <a className="setting_link">{val}</a> : val :
                <>无</>
        }
    </PropItem>
)

const SettingRow: React.FC<any> = ({ name = '', children }) => (
    <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ width: 160, marginRight: 12, textAlign: 'right' }}>
            <b>{name}</b>
        </div>
        <div style={{ width: 'calc(100% - 160px - 12px)' }}>
            {children}
        </div>
    </div>
)

const ViewPlanDetail = (props: any, ref: any) => {
    const { ws_id } = props
    const [visible, setVisible] = useState(false)
    const [dataSource, setDataSource] = useState<any>(undefined)
    // console.log('dataSource:', dataSource)

    useImperativeHandle(ref, () => ({
        show: async (_: any) => {
            const { data, code, msg } = await queryTestPlanDetails({ ws_id, id: _.id })
            if (code === 200) {
                setDataSource({ ...data, ..._ })
                setVisible(true)
                return
            }
            return requestCodeMessage(code, msg)
        }
    }))

    const handleClose = () => {
        setVisible(false)
        setDataSource(null)
    }

    const hanldeOpenEdit = () => {
        history.push(`/ws/${ws_id}/test_plan/${dataSource.id}/edit`)
    }

    const hanldeRunning = () => {
        history.push(`/ws/${ws_id}/test_plan/${dataSource.id}/run`)
    }

    // console.log('dataSource:', dataSource)

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title="计划配置"
            visible={visible}
            width={900}
            onClose={handleClose}
            destroyOnClose
            footer={
                <Row justify="end">
                    <Space>
                        <Button onClick={hanldeOpenEdit}>编辑配置</Button>
                        <Button onClick={hanldeRunning} type="primary">运行计划</Button>
                    </Space>
                </Row>
            }
        >
            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span>基础信息</span>
                </DrawerNavbar>
                <SettingSpaceItem name="名称" val={dataSource?.name} />
                <SettingSpaceItem name="创建人" val={dataSource?.creator_name} />
                <SettingSpaceItem name="所属项目" val={dataSource?.project_name} />
                {/* <SettingSpaceItem name="内网功能基线" val={dataSource?.func_baseline_name} /> */}
                {/* <SettingSpaceItem name="内网性能基线" val={dataSource?.perf_baseline_name} /> */}
                {/* <SettingSpaceItem name="云上功能基线" val={dataSource?.func_baseline_aliyun_name} />
                <SettingSpaceItem name="云上性能基线" val={dataSource?.perf_baseline_aliyun_name} /> */}
                <SettingSpaceItem name={`功能基线（${aligroupServer}）`} val={dataSource?.func_baseline_name} />
                <SettingSpaceItem name={`性能基线（${aligroupServer}）`} val={dataSource?.perf_baseline_name} />
                <SettingSpaceItem name={`功能基线（${aliyunServer}）`} val={dataSource?.func_baseline_aliyun_name} />
                <SettingSpaceItem name={`性能基线（${aliyunServer}）`} val={dataSource?.perf_baseline_aliyun_name} />
                <SettingSpaceItem name="描述" val={dataSource?.description} />
                <SettingSpaceItem name="通知主题" val={dataSource?.notice_name || ((dataSource?.email_info || dataSource?.ding_talk_info) && '[T-one]你的测试已完成{date}')} />
                <SettingSpaceItem name="邮件通知" val={dataSource?.email_info} />
                <SettingSpaceItem name="钉钉通知" val={dataSource?.ding_talk_info} />
                <SettingSpaceItem
                    name="启用"
                    val={
                        <span style={{ paddingLeft: 4 }}>
                            {
                                dataSource?.enable ?
                                    <Badge status="processing" text="是" /> :
                                    <Badge status="default" text="否" />
                            }
                        </span>
                    }
                />
            </Row>
            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span>公共配置</span>
                </DrawerNavbar>
                <PrepSpaceItem name="功能基线" val={dataSource?.func_baseline_name} />
                <PrepSpaceItem name="性能基线" val={dataSource?.perf_baseline_name} />
                {
                    (dataSource?.test_obj === 'kernel' && JSON.stringify(dataSource?.build_pkg_info) !== '{}') &&
                    <>
                        <PrepSpaceItem isLink name="代码仓库" val={dataSource?.build_pkg_info.code_repo} />
                        <PrepSpaceItem isLink name="编译分支" val={dataSource?.build_pkg_info.compile_branch} />
                        <PrepSpaceItem name="CpuArch" val={dataSource?.build_pkg_info.cpu_arch} />
                        <PrepSpaceItem name="Commit ID" val={dataSource?.build_pkg_info.commit_id} />
                        <PrepSpaceItem name="Build config" val={dataSource?.build_pkg_info.build_config} />
                        <PrepSpaceItem name="Build machine" val={dataSource?.build_pkg_info.build_machine} />
                    </>
                }
                {
                    (dataSource?.test_obj === 'kernel' && JSON.stringify(dataSource?.kernel_info) !== '{}') &&
                    <>
                        <PrepSpaceItem isLink name="kernel包" val={dataSource?.kernel_info.kernel} />
                        <PrepSpaceItem isLink name="devel包" val={dataSource?.kernel_info.devel} />
                        <PrepSpaceItem isLink name="headers包" val={dataSource?.kernel_info.headers} />
                        <PrepSpaceItem name="hotfix" val={dataSource?.kernel_info.hotfix ? '是' : '否'} />
                        <PrepSpaceItem name="内核版本" val={dataSource?.kernel_info.kernel_version} />
                    </>
                }
                <PrepSpaceItem name="全局RPM" val={dataSource?.rpm_info} />
                <PrepSpaceItem name="全局变量" val={dataSource?.env_info} />
            </Row>

            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span>测试配置</span>
                </DrawerNavbar>
                {
                    (dataSource?.env_prep && JSON.stringify(dataSource?.env_prep) !== '{}') &&
                    <SettingRow name={dataSource?.env_prep.name} >
                        {
                            dataSource?.env_prep.machine_info.map((i: any, index: number) => (
                                <div key={index}>
                                    <Space>
                                        <span>{i.machine}</span>
                                        <span>{i.script}</span>
                                    </Space>
                                </div>
                            ))
                        }
                    </SettingRow>
                }
                {
                    (dataSource?.test_config && dataSource?.test_config.length > 0) &&
                    dataSource.test_config.map((i: any, index: number) => (
                        <SettingRow name={i.name} key={index}>
                            {
                                i.template.map((t: any) => (
                                    <div>{t.name}</div>
                                ))
                            }
                        </SettingRow>
                    ))
                }
            </Row>

            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span>报告配置</span>
                </DrawerNavbar>
                {dataSource?.auto_report ? (
                    <>
                        <SettingSpaceItem name="自动生成报告" val={<span style={{ paddingLeft: 4 }}><Badge status="processing" text="是" /></span>} />
                        <SettingSpaceItem name="报告名称" val={dataSource?.report_name || '{date} {plan_name} {plan_id} {product_version}'} />
                        <SettingSpaceItem name="报告模板" val={dataSource?.report_template_name} />
                        <SettingSpaceItem name="分组方式" val={dataSource?.group_method === 'job' ? '以Job维度分组' : '以阶段维度分组'} />
                        <SettingSpaceItem name="基准组" val={dataSource?.group_method === 'job' ? `${dataSource?.base_group_info?.stage_name || '-'} / ${dataSource?.base_group_info?.template_name}` : dataSource?.base_group_info?.stage_name} />
                        <SettingSpaceItem name="报告描述" val={dataSource?.report_description} />
                    </>)
                    :
                    <SettingSpaceItem name="自动生成报告" val={<span style={{ paddingLeft: 4 }}><Badge status="default" text="否" /></span>} />
                }
            </Row>

            <Row>
                <DrawerNavbar>
                    <span>触发配置</span>
                </DrawerNavbar>
                <SettingSpaceItem name="触发规则" val={dataSource?.cron_info || '无'} />
            </Row>
        </Drawer>
    )
}

export default forwardRef(ViewPlanDetail)