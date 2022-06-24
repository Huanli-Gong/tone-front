import React, { memo, useCallback, useContext, useEffect } from 'react'
import { Form, Col, Radio, Row, Select, Input, InputNumber } from 'antd'
import { QusetionIconTootip } from '../untils'
import ServerObjectSelect from './ServerObjectSelect'
import DispathTagSelect from './DispathTagSelect'
import CustomServer from './CustomServer'

import { DrawerProvider } from './Provider'

import styles from '../SelectSuite/style.less';
import _ from 'lodash'

export default memo(
    (props: any) => {
        const { batch, server_type, run_mode, form, serverType, serverObjectType, mask, multipInfo } = props
        const {
            setServerObjectType, setServerType, setMask, settingType, setServerList, setTagList,
        } = useContext<any>(DrawerProvider)
        const handleServerTypeChange = useCallback(
            ({ target }) => {
                setServerType(target.value)
                setServerList([])
            },
            [],
        )
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
                                <QusetionIconTootip title="机器" desc="对选中Suite下所有Conf生效" /> :
                                '机器'
                        }
                        className={'drawer_padding'}
                    >
                        <Radio.Group value={serverType} onChange={handleServerTypeChange} >
                            <Radio value={'pool'}>机器池</Radio>
                            {
                                server_type !== 'aliyun' && run_mode === 'standalone' && <Radio value={'custom'}>自持有机器</Radio>
                            }
                        </Radio.Group>
                    </Form.Item>
                }

                {
                    (mask && batch) &&
                    <Form.Item className={'drawer_padding'} label="机器" >
                        <label className="ant-radio-wrapper" onClick={() => handleHideMask('pool')}>
                            <span className="ant-radio ant-radio-checked">
                                <span className={`ant-radio-inner ${!multipInfo.serverPool ? styles.serverItemUncheckeds : ''}`} style={{ borderColor: '#d9d9d9' }} />
                            </span>
                            <span>机器池</span>
                        </label>
                        {
                            server_type !== 'aliyun' && run_mode === 'standalone' &&
                            <label className="ant-radio-wrapper" onClick={() => handleHideMask('self')}>
                                <span className="ant-radio ant-radio-checked">
                                    <span className={`ant-radio-inner ${!multipInfo.selfServer ? styles.serverItemUnchecked : ''}`} style={{ borderColor: '#d9d9d9' }} />
                                </span>
                                <span>自持有机器</span>
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
                                        placeholder={'多个数值'}
                                    >
                                        <Select.Option value={'ip'}>随机</Select.Option>
                                        {
                                            (server_type === 'aliyun' && run_mode === 'standalone') ?
                                                <>
                                                    <Select.Option value={'instance'}>指定机器实例</Select.Option>
                                                    <Select.Option value={'setting'}>指定机器配置</Select.Option>
                                                </> :
                                                <Select.Option value={'server_object_id'}>指定</Select.Option>
                                        }
                                        <Select.Option value={'server_tag_id'}>标签</Select.Option>
                                    </Select>
                                </Col>
                                <Col span={14}>
                                    {
                                        ( serverObjectType === 'ip' || !serverObjectType ) &&
                                        <Input
                                            style={{ width: '100%' }}
                                            autoComplete="off"
                                            disabled={true}
                                            placeholder="随机从机器池调度机器"
                                        />
                                    }
                                    {
                                        ( serverObjectType && serverObjectType !== 'ip' && serverObjectType !== 'server_tag_id' ) &&
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
                            desc={`${settingType === 'suite' ? '对选中Suite下所有Conf生效，' : ''}范围1-10000`}
                        />
                    }
                    className={'drawer_padding'}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        step={1}
                        max={10000}
                        placeholder={multipInfo.repeat ? '多个数值' : '请输入'}
                    />
                </Form.Item>

                {
                    settingType === 'suite' &&
                    <div style={{ height: 8, background: 'rgba(0,0,0,0.03)', width: '100%', marginBottom: 8 }} />
                }
            </>
        )
    }
)