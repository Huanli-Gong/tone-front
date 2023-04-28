/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Space, Switch, Tooltip, Dropdown, Menu, Row, message, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import TemplateListDrawer from './TemplateListDrawer'
import AddDeviceDrawer from './AddDeviceDrawer'

import {
    PlusMnueIcon, PiplineContainer, StepWrapper, StartPiplineWrapper, StartStepCircle, StepStartWord,
    StepTips, StepDeleteIcon, StepTitle, StepOptionLeft, StepPreAddBtn,
    StepTitleInput, StepOptionRight, StepEmptyCircle, StepNextAddBtn, ChildrenStepWrapper,
    AddTemplateItem, ChildAddItem, ChildAddIcon, ArrowDashedBlue, ArrowSolidGery, TemplatesChildrenWrapper,
    TemplateItem, TemplateIndex, TemplateName, StartLine, ServerScript, ServerIndex, ServerTitle, ServerItem,
    ScriptChildrenWrapper, ServerChildAddItem, ServerDeleteIcon, StepUnEmptyCircle, DeleteTemplateIcon
} from './styled'
import { useParams, useIntl, FormattedMessage } from 'umi'

const TestSetting = (props: any) => {
    const { formatMessage } = useIntl()
    const { show, onChange, template } = props
    const { ws_id } = useParams() as any

    const defaultPrepStepData = { name: formatMessage({ id: 'job.types.env' }), /*'环境准备'*/ machine_info: [], visible: false }
    const defaultTemplateData = { name: formatMessage({ id: 'plan.new.stage' }), /*'新测试阶段',*/ template: [], impact_next: false, }

    const [testConfig, setTestConfig] = useState<any>([defaultTemplateData])

    const [envPrep, setEnvPrep] = useState<any>(defaultPrepStepData)

    const addTemplatesRef: any = useRef()
    const addDeviceRef: any = useRef()

    useEffect(() => {
        if (template && JSON.stringify(template) !== '{}') {
            const { test_config, env_prep } = template
            if (test_config) setTestConfig(test_config)
            if (env_prep) setEnvPrep({ ...env_prep, visible: true })
        }
    }, [template])

    const handleAddPrepareStep = () => {
        setEnvPrep({ ...envPrep, visible: true })
    }

    const addTemplateData = () => ({
        name: `${formatMessage({ id: 'plan.new.stage' })}${testConfig.length + 1}`, template: [], impact_next: false
    })

    const handleAddTestStep = (index: number) => {
        if (testConfig.length > 4) {
            message.warning(formatMessage({ id: 'plan.stage.maximum5' }))
            return
        }
        const content: any = []
        testConfig.forEach((i: any, idx: any) => {
            if (idx === index) content.push(addTemplateData())
            content.push(i)
        })
        if (index === testConfig.length) content.push(addTemplateData())
        setTestConfig(content)
    }

    const AddStepDropdown: React.FC<any> = ({ hasEnv, index, children }) => (
        <Dropdown
            trigger={['click']}
            overlay={
                <Menu>
                    {
                        hasEnv &&
                        <Menu.Item onClick={handleAddPrepareStep}>
                            <Space>
                                <PlusMnueIcon />
                                <span><FormattedMessage id="plan.pre.stage" /></span>
                            </Space>
                        </Menu.Item>
                    }
                    <Menu.Item onClick={() => handleAddTestStep(index)}>
                        <Space>
                            <PlusMnueIcon />
                            <span><FormattedMessage id="plan.new.stage" /></span>
                        </Space>
                    </Menu.Item>
                </Menu>
            }
            placement="bottom"
            arrow
        >
            <Tooltip placement="top" title={formatMessage({ id: 'plan.add.stage' })}>
                {children}
            </Tooltip>
        </Dropdown>
    )

    const hanldeEffectStepSwitchChange = (val: any, index: any) => {
        setTestConfig(testConfig.map((i: any, idx: any) => {
            if (idx === index) return { ...i, impact_next: val }
            return i
        }))
    }

    const handleDeleteStep = (index: any) => {
        if (testConfig.length === 1) return
        setTestConfig(testConfig.filter((i: any, idx: any) => index !== idx))
    }

    const handleDeleteServerStep = () => {
        setEnvPrep(defaultPrepStepData)
    }

    const handleAddServer = () => {
        addDeviceRef.current.show()
    }

    const handleAddTemplate = (index: any) => {
        addTemplatesRef.current.show(testConfig[index].template, index)
    }

    const hanldeStepTitleChange = (val: any, index: any) => {
        if (val.length > 20) {
            message.warning(formatMessage({ id: 'plan.enter.up.20.characters' }))
            return
        }
        setTestConfig(
            testConfig.map((i: any, idx: number) => {
                if (idx === index) return { ...i, name: val }
                return i
            })
        )
    }

    const addTemplateOk = (values: any) => {
        if (values.list) {
            const { list, dataIndex } = values
            setTestConfig(testConfig.map((i: any, idx: any) => {
                return dataIndex === idx ? { ...i, template: list } : i
            }))
        }
        else {
            const { replaceId, dataIndex, rowkey, ...templ } = values

            setTestConfig(
                testConfig.map((i: any, idx: any) => {
                    if (idx === dataIndex) {
                        return {
                            ...i,
                            template: i.template.map((t: any, index: number) => {
                                if (index === rowkey) {
                                    return templ
                                }
                                return t
                            })
                        }
                    }
                    return i
                })
            )
        }
    }

    const addDeviceOk = (values: any, index: number) => {
        if (index !== null && index !== undefined)
            return setEnvPrep({
                ...envPrep,
                machine_info: envPrep.machine_info.map((i: any, idx: number) => {
                    if (index === idx) return values
                    return i
                })
            })

        setEnvPrep({ ...envPrep, machine_info: envPrep.machine_info.concat(values) })
    }

    const removeDevice = (index: any) => {
        setEnvPrep({ ...envPrep, machine_info: envPrep.machine_info.filter((i: any, idx: number) => index !== idx) })
    }

    useEffect(() => {
        onChange({ test_config: testConfig, env_prep: envPrep })
    }, [testConfig, envPrep])

    const removeTemplateItem = (index: number, itemId: number) => {
        setTestConfig(
            testConfig.map((row: any, idx: number) => {
                if (idx === index) {
                    const $template = row.template.filter((item: any) => item.id !== itemId)
                    return { ...row, template: $template }
                }
                return row
            })
        )
    }

    const handleOpenSetting = (index: any, i: any) => {
        addDeviceRef.current.show(index, i)
    }

    const handleReplaceTemplate = (listIndex: any, rowIndex: any, id: any) => {
        addTemplatesRef.current.show(testConfig[listIndex].template, listIndex, rowIndex, id)
    }

    return (
        <PiplineContainer style={{ display: show }}>
            <Row style={{ height: '100%' }}>
                <div style={{ display: 'flex', margin: '0 auto' }}>
                    <StartPiplineWrapper >
                        <StartStepCircle />
                        <StepStartWord ><FormattedMessage id="plan.start" /></StepStartWord>
                        <StartLine />
                    </StartPiplineWrapper>
                    {
                        envPrep.visible &&
                        <StepWrapper >
                            <StepTips justify="space-between" align="middle">
                                <span />
                                <StepDeleteIcon onClick={handleDeleteServerStep} />
                            </StepTips>
                            <StepTitle>
                                <StepOptionLeft />
                                <StepTitleInput
                                    value={envPrep.name}
                                    onChange={({ target }: any) => setEnvPrep({ ...envPrep, name: target.value })}
                                />
                                <StepOptionRight>
                                    <StepUnEmptyCircle />
                                    <AddStepDropdown index={0}>
                                        <StepNextAddBtn />
                                    </AddStepDropdown>
                                </StepOptionRight>
                            </StepTitle>
                            <ChildrenStepWrapper >
                                {
                                    envPrep.machine_info.map((i: any, index: any) => (
                                        <ScriptChildrenWrapper key={index}>
                                            <ArrowSolidGery type={'env'} />
                                            <ServerItem onClick={(e) => { e.stopPropagation(); handleOpenSetting(index, i) }}>
                                                <ServerDeleteIcon onClick={(e) => { e.stopPropagation(); removeDevice(index) }} />
                                                <ServerIndex>{index + 1}</ServerIndex>
                                                <ServerTitle>{i.machine} </ServerTitle>
                                                <ServerScript>{i.script}</ServerScript>
                                            </ServerItem>
                                        </ScriptChildrenWrapper>
                                    ))
                                }
                                <ServerChildAddItem onClick={handleAddServer}>
                                    <ArrowDashedBlue />
                                    <AddTemplateItem >
                                        <ChildAddIcon />
                                        <span><FormattedMessage id="plan.add.machine" /></span>
                                    </AddTemplateItem>
                                </ServerChildAddItem>
                            </ChildrenStepWrapper>
                        </StepWrapper>
                    }
                    {
                        testConfig.map((i: any, index: number) => (
                            <StepWrapper key={index}>
                                <StepTips justify="space-between" align="middle">
                                    <Space>
                                        <span><FormattedMessage id="plan.subsequent.steps" /></span>
                                        <Switch
                                            onChange={(val: any) => hanldeEffectStepSwitchChange(val, index)}
                                            checkedChildren={<FormattedMessage id="operation.yes" />}
                                            unCheckedChildren={<FormattedMessage id="operation.no" />}
                                            checked={i.impact_next}
                                        />
                                    </Space>
                                    <StepDeleteIcon onClick={() => handleDeleteStep(index)} />
                                </StepTips>
                                <StepTitle>
                                    <StepOptionLeft>
                                        {
                                            (index === 0 && !envPrep.visible) ?
                                                <AddStepDropdown hasEnv={index === 0 && !envPrep.visible} index={index}>
                                                    <StepPreAddBtn />
                                                </AddStepDropdown> :
                                                <Tooltip placement="top" title={formatMessage({ id: 'plan.add.stage' })}>
                                                    <StepPreAddBtn onClick={() => handleAddTestStep(index)} />
                                                </Tooltip>
                                        }
                                    </StepOptionLeft>
                                    <StepTitleInput
                                        value={i.name}
                                        onChange={({ target }: any) => hanldeStepTitleChange(target.value, index)}
                                    />
                                    <StepOptionRight>
                                        {
                                            i.impact_next ?
                                                <StepUnEmptyCircle /> :
                                                <StepEmptyCircle />
                                        }
                                        {/* {
                                            !envPrep.visible ?
                                                <AddStepDropdown index={testConfig.length}>
                                                    <StepNextAddBtn />
                                                </AddStepDropdown> :
                                        } */}
                                        <Tooltip placement="top" title={formatMessage({ id: 'plan.add.stage' })}>
                                            <StepNextAddBtn onClick={() => handleAddTestStep(index + 1)} />
                                        </Tooltip>
                                    </StepOptionRight>
                                </StepTitle>
                                <ChildrenStepWrapper >
                                    {
                                        i.template.map((item: any, idx: number) => (
                                            <TemplatesChildrenWrapper key={idx}>
                                                <ArrowSolidGery />
                                                <TemplateItem onClick={() => handleReplaceTemplate(index, idx, item.id)} >
                                                    <TemplateIndex>{idx + 1}</TemplateIndex>
                                                    <TemplateName>
                                                        <Tooltip title={item.name}>
                                                            <Typography.Text ellipsis style={{ width: '90%' }}>
                                                                {item.name}
                                                            </Typography.Text>
                                                        </Tooltip>
                                                    </TemplateName>
                                                    <DeleteTemplateIcon
                                                        onClick={(evt) => {
                                                            evt.stopPropagation()
                                                            removeTemplateItem(index, item.id)
                                                        }}
                                                    />
                                                </TemplateItem>
                                            </TemplatesChildrenWrapper>
                                        ))
                                    }
                                    {
                                        i.template.length < 15 &&
                                        <ChildAddItem >
                                            <ArrowDashedBlue />
                                            <AddTemplateItem onClick={() => handleAddTemplate(index)}>
                                                <ChildAddIcon />
                                                <span><FormattedMessage id="plan.add.template" /></span>
                                            </AddTemplateItem>
                                        </ChildAddItem>
                                    }
                                </ChildrenStepWrapper>
                            </StepWrapper>
                        ))
                    }
                </div>
                <TemplateListDrawer ws_id={ws_id} ref={addTemplatesRef} onOk={addTemplateOk} />
                <AddDeviceDrawer ws_id={ws_id} ref={addDeviceRef} onOk={addDeviceOk} />
            </Row>
        </PiplineContainer>
    )
}

export default TestSetting