import React, { useState, useEffect, useRef } from 'react'
import { Badge, message, Table, Typography, Space, Button, Spin, Popconfirm } from 'antd'
import { useIntl, FormattedMessage, getLocale } from 'umi'
import { queryKernelList, deleteKernel, updateSyncKernel } from './services'
import CommonPagination from '@/components/CommonPagination'
import { getRadioFilter, getSearchFilter, getUserFilter } from '@/components/TableFilters'
import DrawerForm from './components/Form'
import { SingleTabCard } from '@/components/UpgradeUI'
import { requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

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
        else requestCodeMessage(code, msg)
        setLoading(false)
    }

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteKernel({ kernel_id: _.id })
        if (code === 200) {
            setPageParams({ ...pageParams, page_num: Math.round((total - 1) / pageParams.page_size) || 1 })
            setRefresh(!refresh)
            message.success(formatMessage({ id: 'operation.success' }))
        }
        else requestCodeMessage(code, msg)
    }

    const handleEdit = (_: any) => {
        createDrawer.current.show('edit', _)
    }

    const handleCreate = () => {
        createDrawer.current.show('new')
    }

    const handleSubmit = () => {
        setRefresh(!refresh)
    }
    const handleUpdateKernel = function* (version: string) {
        message.loading({ content: formatMessage({ id: 'operation.synchronizing' }) })
        yield updateSyncKernel({ version_list: [version] })
    }

    const columns = [{
        title: <FormattedMessage id="kernel.version" />,
        dataIndex: 'version',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Typography.Text ellipsis={{ tooltip: true }}>
                {_ || "-"}
            </Typography.Text>
        ),
        ...getSearchFilter(pageParams, setPageParams, 'version')
    }, {
        title: <FormattedMessage id="kernel.version.type" />,
        dataIndex: 'release',
        width: enLocale ? 160 : 100,
        render: (_: any) => (
            <Badge
                status={_ ? 'success' : 'error'}
                /*  <Typography.Text>{ _ ? '发布' : '未发布' }</Typography.Text>  */
                text={
                    <Typography.Text>
                        {_ ? <FormattedMessage id="kernel.release.version" /> : <FormattedMessage id="kernel.temporary.version" />}
                    </Typography.Text>
                }
            />
        ),
        // ...getRadioFilter( pageParams , setPageParams , [{ name : '发布' , value : 'True' }, { name : '未发布' , value : 'False' }] , 'release'),
        ...getRadioFilter(pageParams, setPageParams,
            [{ name: <FormattedMessage id="kernel.release.version" />, value: 'True' },
            { name: <FormattedMessage id="kernel.temporary.version" />, value: 'False' }
            ], 'release'),
    }, {
        title: <FormattedMessage id="kernel.enabling.condition" />,
        dataIndex: 'enable',
        width: 100,
        render: (_: any) => (
            <Badge
                status={_ ? 'success' : 'error'}
                text={
                    <Typography.Text>
                        {_ ? <FormattedMessage id="kernel.enable" /> : <FormattedMessage id="kernel.stop" />}
                    </Typography.Text>
                }
            />
        ),
        ...getRadioFilter(pageParams, setPageParams,
            [{ name: <FormattedMessage id="kernel.enable" />, value: 'True' },
            { name: <FormattedMessage id="kernel.stop" />, value: 'False' },
            ], 'enable'),
    }, {
        title: <FormattedMessage id="kernel.gmt_created" />,
        width: 170,
        dataIndex: 'gmt_created',
    }, {
        title: <FormattedMessage id="kernel.gmt_modified" />,
        width: 170,
        dataIndex: 'gmt_modified',
    }, {
        title: <FormattedMessage id="kernel.creator" />,
        dataIndex: 'creator_name',
        ...getUserFilter(pageParams, setPageParams, 'creator')
    }, {
        title: <FormattedMessage id="kernel.update_user" />,
        dataIndex: 'update_user',
        ...getUserFilter(pageParams, setPageParams, 'update_user'),
        render(_) {
            return (
                <Typography.Text ellipsis={{ tooltip: true }}>
                    {_ || "-"}
                </Typography.Text>
            )
        }
    }, {
        title: <FormattedMessage id="kernel.desc" />,
        dataIndex: 'description',
        ellipsis: {
            showTitle: false
        },
        render(_) {
            return (
                <Typography.Text ellipsis={{ tooltip: true }}>
                    {_ || "-"}
                </Typography.Text>
            )
        }
    }, {
        title: <FormattedMessage id="Table.columns.operation" />,
        width: enLocale ? 190 : 150,
        fixed: 'right',
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
                                    message.warning(formatMessage({ id: 'request.synchronize.failed' }));
                                } else {
                                    message.success(formatMessage({ id: 'request.synchronize.success' }));
                                }
                                initPageList()

                            })
                        }}
                >
                    <FormattedMessage id="operation.synchronize" />
                </Button>
                <Button size="small" style={{ padding: 0 }} type="link" onClick={() => handleEdit(_)}><FormattedMessage id="operation.edit" /></Button>
                <Popconfirm
                    title={<FormattedMessage id="delete.prompt" />}
                    onConfirm={() => handleDelete(_)}
                    okText={<FormattedMessage id="operation.confirm" />}
                    cancelText={<FormattedMessage id="operation.cancel" />}
                >
                    <Typography.Text
                        style={{ color: '#1890FF', cursor: 'pointer' }}
                    >
                        <FormattedMessage id="operation.delete" />
                    </Typography.Text>
                </Popconfirm>
            </Space>
        )
    }]

    useEffect(() => {
        initPageList()
    }, [refresh, pageParams])

    return (
        <SingleTabCard
            title={<FormattedMessage id="kernel.manage" />}
            extra={<Button type="primary" onClick={handleCreate}><FormattedMessage id="kernel.new.kernel" /></Button>}>
            <Spin spinning={loading} >
                <Table
                    columns={columns as any}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={enLocale ? { x: 1370 } : undefined}
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