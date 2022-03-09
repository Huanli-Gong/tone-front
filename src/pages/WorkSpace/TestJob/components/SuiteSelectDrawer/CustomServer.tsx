import React, { useContext, useState, useRef } from 'react'
import { Form, Select, Input } from 'antd'
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
                    部署ToneAgent
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
                rules={!mask ? [{ required: true, message: '请选择机器类型' }] : []}
            >
                <AgentSelect
                    style={{ width: '100%' }}
                    placeholder={multipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)'}
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
                        message: "请输入IP/SN"
                    },
                    {
                        async validator(rule, value) {
                            if (!value) return Promise.resolve("请输入IP/SN")
                            const channel_type = form.getFieldValue('custom_channel')
                            if (!channel_type) return Promise.reject("请选择机器类型")
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
                    placeholder={multipInfo.selfServer ? '多个数值' : `请输入IP${!BUILD_APP_ENV ? "/SN" : ""}`}
                    autoComplete="off"
                />
            </Form.Item>

            {/**失败时部署Agent对话框 */}
            <DeployModal ref={deployModal} callback={deployCallback} />
        </>
    )
}

export default CustomServer