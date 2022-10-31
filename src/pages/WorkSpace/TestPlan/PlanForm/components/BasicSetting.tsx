import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, Input, Select, Radio } from 'antd'
import { useParams, useRequest } from 'umi'

import { queryProjectList, queryBaselineList } from '@/pages/WorkSpace/TestJob/services'
import { queryKernelList } from '@/pages/SystemConf/KernelManage/services'

import styles from './index.less'

import IsPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/IsPushForm'
import UnPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/UnPushForm'
import BuildKernalForm from '@/pages/WorkSpace/TestJob/components/KernalForms/BuildKernalForm'

/* import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import QuestionCircleComponent from '@/components/Public/QuestionCircle'
import { queryReportTemplateList } from '@/pages/TestJob/services' */
import styled from 'styled-components'
import _ from 'lodash'
import { aligroupServer, aliyunServer } from '@/utils/utils'
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
        form.resetFields(['kernel', 'devel', 'headers', 'kernel_version'])
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
                    label={'计划名称'}
                    rules={[{ required: true, message: '允许字母、数字、下划线、中划线，“.”，不允许中文，最多64个字符', max: 64 }]}
                >
                    <Input autoComplete="off" placeholder="允许字母、数字、下划线、中划线，“.”，不允许中文" />
                </Form.Item>
                <Form.Item name="description" label={'计划描述'}>
                    <Input.TextArea autoComplete="off" placeholder="请输入计划描述模板" />
                </Form.Item>
                {/* rules={[{ required: true, message: "请选择Project" }]} */}
                <Form.Item name="project_id" label={'Project'} >
                    <Select allowClear getPopupContainer={node => node.parentNode} showSearch placeholder="请选择Project">
                        {
                            projectList.map(
                                (item: any, idx: any) => (
                                    <Select.Option key={idx} value={item.id} >
                                        {`${item.name}(${item.product_name})`}
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                </Form.Item>
                <Form.Item label="测试基线">
                    <BaselineWrapper>
                        <Form.Item name="func_baseline" >
                            <Select allowClear getPopupContainer={node => node.parentNode} showSearch
                                /* placeholder="请选择内网功能基线" */
                                placeholder={`请选择功能基线`}
                            >
                                {
                                    baselineList.filter((i: any) => i.test_type === 'functional' && i.server_provider == 'aligroup').map(
                                        (item: any) => (
                                            <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>
                                        )
                                    )
                                }
                            </Select>
                        </Form.Item>
                        <BaselineSpan >
                            {/* 内网｜功能 */}
                            {aligroupServer}｜功能
                        </BaselineSpan>
                        {/* <div style={{ position : 'absolute' , right : -22 , top : -4 }}>
                            <QusetionIconTootip desc="" title="至少添加一种基线" />
                        </div> */}
                    </BaselineWrapper>
                    <BaselineWrapper>
                        <Form.Item name="perf_baseline">
                            <Select allowClear getPopupContainer={node => node.parentNode} showSearch
                                /* placeholder="请选择内网性能基线" */
                                placeholder={`请选择性能基线`}
                            >
                                {
                                    baselineList.filter((i: any) => i.test_type === 'performance' && i.server_provider == 'aligroup').map(
                                        (item: any) => (
                                            <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>
                                        )
                                    )
                                }
                            </Select>
                        </Form.Item>
                        <BaselineSpan >
                            {/* 内网｜性能 */}
                            {aligroupServer}｜性能
                        </BaselineSpan>
                    </BaselineWrapper>

                    {/** 新添加--云上 */}
                    <BaselineWrapper>
                        <Form.Item name="func_baseline_aliyun">
                            <Select allowClear getPopupContainer={node => node.parentNode} showSearch
                                placeholder={`请选择功能基线`}
                            // placeholder="请选择云上功能基线"
                            >
                                {
                                    baselineList.filter((i: any) => i.test_type === 'functional' && i.server_provider == 'aliyun').map(
                                        (item: any) => (
                                            <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>
                                        )
                                    )
                                }
                            </Select>
                        </Form.Item>
                        <BaselineSpan>
                            {aliyunServer}｜功能
                            {/* 云上｜功能 */}
                        </BaselineSpan>
                    </BaselineWrapper>
                    <BaselineWrapper>
                        <Form.Item name="perf_baseline_aliyun">
                            <Select allowClear getPopupContainer={node => node.parentNode} showSearch
                                placeholder={`请选择性能基线`}
                            // placeholder="请选择云上性能基线"
                            >
                                {baselineList.filter((i: any) => i.test_type === 'performance' && i.server_provider == 'aliyun').map(
                                    (item: any) => (
                                        <Select.Option key={item.id} value={item.id} >{item.name}</Select.Option>
                                    )
                                )
                                }
                            </Select>
                        </Form.Item>
                        <BaselineSpan>
                            {aliyunServer}｜性能
                            {/* 云上｜性能 */}
                        </BaselineSpan>
                    </BaselineWrapper>
                </Form.Item>
                <Form.Item name="test_obj" label={"被测对象"}>
                    <Select onChange={(val: any) => setTestObject(val)} getPopupContainer={node => node.parentNode} showSearch placeholder="请选择被测对象">
                        <Select.Option value='kernel'>{'内核包'}</Select.Option>
                        <Select.Option value='rpm'>{'其他软件'}</Select.Option>
                    </Select>
                </Form.Item>
                {
                    testObject == 'kernel' &&
                    <>
                        {
                            <Form.Item label={'内核'} >
                                <Radio.Group value={kernel} onChange={handleKernalInstallChange}>
                                    <Radio value="no">不安装</Radio>
                                    <Radio value="install_push">安装已发布</Radio>
                                    <Radio value="install_un_push">安装未发布</Radio>
                                    <Radio value="install_build_kernel">Build内核</Radio>
                                </Radio.Group>
                            </Form.Item>
                        }
                        {
                            kernel === 'install_push' &&
                            <IsPushForm
                                form={form}
                                kernel={kernel}
                                kernelList={kernelList}
                                needScriptList={true}
                            />
                        }
                        {
                            (kernel === 'install_un_push') && 
                            <UnPushForm needScriptList={true} form={form} />
                        }
                        {
                            (kernel === 'install_build_kernel') &&
                            <BuildKernalForm needScriptList={false} form={form} isPlan={true}/>
                        }
                    </>
                }
                <Form.Item
                    name="rpm_info"
                    label="全局RPM"
                >
                    <Input.TextArea placeholder="请输入RPM包URL,多个回车换行" />
                </Form.Item>
                <Form.Item
                    name="env_info"
                    label="全局变量"
                    rules={[
                        () => ({
                            validator(rule, value) {
                                if (value) {
                                    const reg = /^(\w+=((('[^']+'|"[^"]+")|.+)( |\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/
                                    return reg.test(value) ? Promise.resolve() : Promise.reject('格式：key=value，多个用空格或换行分割');
                                }
                                return Promise.resolve()
                            },
                        })
                    ]}
                >
                    <Input.TextArea placeholder="格式：key=value，多个用空格或换行分割" />
                </Form.Item>
                <Form.Item name="notice_name" label="通知主题">
                    <Input autoComplete="off" placeholder="[T-One] 你的测试已完成{date}" />
                </Form.Item>
                <Form.Item
                    name="email_info"
                    label="邮件通知"
                    rules={[
                        () => ({
                            validator(rule, value) {
                                if (value) {
                                    const arr = value.split(/,|，|\s/g)
                                    const reg = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})+)/
                                    const len = arr.filter((str: string) => !reg.test(str)).length
                                    return len === 0 ?
                                        Promise.resolve() :
                                        Promise.reject('请输入正确的邮箱地址!')
                                }
                                return Promise.resolve()
                            }
                        })
                    ]}
                >
                    <Input autoComplete="off" placeholder="默认通知Job创建人，多个邮箱用空格或英文逗号分隔" />
                </Form.Item>
                <Form.Item name="ding_talk_info" label="钉钉通知" >
                    <Input autoComplete="off" placeholder="请输入钉钉token，多个token用空格或英文逗号分隔" />
                </Form.Item>

                <Form.Item name="enable" label="启用" initialValue={true} >
                    <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </div>
    )
}

export default forwardRef(BasicSetting)
