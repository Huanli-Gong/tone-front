import React, { useCallback, useContext } from 'react'
import { Form, Col, Radio, Row, Select, Input, InputNumber } from 'antd'
import { useIntl, FormattedMessage } from 'umi';
import { formatter, QusetionIconTootip } from '../untils'
import ServerObjectSelect from './ServerObjectSelect'
import DispathTagSelect from './DispathTagSelect'
import CustomServer from './CustomServer'
import { DrawerProvider } from './Provider'
import styles from '../SelectSuite/style.less';

import type { FormInstance, RadioChangeEvent } from "antd"

type IProps = AnyType

type ContextProps = {
    form: FormInstance,
} & AnyType

export default (props: IProps) => {
    const { formatMessage } = useIntl()
    const { batch, server_type, run_mode, serverType, serverObjectType, mask, multipInfo } = props
    const {
        setServerObjectType, setServerType, setMask, settingType, setServerList, setTagList, setHasInfoError, form
    } = useContext<ContextProps>(DrawerProvider)

    React.useEffect(() => {
        if (serverType === "pool")
            setHasInfoError(false)
    }, [serverType, setHasInfoError])

    const handleServerTypeChange = ({ target }: RadioChangeEvent) => {
        setServerType(target.value)
        setServerList([])
    }

    const handleServerObjectTypeChange = useCallback(
        (value) => {
            setServerList([])
            setTagList([])
            setServerObjectType(value)
            setMask(false)
            form.setFieldsValue({ server_object_id: undefined })
        },
        [],
    )

    const handleHideMask = (s: string) => {
        setMask(false)
        if (s === 'pool') {
            setServerType('pool')
            setServerObjectType('ip')
        }
        else setServerType('custom')
    }

    return (
        <>
            {
                (!mask) &&
                <Form.Item
                    label={
                        settingType === 'suite' ?
                            <QusetionIconTootip
                                title={formatMessage({ id: 'select.suite.the.server' })}
                                desc={formatMessage({ id: 'select.suite.the.server.desc' })} />
                            : formatMessage({ id: 'select.suite.the.server' })
                    }
                    className={'drawer_padding'}
                >
                    <Radio.Group value={serverType} onChange={handleServerTypeChange} >
                        <Radio value={'pool'}><FormattedMessage id="select.suite.the.server.pool" /></Radio>
                        {
                            server_type !== 'aliyun' && run_mode === 'standalone' && <Radio value={'custom'}><FormattedMessage id="select.suite.self.owned.server" /></Radio>
                        }
                    </Radio.Group>
                </Form.Item>
            }

            {
                (mask && batch) &&
                <Form.Item className={'drawer_padding'}
                    label={<FormattedMessage id="select.suite.the.server" />}>
                    <label className="ant-radio-wrapper" onClick={() => handleHideMask('pool')}>
                        <span className="ant-radio ant-radio-checked">
                            <span className={`ant-radio-inner ${!multipInfo.serverPool ? styles.serverItemUncheckeds : ''}`} style={{ borderColor: '#d9d9d9' }} />
                        </span>
                        <span><FormattedMessage id="select.suite.the.server.pool" /></span>
                    </label>
                    {
                        server_type !== 'aliyun' && run_mode === 'standalone' &&
                        <label className="ant-radio-wrapper" onClick={() => handleHideMask('self')}>
                            <span className="ant-radio ant-radio-checked">
                                <span className={`ant-radio-inner ${!multipInfo.selfServer ? styles.serverItemUnchecked : ''}`} style={{ borderColor: '#d9d9d9' }} />
                            </span>
                            <span><FormattedMessage id="select.suite.self.owned.server" /></span>
                        </label>
                    }
                </Form.Item>
            }

            <Row
                style={{ marginBottom: 8 }}
                className={'drawer_padding'}
                gutter={8}
            >
                {
                    serverType === 'pool' ?
                        <>
                            <Col span={10}>
                                <Select
                                    style={{ width: '100%' }}
                                    value={serverObjectType}
                                    onChange={handleServerObjectTypeChange}
                                    placeholder={formatMessage({ id: 'select.suite.multiple.values' })}
                                    title={formatMessage({ id: `select.suite.${serverObjectType === 'ip' ? 'random' : serverObjectType}` })}
                                >
                                    <Select.Option value={'ip'}><FormattedMessage id="select.suite.random" /></Select.Option>
                                    {
                                        (server_type === 'aliyun' && run_mode === 'standalone') ?
                                            <>
                                                <Select.Option value={'instance'} title={formatMessage({ id: 'select.suite.instance' })}><FormattedMessage id="select.suite.instance" /></Select.Option>
                                                <Select.Option value={'setting'} title={formatMessage({ id: 'select.suite.setting' })}><FormattedMessage id="select.suite.setting" /></Select.Option>
                                            </> :
                                            <Select.Option value={'server_object_id'}><FormattedMessage id="select.suite.server_object_id" /></Select.Option>
                                    }
                                    <Select.Option value={'server_tag_id'}><FormattedMessage id="select.suite.server_tag_id" /></Select.Option>
                                </Select>
                            </Col>
                            <Col span={14}>
                                {
                                    (serverObjectType === 'ip' || !serverObjectType) &&
                                    <Input
                                        title={formatMessage({ id: 'select.suite.randomly.schedule' })}
                                        style={{ width: '100%' }}
                                        autoComplete="off"
                                        disabled={true}
                                        placeholder={formatMessage({ id: 'select.suite.randomly.schedule' })}
                                    />
                                }
                                {
                                    (serverObjectType && serverObjectType !== 'ip' && serverObjectType !== 'server_tag_id') &&
                                    <ServerObjectSelect {...props} />
                                }
                                {
                                    serverObjectType === 'server_tag_id' &&
                                    <DispathTagSelect {...props} />
                                }
                            </Col>
                        </> :
                        <CustomServer {...props} />
                }
            </Row>

            <Form.Item
                name="repeat"
                label={
                    <QusetionIconTootip
                        title="Repeat"
                        desc={`${settingType === 'suite' ? formatMessage({ id: 'select.suite.repeat.tootip1' }) : formatMessage({ id: 'select.suite.repeat.tootip2' })}`}
                    />
                }
                className={'drawer_padding'}
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    step={1}
                    formatter={formatter}
                    max={10000}
                    placeholder={formatMessage({ id: multipInfo.repeat ? 'select.suite.multiple.values' : 'please.enter' })}
                />
            </Form.Item>

            {
                settingType === 'suite' &&
                <div style={{ height: 8, background: 'rgba(0,0,0,0.03)', width: '100%', marginBottom: 8 }} />
            }
        </>
    )
}