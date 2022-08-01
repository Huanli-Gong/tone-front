import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Space, message, Popconfirm, Pagination, Row, Table, Spin } from 'antd';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { getDomain, deleteDomains } from '../service';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import Highlighter from 'react-highlight-words';
import styles from './style.less';
import SearchInput from '@/components/Public/SearchInput';
import SelectDrop from '@/components/Public//SelectDrop';

import _ from 'lodash'
import AddScripotDrawer from './components/DomianConf/AddScript'
import { requestCodeMessage } from '@/utils/utils';
import { useLocation } from 'umi';

const SetDomain: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { query }: any = useLocation()

    const { test_type } = query

    useImperativeHandle(ref, () => ({
        openCreateDrawer: addScript.current.show
    }))

    const [loading, setLoading] = useState<boolean>(true)
    const [autoFocus, setFocus] = useState<boolean>(true)

    const [dataSource, setDataSource] = useState<any>([])
    const addScript: any = useRef(null)

    const defaultDomainParmas = {
        page_num: 1,
        page_size: 10,
    }

    const [params, setParams] = useState<any>(defaultDomainParmas)

    const getDomainList = async () => {
        setLoading(true)
        const data = await getDomain(params)
        setDataSource(data)
        setLoading(false)
    }

    const handlePage = (page_num: number, page_size: any) => {
        setParams({ ...params, page_num, page_size })
    }

    useEffect(() => {
        getDomainList()
    }, [params])

    const handleDelete = function* (record: any = {}) {
        yield deleteDomains({ id_list: [record.id] });
    }

    const defaultOption = (code: number, msg: string) => {
        const { page_num, page_size } = params
        if (code === 200) {
            message.success('操作成功')
            const pageNum = Math.ceil((dataSource.total - 1) / page_size) || 1
            let index = page_num
            if (page_num > pageNum) {
                index = pageNum
            }
            setParams({ ...params, page_num: index })
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const totalTotal = (total: any) => {
        return total || 0
    }

    const columns: any = [
        {
            title: '领域名称',
            width: 300,
            fixed: 'left',
            dataIndex: 'name',
            ellipsis: {
                showTitle: false
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: string) => setParams({ ...params, name: val })}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) setFocus(!autoFocus)
            },
            filterIcon: () => <FilterFilled style={{ color: params.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => (
                <PopoverEllipsis title={row.name} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[params.name || '']}
                        autoEscape
                        textToHighlight={row.name.toString()}
                    />
                </PopoverEllipsis>
            )
        },
        {
            title: '创建时间',
            width: 170,
            dataIndex: 'gmt_created',
            sorter: true,
            render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_created} />
        },
        {
            title: '修改时间',
            width: 170,
            dataIndex: 'gmt_modified',
            sorter: true,
            render: (_: any, row: any) => <PopoverEllipsis title={row.gmt_modified} />
        },
        {
            title: '创建者',
            width: 100,
            dataIndex: 'creator',
            filterIcon: () => <FilterFilled style={{ color: params.creator ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: any) => { setParams({ ...params, creator: val }) }} />,
        },
        {
            title: '修改者',
            width: 100,
            dataIndex: 'update_user',
            filterIcon: () => <FilterFilled style={{ color: params.update_user ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: any) => { setParams({ ...params, update_user: val }) }} />,
        },
        {
            title: '描述',
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'domain_conf',
            width: 130,
            fixed: 'right',
            render: (text: any, record: any) => {
                return (
                    <Space size='small'>
                        <span className={styles.fail_detail_operation} onClick={() => hanldeEdit(record)}>编辑</span>

                        <Popconfirm
                            title={<div style={{ color: 'red' }}>删除会使关联了该领域的Suite/Conf<br />失去该领域配置，请谨慎删除！！</div>}
                            onCancel={() => {
                                const generObj = handleDelete(record);
                                const excuteResult: any = generObj.next();
                                excuteResult.value.then((result: any) => {
                                    const { code, msg } = result;
                                    defaultOption(code, msg);
                                })
                            }}
                            okText="取消"
                            cancelText="确定删除"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}>
                            <span className={styles.fail_detail_operation}>删除</span>
                        </Popconfirm>
                    </Space>
                )
            }
        }
    ]

    const hanldeEdit = (record: any) => {
        addScript.current?.show('编辑领域', record)
    }

    return (
        <>
            <Spin spinning={loading}>
                <Table
                    size={'small'}
                    onChange={
                        (pagination: any, filters: any, sorter: any) => {
                            const { order, field } = sorter;
                            switch (order) {
                                case undefined:
                                    if (field === 'gmt_created') return setParams({ ...params, gmt_created: undefined })
                                    if (field === 'gmt_modified') return setParams({ ...params, gmt_modified: undefined })
                                case 'descend':
                                    if (field === 'gmt_created') return setParams({ ...params, gmt_created: '-gmt_created' })
                                    if (field === 'gmt_modified') return setParams({ ...params, gmt_modified: '-gmt_modified' })
                                    break;
                                case 'ascend':
                                    if (field === 'gmt_created') return setParams({ ...params, gmt_created: '+gmt_created' })
                                    if (field === 'gmt_modified') return setParams({ ...params, gmt_modified: '+gmt_modified' })
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    columns={columns}
                    dataSource={dataSource.data}
                    rowKey={record => record.id + ''}
                    pagination={false}
                />
                {
                    dataSource.total &&
                    <Row justify="space-between" style={{ padding: '16px 20px 0' }}>
                        <div>
                            共{totalTotal(dataSource.total)}条
                        </div>
                        <Pagination
                            showQuickJumper
                            showSizeChanger
                            size="small"
                            current={params.page_num}
                            defaultCurrent={1}
                            onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                            onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                            total={dataSource.total}
                        />
                    </Row>
                }
            </Spin>
            <AddScripotDrawer ref={addScript} onOk={getDomainList} />
        </>
    );
};

export default forwardRef(SetDomain);
