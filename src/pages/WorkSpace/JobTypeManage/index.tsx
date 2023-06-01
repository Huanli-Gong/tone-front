/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useRef } from 'react'
import { Table, Space, Button, Badge, message, Modal } from 'antd'
import { useRequest, history, useModel, useIntl, FormattedMessage, getLocale, useParams } from 'umi'
import { queryJobTypeList, jobSwitch, deleteJob, queryJobTypeDel } from './services'
import { requestCodeMessage, switchServerType, switchTestType } from '@/utils/utils'
import { CheckCircleOutlined, CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons'

import { DelTypeModal, EditTalbeCell } from './components'
import { SingleTabCard } from '@/components/UpgradeUI'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

const DeleteTipsModal: React.ForwardRefRenderFunction<AnyType, AnyType> = ({ onOk }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const [source, setSource] = React.useState(undefined)

    React.useImperativeHandle(ref, () => ({
        show(_: any) {
            setVisible(true)
            setSource(_)
        }
    }))
    const handleCancel = () => {
        setVisible(false)
        setSource(undefined)
    }

    const handleOk = () => {
        onOk(source)
        handleCancel()
    }

    React.useEffect(() => {
        return () => {
            handleCancel()
        }
    }, [])

    return (
        <Modal
            title={<FormattedMessage id="delete.prompt" />}
            centered={true}
            open={visible}
            onCancel={() => setVisible(false)}
            footer={[
                <Button key="submit" onClick={handleOk}>
                    <FormattedMessage id="operation.ok" />
                </Button>,
                <Button key="back" type="primary" onClick={() => setVisible(false)}>
                    <FormattedMessage id="operation.cancel" />
                </Button>
            ]}
            width={300}
        >
            <div style={{ color: 'red', marginBottom: 5 }}>
                <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                <FormattedMessage id="delete.prompt" />
            </div>
        </Modal>
    )
}

const TipsModalComp = React.forwardRef(DeleteTipsModal)

export default () => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'
    const { ws_id } = useParams() as any
    const tipModalRef = React.useRef<any>(null)
    const deleteModal: any = useRef(null)
    const { initialState, setInitialState } = useModel('@@initialState')

    const { data, loading, run } = useRequest(
        () => queryJobTypeList({ ws_id }),
        {
            manual: true
        }
    )

    const runInterface = () => {
        run()
            .then(() => {
                setInitialState({
                    ...initialState,
                    refreshMenu: !initialState?.refreshMenu
                })
            })
        message.success(formatMessage({ id: 'operation.success' }))
    }

    const defaultOption = (ret: any) => {
        if (ret.code === 200) {
            runInterface()
        }
        else
            requestCodeMessage(ret.code, ret.msg)
    }

    const handleChangePriority = async (jt_id: number, priority: number) => {
        if (typeof +priority === 'number') {
            if (+priority > 0) {
                const result = await jobSwitch({ priority, jt_id })
                defaultOption(result)
            }
            else message.error(formatMessage({ id: 'job.types.sort.ps1' }))
        }
        else message.error(formatMessage({ id: 'job.types.sort.ps2' }))
    }

    React.useEffect(() => {
        run()
    }, [ws_id])

    const handleDeleteJobType = async (job: any) => {
        const res = await queryJobTypeDel({ jt_id: job.id })
        if (res.data.length > 0) {
            deleteModal.current.show(job)
        }
        else {
            tipModalRef.current.show(job)
        }
    }

    const handleDelete = async (job: any) => {
        const result = await deleteJob({ jt_id: job.id, ws_id })
        if (result.code === 200) {
            runInterface()
        }
        else
            requestCodeMessage(result.code, result.msg)
    }

    // 编辑
    const handleEditJobType = useCallback(
        (_id) => {
            if (_id || _id === 0) {
                history.push(`/ws/${ws_id}/job/update/${_id}`)
            }
        }, [ws_id]
    )

    // 预览
    const handlePreviewJobType = useCallback(
        (jt_id) => {
            history.push(`/ws/${ws_id}/test_job/${jt_id}/preview`)
        }, []
    )

    const handleSetDefault = async (_: any) => {
        if (!_.enable) return
        const result = await jobSwitch({ is_first: true, jt_id: _.id, ws_id })
        defaultOption(result)
    }

    const columns: any = [
        {
            title: <FormattedMessage id="job.types.default" />,
            fixed: 'left',
            width: enLocale ? 100 : 50,
            // dataIndex : 'is_first',
            render: (_: any) => (
                _.is_first ? <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} /> : <CheckCircleOutlined onClick={() => handleSetDefault(_)} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
            )
        },
        {
            title: <FormattedMessage id="job.types.sort" />,
            fixed: 'left',
            width: 75,
            render: (_: any) => (
                <EditTalbeCell size="small" id={_.id} priority={_.priority} onChange={handleChangePriority} />
            )
        },
        {
            title: <FormattedMessage id="job.types.type_name" />,
            dataIndex: 'name',
            ellipsis: {
                shwoTitle: false,
            },
            fixed: 'left',
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText>,
        },
        {
            title: <FormattedMessage id="job.types.test_type" />,
            dataIndex: 'test_type',
            render: (_: string) => switchTestType(_, formatMessage)
        },
        {
            title: <FormattedMessage id="job.types.server_type" />,
            dataIndex: 'server_type',
            render: (_: string) => switchServerType(_, formatMessage)
        },
        {
            title: <FormattedMessage id="job.types.creator_name" />,
            dataIndex: 'creator_name',
            render: (_: any) => (_ || '-')
        },
        {
            title: <FormattedMessage id="job.types.gmt_created" />,
            width: 176,
            dataIndex: 'gmt_created',
            render: (_: any) => (_ || '-')
        },
        {
            title: <FormattedMessage id="job.types.enable.state" />,
            dataIndex: 'enable',
            render: (_: any) => (
                <Badge
                    status={_ ? "success" : "error"}
                    text={_ ? <FormattedMessage id="job.types.enable" /> : <FormattedMessage id="job.types.stop" />}
                />
            )
        },
        {
            title: <FormattedMessage id="job.types.description" />,
            dataIndex: 'description',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} >{_}</ColumnEllipsisText>
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            fixed: 'right',
            render: (_: any) => (
                <Space>
                    <Button style={{ padding: 0 }} size="small" type="link" onClick={() => handleEditJobType(_.id)}>
                        <FormattedMessage id="operation.edit" />
                    </Button>
                    <Button onClick={() => handlePreviewJobType(_.id)} style={{ padding: 0 }} size="small" type="link">
                        <FormattedMessage id="operation.preview" />
                    </Button>
                    {(_.creator_name === '系统预设') || (_.creator_name !== '系统预设' && _.is_first) ? <></> :
                        <Button type='link' size="small" style={{ padding: 0 }} onClick={() => handleDeleteJobType(_)}>
                            <FormattedMessage id="operation.delete" />
                        </Button>}
                </Space>
            )
        }
    ]

    const handleCreate = useCallback(
        () => history.push(`/ws/${ws_id}/job/types/create`), []
    )

    if (!data) return <></>
    return (
        <SingleTabCard
            title={<FormattedMessage id="job.types.manage" />}
            extra={
                <Button type="primary" onClick={handleCreate}><FormattedMessage id="job.types.create" /></Button>
            }
        >
            <Table
                size="small"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data || []}
                pagination={false}
                scroll={{ x: 1500 }}
            />
            <DelTypeModal ref={deleteModal} onOk={handleDelete} />
            <TipsModalComp ref={tipModalRef} onOk={handleDelete} />
        </SingleTabCard>
    )
}