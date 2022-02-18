import React, { useCallback, useRef, useEffect,useState } from 'react'
import { Table, Space, Button, Badge, message, Tooltip, Modal, Input } from 'antd'
import { useRequest, history, useModel } from 'umi'
import { queryJobTypeList, jobSwitch, deleteJob, queryJobTypeDel } from './services'
import { requestCodeMessage, switchServerType, switchTestType } from '@/utils/utils'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { CheckCircleOutlined, CheckCircleFilled , ExclamationCircleOutlined } from '@ant-design/icons'

import { JobTypeDeleteModal, EditTalbeCell } from './components'
import { SingleTabCard } from '@/components/UpgradeUI'

export default (props: any) => {
    const { ws_id } = props.match.params
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [DefaultJob, setDefaultJob] = useState({});
    const deleteModal: any = useRef(null)
    const { initialState, setInitialState } = useModel('@@initialState')
    const { data, loading, run } = useRequest(
        queryJobTypeList,
        {
            formatResult: (res: any) => {
                return res
            },
            initialData: { total: 0, data: [] },
            defaultParams: [{ ws_id }]
        }
    )
    const defaultOption = (ret: any) => {
        if (ret.code === 200) {
            run({ ws_id })
            message.success('操作成功!')
        }
        else
            requestCodeMessage( ret.code , ret.msg )
    }

    const handleChangePriority = async (jt_id: number, priority: number) => {
        if (typeof +priority === 'number') {
            if (+priority > 0) {
                const result = await jobSwitch({ priority, jt_id })
                defaultOption(result)
            }
            else message.error('排序值须大于0')
        }
        else message.error('排序值须为数字')
    }

    useEffect(() => {
        setInitialState({
            ...initialState,
            refreshMenu: !initialState?.refreshMenu
        })
    }, [data])

    const handleDeleteJobType = async (job: any) => {
        const data = await queryJobTypeDel({ jt_id: job.id })
        if(data.data.length > 0){
            deleteModal.current.show(job)
        }else{
            setDeleteDefault(true)
            setDefaultJob(job)
        }
    }

    const handleDelete = async (job: any) => {
        const result = await deleteJob({ jt_id: job.id, ws_id })
        if (result.code === 200) {
            run({ ws_id })
            message.success('操作成功!')
            deleteModal.current.hide()
            setDeleteDefault(false)
        }
        else
            requestCodeMessage( result.code , result.msg )
    }

    // 编辑
    const handleEditJobType = useCallback(
        (ws_id, _id) => {
            if (ws_id && (_id || _id === 0)) {
                history.push(`/ws/${ws_id}/job/update/${_id}`)
            }
        }, []
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
            title: '默认',
            fixed: 'left',
            width: 50,
            // dataIndex : 'is_first',
            render: (_: any) => (
                _.is_first ? <CheckCircleFilled style={{ width: 17.5, height: 17.5, color: '#1890ff' }} /> : <CheckCircleOutlined onClick={() => handleSetDefault(_)} style={{ cursor: 'pointer', width: 17.5, height: 17.5, color: 'rgba(0,0,0,.1)' }} />
            )
        },
        {
            title: '排序',
            fixed: 'left',
            width: 75,
            render: (_: any) => (
                <EditTalbeCell size="small" id={_.id} priority={_.priority} onChange={handleChangePriority} />
            )
        },
        {
            title: '类型名称',
            dataIndex: 'name',
            ellipsis: {
                shwoTitle: false,
            },
            fixed: 'left',
            render: (_: any) => <EllipsisPulic title={_}/>,
        },
        {
            title: '测试类型',
            dataIndex: 'test_type',
            render: (_: string) => switchTestType(_)
        },
        {
            title: 'ServerProvider',
            dataIndex: 'server_type',
            render: (_: string) => switchServerType(_)
        },
        {
            title: '创建者',
            dataIndex: 'creator_name',
            render: (_: any) => (_ || '-')
        },
        {
            title: '创建时间',
            width: 176,
            dataIndex: 'gmt_created',
            render: (_: any) => (_ || '-')
        },
        {
            title: '当前状态',
            dataIndex: 'enable',
            render: (_: any) => (
                <Badge
                    status={_ ? "success" : "error"}
                    text={_ ? "启用" : "停用"}
                />
            )
        },
        {
            title: '描述',
            dataIndex: 'description',
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any) => <EllipsisPulic title={_}/>
        },
        {
            title: '操作',
            fixed: 'right',
            render: (_: any) => (
                <Space>
                    <Button style={{ padding: 0 }} size="small" type="link" onClick={() => handleEditJobType(ws_id, _.id)}>编辑</Button>
                    <Button onClick={() => handlePreviewJobType(_.id)} style={{ padding: 0 }} size="small" type="link" >预览</Button>
                    {_.creator_name !== '系统预设' && <Button type='link' size="small" style={{ padding: 0 }} onClick={() => handleDeleteJobType(_)}>删除</Button>}
                </Space>
            )
        }
    ]

    const handleCreate = useCallback(
        () => history.push(`/ws/${ws_id}/job/create`), []
    )

    return (
        <SingleTabCard
            title={'Job类型管理'}
            extra={
                <Button type="primary" onClick={handleCreate}>新建Job类型</Button>
            }
        >
            <Table
                size="small"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data.data}
                pagination={false}
                scroll={{ x: 1500 }}
            />
            <JobTypeDeleteModal ref={deleteModal} onOk={handleDelete} />
            <Modal
				title="删除提示"
				centered={true}
				visible={deleteDefault}
				onCancel={() => setDeleteDefault(false)}
				footer={[
					<Button key="submit" onClick={()=>handleDelete(DefaultJob)}>
						确定删除
					</Button>,
					<Button key="back" type="primary"  onClick={() => setDeleteDefault(false)}>
						取消
					</Button>
				]}
				width={300}
			>
				<div style={{ color:'red',marginBottom: 5 }}> 
					<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign:'middle' 	}}/>
					确定要删除吗？
				</div>
			</Modal>
        </SingleTabCard>
    )
}