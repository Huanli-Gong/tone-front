import React, { useContext, useState, useRef } from 'react'
import { Form, Select, Input } from 'antd'
import { useIntl, FormattedMessage } from 'umi';
import { DrawerProvider } from './Provider'
import styles from '../SelectSuite/style.less'
import { checkIpAndSn } from './services';
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal'
import { AgentSelect } from '@/components/utils';
import { FormInstance } from 'antd/lib/form';

type IProps = {
    mask: boolean;
    multipInfo: any;
    form: FormInstance;
    loading?: boolean
}

const CustomServer: React.FC<IProps> = (props: any) => {
    const { formatMessage } = useIntl()
    const { mask, multipInfo, form } = props
    const { setMask, setLoading } = useContext<any>(DrawerProvider)

    /**
     * @author jpt 部署Agent对话框
     * @description 机器类型为：自持有机器、且channelType为'toneagent'选项，校验失败时，则可以进行部署Agent。
     **/
    const deployModal: any = useRef(null);
    // 部署Agent
    const deployClick = (selectedRow: any) => {
        deployModal.current?.show({ ...selectedRow, detailData: selectedRow?.errors || [] });
    }

    // 部署回调
    const deployCallback = (info: any) => {
        // step1.Agent部署结果信息
        const { success_servers = [], } = info;
        const successIps = success_servers?.map((item: any) => item.ip);
        // step2.数据回填
        if (successIps?.length) {
            form.setFieldsValue({ custom_ip: successIps[0] })
        }
    }

    // toneAgent校验失败的内容提示
    const ValidateIps: React.FC<any> = ({ data, channelType }) => (
        <span>
            <span>{data.msg?.join(' ')}</span>
            {
                channelType == 'toneagent' &&
                <span
                    className={styles.btn_style}
                    onClick={() => deployClick(data)}
                >
                    <FormattedMessage id="select.suite.deploy.toneagent" />
                </span>
            }
        </span>
    )

    return (
        <>
            {/* { multipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)' } */}
            <Form.Item
                name="custom_channel"
                style={{ width: '100%' }}
                rules={!mask ? 
                    [{ required: true, message: formatMessage({id:'select.suite.custom_channel'}) }] 
                    : 
                    []
                }
            >
                <AgentSelect
                    style={{ width: '100%' }}
                    placeholder={multipInfo.selfServer ? formatMessage({id:'select.suite.multiple.values'}): formatMessage({id:'select.suite.agent.select'})}
                    onChange={(value: any) => {
                        setMask(false)
                        value && form.validate
                    }}
                />
            </Form.Item>

            <Form.Item
                name="custom_ip"
                style={{ width: '100%' }}
                validateTrigger={["onBlur"]}
                rules={[
                    {
                        required: true,
                        message: formatMessage({id: 'select.suite.custom_ip'})
                    },
                    {
                        async validator(rule, value) {
                            if (!value) return Promise.resolve(formatMessage({id: 'select.suite.custom_ip'}))
                            const channel_type = form.getFieldValue('custom_channel')
                            if (!channel_type) return Promise.reject(formatMessage({id: 'select.suite.custom_channel'}))
                            setLoading(true)
                            // 接口校验
                            const { code, msg } = await checkIpAndSn({ ip: value, channel_type }) || {}
                            if (code !== 200) {
                                setLoading(false)
                                return Promise.reject(<ValidateIps data={{ msg, errors: [value] }} channelType={channel_type} />)
                            }
                            Promise.resolve()
                            setLoading(false)
                            return
                        },
                    }
                ]}
            >
                <Input
                    allowClear
                    placeholder={multipInfo.selfServer ? formatMessage({id:'select.suite.multiple.values'}): `${formatMessage({id:'select.suite.enter.ip'})}${!BUILD_APP_ENV ? "/SN" : ""}`}
                    autoComplete="off"
                />
            </Form.Item>

            {/**失败时部署Agent对话框 */}
            <DeployModal ref={deployModal} callback={deployCallback} />
        </>
    )
}

export default CustomServer