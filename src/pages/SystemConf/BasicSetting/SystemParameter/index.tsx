import { Layout, Space, Table, Typography, Badge, message, Spin, Popconfirm, Tooltip } from 'antd'
import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useRequest, useIntl, FormattedMessage, getLocale } from 'umi'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { deleteConfig, queryConfigList } from '../services'
import { getRadioFilter, getSearchFilter, getUserFilter } from '@/components/TableFilters'
import CommonPagination from '@/components/CommonPagination'
import AddConfig from './AddConfig'
import { request } from 'express'
import { requestCodeMessage } from '@/utils/utils'

const SystemParameter = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

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
        title: <FormattedMessage id="basic.config_key"/>,
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
        title: <FormattedMessage id="basic.config_value"/>,
        width: 160,
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
        title: <FormattedMessage id="basic.is_enable"/>,
        width: 100,
        render: (_: any) => (
            <>
                <Badge status={_ ? 'success' : 'error'} />
                <Typography.Text>{_ ? <FormattedMessage id="basic.enable"/> : <FormattedMessage id="basic.stop"/> }</Typography.Text>
            </>
        ),
        ...getRadioFilter(params, setParams, [{ name: <FormattedMessage id="basic.enable"/>, value: 1 }, { name: <FormattedMessage id="basic.stop"/>, value: 0 }], 'enable'),
    }, {
        dataIndex: 'gmt_created',
        title: <FormattedMessage id="basic.gmt_created"/>,
        width: 175,
    }, {
        dataIndex: 'gmt_modified',
        title: <FormattedMessage id="basic.gmt_modified"/>,
        width: 175,
    }, {
        dataIndex: 'creator_name',
        title: <FormattedMessage id="basic.creator"/>,
        ...getUserFilter(params, setParams, 'creator')
    }, {
        dataIndex: 'update_user',
        title: <FormattedMessage id="basic.update_user"/>,
        ...getUserFilter(params, setParams, 'update_user')
    }, {
        dataIndex: 'description',
        title: <FormattedMessage id="basic.desc"/>,
        ellipsis: {
            showTitle: false
        },
        render: (_: any) => (
            <Tooltip placement="topLeft" title={_}>
                {_}
            </Tooltip>
        ),
    }, {
        title: <FormattedMessage id="Table.columns.operation"/>,
        width: 100,
        fixed: 'right',
        render: (_: any) => (
            <Space>
                <span
                    onClick={() => handleEdit(_)}
                    style={{ color: '#1890FF', cursor: 'pointer' }}
                >
                    <FormattedMessage id="operation.edit"/>
                </span>

                <Popconfirm
                    title={<div style={{ color: 'red' }}><FormattedMessage id="basic.delete.popconfirm.title"/></div>}
                    onCancel={() => handleDelete(_)}
                    okText={<FormattedMessage id="operation.cancel"/>}
                    cancelText={<FormattedMessage id="operation.confirm.delete"/>}
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                    <Typography.Text
                        style={{ color: '#1890FF', cursor: 'pointer' }}
                    >
                        <FormattedMessage id="operation.delete"/>
                    </Typography.Text>
                </Popconfirm>
            </Space>
        )
    },]

    const handleEdit = (_: any) => {
        addConfigDrawer.current.show('edit', _)
    }

    const handleDelete = async (_: any) => {
        const { code, msg } = await deleteConfig({ config_id: _.id })
        if (code === 200) {
            refresh()
            message.success(formatMessage({id: 'operation.success'}) )
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
                    columns={columns as any}
                    pagination={false}
                    size="small"
                    scroll={enLocale? { x: 1200 } : undefined}
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