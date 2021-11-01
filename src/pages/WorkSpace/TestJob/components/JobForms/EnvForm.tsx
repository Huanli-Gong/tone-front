import React, { useState, useImperativeHandle, useEffect } from 'react'

import { Form, Radio, Row, Col, Select, Input } from 'antd'

import styles from './index.less'
import { FormProps } from './index'

import { queryKernelList } from '@/pages/SystemConf/KernelManage/services'

import IsPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/IsPushForm'
import UnPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/UnPushForm'
import BuildKernalForm from '@/pages/WorkSpace/TestJob/components/KernalForms/BuildKernalForm'
import FormList from '@/pages/WorkSpace/TestJob/components/FormList'

import MonitorList from './MonitorList'

import { useRequest , useParams } from 'umi'
import _ from 'lodash'

/**
 * 环境配置
 */
export default ({ contrl, disabled = false, onRef = null, template = {} }: FormProps) => {
    const { ws_id } : any = useParams()
    const [form] = Form.useForm()
    const [reset, setReset] = useState(false) // 重装
    const [reboot, setReboot] = useState(false) // 重启
    const [monitor, setMonitor] = useState(false) // 监控

    const [kernel, setKernal] = useState('no')

    const handleKernalInstallChange = (evt: any) => {
        setKernal(evt.target.value)
        !disabled && form.resetFields(['kernel', 'devel', 'headers', 'kernel_version', 'scripts'])
    }

    useImperativeHandle(
        onRef,
        () => ({
            form,
            reset: () => {
                setKernal('no')
                setReset(false)
                setReboot(false)
                setMonitor(false)
                form.resetFields()
            },
            setVal: (data:Object) =>{
                let {rpm_info,script_info,kernel_version,kernel_info,build_pkg_info} = data
                 rpm_info = rpm_info || [{pos: 'before',rpm: ''}]
                 script_info = script_info || [{pos: 'before',script: ''}]
                 form.resetFields()
                 let kernelType = 'no'
                 if(kernel_info && _.get(kernel_info,'kernel') && _.get(kernel_info,'devel') && _.get(kernel_info,'headers') && kernel_version) {
                    kernelType = 'install_push'
                    form.setFieldsValue({...data,kernel_install: kernelType,rpm_info,script_info})
                    setKernal(kernelType)
                    return
                 }
                 if(kernel_info && _.get(kernel_info,'kernel') && _.get(kernel_info,'devel') && _.get(kernel_info,'headers') && !kernel_version) {
                    kernelType = 'install_un_push'
                    form.setFieldsValue({...data,kernel_install: kernelType,rpm_info,script_info})
                    setKernal(kernelType)
                    return
                 }
                 if(build_pkg_info && _.get(build_pkg_info,'code_repo') && _.get(build_pkg_info,'code_branch') && _.get(build_pkg_info,'cpu_arch')) {
                    kernelType = 'install_build_kernel'
                    form.setFieldsValue({...data,kernel_install: kernelType,rpm_info,script_info})
                    setKernal(kernelType)
                    return
                 }
                form.setFieldsValue({...data,kernel_install: kernelType,rpm_info,script_info})
                setKernal(kernelType)
            }
        }),
    )

    // 新建job已经发布版本不过滤。
    const { data: kernelList } = useRequest(
        () => queryKernelList({ enable: 'True' }) // , release : 'True'
    )
    
    useEffect(() => {
        if (JSON.stringify(template) !== '{}') {
            const {
                monitor_info,
                need_reboot,
                rpm_info,
                script_info,
                env_info,
                kernel_info,
                kernel_version,
                iclone_info,
                build_pkg_info
            } = template

            const { os = '', app_name = '' } = iclone_info || {}
            const { devel, headers, branch, ...kernels } = kernel_info || {}

            let reclone_contrl: boolean = false
            if (os || app_name) {
                reclone_contrl = true
                setReset(reclone_contrl)
            }

            const hasBuildKernel = build_pkg_info && JSON.stringify(build_pkg_info) !== '{}'

            if (kernel_version) setKernal('install_push')
            if (!kernel_version && !hasBuildKernel) setKernal('install_un_push')
            if (!kernel_version && !hasBuildKernel && !devel) setKernal('no')
            if (hasBuildKernel) setKernal('install_build_kernel')

            setReboot(need_reboot)
            let moniter_contrl: boolean = false

            if (monitor_info && monitor_info.length > 0) {
                setMonitor(true)
                moniter_contrl = true
            }

            const variable: any = env_info ? Object.keys(env_info).map((k: any) => `${k}=${env_info[k]}`).toString().replace(/,|，/g, '\n') : ''
            const monitorInfo = _.isArray(monitor_info) ? monitor_info.map((item) => {
                const obj:{monitor_type:string,server?:string} = {monitor_type:item.monitor_type}
                if(_.get(item,'monitor_type') === 'custom_machine')  obj.server = item.server_input
                return obj
            }) : []
            form.setFieldsValue({
                monitor_info: monitor_info && monitor_info.length > 0 ? monitorInfo : [{monitor_type: 'case_machine',server: ''}],
                rpm_info: rpm_info && rpm_info.length > 0 ? rpm_info : [{ pos: 'before', rpm: '' }],
                script_info: script_info && script_info.length > 0 ? script_info : [{ pos: 'before', script: '' }],
                need_reboot,
                env_info: variable,
                reclone_contrl,
                os,
                app_name,
                moniter_contrl,
                kernel_version,
                devel, headers,
                ...kernels,
                ...build_pkg_info
            })
        }
    }, [template, kernelList])

    const handleRebootChange = ({ target }: any) => {  //reboot rmp script change
        setReboot(target.value)
    }

    useEffect(() => {
        form.setFieldsValue({ kernel_install: kernel })
    }, [kernel])

    return (
        <Form
            colon={false}
            layout="horizontal"
            size="small"
            /*hideRequiredMark*/
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            style={{ width: '100%' }}
            name="env"
            form={form}
            className={styles.job_test_form}
            initialValues={{
                rpm_info: [{ pos: 'before', rpm: '' }],
                script_info: [{ pos: 'before', script: '' }],
                monitor_info: [{monitor_type: 'case_machine',server: ''}],
                need_reboot: false,
                hotfix_install: true,
                scripts: [{ pos: 'before', script: '' }],
                kernel_install: 'no',
            }}
        >
            {
                'reclone' in contrl &&
                <Form.Item
                    label={contrl.reclone.alias || contrl.reclone.show_name}
                    name="reclone_contrl"
                    initialValue={false}
                >
                    <Radio.Group disabled={disabled} onChange={({ target }) => setReset(target.value)}>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
            }
            {
                reset &&
                <Form.Item label=" ">
                    <Form.Item label="物理机">
                        <Row gutter={10}>
                            <Col span={12}>
                                <Form.Item name="os" noStyle>
                                    <Select getPopupContainer={node => node.parentNode} placeholder="请选择iclone os镜像" disabled={disabled}>
                                        <Select.Option value="AliOS7U2-4.9-x86-64">AliOS7U2-4.9-x86-64</Select.Option>
                                        <Select.Option value="AliOS7U2-aarch64">AliOS7U2-aarch64</Select.Option>
                                        <Select.Option value="AliOS7U2-x86-64">AliOS7U2-x86-64</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="app_name" noStyle>
                                    <Select getPopupContainer={node => node.parentNode} placeholder="请选择iclone应用模板" disabled={disabled}>
                                        <Select.Option value="baseos_server">baseos_server</Select.Option>
                                        <Select.Option value="app_server">app_server</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item name="vm" label="虚拟机">
                        <Select getPopupContainer={node => node.parentNode} placeholder="请选择vm配置" disabled={disabled}></Select>
                    </Form.Item>
                </Form.Item>
            }
            {
                'kernel_install' in contrl &&
                <Form.Item
                    label={contrl.kernel_install.alias || contrl.kernel_install.show_name}
                    name="kernel_install"
                >
                    <Radio.Group value={kernel} disabled={disabled} onChange={handleKernalInstallChange} defaultValue={kernel}>
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
                    disabled={disabled}
                />
            }
            {
                kernel === 'install_un_push' &&
                <UnPushForm disabled={disabled} />
            }
            {
                kernel === 'install_build_kernel' &&
                <BuildKernalForm disabled={disabled} ws_id={ws_id} form={form} />
            }
            {
                'reboot' in contrl &&
                <Form.Item
                    label={contrl.reboot.alias || contrl.reboot.show_name}
                    name="need_reboot"
                >
                    <Radio.Group disabled={disabled} onChange={handleRebootChange}>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
            }
            {
                'global_variable' in contrl &&
                <Form.Item
                    name="env_info"
                    // label="全局变量"
                    label={contrl.global_variable.alias || contrl.global_variable.show_name}
                    rules={[
                        () => ({
                            validator(rule, value) {
                                if (value) {
                                    const valArr = value.split(/,|，|\n/g)
                                    const reg = /^(.+=.+)$/
                                    let warry = valArr.filter((str: any) => !reg.test(str))
                                    return warry.length === 0 ? Promise.resolve() : Promise.reject('格式：key=value，多个用英文逗号或换行分割');
                                }
                                else
                                    return Promise.resolve()
                            },
                        })
                    ]}
                >
                    <Input.TextArea disabled={disabled} placeholder="格式：key=value，多个用英文逗号或换行分割" />
                </Form.Item>
            }
            {
                'rpm' in contrl &&
                <FormList
                    // label="安装RPM"
                    label={contrl.rpm.alias || contrl.rpm.show_name}
                    listName="rpm_info"
                    textName="rpm"
                    radioName="pos"
                    buttonText="+ 添加RPM包"
                    placeholder={'请输入rpm包链接，多个用英文逗号或换行分割'}
                    buttonShow={reboot}
                    disabled={disabled}
                />
            }
            {
                'script' in contrl &&
                <FormList
                    // label="执行脚本"
                    label={contrl.script.alias || contrl.script.show_name}
                    listName="script_info"
                    textName="script"
                    radioName="pos"
                    buttonText="+ 添加执行脚本"
                    placeholder={'请输入脚本内容'}
                    buttonShow={reboot}
                    disabled={disabled}
                />
            }
            {
                'monitor' in contrl &&
                <Form.Item
                    // label="监控配置"
                    label={contrl.monitor.alias || contrl.monitor.show_name}
                    name="moniter_contrl"
                    initialValue={false}
                >
                    <Radio.Group
                        disabled={disabled}
                        onChange={({ target }) => {
                            setMonitor(target.value)
                            if(target) {
                                form.setFieldsValue({...form.getFieldsValue(),monitor_info: [{monitor_type: 'case_machine',server: ''}]})
                            }
                        }}
                    >
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
            }
            {
                monitor &&
                <MonitorList disabled={disabled} formComponent={form} template={template}/>
            }
        </Form>
    )
}
