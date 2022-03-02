import { Layout, Space, Table, Typography, Badge, message, Spin, Popconfirm, Tooltip } from 'antd'
import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useRequest } from 'umi'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { deleteConfig, queryConfigList } from '../services'
import { getRadioFilter, getSearchFilter, getUserFilter } from '@/components/TableFilters'
import CommonPagination from '@/components/CommonPagination'
import AddConfig from './AddConfig'
import { request } from 'express'
import { requestCodeMessage } from '@/utils/utils'

const SystemParameter = (props: any, ref: any) => {

    useImperativeHandle(ref, () => ({
        openSetting: () => addConfigDrawer.current.show()
    }))

    const addConfigDrawer: any = useRef()
    const PAGE_DEFAULT_PARAMS: any = { config_type: 'sys', page_size: 10, page_num: 1 }
    const [params, setParams] = useState<any>(PAGE_DEFAULT_PARAMS)

    const { data: dataSource, loading, refresh, run } = useRequest(
        (data) => queryConfigList(data),
        {
            formatResult: response => response,
            initialData: { data: [], total: 0 },
            defaultParams: [PAGE_DEFAULT_PARAMS]
        }
    )

    useEffect(() => {
        run(params)
    }, [params])

    const columns = [{
        dataIndex: 'config_key',
        title: '配置名称',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                {_}
            </Tooltip>
        ),
        ...getSearchFilter(params, setParams, 'config_key'),
    }, {
        dataIndex: 'config_value',
        title: '配置内容',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                {_}
            </Tooltip>
        ),
        ...getSearchFilter(params, setParams, 'config_value'),
    }, {
        dataIndex: 'enable',
        title: '是否启用',
        render: (_: any) => (
            <>
                <Badge status={_ ? 'success' : 'error'} />
                <Typography.Text>{_ ? '启用' : '停用'}</Typography.Text>
            </>
        ),
        ...getRadioFilter(params, setParams, [{ name: '启用', value: 1 }, { name: '停用', value: 0 }], 'enable'),
    }, {
        dataIndex: 'gmt_created',
        title: '创建时间',
        width: 175,
    }, {
        dataIndex: 'gmt_modified',
        title: '修改时间',
        width: 175,
    }, {
        dataIndex: 'creator_name',
        title: '创建者',
        ...getUserFilter({ name: 'creator', data: params, setDate: setParams })
    }, {
        dataIndex: 'update_user',
        title: '修改者',
        ...getUserFilter({ name: 'update_user', data: params, setDate: setParams })
    }, {
        dataIndex: 'description',
        title: '描述',
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                {_}
            </Tooltip>
        ),
    }, {
        title: '操作',
        width: 100,
        render: (_: any) => (
            <Space>
                <span
                    onClick={() => handleEdit(_)}
                    style={{ color: '#1890FF', cursor: 'pointer' }}
                >
                    编辑
                </span>

                <Popconfirm
                    title={<div style={{ color: 'red' }}>删除系统参数将可能导致系统部分<br />功能无法正常使用，请谨慎删除！！</div>}
                    onCancel={() => handleDelete(_)}
                    okText="取消"
                    cancelText="确认删除"
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                    <Typography.Text
                        style={{ color: '#1890FF', cursor: 'pointer' }}
                    >
                        删除
                    </Typography.Text>
                </Popconfirm>
            </Space>
        )
    },]

    const handleEdit = (_: any) => {
        addConfigDrawer.current.show('编辑配置', _)
    }

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteConfig({ config_id: _.id })
        if (code === 200) {
            refresh()
            message.success('操作成功!')
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const hanldeOk = () => refresh()

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Table
                    rowKey="id"
                    dataSource={dataSource?.data}
                    columns={columns}
                    pagination={false}
                    size="small"
                />
                <CommonPagination
                    pageSize={params.page_size}
                    currentPage={params.page_num}
                    total={dataSource?.total || 0}
                    onPageChange={
                        (page_num: number, page_size: number = params.page_num) => {
                            setParams({ ...params, page_size, page_num })
                            run(params)
                        }
                    }
                />
            </Spin>
            <AddConfig ref={addConfigDrawer} onOk={hanldeOk} />
        </Layout.Content>
    )
}
export default forwardRef(SystemParameter)