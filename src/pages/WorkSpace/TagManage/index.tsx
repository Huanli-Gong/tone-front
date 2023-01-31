import React, { useState, useEffect } from 'react';
import { Button, Space, Drawer, Form, Tag, Input, message, Popconfirm, Pagination, Spin, Popover, Table, Row } from 'antd';
import { FormattedMessage, useIntl } from 'umi'
import { tagList, addTag, editTag, delSuite } from './service';
import styles from './style.less';
import ColorPicker from './components/ColorPicker';
import Highlighter from 'react-highlight-words';
import SearchInput from '@/components/Public/SearchInput';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import SelectDrop from '@/components/Public//SelectDrop';
import { SingleTabCard } from '@/components/UpgradeUI';
import { requestCodeMessage } from '@/utils/utils';
import { ColumnEllipsisText } from '@/components/ColumnComponents';
import { tooltipTd } from '../TestResult/Details/components';

const SuiteManagement: React.FC<any> = props => {
    const { formatMessage } = useIntl()
    const { ws_id } = props.match.params
    const [formSuite] = Form.useForm();
    const [data, setData] = useState<any>([]);
    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [refresh, setRefresh] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(true)
    const [visible, setVisible] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(false)
    const [outId, setOutId] = useState<number>()
    const [msg, setMsg] = useState<string>()
    const [validateStatus, setValidateStatus] = useState<string>()
    const [creator_id, setCreator] = useState<number>()
    const [update_id, setUpdater] = useState<number>()
    const getList = async (params: any = {}) => {
        setLoading(true)
        setData({ data: [] })
        const data: any = await tagList({ ...params })
        data && setData(data)
        setLoading(false)
    };

    useEffect(() => {
        const params = { ws_id, name, description, update_user: update_id, creator: creator_id, page_num: page, page_size: pageSize }
        getList(params)
    }, [update_id, name, creator_id, description, page, pageSize, refresh]);
    const handlePage = (page_num: number, page_size: any) => {
        setPage(page_num)
        setPageSize(page_size)
    }
    const editOuter = (row: any) => {
        formSuite.resetFields()
        setValidateStatus('success')
        setMsg(formatMessage({ id: 'job.tags.msg1' }))
        setVisible(true)
        setOutId(row.id)
        setTimeout(function () {
            formSuite.setFieldsValue(row)
        }, 1)
    }
    const submitSuite = async (data: any) => {
        if (fetching) {
            return
        }
        setFetching(true)
        data.name = data.name && data.name.replace(/\s+/g, "")
        data.description = (data.description && data.description.replace(/\s+/g, "")) || ''
        const params = { ...data }
        setValidateStatus('validating')
        setMsg('')
        params.ws_id = ws_id
        const res: any = outId ? await editTag(outId, params) : await addTag(params)
        if (res.code == 201) {
            setTimeout(function () {
                setFetching(false)
            }, 1)
            setValidateStatus('error')
            setMsg(res.msg)
            return
        }
        if (res.code == 1302) {
            setValidateStatus('error')
            setMsg(formatMessage({ id: 'job.tags.msg2' }))
            setFetching(false)
            return
        }
        setValidateStatus('success')
        setMsg('')
        await setVisible(false)
        setTimeout(function () {
            setFetching(false)
        }, 1)
        message.success(formatMessage({ id: 'operation.success' }));
        outId ? setRefresh(!refresh) : page == 1 ? setRefresh(!refresh) : setPage(1)
    }
    const onSuiteSubmit = () => {
        formSuite.validateFields().then(val => {
            const reg = new RegExp(/^[A-Za-z0-9\._-]*$/g);
            if (!val.name || val.name.replace(/\s+/g, "") == '') {
                setValidateStatus('error')
                setMsg(formatMessage({ id: 'please.enter' }))
                return
            } else if (!reg.test(val.name) || val.name.length > 32) {
                setValidateStatus('error')
                setMsg(formatMessage({ id: 'job.tags.msg3' }))
                return
            } else {
                submitSuite(val)
            }
        }).catch(err => {
            if (!err.values.name || err.values.name.replace(/\s+/g, "") == '') {
                setValidateStatus('error')
                setMsg(formatMessage({ id: 'please.enter' }))
            }
        })
    }
    const newSuite = () => {
        setOutId(undefined)
        setVisible(true)
        formSuite.resetFields()
        // setTimeout(function () {
        //     formSuite.setFieldsValue({ run_environment: 'aligroup', run_mode: 'standalone', tag_color: 'rgb(255,157,78,1)' })
        // }, 1)
        setValidateStatus('')
        setMsg(formatMessage({ id: 'job.tags.msg1' }))
    }
    const remOuter = async (params: any) => {
        const res = await delSuite({ tag_id: params.id, ws_id })
        if (res.code != 200) {
            requestCodeMessage(res.code, res.msg)
            return
        }
        setPage(Math.round((data.total - 1) / pageSize) || 1)
        message.success(formatMessage({ id: 'operation.success' }));
        setRefresh(!refresh)
    }

    // <FormattedMessage id=""/>
    const columns: any = [
        {
            title: <FormattedMessage id="job.tags.tag.name" />,
            dataIndex: 'name',
            width: 120,
            filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setName(val) }} />,
            onFilterDropdownVisibleChange: (v: any) => {
                if (v) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => (
                <Popover title={row.name} placement="right" trigger="hover" content={false}
                    overlayClassName={styles.tag_popover_style}
                    arrowPointAtCenter={true}
                >
                    <Tag color={row.tag_color}>
                        {
                            row.name.toString().length > 10 ?
                                row.name.toString().substr(0, 10).concat('...') :
                                row.name.toString()
                        }
                    </Tag>
                </Popover>
            )
        },
        {
            title: <FormattedMessage id="job.tags.source_tag" />,
            dataIndex: 'source_tag',
            width: 100,
        },
        {
            title: <FormattedMessage id="job.tags.creator_name" />,
            dataIndex: 'creator_name',
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: creator_id ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: number) => { setPage(1), setCreator(val) }} />,
        },
        {
            title: <FormattedMessage id="job.tags.update_user" />,
            dataIndex: 'update_user',
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: update_id ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectDrop confirm={confirm} onConfirm={(val: number) => { setPage(1), setUpdater(val) }} />,
            ...tooltipTd("-")
        },
        {
            title: <FormattedMessage id="job.tags.gmt_created" />,
            dataIndex: 'gmt_created',
            width: 120,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => row.source_tag !== '系统标签' ? <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.gmt_created} /> : "-"
        },
        {
            title: <FormattedMessage id="job.tags.gmt_modified" />,
            dataIndex: 'gmt_modified',
            width: 120,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => row.source_tag !== '系统标签' ? <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.gmt_modified} /> : "-"
        },
        {
            title: <FormattedMessage id="job.tags.remarks" />,
            dataIndex: 'description',
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SearchInput confirm={confirm} autoFocus={autoFocus} onConfirm={(val: string) => { setPage(1), setDescription(val) }} />,
            onFilterDropdownVisibleChange: (v: any) => {
                if (v) {
                    setFocus(!autoFocus)
                }
            },
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row.description }} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[description || '']}
                        autoEscape
                        textToHighlight={row.description ? row.description.toString() : '-'}
                    />
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            valueType: 'option',
            dataIndex: 'creator',
            width: 150,
            render: (_: any, row: any) => (
                row.source_tag !== '系统标签' &&
                <Space>
                    <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editOuter({ ...row })}><FormattedMessage id="operation.edit" /></Button>
                    <Popconfirm
                        title={<div style={{ color: 'red' }}><FormattedMessage id="job.tags.delete.prompt" /></div>}
                        placement="topRight"
                        okText={<FormattedMessage id="operation.cancel" />}
                        cancelText={<FormattedMessage id="operation.delete" />}
                        onCancel={() => remOuter(row)}
                        overlayStyle={{ width: '300px' }}
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="link" style={{ padding: 0, height: 'auto' }}><FormattedMessage id="operation.delete" /></Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <SingleTabCard
            title={<FormattedMessage id="job.tags.name" />}
            extra={<Button key="3" type="primary" onClick={newSuite}><FormattedMessage id="job.tags.create" /></Button>}
        >
            <Spin spinning={loading}>
                <Table
                    pagination={false}
                    rowKey={record => record.id + ''}
                    columns={columns}
                    dataSource={data.data}
                    size="small"
                />
                <Row justify="space-between" style={{ marginTop: 20 }}>
                    <div className={data.total == 0 ? styles.hidden : ''}>
                        {formatMessage({ id: 'pagination.total.strip' }, { data: data.total })}
                    </div>
                    <Pagination
                        size="small"
                        className={data.total == 0 ? styles.hidden : ''}
                        showQuickJumper
                        showSizeChanger
                        current={page}
                        defaultCurrent={1}
                        onChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                        onShowSizeChange={(page_num: number, page_size: any) => handlePage(page_num, page_size)}
                        total={data.total}
                    />
                </Row>
            </Spin>

            <Drawer
                maskClosable={false}
                keyboard={false}
                title={outId ? <FormattedMessage id="job.tags.edit.tag" /> : <FormattedMessage id="job.tags.create.tag" />}
                width={376}
                onClose={() => setVisible(false)}
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
                            <FormattedMessage id="operation.cancel" />
                        </Button>
                        <Button onClick={onSuiteSubmit} type="primary" htmlType="submit" >
                            {outId ? <FormattedMessage id="operation.update" /> : <FormattedMessage id="operation.ok" />}
                        </Button>
                    </div>
                }
            >
                <Spin spinning={validateStatus == 'validating'}>
                    <Form
                        layout="vertical"
                        form={formSuite}
                        initialValues={{
                            tag_color: 'rgb(255,157,78,1)'
                        }}
                    /*hideRequiredMark*/
                    >
                        <Form.Item
                            name="tag_color"
                            label={<FormattedMessage id="job.tags.tag_color" />}
                            rules={[{
                                required: true,
                                message: formatMessage({ id: 'please.select' }),
                            }]}
                        >
                            <ColorPicker />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label={<FormattedMessage id="job.tags.tag.name" />}
                            validateStatus={validateStatus}
                            help={msg}
                            rules={[{ required: true }]}
                        >
                            <Input
                                autoComplete="off"
                                placeholder={formatMessage({ id: 'please.enter' })}
                                onChange={(e) => {
                                    if (!e.target.value.replace(/\s+/g, "")) {
                                        setValidateStatus('error')
                                        setMsg(formatMessage({ id: 'please.enter' }))
                                        return
                                    }
                                    setMsg(undefined)
                                    setValidateStatus('')
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label={<FormattedMessage id="job.tags.remarks" />}
                        >
                            <Input.TextArea rows={3} placeholder={formatMessage({ id: 'job.tags.remarks.placeholder' })} />
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
        </SingleTabCard>
    );
};

export default SuiteManagement;
