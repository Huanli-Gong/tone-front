import React, { useState, useImperativeHandle, useEffect } from 'react'
import { Form, Radio, Row, Col, Select, Input, Card } from 'antd'
import styles from './index.less'
import { queryKernelList } from '@/pages/SystemConf/KernelManage/services'
import IsPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/IsPushForm'
import UnPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/UnPushForm'
import BuildKernalForm from '@/pages/WorkSpace/TestJob/components/KernalForms/BuildKernalForm'
import FormList from '@/pages/WorkSpace/TestJob/components/FormList'
import MonitorList from '@/pages/WorkSpace/TestJob/components/JobForms/MonitorList'
import { getTextByJs } from '@/utils/hooks'
import { useRequest, useIntl, FormattedMessage, getLocale } from 'umi'

/**
 * 环境配置
 */
export default ({ contrl, disabled = false, onRef = null, template = {}, ws_id }: any) => {
    if  (JSON.stringify(contrl) === '{}' ) return <></>

    const { formatMessage } = useIntl()
    const locale = getLocale() === 'en-US';
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

            let params: any = []
            if (kernel_info && JSON.stringify(kernel_info) !== '{}') {
                params = { ...params, ...kernel_info }
            }

            let reclone_contrl: boolean = false

            let os, app_name
            if (iclone_info) {
                os = iclone_info.os
                app_name = iclone_info.app_name
                if (os || app_name) {
                    reclone_contrl = true
                    setReset(reclone_contrl)
                }
            }

            const hasBuildKernel = !!build_pkg_info && JSON.stringify(build_pkg_info) !== '{}'
            
            if (kernel_version) setKernal('install_push')
            if (!kernel_version&& !hasBuildKernel) setKernal('no')
            if (hasBuildKernel) setKernal('install_build_kernel')
            if ( kernel_info && JSON.stringify( kernel_info ) !== '{}' && !kernel_version ) setKernal('install_un_push')
            setReboot(need_reboot)
            let moniter_contrl: boolean = false

            if (monitor_info && monitor_info.length > 0) {
                setMonitor(true)
                moniter_contrl = true
            }

            const variable: any = env_info ? getTextByJs(env_info) : ''

            form.setFieldsValue({
                ...params,
                ...{
                    monitor_info: monitor_info && monitor_info.length > 0 ? monitor_info : [{}],
                    rpm_info: rpm_info && rpm_info.length > 0 ? rpm_info : [{ rpm: '', pos: 'before' }],
                    script_info: script_info && script_info.length > 0 ? script_info : [{ script: '', pos: 'before' }],
                    need_reboot,
                    env_info: variable,
                    reclone_contrl,
                    os,
                    app_name,
                    moniter_contrl,
                    kernel_version,
                    ...build_pkg_info,
                }
            })
        }
    }, [template, kernelList])

    const handleRebootChange = ({ target }: any) => {
        setReboot(target.value)
        !disabled && form.resetFields(['rpm_info', 'script_info'])
    }

    return (
        <Card
            title={<FormattedMessage id="ws.result.details.env.prepare.config"/>}
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
            style={{ marginBottom: 10, borderTop: 'none' }}
        >
            {/* {
                JSON.stringify(contrl) === '{}' && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            } */}
            <Form
                colon={false}
                layout="horizontal"
                size="small"
                /*hideRequiredMark*/
                // wrapperCol={{ span: 10 }}
                style={{ width: '100%' }}
                name="env"
                form={form}
                className={`${styles.job_test_form} ${styles[locale ? 'label_style_form_en' : 'label_style_form']}`}
                initialValues={{
                    rpm_info: [{ rpm: '', pos: 'before' }],
                    script_info: [{ script: '', pos: 'before' }],
                    monitor_info: [{}],
                    need_reboot: false,
                    hotfix_install: true,
                    scripts: [{ script: '', pos: 'before' }]
                }}
            >
                <Row>
                    <Col span={ 15 }>
                        {
                            'reclone' in contrl &&
                            <Form.Item
                                label={contrl.reclone.alias || <FormattedMessage id={`ws.result.details.${contrl.reclone.name}`}/> }
                                name="reclone_contrl"
                                initialValue={false}
                            >
                                <Radio.Group disabled={disabled} onChange={({ target }) => setReset(target.value)}>
                                    <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                                    <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                                </Radio.Group>
                            </Form.Item>
                        }
                        {
                            reset &&
                            <Form.Item label=" ">
                                <Form.Item label={<FormattedMessage id="ws.result.details.physical"/>}>
                                    <Row gutter={10}>
                                        <Col span={12}>
                                            <Form.Item name="os" noStyle>
                                                <Select getPopupContainer={node => node.parentNode} 
                                                    placeholder={<FormattedMessage id="ws.result.details.physical.placeholder"/>}
                                                    disabled={disabled}>
                                                    <Select.Option value="AliOS7U2-4.9-x86-64">AliOS7U2-4.9-x86-64</Select.Option>
                                                    <Select.Option value="AliOS7U2-aarch64">AliOS7U2-aarch64</Select.Option>
                                                    <Select.Option value="AliOS7U2-x86-64">AliOS7U2-x86-64</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="app_name" noStyle>
                                                <Select getPopupContainer={node => node.parentNode} 
                                                    placeholder={<FormattedMessage id="ws.result.details.app_name.placeholder"/>}
                                                    disabled={disabled}>
                                                    <Select.Option value="baseos_server">baseos_server</Select.Option>
                                                    <Select.Option value="app_server">app_server</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                                <Form.Item name="vm" label={<FormattedMessage id="ws.result.details.vm"/>}>
                                    <Select getPopupContainer={node => node.parentNode} 
                                        placeholder={<FormattedMessage id="ws.result.details.vm.placeholder"/>}
                                        disabled={disabled}></Select>
                                </Form.Item>
                            </Form.Item>
                        }
                        {
                            'kernel_install' in contrl &&
                            <Form.Item label={contrl.kernel_install.alias || <FormattedMessage id={`ws.result.details.${contrl.kernel_install.name}`}/> }>
                                <Radio.Group value={kernel} disabled={disabled} onChange={handleKernalInstallChange}>
                                    <Radio value="no"><FormattedMessage id="ws.result.details.install_no"/></Radio>
                                    <Radio value="install_push"><FormattedMessage id="ws.result.details.install_publish"/></Radio>
                                    <Radio value="install_un_push"><FormattedMessage id="ws.result.details.install_un"/></Radio>
                                    <Radio value="install_build_kernel"><FormattedMessage id="ws.result.details.install_build"/></Radio>
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
                            <UnPushForm disabled={disabled} form={form}/>
                        }
                        {
                            kernel === 'install_build_kernel' &&
                            <BuildKernalForm form={form} disabled={disabled} project_id={template?.project_id} />
                        }
                        {
                            'reboot' in contrl &&
                            <Form.Item
                                label={contrl.reboot.alias || <FormattedMessage id={`ws.result.details.${contrl.reboot.name}`}/> }
                                name="need_reboot"
                            >
                                <Radio.Group disabled={disabled} onChange={handleRebootChange}>
                                    <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                                    <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                                </Radio.Group>
                            </Form.Item>
                        }
                        {
                            'global_variable' in contrl &&
                            <Form.Item
                                name="env_info"
                                // label="全局变量"
                                label={contrl.global_variable.alias || <FormattedMessage id={`ws.result.details.${contrl.global_variable.name}`}/> }
                                rules={[
                                    () => ({
                                        validator(rule, value) {
                                            if (value) {
                                                const reg = /^(\w+=((('[^']+'|"[^"]+")|.+)( |\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/
                                                return reg.test(value) ? Promise.resolve() : Promise.reject(formatMessage({id: 'format.key.value'}) );
                                            }
                                            else
                                                return Promise.resolve()
                                        },
                                    })
                                ]}
                            >
                                <Input.TextArea disabled={disabled} placeholder={formatMessage({id: 'format.key.value'})} />
                            </Form.Item>
                        }
                        {
                            'rpm' in contrl &&
                            <FormList
                                // label="安装RPM"
                                label={contrl.rpm.alias || <FormattedMessage id={`ws.result.details.${contrl.rpm.name}`}/> }
                                listName="rpm_info"
                                textName="rpm"
                                radioName="pos"
                                buttonText={formatMessage({id: 'ws.result.details.rpm.add'})}
                                placeholder={formatMessage({id: 'ws.result.details.please.enter.rpm'})}
                                buttonShow={reboot}
                                disabled={disabled}
                            />
                        }
                        {
                            'script' in contrl &&
                            <FormList
                                // label="执行脚本"
                                label={contrl.script.alias || <FormattedMessage id={`ws.result.details.${contrl.script.name}`}/> }
                                listName="script_info"
                                textName="script"
                                radioName="pos"
                                buttonText={formatMessage({id: 'ws.result.details.script.add'})}
                                placeholder={formatMessage({id: 'ws.result.details.please.enter.script'})}
                                buttonShow={reboot}
                                disabled={disabled}
                            />
                        }
                        {
                            'monitor' in contrl &&
                            <Form.Item
                                // label="监控配置"
                                label={contrl.monitor.alias || <FormattedMessage id={`ws.result.details.${contrl.monitor.name}.config`}/> }
                                name="moniter_contrl"
                                initialValue={false}
                            >
                                <Radio.Group
                                    disabled={disabled}
                                    onChange={({ target }) => setMonitor(target.value)}
                                >
                                    <Radio value={true}><FormattedMessage id="operation.yes"/></Radio>
                                    <Radio value={false}><FormattedMessage id="operation.no"/></Radio>
                                </Radio.Group>
                            </Form.Item>
                        }
                        {
                            monitor &&
                            <MonitorList disabled={disabled} formComponent={form}/>
                        }
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}
