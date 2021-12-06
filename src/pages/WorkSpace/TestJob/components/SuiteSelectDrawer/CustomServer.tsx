import React, { useContext, useState, useRef } from 'react'
import { Form, Select, Input } from 'antd'
import { DrawerProvider } from './Provider'
import styles from '../SelectSuite/style.less'
import { checkIpAndSn } from './services';
import DeployModal from '@/pages/WorkSpace/DeviceManage/GroupManage/Standalone/Components/DeployModal'

const CustomServer = (props: any) => {
    const { mask, multipInfo, form, loading } = props
    const { setMask, setLoading } = useContext<any>(DrawerProvider)

    // 校验成功/失败的标识
    const [validate, setValidate] = useState<any>(undefined)
    const [validateMsg, setValidateMsg] = useState<any>(undefined);
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
            // 重置错误信息提示
            setValidate('success')
            setValidateMsg('')
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

    // 校验函数
    const handleCustomChannel = async (value: any) => {
        if (loading) return
        setLoading(true)
        const custom_ip = form.getFieldValue('custom_ip')
        const channel_type = value
        if (channel_type && custom_ip) {
            // 接口校验
            const { code, msg } = await checkIpAndSn({ ip: custom_ip, channel_type }) || {}
            if (code === 200) {
                setValidate('success')
                setValidateMsg('')
            } else {
                setValidate('error')
                setValidateMsg(<ValidateIps data={{ msg, errors: [custom_ip] }} channelType={channel_type} />)
            }
        } else {
            setValidate('error')
            setValidateMsg(<ValidateIps data={{ msg: ['请输入IP/SN'] }} channelType={undefined} />)
        }
        setLoading(false)
    }

    // 失焦触发
    const handleCustomBlur = () => {
        const channel_type = form.getFieldValue('custom_channel')
        handleCustomChannel(channel_type)
    }

    return (
        <>
            {/* { multipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)' } */}
            <Form.Item
                name="custom_channel"
                style={{ width: '100%' }}
                rules={!mask ? [{ required: true, message: '请选择机器类型' }] : []}
            >
                <Select
                    style={{ width: '100%' }}
                    placeholder={multipInfo.selfServer ? '多个数值' : '请选择机器类型(agent)'}
                    onChange={(value) => {
                        setMask(false)
                        value && handleCustomChannel(value)
                    }}
                >
                    <Select.Option value="staragent">StarAgent</Select.Option>
                    <Select.Option value="toneagent">ToneAgent</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="custom_ip" //11.159.157.229
                style={{ width: '100%' }}
                validateStatus={validate}
                // rules={[{ required : true , message : '请输入IP/SN' }]}
                help={validate === 'error' && validateMsg}
            >
                <Input
                    allowClear
                    placeholder={multipInfo.selfServer ? '多个数值' : '请输入IP/SN'}
                    autoComplete="off"
                    onBlur={handleCustomBlur}
                />
            </Form.Item>

            {/**失败时部署Agent对话框 */}
            <DeployModal ref={deployModal} callback={deployCallback} />
        </>
    )
}

export default CustomServer