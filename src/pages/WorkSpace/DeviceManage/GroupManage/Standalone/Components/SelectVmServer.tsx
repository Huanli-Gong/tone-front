import React, { forwardRef, useImperativeHandle, useState, useMemo, useCallback } from 'react'

import { Modal, Table, Spin, Row, Space, Select, Typography, Alert, Button, message } from 'antd'
import { requestCodeMessage } from '@/utils/utils'
import { checkTestServerIps } from '@/pages/WorkSpace/DeviceManage/GroupManage/services'
import { useParams, request, useIntl, FormattedMessage } from 'umi'
import { AlertProps } from 'antd/lib/alert'
import { AgentSelect } from '@/components/utils'

const SelectVmServer = (props: any, ref: any) => {
    const { formatMessage } = useIntl();
    const { onOk } = props
    const { ws_id } = useParams<any>()
    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([])
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(true)
    const [channelType, setChannelType] = useState(BUILD_APP_ENV ? open_agent : self_agent)

    const [alertInfo, setAlertInf] = useState<AlertProps>({ type: undefined, message: null })

    useImperativeHandle(
        ref, () => ({
            show(_: any) {
                console.log(_)
                queryVmList(_)
            }
        })
    )

    const queryVmList = async (id: string | number) => {
        setLoading(true)
        const { code, msg, data } = await request(`/api/server/sync_vm/?server_id=${id}`)
        setLoading(false)
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
        title: <FormattedMessage id="device.machine.name"/>,
    }, {
        dataIndex: 'idc',
        title: 'IDC',
    }, {
        dataIndex: 'app_group',
        title: <FormattedMessage id="device.app_group"/>,
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
                message.success(formatMessage({id: 'operation.success'}) )
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
            title={<FormattedMessage id="device.select.virtual.machine"/>}
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
                    <Typography.Text><FormattedMessage id="device.channel_type"/>：</Typography.Text>
                    <AgentSelect
                        value={channelType}
                        onChange={onChannelTypeChange}
                        placeholder={formatMessage({id:'device.channel_type.message'}) }
                    />
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
                        <Button type="default" onClick={handleClose}>
                            <FormattedMessage id="operation.cancel"/>
                        </Button>
                        <Button
                            type="primary"
                            onClick={hanldeOk}
                            disabled={!canSubmit}
                        >
                            <FormattedMessage id="operation.ok"/>
                        </Button>
                    </Space>
                </Row>
            </Spin>
        </Modal>
    )
}

export default forwardRef(SelectVmServer)