import React, { forwardRef, useImperativeHandle, useState, useMemo, useCallback } from 'react'

import { Modal, Table, Spin, Row, Space, Select, Typography, Alert, Button, message } from 'antd'
import { requestCodeMessage } from '@/utils/utils'
import { checkTestServerIps } from '@/pages/WorkSpace/DeviceManage/GroupManage/services'
import { useParams, request } from 'umi'
import { AlertProps } from 'antd/lib/alert'

const SelectVmServer = (props: any, ref: any) => {
    const { onOk } = props
    const { ws_id } = useParams<any>()
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([])
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(true)
    const [channelType, setChannelType] = useState('staragent')

    const [alertInfo, setAlertInf] = useState<AlertProps>({ type: undefined, message: null })

    useImperativeHandle(
        ref, () => ({
            show(_: any) {
                console.log( _ )
                queryVmList(_)
            }
        })
    )

    const queryVmList = async (id: string | number) => {
        setLoading( true )
        const { code, msg, data } = await request(`/api/server/sync_vm/?server_id=${id}`)
        setLoading( false )
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        setDataSource(data)
        setVisible(true)
        setSource(id)
    }

    const handleClose = useCallback(
        () => {
            setVisible(false)
            setLoading(true)
            setSource(null)
            setSelectedRowKeys([])
            setDataSource([])
            setAlertInf({ type: undefined, message: null })
        }, []
    )

    const columns = [{
        dataIndex: 'ip',
        title: 'IP',
    }, {
        dataIndex: 'sn',
        title: 'SN',
    }, {
        dataIndex: 'hostname',
        title: '机器名称',
    }, {
        dataIndex: 'idc',
        title: 'IDC',
    }, {
        dataIndex: 'app_group',
        title: '分组',
    },]

    const onChange = useCallback(
        (keys: Array<any>) => {
            setSelectedRowKeys(keys)
        }, []
    )

    const hanldeOk = async () => {
        if (JSON.stringify(selectedRowKeys) !== '[]') {
            setAlertInf({ type: undefined, message: null })
            setLoading(true)
            const result = await checkServerIp()
            if (result) {
                const { code, msg } = await request(
                    `/api/server/sync_vm/`,
                    { method: 'post', data: { server_id: source, ips: selectedRowKeys, ws_id } }
                )
                if (code !== 200) {
                    setLoading(false)
                    requestCodeMessage(code, msg)
                    return
                }
                handleClose()
                onOk()
                message.success("添加成功!")
            }
            setLoading(false)
        }
    }

    const onChannelTypeChange = useCallback(
        (channel_type: string) => {
            setChannelType(channel_type)
        }, []
    )

    const checkServerIp = async () => {
        const { code, msg, data } = await checkTestServerIps({ ips: selectedRowKeys, ws_id, channel_type: channelType })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return false
        }

        const { success, errors } = data
        if (JSON.stringify(errors) !== '[]') {
            setAlertInf({
                type: 'error',
                message: JSON.stringify(msg) !== '[]' ? msg.reduce((p: string, c: string) => p += c, '') : ''
            })
            return false
        }
        if (JSON.stringify(success) !== '[]')
            return true

        return false
    }

    const canSubmit = useMemo(() => {
        return selectedRowKeys.length !== 0 && dataSource.length !== 0 && !loading
    }, [selectedRowKeys, dataSource, loading])

    return (
        <Modal
            visible={visible}
            title={'选择虚拟机'}
            width={800}
            onCancel={handleClose}
            footer={false}
        >
            <Spin spinning={loading}>
                {
                    alertInfo.message &&
                    <Alert
                        style={{ marginBottom: 16 }}
                        showIcon
                        closable
                        type={alertInfo.type}
                        message={alertInfo.message}
                    />
                }

                <Space style={{ marginBottom: 16 }} >
                    <Typography.Text>控制通道：</Typography.Text>
                    <Select value={channelType} onChange={onChannelTypeChange} placeholder="请选择控制通道">
                        <Select.Option value="staragent">StarAgent</Select.Option>
                        <Select.Option value="toneagent">ToneAgent</Select.Option>
                    </Select>
                </Space>

                <Table
                    dataSource={dataSource}
                    columns={columns}
                    rowKey={'ip'}
                    pagination={false}
                    size="small"
                    rowSelection={{
                        selectedRowKeys,
                        onChange
                    }}
                    scroll={{ y: 200 }}
                />

                <Row justify="end" style={{ marginTop: 16 }}>
                    <Space>
                        <Button type="default" onClick={handleClose}>取消</Button>
                        <Button
                            type="primary"
                            onClick={hanldeOk}
                            disabled={!canSubmit}
                        >
                            确定
                        </Button>
                    </Space>
                </Row>
            </Spin>
        </Modal>
    )
}

export default forwardRef(SelectVmServer)