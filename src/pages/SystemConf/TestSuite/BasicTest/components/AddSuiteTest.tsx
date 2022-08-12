import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { Drawer, Button, Form, Spin, Col, Row, Select, Input, Radio, Empty, Popover } from 'antd'
import styles from '../style.less'
import { member, validateSuite } from '../../service'
import Owner from '@/components/Owner/index';
import { useLocation, useRequest } from 'umi'
import _ from 'lodash'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { useSuiteProvider } from '../../hooks'
import { QusetionIconTootip } from '@/components/Product/index'

/**
 * @module 系统级
 * @description 新增、编辑suite级
 */
export default forwardRef(
    ({ onOk }: any, ref: any) => {
        const { query }: any = useLocation()
        const testType = query.test_type || 'functional'
        const [form] = Form.useForm()

        const { domainList , runList , viewType } = useSuiteProvider()

        const [visible, setVisible] = useState(false)
        const [validateStatus, setValidateStatus] = useState<any>('')
        const [help, setHelp] = useState<string | undefined>()
        const [fetch, setFetch] = useState<boolean>(false)
        const [disable, setDisable] = useState(false)
        const [dataSource, setDataSource] = useState<any>({})

        const { data: user, loading: fetchLoading, run: fetchUserRunner } = useRequest(
            (keyword = '',) => member({ keyword, scope: 'aligroup' }),
            {
                initialData: [],
                debounceInterval: 300,
            }
        )

        useImperativeHandle(ref, () => ({
            show: (t: any, d: any = {}) => {
                setVisible(true)
                setDisable(false)
                d && setDataSource(d)
                form.setFieldsValue({
                    ...d,
                    test_type: testType,
                    owner: d.owner_name,
                    certificated: d.certificated ? 1 : 0
                })
            },
            hide: handleCancel
        }))

        const handleOk = () => {
            form.validateFields().then(val => {
                if (!val.name || val.name.replace(/\s+/g, "") == '') {
                    setValidateStatus('error')
                    setHelp('请输入')
                    return
                }
                val.name = val.name.replace(/\s+/g, "")
                setDisable(true)
                if (val.owner === dataSource.owner_name) val.owner = dataSource.owner
                val.domain_list_str = val.domain_list_str.join()
                onOk(val, dataSource.id ? dataSource.id : '')
                setDisable(false)
            }).catch(err => {
                if (!err.values.name || err.values.name.replace(/\s+/g, "") == '') {
                    setValidateStatus('error')
                    setHelp('请输入')
                }
                setDisable(false)
            })
        }

        const handleBlur = async (e: any) => {
            const name = e.target.value.replace(/\s+/g, "")
            if (!name) {
                setValidateStatus('error')
                setHelp('请输入')
                return
            }
            setValidateStatus('validating')
            setFetch(true)
            const data = await validateSuite({ suite_name: name, test_type: testType })
            setFetch(false)
            if (data.code != 200) {
                setValidateStatus('error')
                setHelp(data.msg)
                setDisable(true)
            } else {
                setValidateStatus('')
                setHelp(undefined)
                setDisable(false)
            }
        }

        const hanldFocus = () => {
            setDisable(false)
        }

        const handleChange = () => {
            setHelp(undefined)
            setValidateStatus('')
        }

        const handleSearch = async (word: any = "") => {
            fetchUserRunner(word)
        }

        const handleCancel = () => {
            setVisible(false)
            setDisable(false)
            form.resetFields()
            setHelp(undefined)
            setValidateStatus('')
            setDataSource({})
        }

        const title = useMemo(() => {
            const testType = query.test_type === 'performance' ? '性能Test Suite' : '功能Test Suite'
            const optName = JSON.stringify(dataSource) !== '{}' ? '编辑' : '新增'

            return optName + testType
        }, [query, dataSource])

        const buttonText = useMemo(() => {
            return JSON.stringify(dataSource) !== '{}' ? '更新' : '确定'
        }, [])

        return (
            <Drawer
                maskClosable={false}
                keyboard={false}
                className={styles.warp}
                forceRender={true}
                destroyOnClose={true}
                title={title}
                width={376}
                onClose={handleCancel}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>取消</Button>
                        <Button onClick={handleOk} disabled={disable} type="primary" htmlType="submit" >
                            {buttonText}
                        </Button>
                    </div>
                }
            >
                <Spin spinning={fetch} >
                    <Form
                        layout="vertical"
                        form={form}
                        /*hideRequiredMark*/
                        initialValues={{ is_default: 1, view_type: 'Type1' }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Test Suite"
                                    validateStatus={validateStatus}
                                    help={help}
                                    rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input
                                        autoComplete="off"
                                        placeholder="请输入"
                                        // onBlur={handleBlur} 配合debug需求，临时注释
                                        onFocus={hanldFocus}
                                        onChange={handleChange}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="test_type"
                                    label="测试类型"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" disabled getPopupContainer={node => node.parentNode}>
                                        <Select.Option value="functional">功能测试</Select.Option>
                                        <Select.Option value="performance">性能测试</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="run_mode"
                                    label="运行模式"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" getPopupContainer={node => node.parentNode}>
                                        {
                                            runList.map((item: any, index: number) => {
                                                return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            {
                                query.test_type === 'performance' &&
                                <Col span={24}>
                                    <Form.Item
                                        name="view_type"
                                        label="视图类型"
                                    >
                                        <Select placeholder="请选择">
                                            {
                                                viewType.map((item: any, index: number) => {
                                                    return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                                })
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                            }
                            <Col span={24}>
                                <Form.Item
                                    name="domain_list_str"
                                    label="领域"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" mode="multiple" showArrow showSearch={false} getPopupContainer={node => node.parentNode}>
                                        {
                                            domainList.map((item: any, index: number) => {
                                                return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Owner />
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="is_default"
                                    label={
                                        <QusetionIconTootip title="默认用例" desc="自动加入新建workspace" />
                                    }
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="certificated"
                                    label={
                                        <QusetionIconTootip title="是否认证" desc="只有认证过得用例才能同步到Testfarm" />
                                    }
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>

                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="doc"
                                    label="说明"
                                >
                                    <Input.TextArea rows={3} placeholder="请输入Test Suite说明" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="备注"
                                >
                                    <Input.TextArea rows={3} placeholder="请输入" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>
        )
    }
)