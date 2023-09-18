/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, Input, Select, Radio } from 'antd'
import { useParams, useRequest, useIntl, FormattedMessage } from 'umi'

import { queryProjectList, queryBaselineList } from '@/pages/WorkSpace/TestJob/services'
import { queryKernelList } from '@/pages/SystemConf/KernelManage/services'

import styles from './index.less'

import IsPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/IsPushForm'
import UnPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/UnPushForm'
import BuildKernalForm from '@/pages/WorkSpace/TestJob/components/KernalForms/BuildKernalForm'

import styled from 'styled-components'
import { wsIgnoreScriptInput } from '@/utils/utils'

const BaselineSpan = styled.span`
    position:absolute;
    right: 30px;
    top: 4px;
    font-size: 12px;
    color:rgba(0,0,0,.45);
`

const BaselineWrapper = styled.div`
    position:relative;
`
const BasicSetting = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { template, show } = props

    const { ws_id } = useParams() as any
    const [form] = Form.useForm()
    const [kernel, setKernal] = useState('no')
    const [testObject, setTestObject] = useState('rpm')

    const { data: projectList } = useRequest(
        () => queryProjectList({ ws_id, page_size: 500 }),
        { initialData: [] } //manual : true , , run : getProjectList 
    )

    const { data: baselineList } = useRequest(
        () => queryBaselineList({ ws_id, page_size: 500 }),
        { initialData: [] } //manual : true , , run : getBaselineList 
    )

    const { data: kernelList } = useRequest(
        () => queryKernelList({ enable: 'True' }) // , release : 'True'
    )

    const handleKernalInstallChange = (evt: any) => {
        setKernal(evt.target.value)
        form.setFieldsValue({ test_obj: testObject })
        form.resetFields(['kernel_packages', 'kernel_version'])
    }

    useImperativeHandle(ref, () => ({
        validate: () => {
            return form.validateFields()
        }
    }))

    useEffect(() => {
        if (template && JSON.stringify(template) !== '{}') {
            const { build_pkg_info, kernel_info, kernel_version, test_obj } = template
            setTestObject(test_obj)
            if (test_obj === 'kernel') {
                if (JSON.stringify(build_pkg_info) !== '{}') {
                    setKernal('install_build_kernel')
                }
                if (JSON.stringify(kernel_info) !== '{}') {
                    if (kernel_version) setKernal('install_push')
                    else setKernal('install_un_push')
                }
            }
            form.setFieldsValue({ ...kernel_info, ...build_pkg_info, ...template, })
        }
    }, [template])

    const baseFormItemProps = {
        allowClear: true,
        getPopupContainer: (node: any) => node.parentNode,
        showSearch: true,
        filterOption: (input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
    }

    return (
        <div
            style={{
                display: show,
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                paddingTop: 20,
                paddingBottom: 20
            }}
        >
            <Form
                form={form}
                layout="horizontal"
                size="small"
                /*hideRequiredMark*/
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 12 }}
                style={{ width: '100%' }}
                colon={false}
                className={styles.job_plan_form}
                // onFieldsChange={ onChange }
                initialValues={{
                    hotfix_install: true,
                    test_obj: 'rpm',
                    scripts: [{ pos: 'before', script: '' }],
                }}
            >
                <Form.Item
                    name="name"
                    label={<FormattedMessage id="plan.plan.name" />}
                    rules={[{ required: true, message: formatMessage({ id: 'plan.plan.name.message' }), max: 64 }]}
                >
                    <Input autoComplete="off" placeholder={formatMessage({ id: 'plan.plan.name.placeholder' })} />
                </Form.Item>
                <Form.Item name="description" label={<FormattedMessage id="plan.plan.description" />}>
                    <Input.TextArea autoComplete="off" placeholder={formatMessage({ id: 'plan.plan.description.placeholder' })} />
                </Form.Item>
                {/* rules={[{ required: true, message: "请选择Project" }]} */}
                <Form.Item name="project_id" label={'Project'} >
                    <Select
                        {...baseFormItemProps}
                        placeholder={formatMessage({ id: 'plan.plan.project_id' })}
                        options={
                            projectList.map(
                                (item: any) => ({
                                    value: item.id,
                                    label: `${item.name}(${item.product_name})`
                                })
                            )
                        }
                    />
                </Form.Item>
                <Form.Item label={<FormattedMessage id="plan.test.baseline" />}>
                    <BaselineWrapper>
                        <Form.Item name="func_baseline" >
                            <Select
                                {...baseFormItemProps}
                                /* placeholder="请选择内网功能基线" */
                                placeholder={formatMessage({ id: 'plan.func_baseline.placeholder' })}
                                options={
                                    baselineList.filter((i: any) => i.test_type === 'functional').map(
                                        (item: any) => ({
                                            value: item.id,
                                            label: item.name
                                        })
                                    )
                                }
                            />
                        </Form.Item>
                        <BaselineSpan >
                            {/* 内网｜功能 */}
                            <FormattedMessage id="plan.function" />
                        </BaselineSpan>
                    </BaselineWrapper>
                    <BaselineWrapper>
                        <Form.Item name="perf_baseline">
                            <Select
                                {...baseFormItemProps}
                                /* placeholder="请选择内网性能基线" */
                                placeholder={formatMessage({ id: 'plan.perf_baseline.placeholder' })}
                                options={
                                    baselineList.filter((i: any) => i.test_type === 'performance').map(
                                        (item: any) => ({
                                            value: item.id,
                                            label: item.name
                                        })
                                    )
                                }
                            />
                        </Form.Item>
                        <BaselineSpan >
                            {/* 内网｜性能 */}
                            <FormattedMessage id="plan.performance" />
                        </BaselineSpan>
                    </BaselineWrapper>
                </Form.Item>
                <Form.Item
                    name="test_obj"
                    label={<FormattedMessage id="plan.tested.object" />}
                >
                    <Select
                        {...baseFormItemProps}
                        filterOption={false}
                        onChange={(val: any) => setTestObject(val)}
                        placeholder="请选择被测对象"
                    >
                        <Select.Option value={'kernel'}><FormattedMessage id="plan.kernel.package" /></Select.Option>
                        <Select.Option value={'rpm'}><FormattedMessage id="plan.others.soft" /></Select.Option>
                    </Select>
                </Form.Item>
                {
                    testObject == 'kernel' &&
                    <>
                        {
                            <Form.Item label={<FormattedMessage id="plan.kernel" />} >
                                <Radio.Group value={kernel} onChange={handleKernalInstallChange}>
                                    <Radio value="no"><FormattedMessage id="ws.result.details.install_no" /></Radio>
                                    <Radio value="install_push"><FormattedMessage id="plan.install_push" /></Radio>
                                    <Radio value="install_un_push"><FormattedMessage id="plan.install_un_push" /></Radio>
                                    <Radio value="install_build_kernel"><FormattedMessage id="plan.install_build_kernel" /></Radio>
                                </Radio.Group>
                            </Form.Item>
                        }
                        {
                            kernel === 'install_push' &&
                            <IsPushForm
                                form={form}
                                kernel={kernel}
                                kernelList={kernelList}
                                needScriptList={!wsIgnoreScriptInput.includes(ws_id)}
                            />
                        }
                        {
                            (kernel === 'install_un_push') &&
                            <UnPushForm
                                form={form}
                                needScriptList={!wsIgnoreScriptInput.includes(ws_id)}
                            />
                        }
                        {
                            (kernel === 'install_build_kernel') &&
                            <BuildKernalForm needScriptList={false} form={form} isPlan={true} />
                        }
                    </>
                }
                <Form.Item
                    name="rpm_info"
                    label={<FormattedMessage id="plan.rpm_info" />}
                >
                    <Input.TextArea placeholder={formatMessage({ id: 'plan.rpm_info.placeholder' })} />
                </Form.Item>
                <Form.Item
                    name="env_info"
                    label={<FormattedMessage id="plan.env_info" />}
                    rules={[
                        () => ({
                            validator(rule, value) {
                                if (value) {
                                    const reg = /^(\w+=((('[^']+'|"[^"]+")|.+)(\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/
                                    // const reg = /^(\w+=((('[^']+'|"[^"]+")|.+)( |\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/
                                    return reg.test(value) ? Promise.resolve() : Promise.reject(formatMessage({ id: 'plan.env_info.reject' }));
                                }
                                return Promise.resolve()
                            },
                        })
                    ]}
                >
                    <Input.TextArea placeholder={formatMessage({ id: 'plan.env_info.reject' })} />
                </Form.Item>
                <Form.Item name="notice_name" label={<FormattedMessage id="plan.notice_name" />}>
                    <Input autoComplete="off"
                        placeholder={formatMessage({ id: 'plan.notice_name.placeholder' }, { date: '{date}' })}
                    />
                </Form.Item>
                <Form.Item
                    name="email_info"
                    label={<FormattedMessage id="plan.email_info" />}
                    rules={[
                        () => ({
                            validator(rule, value) {
                                if (value) {
                                    const arr = value.split(/,|，|\s/g)
                                    const reg = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})+)/
                                    const len = arr.filter((str: string) => !reg.test(str)).length
                                    return len === 0 ?
                                        Promise.resolve() :
                                        Promise.reject(formatMessage({ id: 'plan.email_info.reject' }))
                                }
                                return Promise.resolve()
                            }
                        })
                    ]}
                >
                    <Input autoComplete="off" placeholder={formatMessage({ id: 'plan.email_info.placeholder' })} />
                </Form.Item>
                <Form.Item name="ding_talk_info" label={<FormattedMessage id="plan.ding_talk_info" />}>
                    <Input autoComplete="off" placeholder={formatMessage({ id: 'plan.ding_talk_info.placeholder' })} />
                </Form.Item>

                <Form.Item name="enable" label={<FormattedMessage id="plan.enable" />} initialValue={true} >
                    <Radio.Group>
                        <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                        <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </div>
    )
}

export default forwardRef(BasicSetting)
