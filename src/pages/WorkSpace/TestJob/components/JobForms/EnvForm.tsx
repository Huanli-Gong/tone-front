/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useImperativeHandle, useEffect } from 'react';
import { Form, Radio, Row, Col, Select, Input /* Space, Typography */ } from 'antd';
import styles from './index.less';
import type { FormProps } from './';
import { queryKernelList } from '@/pages/SystemConf/KernelManage/services';
import IsPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/IsPushForm';
import UnPushForm from '@/pages/WorkSpace/TestJob/components/KernalForms/UnPushForm';
import BuildKernalForm from '@/pages/WorkSpace/TestJob/components/KernalForms/BuildKernalForm';
import FormList from '@/pages/WorkSpace/TestJob/components/FormList';
import { getTextByJs } from '@/utils/hooks';
import MonitorList from './MonitorList';

import { useRequest, useIntl, FormattedMessage, useParams } from 'umi';
import _ from 'lodash';
import { wsIgnoreScriptInput } from '@/utils/utils';

/**
 * 环境配置
 */
export default ({
    contrl,
    disabled = false,
    envErrorFlag,
    project_id,
    onRef = null,
    template = {},
}: FormProps) => {
    const { formatMessage } = useIntl();
    const { ws_id } = useParams() as any;
    const [form] = Form.useForm();
    const [reset, setReset] = useState(false); // 重装
    const [reboot, setReboot] = useState(false); // 重启
    const [monitor, setMonitor] = useState(false); // 监控

    const [kernel, setKernal] = useState('no'); /* project_id ? 'install_build_kernel' : 'no' */

    const handleKernalInstallChange = (evt: any) => {
        setKernal(evt.target.value);
        !disabled && form.resetFields(['kernel_packages', 'kernel_version', 'scripts']);
    };

    useImperativeHandle(onRef, () => ({
        form,
        reset: () => {
            form.resetFields();
            setReset(false);
            setReboot(false);
            setMonitor(false);
            setKernal('no'); /* project_id ? 'install_build_kernel' : 'no' */
        },
        setVal: (data: any) => {
            // eslint-disable-next-line prefer-const
            let { rpm_info, script_info, kernel_version, kernel_info, build_pkg_info }: any = data;
            rpm_info = rpm_info || [{ pos: 'before', rpm: '' }];
            script_info = script_info || [{ pos: 'before', script: '' }];
            form.resetFields();
            let kernelType = 'no';
            if (kernel_info && _.get(kernel_info, 'kernel_packages') && kernel_version) {
                kernelType = 'install_push';
                form.setFieldsValue({ ...data, kernel_install: kernelType, rpm_info, script_info });
                setKernal(kernelType);
                return;
            }
            if (kernel_info && _.get(kernel_info, 'kernel_packages') && !kernel_version) {
                kernelType = 'install_un_push';
                form.setFieldsValue({ ...data, kernel_install: kernelType, rpm_info, script_info });
                setKernal(kernelType);
                return;
            }
            if (
                build_pkg_info &&
                _.get(build_pkg_info, 'code_repo') &&
                _.get(build_pkg_info, 'code_branch') &&
                _.get(build_pkg_info, 'cpu_arch')
            ) {
                kernelType = 'install_build_kernel';
                form.setFieldsValue({ ...data, kernel_install: kernelType, rpm_info, script_info });
                setKernal(kernelType);
                return;
            }
            form.setFieldsValue({ ...data, kernel_install: kernelType, rpm_info, script_info });
            setKernal(kernelType);
        },
    }));

    useEffect(() => {
        if (envErrorFlag) {
            form.scrollToField('env_info');
        }
    }, [envErrorFlag]);
    // 新建job已经发布版本不过滤。
    const { data: kernelList } = useRequest(
        () => queryKernelList({ enable: 'True' }), // , release : 'True'
    );

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
                build_pkg_info,
            } = template;

            const { os = '', app_name = '' } = iclone_info || {};
            const { branch, kernel_packages, ...kernels } = kernel_info || {};

            let reclone_contrl: boolean = false;
            if (os || app_name) {
                reclone_contrl = true;
                setReset(reclone_contrl);
            }

            const hasBuildKernel = build_pkg_info && JSON.stringify(build_pkg_info) !== '{}';

            if (kernel_version) setKernal('install_push');
            if (!kernel_version && !hasBuildKernel) {
                if (kernel_packages)
                    setKernal(kernel_packages.length > 0 ? 'install_un_push' : 'no');
            }
            if (hasBuildKernel) setKernal('install_build_kernel');

            setReboot(need_reboot);
            let moniter_contrl: boolean = false;

            if (monitor_info && monitor_info.length > 0) {
                setMonitor(true);
                moniter_contrl = true;
            }

            const variable: any = env_info ? getTextByJs(env_info) : '';
            const monitorInfo = _.isArray(monitor_info)
                ? monitor_info.map((item) => {
                      const obj: { monitor_type: string; server?: string } = {
                          monitor_type: item.monitor_type,
                      };
                      if (_.get(item, 'monitor_type') === 'custom_machine')
                          obj.server = item.server_input;
                      return obj;
                  })
                : [];
            form.setFieldsValue({
                monitor_info:
                    monitor_info && monitor_info.length > 0
                        ? monitorInfo
                        : [{ monitor_type: 'case_machine', server: '' }],
                rpm_info: rpm_info && rpm_info.length > 0 ? rpm_info : [{ pos: 'before', rpm: '' }],
                script_info:
                    script_info && script_info.length > 0
                        ? script_info
                        : [{ pos: 'before', script: '' }],
                need_reboot,
                env_info: variable,
                reclone_contrl,
                os,
                app_name,
                moniter_contrl,
                kernel_version,
                kernel_packages,
                ...kernels,
                ...build_pkg_info,
            });
        }
    }, [template, kernelList]);

    const handleRebootChange = ({ target }: any) => {
        //reboot rmp script change
        setReboot(target.value);
    };

    useEffect(() => {
        form.setFieldsValue({ kernel_install: kernel });
    }, [kernel]);

    /* React.useEffect(() => {
        setKernal("install_build_kernel")
        form.setFieldsValue({ kernel_install: "install_build_kernel" })
    }, [project_id]) */

    return (
        <Form
            colon={false}
            layout="horizontal"
            size="small"
            /*hideRequiredMark*/
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 14 }}
            style={{ width: '100%' }}
            name="env"
            form={form}
            className={styles.job_test_form}
            initialValues={{
                rpm_info: [{ pos: 'before', rpm: '' }],
                script_info: [{ pos: 'before', script: '' }],
                monitor_info: [{ monitor_type: 'case_machine', server: '' }],
                need_reboot: false,
                hotfix_install: true,
                scripts: [{ pos: 'before', script: '' }],
                kernel_install: 'no',
            }}
        >
            {'reclone' in contrl && (
                <Form.Item
                    label={
                        contrl.reclone.alias || (
                            <FormattedMessage id={`job.form.${contrl.reclone.name}`} />
                        )
                    }
                    name="reclone_contrl"
                    initialValue={false}
                >
                    <Radio.Group
                        disabled={disabled}
                        onChange={({ target }) => setReset(target.value)}
                    >
                        <Radio value={true}>
                            <FormattedMessage id="operation.yes" />
                        </Radio>
                        <Radio value={false}>
                            <FormattedMessage id="operation.no" />
                        </Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            {reset && (
                <Form.Item label=" ">
                    <Form.Item label={<FormattedMessage id="job.form.physical.machine" />}>
                        <Row gutter={10}>
                            <Col span={12}>
                                <Form.Item name="os" noStyle>
                                    <Select
                                        getPopupContainer={(node) => node.parentNode}
                                        placeholder={<FormattedMessage id="job.form.iclone.os" />}
                                        disabled={disabled}
                                    >
                                        <Select.Option value="AliOS7U2-4.9-x86-64">
                                            AliOS7U2-4.9-x86-64
                                        </Select.Option>
                                        <Select.Option value="AliOS7U2-aarch64">
                                            AliOS7U2-aarch64
                                        </Select.Option>
                                        <Select.Option value="AliOS7U2-x86-64">
                                            AliOS7U2-x86-64
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="app_name" noStyle>
                                    <Select
                                        getPopupContainer={(node) => node.parentNode}
                                        placeholder={
                                            <FormattedMessage id="job.form.iclone.template" />
                                        }
                                        disabled={disabled}
                                    >
                                        <Select.Option value="baseos_server">
                                            baseos_server
                                        </Select.Option>
                                        <Select.Option value="app_server">app_server</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item name="vm" label={<FormattedMessage id="job.form.vm" />}>
                        <Select
                            getPopupContainer={(node) => node.parentNode}
                            placeholder={<FormattedMessage id="job.form.vm.config" />}
                            disabled={disabled}
                        />
                    </Form.Item>
                </Form.Item>
            )}
            {'kernel_install' in contrl && (
                <Form.Item
                    label={
                        contrl.kernel_install.alias || (
                            <FormattedMessage id={`job.form.${contrl.kernel_install.name}`} />
                        )
                    }
                    name="kernel_install"
                >
                    <Radio.Group
                        value={kernel}
                        disabled={disabled}
                        onChange={handleKernalInstallChange}
                    >
                        <Radio value="no">
                            <FormattedMessage id="job.form.uninstall" />
                        </Radio>
                        <Radio value="install_push">
                            <FormattedMessage id="job.form.install_push" />
                        </Radio>
                        <Radio value="install_un_push">
                            <FormattedMessage id="job.form.install_un_push" />
                        </Radio>
                        <Radio value="install_build_kernel">
                            <FormattedMessage id="job.form.install_build_kernel" />
                        </Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            {kernel === 'install_push' && (
                <IsPushForm
                    form={form}
                    kernel={kernel}
                    kernelList={kernelList}
                    disabled={disabled}
                    needScriptList={!wsIgnoreScriptInput.includes(ws_id)}
                />
            )}
            {kernel === 'install_un_push' && (
                <UnPushForm
                    disabled={disabled}
                    form={form}
                    needScriptList={!wsIgnoreScriptInput.includes(ws_id)}
                />
            )}
            {kernel === 'install_build_kernel' && (
                <BuildKernalForm disabled={disabled} form={form} project_id={project_id} />
            )}
            {'reboot' in contrl && (
                <Form.Item
                    label={
                        contrl.reboot.alias || (
                            <FormattedMessage id={`job.form.${contrl.reboot.name}`} />
                        )
                    }
                    name="need_reboot"
                >
                    <Radio.Group disabled={disabled} onChange={handleRebootChange}>
                        <Radio value={true}>
                            <FormattedMessage id="operation.yes" />
                        </Radio>
                        <Radio value={false}>
                            <FormattedMessage id="operation.no" />
                        </Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            {'global_variable' in contrl && (
                <Form.Item
                    label={
                        contrl.global_variable.alias || (
                            <FormattedMessage id={`job.form.${contrl.global_variable.name}`} />
                        )
                    }
                >
                    <Form.Item
                        name="env_info"
                        // label="全局变量"
                        rules={[
                            () => ({
                                validator(rule, value) {
                                    if (value) {
                                        const reg =
                                            /^(\w+=((('[^']+'|"[^"]+")|.+)(\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/;
                                        // const reg = /^(\w+=((('[^']+'|"[^"]+")|.+)( |\n)))*\w+=(('[^']+'|"[^"]+")|.+)$/
                                        return reg.test(value)
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                  formatMessage({
                                                      id: 'job.form.env_info.placeholder',
                                                  }),
                                              );
                                    } else return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input.TextArea
                            disabled={disabled}
                            placeholder={formatMessage({ id: 'job.form.env_info.placeholder' })}
                        />
                    </Form.Item>
                </Form.Item>
            )}
            {'rpm' in contrl && (
                <FormList
                    form={form}
                    // label="安装RPM"
                    label={
                        contrl.rpm.alias || <FormattedMessage id={`job.form.${contrl.rpm.name}`} />
                    }
                    listName="rpm_info"
                    textName="rpm"
                    radioName="pos"
                    buttonText={formatMessage({ id: 'job.form.rpm.buttonText' })}
                    placeholder={formatMessage({ id: 'job.form.rpm.placeholder' })}
                    buttonShow={reboot}
                    disabled={disabled}
                />
            )}
            {'script' in contrl && (
                <FormList
                    form={form}
                    // label="执行脚本"
                    label={
                        contrl.script.alias || (
                            <FormattedMessage id={`job.form.${contrl.script.name}`} />
                        )
                    }
                    listName="script_info"
                    textName="script"
                    radioName="pos"
                    buttonText={formatMessage({ id: 'job.form.script.buttonText' })}
                    placeholder={formatMessage({ id: 'job.form.script.placeholder' })}
                    buttonShow={reboot}
                    disabled={disabled}
                />
            )}
            {'monitor' in contrl && (
                <Form.Item
                    // label="监控配置"
                    label={
                        contrl.monitor.alias || (
                            <FormattedMessage id={`job.form.${contrl.monitor.name}.config`} />
                        )
                    }
                    name="moniter_contrl"
                    initialValue={false}
                >
                    <Radio.Group
                        disabled={disabled}
                        onChange={({ target }) => {
                            setMonitor(target.value);
                            if (target) {
                                form.setFieldsValue({
                                    ...form.getFieldsValue(),
                                    monitor_info: [{ monitor_type: 'case_machine', server: '' }],
                                });
                            }
                        }}
                    >
                        <Radio value={true}>
                            <FormattedMessage id="operation.yes" />
                        </Radio>
                        <Radio value={false}>
                            <FormattedMessage id="operation.no" />
                        </Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            {monitor && (
                <MonitorList disabled={disabled} formComponent={form} template={template} />
            )}
        </Form>
    );
};
