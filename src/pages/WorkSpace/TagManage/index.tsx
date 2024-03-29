/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from 'react';
import { Button, Space, Drawer, Form, Input, message, Popconfirm, Pagination, Spin, Row } from 'antd';
import { FormattedMessage, useIntl, useParams } from 'umi'
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
import { ResizeHooksTable } from '@/utils/table.hooks';
import { ResizeTag } from "@/pages/WorkSpace/DeviceManage/DispatchTag"

const SuiteManagement: React.FC<any> = () => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const DEFAULT_QUERY_PARAMS = { ws_id, page_num: 1, page_size: 10 }
    const [formSuite] = Form.useForm();
    const [listParams, setListParams] = React.useState<any>(DEFAULT_QUERY_PARAMS)

    const [data, setData] = useState<any>([]);
    const [autoFocus, setFocus] = useState<boolean>(true)
    const [refresh, setRefresh] = useState<any>(new Date().getTime())
    const [loading, setLoading] = useState<boolean>(true)
    const [visible, setVisible] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(false)
    const [outId, setOutId] = useState<number>()
    const [msg, setMsg] = useState<string>()
    const [validateStatus, setValidateStatus] = useState<string>()

    const getList = async (params: any = listParams) => {
        setLoading(true)
        setData({ data: [] })
        const data: any = await tagList(params)
        data && setData(data)
        setLoading(false)
    };

    useEffect(() => {
        getList()
    }, [refresh, listParams]);

    const handlePage = (page_num: number, page_size: any) => {
        setListParams((p: any) => ({ ...p, page_num, page_size }))
    }

    const flush = () => setRefresh(new Date().getTime())

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
        if (res.code === '1-12-002') {
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

        outId ? flush() : listParams?.page_num == 1 ? flush() : setListParams((p: any) => ({ ...p, page_num: 1 }))
    }

    const onSuiteSubmit = () => {
        formSuite.validateFields().then(val => {
            const reg = new RegExp(/^[A-Za-z0-9\._-]*$/g);
            if (!val.name || val.name.replace(/\s+/g, "") == '') {
                setValidateStatus('error')
                setMsg(formatMessage({ id: 'please.enter' }))
                return
            } else if (!reg.test(val.name) || val.name.length > 64) {
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
        setListParams((p: any) => ({ ...p, page_num: Math.ceil((data.total - 1) / listParams.page_size) || 1 }))
        message.success(formatMessage({ id: 'operation.success' }));
        setRefresh(new Date().getTime())
    }

    // <FormattedMessage id=""/>
    const columns: any = [
        {
            title: <FormattedMessage id="job.tags.tag.name" />,
            dataIndex: 'name',
            ellipsis: {
                showTitle: false,
            },
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: string) => {
                        setListParams((p: any) => ({ ...p, page_num: 1, name: val }))
                    }}
                />
            ),
            onFilterDropdownVisibleChange: (v: any) => {
                if (v) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => (
                <ResizeTag {...row} />
            )
        },
        {
            title: <FormattedMessage id="job.tags.source_tag" />,
            dataIndex: 'source_tag',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
        },
        {
            title: <FormattedMessage id="job.tags.creator_name" />,
            dataIndex: 'creator_name',
            ellipsis: {
                showTitle: false,
            },
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: listParams?.creator ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDrop
                    confirm={confirm}
                    onConfirm={(val: number) => {
                        setListParams((p: any) => ({ ...p, page_num: 1, creator: val }))
                    }}
                />
            ),
        },
        {
            title: <FormattedMessage id="job.tags.update_user" />,
            dataIndex: 'update_user',
            width: 100,
            filterIcon: () => <FilterFilled style={{ color: listParams?.update_user ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDrop
                    confirm={confirm}
                    onConfirm={(val: number) => {
                        setListParams((p: any) => ({ ...p, update_user: val, page_num: 1 }))
                    }}
                />
            ),
            ...tooltipTd("-")
        },
        {
            title: <FormattedMessage id="job.tags.gmt_created" />,
            dataIndex: 'gmt_created',
            width: 160,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => row.source_tag !== '系统标签' ? <ColumnEllipsisText ellipsis={{ tooltip: true }}  >{row.gmt_created}</ColumnEllipsisText> : "-"
        },
        {
            title: <FormattedMessage id="job.tags.gmt_modified" />,
            dataIndex: 'gmt_modified',
            width: 160,
            ellipsis: {
                shwoTitle: false,
            },
            render: (_: any, row: any) => row.source_tag !== '系统标签' ? <ColumnEllipsisText ellipsis={{ tooltip: true }} >{row.gmt_modified} </ColumnEllipsisText> : "-"
        },
        {
            title: <FormattedMessage id="job.tags.remarks" />,
            dataIndex: 'description',
            width: 160,
            ellipsis: {
                showTitle: false,
            },
            filterIcon: () => <FilterFilled style={{ color: listParams?.description ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: string) => {
                        setListParams((p: any) => ({ ...p, description: val, page_num: 1 }))
                    }}
                />
            ),
            onFilterDropdownVisibleChange: (v: any) => {
                if (v) {
                    setFocus(!autoFocus)
                }
            },
            render: (_: any, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: row.description }} >
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[listParams?.description || '']}
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
            width: 120,
            render: (_: any, row: any) => (
                row.source_tag !== '系统标签' &&
                <Space>
                    <Button
                        type="link"
                        style={{ padding: 0, height: 'auto' }}
                        onClick={() => editOuter({ ...row })}
                    >
                        <FormattedMessage id="operation.edit" />
                    </Button>
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
                <ResizeHooksTable
                    name="ws-job-type-tag-list"
                    refreshDeps={[data, autoFocus, listParams]}
                    pagination={false}
                    rowKey={record => record.id + ''}
                    columns={columns}
                    dataSource={data.data}
                    size="small"
                    scroll={{ x: '100%' }}
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
                        current={listParams?.page_num}
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
                open={visible}
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
                            /* @ts-ignore */
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
