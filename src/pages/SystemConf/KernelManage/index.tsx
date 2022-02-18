import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Badge, Layout, message, Table, Tabs, Typography, Space, Button, Spin, Tooltip, Popconfirm } from 'antd'

import { queryKernelList, deleteKernel, updateSyncKernel } from './services'
import CommonPagination from '@/components/CommonPagination'
import { getRadioFilter, getSearchFilter, getUserFilter } from '@/components/TableFilters'

import DrawerForm from './components/Form'
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { SingleTabCard } from '@/components/UpgradeUI'
import { requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const [dataSource, setDataSource] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)

    const createDrawer: any = useRef(null)

    const [pageParams, setPageParams] = useState<any>({ page_num: 1, page_size: 10 })

    const initPageList = async () => {
        setLoading(true)
        const { code, data, msg, total: pageTotal } = await queryKernelList(pageParams)
        if (code === 200) {
            setDataSource(data)
            setTotal(pageTotal)
        }
        else requestCodeMessage( code , msg )
        setLoading(false)
    }

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteKernel({ kernel_id: _.id })
        if (code === 200) {
            setPageParams({ ...pageParams, page_num: Math.round((total - 1) / pageParams.page_size) || 1 })
            setRefresh(!refresh)
            message.success('操作成功!')
        }
        else requestCodeMessage( code , msg )
    }

    const handleEdit = (_: any) => {
        createDrawer.current.show('编辑内核', _)
    }

    const handleCreate = () => {
        createDrawer.current.show('新增内核')
    }

    const handleSubmit = () => {
        setRefresh(!refresh)
    }
    const handleUpdateKernel = function* (version: string) {
        message.loading({ content: '同步中' })
        yield updateSyncKernel({ version_list: [version] })
    }

    const columns = [{
        title: '内核版本',
        dataIndex: 'version',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                { _}
            </Tooltip>
        ),
        ...getSearchFilter(pageParams, setPageParams, 'version')
    }, {
        title: '版本类型', // '发布情况',
        dataIndex: 'release',
        width: 100,
        render: (_: any) => (
            <>
                <Badge status={_ ? 'success' : 'error'} />
                {/* <Typography.Text>{ _ ? '发布' : '未发布' }</Typography.Text> */}
                <Typography.Text>{_ ? '发布版本' : '临时版本'}</Typography.Text>
            </>
        ),
        // ...getRadioFilter( pageParams , setPageParams , [{ name : '发布' , value : 'True' }, { name : '未发布' , value : 'False' }] , 'release'),
        ...getRadioFilter(pageParams, setPageParams, [{ name: '发布版本', value: 'True' }, { name: '临时版本', value: 'False' }], 'release'),
    }, {
        title: '启用情况',
        dataIndex: 'enable',
        width: 100,
        render: (_: any) => <><Badge status={_ ? 'success' : 'error'} /><Typography.Text>{_ ? '启用' : '停用'}</Typography.Text></>,
        ...getRadioFilter(pageParams, setPageParams, [{ name: '启用', value: 'True' }, { name: '停用', value: 'False' }], 'enable'),
    }, {
        title: '创建时间',
        width: 170,
        dataIndex: 'gmt_created',
    }, {
        title: '修改时间',
        width: 170,
        dataIndex: 'gmt_modified',
    }, {
        title: '创建者',
        dataIndex: 'creator_name',
        ...getUserFilter({ name: 'creator', data: pageParams, setDate: setPageParams })
    }, {
        title: '修改者',
        dataIndex: 'update_user',
        ...getUserFilter({ name: 'update_user', data: pageParams, setDate: setPageParams })
    }, {
        title: '描述',
        dataIndex: 'description',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                { _}
            </Tooltip>
        ),
    }, {
        title: '操作',
        width: 150,
        render: (_: any) => (
            <Space>
                <Button
                    style={{ padding: 0 }}
                    size="small" type="link"
                    onClick={
                        () => {
                            const generObj = handleUpdateKernel(_.version)
                            const excuteResult: any = generObj.next();
                            excuteResult.value.then((result: any) => {
                                message.destroy()
                                const { code } = result;
                                if (code != 200) {
                                    message.warning('同步失败');
                                } else {
                                    message.success('同步成功');
                                }
                                initPageList()

                            })
                        }}
                >
                    同步
                    </Button>
                <Button size="small" style={{ padding: 0 }} type="link" onClick={() => handleEdit(_)}>编辑</Button>
                <Popconfirm
                    title="确定要删除吗？"
                    onConfirm={() => handleDelete(_)}
                    okText="确认"
                    cancelText="取消"
                >
                    <Typography.Text
                        style={{ color: '#1890FF', cursor: 'pointer' }}
                    >
                        删除
                    </Typography.Text>
                </Popconfirm>
            </Space>
        )
    }]

    useEffect(() => {
        initPageList()
    }, [refresh, pageParams])

    return (
        <SingleTabCard title="内核管理" extra={<Button type="primary" onClick={handleCreate}>新增内核</Button>}>
            <Spin spinning={loading} >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="id"
                    size="small"
                />
                <CommonPagination
                    pageSize={pageParams.page_size}
                    currentPage={pageParams.page_num}
                    total={total}
                    onPageChange={(page_num, page_size) => setPageParams({ page_size, page_num })}
                />
            </Spin>
            <DrawerForm ref={createDrawer} confirm={handleSubmit} />
        </SingleTabCard>
    )
}