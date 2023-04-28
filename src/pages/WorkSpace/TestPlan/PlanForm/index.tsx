/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useRef, useEffect } from 'react'
import { Breadcrumb, Row, Steps, Button, Result, Col, Space, message, Spin, Badge } from 'antd'

import BasicSetting from './components/BasicSetting'
import TestSetting from './components/TestSetting'
import ReportSetting from './components/ReportSetting'
import TouchSetting from './components/TouchSetting'

import { useClientSize, writeDocumentTitle } from '@/utils/hooks'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import {
    CreateContainer, ContainerBody, ContainerBreadcrumb, LeftWrapper,
    RightBody, RightNav, RightWrapper, SuccessDescriptionContainer
} from './styles'
import { history, useIntl, FormattedMessage, getLocale, Access, useAccess, useLocation } from 'umi'
import { runningTestPlan, creatTestPlan, queryTestPlanDetails, updateTestPlan } from '@/pages/WorkSpace/TestPlan/services'
import styles from './index.less'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'
import _ from 'lodash'
import { stringify } from 'querystring'

/** 
 * 计划管理/新建计划（新）
 * */
const TestPlan = (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const access = useAccess();
    const { height: layoutHeight } = useClientSize()
    const { state } = useLocation() as any

    const { route } = props
    // console.log('route.name:', route.name)
    writeDocumentTitle(`Workspace.TestPlan.${route.name}`)

    const { ws_id, plan_id } = props.match.params
    const [current, setCurrent] = useState(0)

    const [loading, setLoading] = useState(route.name !== 'Create')
    const [isFormStep, setIsFormStep] = useState(true) //填表阶段
    const [pedding, setPedding] = useState(false)

    const basicSettingRef: any = useRef()
    const touchSettingRef: any = useRef()
    const reportSettingRef: any = useRef()

    const [dataSource, setDataSource] = useState<any>({ basic: {}, pipline: {}, touch: {} })
    const [template, setTemplate] = useState<any>(null)
    const [successData, setSuccessData] = useState<any>(null)

    // 查询
    const getEditTestPlanData = async () => {
        const { data, code } = await queryTestPlanDetails({ ws_id, id: plan_id })
        if (code === 200) {
            setTemplate(data)
            // setSuccessData( data )
            setLoading(false)
        }
    }

    useEffect(() => {
        const { name } = route
        if (name !== 'Create')
            getEditTestPlanData()
    }, [route])

    const handleStepPre = () => {
        setCurrent(current - 1)
    }

    // 校验数据
    const checkDataSource = () => {
        return new Promise((resolve: any, reject: any) => {
            const pipline = dataSource.pipline
            const { env_prep = {}, test_config = [] } = pipline || {}
            const localStr = formatMessage({ id: 'plan.cannot.be.empty' })
            if (env_prep.machine_info && !env_prep.machine_info.length) {
                message.error(`${env_prep.name}${localStr}`)
                reject()
            }

            if (test_config.length) {
                test_config.forEach((item: any) => {
                    const { name, template: $template = [] } = item
                    if (!$template.length) {
                        message.error(`${name}${localStr}`)
                        reject()
                    }
                })
            } else {
                message.error(`${env_prep.name}${localStr}`)
                reject()
            }
            resolve()
        })
    }
    const hanleStepNext = async (stepKey: any) => {
        if (pedding) return
        setPedding(true)
        try {
            if (current === 0) {
                const basicFormValue = await basicSettingRef.current.validate()
                const { headers, devel, hotfix_install, scripts, kernel, build_config, build_machine, code_branch, code_repo,
                    commit_id, compile_branch, cpu_arch, product_name, ...formValue
                } = basicFormValue
                setDataSource({
                    ...dataSource,
                    basic: {
                        ...formValue,
                        kernel_info: { headers, devel, hotfix_install, kernel, scripts },
                        build_pkg_info: {
                            build_config, build_machine, code_branch, code_repo,
                            commit_id, compile_branch, cpu_arch, name: product_name
                        }
                    }
                })
            }
            if (current === 1) {
                // 校验各阶段都添加了模版，才能跳到下一步
                await checkDataSource()
            } else if (current === 2) {
                // 校验表单必填项填写了没有
                await reportSettingRef.current.validate()
            }

            // 编辑时通过校验后，可随意跳步骤。
            (route.name === 'Edit' && stepKey !== 'NextStep') ? setCurrent(stepKey) : setCurrent(current + 1)
        }
        catch (err) {
            console.log(err, 8888)
        }
        setPedding(false)
    }

    const handleStepChange = async (key: number) => {
        if (key > current) {
            await hanleStepNext(key)
        }
        else setCurrent(key)
    }

    const hanldePrepDataChange = ({ test_config, env_prep }: any) => {
        setDataSource({
            ...dataSource,
            pipline: {
                env_prep: env_prep.visible ? env_prep : {},
                test_config: test_config.map((i: any) => {
                    return { ...i, template: i.template.map((t: any) => t.id) }
                })
            },
        })
        // 将步骤2产生的数据，传给步骤3中
        reportSettingRef.current.refreshData(test_config);
    }

    const trhowErrorMsg = (err: any) => {
        if (err) {
            const { errorFields } = err
            if (errorFields && _.isArray(errorFields) && errorFields.length > 0) {
                const { errors } = errorFields[0]
                message.error(errors.toString())
            }
        }
    }

    const formatterData = async () => {
        const basic = await basicSettingRef.current.validate()
        const report = await reportSettingRef.current.validate()
        const touch = await touchSettingRef.current.validate()
        const pipline = dataSource.pipline

        const {
            headers, devel, hotfix_install, scripts, kernel, build_config,
            build_machine, code_branch, code_repo, kernel_packages,
            commit_id, compile_branch, cpu_arch, product_name, ...formValue
        } = basic;

        const { base_group_job, base_group_stage, ...reportOther } = report;
        // *根据“分组方式”区分“选择基准组”字段的表单值的来源。

        const { group_method } = report
        let reportValues = { ...reportOther }
        if (group_method === "job") {
            const [stage_id, base_group] = base_group_job
            reportValues = Object.assign(reportValues, { stage_id, base_group })
        }
        if (group_method === "stage")
            reportValues = Object.assign(reportValues, { base_group: base_group_stage })

        return {
            ...formValue,
            kernel_info: { headers, devel, hotfix_install, scripts, kernel, kernel_packages },
            build_pkg_info: {
                build_config, build_machine, code_branch, code_repo,
                commit_id, compile_branch, cpu_arch, name: product_name
            },
            ...reportValues,
            ...touch,
            cron_info: touch?.cron_info ?? dataSource?.cron_info,
            ...pipline
        }
    }

    const hanldePushTestPlan = async () => {
        if (pedding) return
        setPedding(true)
        const formData = await formatterData()
        const { code, msg, data } = await creatTestPlan({ ...formData, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            setPedding(false)
            return
        }
        setSuccessData(data)
        setIsFormStep(false)
    }

    const handleTestPlanOption = async (is_save: boolean = false) => {
        if (pedding) return
        setPedding(true)
        try {
            const formData = await formatterData()
            const { code, msg } = await runningTestPlan({ ...formData, is_save, ws_id, plan_id })
            if (code !== 200) {
                requestCodeMessage(code, msg)
                setPedding(false)
                return;
            }

            history.push(`/ws/${ws_id}/test_plan?${stringify(state)}`)
        }
        catch (err) {
            console.log(err)
            setPedding(false)
            trhowErrorMsg(err)
        }
    }

    const handleBackPlanManage = () => history.push(`/ws/${ws_id}/test_plan?${stringify(state)}`)

    const hanldeUpdatePlan = async () => {
        if (pedding) return
        setPedding(true)
        try {
            const formData = await formatterData()
            const { code, msg } = await updateTestPlan({ ...formData, ws_id, plan_id })
            if (code !== 200) {
                requestCodeMessage(code, msg)
                setPedding(false)
                return;
            }
            history.push(`/ws/${ws_id}/test_plan?${stringify(state)}`)
        }
        catch (err) {
            console.log(err)
            setPedding(false)
            trhowErrorMsg(err)
        }
    }


    return (
        <Spin spinning={loading} >
            <CreateContainer height={layoutHeight}>
                <ContainerBreadcrumb align="middle">
                    <Breadcrumb >
                        <Breadcrumb.Item onClick={handleBackPlanManage}>
                            <span style={{ cursor: 'pointer' }}><FormattedMessage id={`menu.Workspace.TestPlan.Manage`} /></span>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item >
                            <FormattedMessage id={`Workspace.TestPlan.${route.name}`} />
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </ContainerBreadcrumb>
                <ContainerBody height={layoutHeight}>
                    {
                        isFormStep ?
                            <>
                                {/* 左侧   步骤 === 进度显示部分 ==== onChange={setCurrent}  */}
                                <LeftWrapper state={route.name !== 'Create'} enLocale={enLocale}>
                                    <Steps current={current} direction="vertical" style={{ height: 201 }} onChange={handleStepChange} >
                                        <Steps.Step title={<FormattedMessage id="plan.basic.configuration" />} key={0} className={styles[['Run', 'Edit'].includes(route.name) ? 'stepsWrapper_1' : 'stepsWrapper']} />
                                        <Steps.Step title={<FormattedMessage id="plan.test.configuration" />} key={1} className={styles[['Run', 'Edit'].includes(route.name) ? 'stepsWrapper_2' : 'stepsWrapper']} />
                                        <Steps.Step title={<FormattedMessage id="plan.report.configuration" />} key={2} />
                                        <Steps.Step title={<FormattedMessage id="plan.trigger.configuration" />} key={3} />
                                    </Steps>
                                </LeftWrapper>
                                <RightWrapper enLocale={enLocale}>
                                    {/* 右侧 导航  === 操作部分 ==== */}
                                    <RightNav>
                                        <Row justify="space-between" align="middle">
                                            <div className={styles.plan_step_btn} onClick={handleStepPre}>
                                                {
                                                    current === 0 ? null : (
                                                        <>
                                                            <ArrowLeftOutlined />
                                                            <span><FormattedMessage id="operation.previous" /></span>
                                                        </>
                                                    )
                                                }
                                            </div>
                                            <Space>
                                                {
                                                    route.name === 'Run' &&
                                                    <>
                                                        <Button onClick={() => handleTestPlanOption()}><FormattedMessage id="plan.run.only" /></Button>
                                                        <Access accessible={access.WsTourist()}>
                                                            <Access
                                                                accessible={access.WsMemberOperateSelf(template?.creator)}
                                                                fallback={<Button onClick={() => AccessTootip()} type="primary"><FormattedMessage id="plan.run.and.save" /></Button>}
                                                            >
                                                                <Button onClick={() => handleTestPlanOption(true)} type="primary"><FormattedMessage id="plan.run.and.save" /></Button>
                                                            </Access>
                                                        </Access>
                                                    </>
                                                }
                                                {
                                                    route.name === 'Edit' &&
                                                    <>
                                                        <Button onClick={hanldeUpdatePlan} type="primary"><FormattedMessage id="plan.save" /></Button>
                                                        <Access accessible={access.WsTourist()}>
                                                            <Access
                                                                accessible={access.WsMemberOperateSelf(template?.creator)}
                                                                fallback={<Button onClick={() => AccessTootip()}><FormattedMessage id="plan.save.and.run" /></Button>}
                                                            >
                                                                <Button onClick={() => handleTestPlanOption(true)}><FormattedMessage id="plan.save.and.run" /></Button>
                                                            </Access>
                                                        </Access>
                                                    </>
                                                }
                                                <div className={styles.plan_step_btn} onClick={() => hanleStepNext('NextStep')}>
                                                    {
                                                        current < 3 &&
                                                        <>
                                                            <span style={{ fontSize: 14 }}><FormattedMessage id="operation.next" /></span>
                                                            <ArrowRightOutlined />
                                                        </>
                                                    }
                                                </div>
                                                {
                                                    current === 3 &&
                                                    <>
                                                        {
                                                            route.name === 'Create' &&
                                                            <Button type="primary" onClick={hanldePushTestPlan}><FormattedMessage id="plan.release" /></Button>
                                                        }
                                                    </>
                                                }
                                            </Space>
                                        </Row>
                                    </RightNav>
                                    {/*   右侧  ===  表单部分  ===  */}
                                    <RightBody>
                                        <BasicSetting
                                            show={current === 0 ? 'block' : 'none'}
                                            ref={basicSettingRef}
                                            template={template}
                                        />
                                        <TestSetting
                                            show={current === 1 ? 'block' : 'none'}
                                            template={template}
                                            onChange={hanldePrepDataChange}
                                        />

                                        <ReportSetting
                                            {...props}
                                            show={current === 2 ? 'block' : 'none'}
                                            ref={reportSettingRef}
                                            template={template}
                                        />
                                        <TouchSetting
                                            ref={touchSettingRef}
                                            template={template}
                                            show={current === 3 ? 'block' : 'none'}
                                        />
                                    </RightBody>
                                </RightWrapper>
                            </>
                            :
                            <div style={{ width: '100%' }}>
                                {/* 计划成功部分 */}
                                <Result
                                    status="success"
                                    style={{ margin: '0 auto' }}
                                    title={<FormattedMessage id="plan.created.success" />}
                                    subTitle={<FormattedMessage id="plan.the.test.plan.can" />}
                                    extra={[
                                        <Button
                                            type="primary"
                                            key="console"
                                            onClick={() => history.push(`/ws/${ws_id}/test_plan?${stringify(state)}`)}
                                        >
                                            <FormattedMessage id="plan.return.management" />
                                        </Button>
                                    ]}
                                />
                                <SuccessDescriptionContainer>
                                    <Col span={24}><b><FormattedMessage id="plan.configuration.information" /></b></Col>
                                    <Col span={24}>
                                        <Row>
                                            {
                                                successData?.name &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span><FormattedMessage id="plan.table.name" />：</span>
                                                        <span>{successData?.name}</span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.cron_info &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span><FormattedMessage id="plan.table.cron_info" />：</span>
                                                        <span>{successData?.cron_info}</span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.enable &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span><FormattedMessage id="plan.table.enable" />：</span>
                                                        <span>
                                                            {
                                                                successData?.enable ?
                                                                    <Badge status="processing" text={<FormattedMessage id="operation.yes" />} /> :
                                                                    <Badge status="default" text={<FormattedMessage id="operation.no" />} />
                                                            }
                                                        </span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.next_time &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span><FormattedMessage id="plan.next_time" />：</span>
                                                        <span>{successData?.next_time}</span>
                                                    </Space>
                                                </Col>
                                            }
                                        </Row>
                                    </Col>
                                </SuccessDescriptionContainer>
                            </div>
                    }
                </ContainerBody>
            </CreateContainer>
        </Spin>
    )
}

export default TestPlan
