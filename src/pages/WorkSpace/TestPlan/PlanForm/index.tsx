import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Breadcrumb, Row, Steps, Button, Result, Col, Space, message, Spin , Badge } from 'antd'

import BasicSetting from './components/BasicSetting'
import TestSetting from './components/TestSetting'
import ReportSetting from './components/ReportSetting'
import TouchSetting from './components/TouchSetting'

import { useClientSize , writeDocumentTitle } from '@/utils/hooks'
import { ArrowLeftOutlined, ArrowRightOutlined , CheckOutlined} from '@ant-design/icons'
import {
    CreateContainer, ContainerBody, ContainerBreadcrumb, LeftWrapper,
    RightBody, RightNav, RightWrapper, SuccessDescriptionContainer
} from './styles'
import { history, FormattedMessage } from 'umi'
import { runningTestPlan, creatTestPlan, queryTestPlanDetails, updateTestPlan } from '@/pages/WorkSpace/TestPlan/services'
import styles from './index.less'
import { requestCodeMessage } from '@/utils/utils'

/** 
 * 计划管理/新建计划（新）
 * */
const TestPlan = (props: any) => {
    const {height: layoutHeight} = useClientSize()

    const { route } = props
    // console.log('route.name:', route.name)

    writeDocumentTitle( `Workspace.TestPlan.${ route.name }` )

    const { ws_id, plan_id } = props.match.params
    const [current, setCurrent] = useState(0)

    const [loading, setLoading] = useState(route.name !== 'Create')
    const [isFormStep, setIsFormStep] = useState( true ) //填表阶段
    const [pedding, setPedding] = useState(false)

    const basicSettingRef: any = useRef()
    const touchSettingRef: any = useRef()
    const reportSettingRef: any = useRef()

    const [dataSource, setDataSource] = useState<any>({ basic: {}, pipline: {}, touch: {} })

    const [template, setTemplate] = useState(null)

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
    }, [])

    const handleStepPre = () => {
        setCurrent(current - 1)
    }

    const handleStepChange = async ( key : number ) => {
        if ( key > current) {
            await hanleStepNext(key)
        }
        else setCurrent( key )
    }

    const hanleStepNext = async (stepKey: any) => {
        if (pedding) return
        setPedding(true)
        try {
            if (current === 0) {
                const basicFormValue = await basicSettingRef.current.validate()
                const { headers, devel, hotfix, kernel, build_config, build_machine, code_branch, code_repo,
                    commit_id, compile_branch, cpu_arch, ...formValue
                } = basicFormValue
                setDataSource({
                    ...dataSource,
                    basic: {
                        ...formValue,
                        kernel_info: { headers, devel, hotfix, kernel },
                        build_info: {
                            build_config, build_machine, code_branch, code_repo,
                            commit_id, compile_branch, cpu_arch
                        }
                    }
                })
            } 
            if (current === 1) {
                // 校验各阶段都添加了模版，才能跳到下一步
                await checkDataSource()
            } else if (current === 2) {
                // 校验表单必填项填写了没有
                const formData = await reportSettingRef.current.validate()
            }

            // 编辑时通过校验后，可随意跳步骤。
            (route.name === 'Edit' && stepKey !== 'NextStep') ? setCurrent(stepKey) : setCurrent(current + 1)
        }
        catch (err) {
            console.log(err, 8888)

        }
        setPedding(false)
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

    const formatterData = async () => {
        const basic = await basicSettingRef.current.validate()
        const report = await reportSettingRef.current.validate()
        const touch = await touchSettingRef.current.validate()
        const pipline = dataSource.pipline

        const { 
            headers, devel, hotfix, kernel, build_config, 
            build_machine, code_branch, code_repo,
            commit_id, compile_branch, cpu_arch, ...formValue
        } = basic;

        const { base_group_job, base_group_stage, ...reportOther } = report;
        // *根据“分组方式”区分“选择基准组”字段的表单值的来源。
        const reportValue = report.group_method === 'job' ?
            { ...reportOther, stage_id: base_group_job[0], base_group: base_group_job[1] } : { ...reportOther, base_group: base_group_stage}

        return {
            ...formValue,
            kernel_info: { headers, devel, hotfix, kernel },
            build_info: {
                build_config, build_machine, code_branch, code_repo,
                commit_id, compile_branch, cpu_arch
            },
            ...reportValue,
            ...touch,
            ...pipline
        }
    }

    const hanldePushTestPlan = async () => {
        if (pedding) return
        setPedding(true)
        const formData = await formatterData()
        const { code, msg, data } = await creatTestPlan({ ...formData , ws_id })
        if (code !== 200) {
            requestCodeMessage( code , msg )
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
                requestCodeMessage( code , msg )
                setPedding(false)
                return;
            }
            history.push(`/ws/${ws_id}/test_plan`)
        }
        catch( err ) {
            console.log( err )
            setPedding( false )
            message.error( err.errorFields[0].errors.toString())
        }
    }

    const handleBackPlanManage = useCallback(() => {
        history.push(`/ws/${ws_id}/test_plan`)
    }, [])

    const hanldeUpdatePlan = async () => {
        if (pedding) return
        setPedding(true)
        try {
            const formData = await formatterData()
            const { code, msg } = await updateTestPlan({ ...formData, ws_id, plan_id })
            if (code !== 200) {
                requestCodeMessage( code , msg )
                setPedding(false)
                return;
            }
            history.push(`/ws/${ws_id}/test_plan`)
        }
        catch( err ) {
            console.log( err )
            setPedding( false )
            message.error( err.errorFields[0].errors.toString())
        }
    }

    // 校验数据
    const checkDataSource = () => {
        return new Promise(( resolve : any , reject : any ) => {
            const pipline = dataSource.pipline
            const { env_prep = {}, test_config = [] } = pipline || {}
    
            if (env_prep.machine_info && !env_prep.machine_info.length){
                message.error(`${env_prep.name}模板不能为空`)
                reject()
            }
    
            if (test_config.length) {
                test_config.forEach((item: any)=> {
                    const { name, template = [] } = item
                    if (!template.length) {
                       message.error(`${name}模板不能为空`)
                       reject()
                    }
                })
            } else {
                message.error(`${env_prep.name}模板不能为空`)
                reject()
            }
            resolve()
        })
    }

    return (
        <Spin spinning={loading} >
            <CreateContainer height={layoutHeight}>
                <ContainerBreadcrumb align="middle">
                    <Breadcrumb >
                        <Breadcrumb.Item onClick={handleBackPlanManage}>
                            <span style={{ cursor : 'pointer' }}><FormattedMessage id={`Workspace.TestPlan.Manage`} /></span>
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
                                <LeftWrapper state={ route.name !== 'Create' }>
                                    <Steps current={current} direction="vertical" style={{ height: 201 }} onChange={ handleStepChange } >
                                        <Steps.Step title="基础配置" key={ 0 } className={styles[(route.name === 'Run' || route.name === 'Edit' ) ? 'stepsWrapper_1' : 'stepsWrapper']}/>
                                        <Steps.Step title="测试配置" key={ 1 } className={styles[(route.name === 'Run' || route.name === 'Edit' ) ? 'stepsWrapper_2' : 'stepsWrapper']}/>
                                        <Steps.Step title="报告配置" key={ 2 } />
                                        <Steps.Step title="触发配置" key={ 3 } />
                                    </Steps>
                                </LeftWrapper>
                                <RightWrapper>
                                    {/* 右侧 导航  === 操作部分 ==== */}
                                    <RightNav>
                                        <Row justify="space-between" align="middle">
                                            <div className={styles.plan_step_btn} onClick={handleStepPre}>
                                                {
                                                    current === 0 ? null : (
                                                        <>
                                                            <ArrowLeftOutlined />
                                                            <span >上一步</span>
                                                        </>
                                                    )
                                                }
                                            </div>
                                            <Space>
                                                {
                                                    route.name === 'Run' &&
                                                    <>
                                                        <Button onClick={() => handleTestPlanOption()} >仅运行</Button>
                                                        <Button onClick={() => handleTestPlanOption(true)} type="primary">运行并保存</Button>
                                                    </>
                                                }
                                                {
                                                    route.name === 'Edit' &&
                                                    <>
                                                        <Button onClick={hanldeUpdatePlan} type="primary">保存</Button>
                                                        <Button onClick={() => handleTestPlanOption(true)} >保存并运行</Button>
                                                    </>
                                                }
                                                <div className={styles.plan_step_btn} onClick={()=> hanleStepNext('NextStep')}>
                                                    {
                                                        current < 3 &&
                                                        <>
                                                            <span style={{fontSize: 14 }}>下一步</span>
                                                            <ArrowRightOutlined />
                                                        </>
                                                    }
                                                </div>
                                                {
                                                    current === 3 &&
                                                    <>
                                                        {
                                                            route.name === 'Create' &&
                                                            <Button type="primary" onClick={hanldePushTestPlan}>发布</Button>
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
                                            ws_id={ws_id}
                                            ref={basicSettingRef}
                                            template={template}
                                        />
                                        <TestSetting
                                            show={current === 1 ? 'block' : 'none'}
                                            ws_id={ws_id}
                                            template={template}
                                            onChange={hanldePrepDataChange}
                                        />

                                        <ReportSetting
                                            show={current === 2 ? 'block' : 'none'}
                                            ws_id={ws_id}
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
                                    title="测试计划创建成功"
                                    subTitle="测试计划可以实现版本全面测试、周期性测试、测试流程串联、测试验证阶段卡点等"
                                    extra={[
                                        <Button type="primary" key="console" onClick={() => history.push(`/ws/${ws_id}/test_plan`)} >
                                            返回计划管理
                                        </Button>
                                    ]}
                                />
                                <SuccessDescriptionContainer>
                                    <Col span={24}><b>计划配置信息</b></Col>
                                    <Col span={24}>
                                        <Row>
                                            {
                                                successData?.name &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span>计划名称：</span>
                                                        <span>{successData?.name}</span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.cron_info &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span>触发规则：</span>
                                                        <span>{successData?.cron_info}</span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.enable &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span>启用：</span>
                                                        <span>
                                                            {
                                                                successData?.enable ? 
                                                                    <Badge status="processing" text="是" /> :
                                                                    <Badge status="default" text="否" />
                                                            }
                                                        </span>
                                                    </Space>
                                                </Col>
                                            }
                                            {
                                                successData?.next_time &&
                                                <Col span={12}>
                                                    <Space>
                                                        <span>下次触发时间：</span>
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
