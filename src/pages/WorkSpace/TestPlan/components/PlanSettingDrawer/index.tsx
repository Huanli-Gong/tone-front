import React, { useState, forwardRef, useImperativeHandle } from 'react'
import styled from 'styled-components'
import { Drawer, Row, Col, Space, Button, message, Badge } from 'antd'

import { queryTestPlanDetails } from '@/pages/WorkSpace/TestPlan/services'
import { history, useIntl, FormattedMessage  } from 'umi'
import { requestCodeMessage } from '@/utils/utils'

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
    const { formatMessage } = useIntl()
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

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={<FormattedMessage id="plan.configuration" />}
            visible={visible}
            width={900}
            onClose={handleClose}
            destroyOnClose
            footer={
                <Row justify="end">
                    <Space>
                        <Button onClick={hanldeOpenEdit}><FormattedMessage id="plan.edit.configuration" /></Button>
                        <Button onClick={hanldeRunning} type="primary"><FormattedMessage id="plan.run.plan" /></Button>
                    </Space>
                </Row>
            }
        >
            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span><FormattedMessage id="plan.basic.info" /></span>
                </DrawerNavbar>
                <SettingSpaceItem name={formatMessage({id:'plan.name'})} val={dataSource?.name} />
                <SettingSpaceItem name={formatMessage({id:'plan.creator_name'})} val={dataSource?.creator_name} />
                <SettingSpaceItem name={formatMessage({id:'plan.project_name'})} val={dataSource?.project_name} />
                {/* <SettingSpaceItem name="内网功能基线" val={dataSource?.func_baseline_name} /> */}
                {/* <SettingSpaceItem name="内网性能基线" val={dataSource?.perf_baseline_name} /> */}
                {/* <SettingSpaceItem name="云上功能基线" val={dataSource?.func_baseline_aliyun_name} />
                <SettingSpaceItem name="云上性能基线" val={dataSource?.perf_baseline_aliyun_name} /> */}
                <SettingSpaceItem name={`${formatMessage({id:'plan.func_baseline'})}（${formatMessage({id: 'aligroupServer'})}）`} val={dataSource?.func_baseline_name} />
                <SettingSpaceItem name={`${formatMessage({id:'plan.perf_baseline'})}（${formatMessage({id: 'aligroupServer'})}）`} val={dataSource?.perf_baseline_name} />
                <SettingSpaceItem name={`${formatMessage({id:'plan.func_baseline'})}（${formatMessage({id: 'aliyunServer'})}）`} val={dataSource?.func_baseline_aliyun_name} />
                <SettingSpaceItem name={`${formatMessage({id:'plan.perf_baseline'})}（${formatMessage({id: 'aliyunServer'})}）`} val={dataSource?.perf_baseline_aliyun_name} />
                <SettingSpaceItem name={formatMessage({id:'plan.description'})} val={dataSource?.description} />
                <SettingSpaceItem name={formatMessage({id:'plan.notice_name'})} val={dataSource?.notice_name || ((dataSource?.email_info || dataSource?.ding_talk_info) && '[T-one]你的测试已完成{date}')} />
                <SettingSpaceItem name={formatMessage({id:'plan.email_info'})} val={dataSource?.email_info} />
                <SettingSpaceItem name={formatMessage({id:'plan.ding_talk_info'})} val={dataSource?.ding_talk_info} />
                <SettingSpaceItem
                    name={formatMessage({id:'plan.enable'})}
                    val={
                        <span style={{ paddingLeft: 4 }}>
                            {
                                dataSource?.enable ?
                                    <Badge status="processing" text={<FormattedMessage id="operation.yes" />} /> 
                                    :
                                    <Badge status="default" text={<FormattedMessage id="operation.no" />} />
                            }
                        </span>
                    }
                />
            </Row>
            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span><FormattedMessage id="plan.public.config" /></span>
                </DrawerNavbar>
                <PrepSpaceItem name="功能基线" val={dataSource?.func_baseline_name} />
                <PrepSpaceItem name="性能基线" val={dataSource?.perf_baseline_name} />
                {
                    (dataSource?.test_obj === 'kernel' && JSON.stringify(dataSource?.build_pkg_info) !== '{}') &&
                    <>
                        <PrepSpaceItem isLink name={formatMessage({id:'plan.code_repo'})} val={dataSource?.build_pkg_info.code_repo} />
                        <PrepSpaceItem isLink name={formatMessage({id:'plan.compile_branch'})} val={dataSource?.build_pkg_info.compile_branch} />
                        <PrepSpaceItem name="CpuArch" val={dataSource?.build_pkg_info.cpu_arch} />
                        <PrepSpaceItem name="Commit ID" val={dataSource?.build_pkg_info.commit_id} />
                        <PrepSpaceItem name="Build config" val={dataSource?.build_pkg_info.build_config} />
                        <PrepSpaceItem name="Build machine" val={dataSource?.build_pkg_info.build_machine} />
                    </>
                }
                {
                    (dataSource?.test_obj === 'kernel' && JSON.stringify(dataSource?.kernel_info) !== '{}') &&
                    <>
                        <PrepSpaceItem isLink name={formatMessage({id:'plan.kernel.pkg'})} val={dataSource?.kernel_info.kernel} />
                        <PrepSpaceItem isLink name={formatMessage({id:'plan.devel'})} val={dataSource?.kernel_info.devel} />
                        <PrepSpaceItem isLink name={formatMessage({id:'plan.headers'})} val={dataSource?.kernel_info.headers} />
                        <PrepSpaceItem name="hotfix" val={dataSource?.kernel_info.hotfix ? formatMessage({id: 'operation.yes'}): formatMessage({id: 'operation.no'})} />
                        <PrepSpaceItem name={formatMessage({id:'plan.kernel_version'})} val={dataSource?.kernel_info.kernel_version} />
                    </>
                }
                <PrepSpaceItem name={formatMessage({id:'plan.rpm_info'})} val={dataSource?.rpm_info} />
                <PrepSpaceItem name={formatMessage({id:'plan.env_info'})} val={dataSource?.env_info} />
            </Row>

            <Row style={{ marginBottom: 20 }}>
                <DrawerNavbar>
                    <span><FormattedMessage id="plan.test.configuration" /></span>
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
                    <span><FormattedMessage id="plan.report.configuration" /></span>
                </DrawerNavbar>
                {dataSource?.auto_report ? (
                    <>
                        <SettingSpaceItem name={formatMessage({id: 'plan.generate.reports'})} val={<span style={{ paddingLeft: 4 }}><Badge status="processing" text={formatMessage({id: 'operation.yes'})} /></span>} />
                        <SettingSpaceItem name={formatMessage({id: 'plan.report_name'})} val={dataSource?.report_name || '{date} {plan_name} {plan_id} {product_version}'} />
                        <SettingSpaceItem name={formatMessage({id: 'plan.report_template_name'})} val={dataSource?.report_template_name} />
                        <SettingSpaceItem name={formatMessage({id: 'plan.group_method'})} val={dataSource?.group_method === 'job' ? formatMessage({id: 'plan.group_method.job'}) : formatMessage({id: 'plan.group_method.stage'})} />
                        <SettingSpaceItem name={formatMessage({id: 'plan.base_group_info'})} val={dataSource?.group_method === 'job' ? `${dataSource?.base_group_info?.stage_name || '-'} / ${dataSource?.base_group_info?.template_name}` : dataSource?.base_group_info?.stage_name} />
                        <SettingSpaceItem name={formatMessage({id: 'plan.report_description'})} val={dataSource?.report_description} />
                    </> )
                    :
                    <SettingSpaceItem name={formatMessage({id: 'plan.generate.reports'})} val={<span style={{ paddingLeft: 4 }}><Badge status="default" text={formatMessage({id: 'operation.no'})} /></span>} />
                }
            </Row>

            <Row>
                <DrawerNavbar>
                    <span><FormattedMessage id="plan.trigger.configuration" /></span>
                </DrawerNavbar>
                <SettingSpaceItem name={formatMessage({id: 'plan.trigger.rule'})} val={dataSource?.cron_info || formatMessage({id: 'plan.width.out'})} />
            </Row>
        </Drawer>
    )
}

export default forwardRef(ViewPlanDetail)