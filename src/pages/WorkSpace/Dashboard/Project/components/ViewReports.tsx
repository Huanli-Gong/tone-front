import React, { useState, useRef, useEffect } from 'react'
import { Popover, Space, Table, Typography, Input, Button, Select } from 'antd'
import { CaretDownOutlined, SearchOutlined } from '@ant-design/icons'
import { useParams } from 'umi'
import Highlighter from 'react-highlight-words'
import { queryMember } from '@/services/Workspace';

import styles from './index.less'

const ViewReports = (props: any) => {
    const { report_li } = props
    if (report_li.length === 0) return <></>
    const { ws_id }: any = useParams()

    const handleViewReport = async (row?: any) => {
        window.open(`/ws/${ws_id}/test_report/${row ? row.id : report_li[0].id}`)
    }

    if (report_li.length === 1) return <Typography.Link style={{ cursor: 'pointer' }} onClick={() => handleViewReport(null)}>查看报告</Typography.Link>

    const searchInput: any = useRef(null)

    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')

    const [userSearchColumn, setUserSearchColumn] = useState('')
    const [val, setVal] = useState<any>('')
    const [visible, setVisible] = useState(false)
    const [userList, setUserList] = useState<any>([])

    useEffect(() => {
        visible && getUserList()
    }, [visible])

    const getUserList = async (word?: string) => {
        const param: any = word && word.replace(/\s*/g, "")
        let { data } = await queryMember({ keyword: param })
        setUserList(data || [])
    }

    const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    };

    const handleReset = (clearFilters: any) => {
        clearFilters();
        setSearchText('')
    };

    const handleUserReset = (clearFilters: any) => {
        clearFilters();
        setVal('')
    };

    const handleSearchUser = (selectedKeys: any, confirm: any, dataIndex: any) => {
        confirm();
        setVal(selectedKeys[0])
        setUserSearchColumn(dataIndex)
    };

    const getUserSearchProps = (dataIndex: any, name: any) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Space direction="vertical">
                    <Select
                        allowClear
                        defaultOpen
                        filterOption={false}
                        showSearch
                        onSearch={getUserList}
                        style={{ width: '100%' }}
                        onChange={(value: number) => setSelectedKeys(value ? [value] : [])}
                        showArrow={false}
                        autoFocus={true}
                        value={selectedKeys[0]}
                        placeholder={`搜索${name}`}
                    >
                        {
                            userList.map((item: any) => (
                                <Select.Option value={item.last_name} key={item.id}>{item.last_name}</Select.Option>
                            ))
                        }
                    </Select>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearchUser(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            搜索
                        </Button>
                        <Button onClick={() => handleUserReset(clearFilters)} size="small" style={{ width: 90 }}>
                            重置
                        </Button>
                    </Space>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: any) => (
            record[dataIndex]
                ? record[dataIndex] === value
                : ''
        ),
        render: (text: any) => (
            userSearchColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[val]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            )
        )
    })

    const getColumnSearchProps = (dataIndex: any, name: any) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`搜索 ${name}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        搜索
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        重置
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        render: (text: any) => (
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            )
        )
    });

    const columns: any = [
        {
            dataIndex: 'name',
            title: '报告名称',
            width: 165,
            ellipsis: true,
            ...getColumnSearchProps('name', '报告名称'),
        },
        {
            dataIndex: 'creator_name',
            width: 100,
            title: '创建人',
            ...getUserSearchProps('creator_name', '创建人')
        },
        {
            dataIndex: 'gmt_created',
            title: '保存时间',
            width: 200,
        }
    ]

    return (
        <Popover
            trigger="click"
            placement="left"
            visible={visible}
            onVisibleChange={show => setVisible(show)}
            overlayClassName={styles.popover_job}
            title="查看报告"
            content={
                <Table
                    size="small"
                    rowKey="id"
                    columns={columns}
                    dataSource={report_li}
                    scroll={{ y: 244 }}
                    onRow={record => {
                        return {
                            onClick: () => handleViewReport(record),
                        };
                    }}
                />
            }
        >
            <Typography.Link style={{ cursor: 'pointer' }}>查看报告<CaretDownOutlined /></Typography.Link>
        </Popover>
    )
}

export default ViewReports