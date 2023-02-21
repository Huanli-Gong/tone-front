import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useContext, } from 'react';
import { Button, Space, Tabs, message, Row, Typography, TableColumnProps } from 'antd';
import { CaretRightFilled, CaretDownFilled, EditOutlined } from '@ant-design/icons';
import { editCase, delCase, openSuite } from '../../../service';
import styles from '../../style.less';
import MetricTable from '../../components/MetricTable';
import CommonTable from '@/components/Public/CommonTable';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';
import DesFastEditDrawer from '../DesFastEditDrawer'
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { TestContext } from '../../../Provider'
import { requestCodeMessage } from '@/utils/utils';
import { useSuiteProvider } from '../../../hooks';
import { useLocation, useIntl, FormattedMessage } from 'umi';
import DeleteDefault from '../DeleteDefault';
import DeleteTips from '../DeleteTips';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

/**
 * Conf级列表
 * @param id 父级列表suite_id
 * @returns 
 */
export default forwardRef(({ id }: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { query }: any = useLocation()

    const { domainList } = useSuiteProvider()
    // console.log('domainList：', domainList)

    const { TabPane } = Tabs;
    const { setSelectedRowKeys, setSelectedRow, selectedRowKeys, confDrawerShow, confRefresh, setConfRefresh, metricDelInfo } = useContext(TestContext)
    const [innerKey, setInnerKey] = useState<string>('1')
    const [confPage, setConfPage] = useState<number>(1)
    const [confPageSize, setConfPageSize] = useState<number>(10)
    const [expandList, setExpandList] = useState<any>([])
    const [expandLoading, setExpandLoading] = useState<boolean>(true)
    const [expandInnerKey, setExpandInnerKey] = useState<string[]>([])

    const descFastEdit: any = useRef(null)
    const deleteTipsRef: any = useRef(null)
    const deleteDefaultRef: any = useRef(null)

    // 刷新列表
    useImperativeHandle(
        ref,
        () => ({
            refresh: ({ refreshId }: any) => {
                if (id === refreshId) {
                    getCase()
                }
            }
        })
    )

    const getCase = async () => {
        setExpandList({ data: [] })
        setExpandInnerKey([])
        setExpandLoading(true)
        const params = { suite_id: id, page_num: confPage, page_size: confPageSize }
        const data = await openSuite(params)
        setExpandList(data)
        setExpandLoading(false)
    }

    useEffect(() => {
        getCase()
    }, [confPage, confPageSize, confRefresh]);

    const editInner = (row: any) => {
        row.var = row.var ? JSON.parse(row.var) : [{ name: '', val: '', des: '' }]
        row.is_default = row.is_default ? 1 : 0
        const arr = row.domain_id_list === '' ? [] : row.domain_id_list.split(',')
        let newArr = [];
        for (var i = 0; i < arr.length; i++) {
            newArr.push(Number.parseInt(arr[i]));
        }
        row.domain_list_str = newArr
        domainList.forEach((item: any) => { if (item.name == row.domain) row.domain = item.id })
        confDrawerShow('edit', row)
    }

    const deleteInner = async (row: any) => {
        const { code } = await queryConfirm({ flag: 'pass', case_id_list: row.id })
        if (code === 200) deleteTipsRef.current?.show(row)
        else deleteDefaultRef.current?.show(row)
    }

    const handleInnerTab = (key: string, id: number) => {
        setInnerKey(key)
        if (innerKey == '1') return
        setConfRefresh(!confRefresh)
    }

    const remInnner = async (row: AnyType) => {
        await delCase(row.id)
        message.success(formatMessage({ id: 'operation.success' }));
        setConfRefresh(!confRefresh)
    }

    const newCase = () => {
        confDrawerShow('new', { bentch: false, test_suite_id: id })
    }
    const rowSelection = + status === 0 ? {
        selectedRowKeys,
        getCheckboxProps: (record: AnyType) => ({
            disabled: !!metricDelInfo?.selectedRowKeys?.length, // Column configuration not to be checked
        }),
        onChange: (selectedRowKeys: any[], selectedRows: any) => {
            console.log(selectedRows, selectedRowKeys)
            setSelectedRow(selectedRows)
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    const onExpand = async (record: any) => {
        setExpandInnerKey([record.id])
    }

    const columns: TableColumnProps<any>[] = [
        { title: 'Test Conf', dataIndex: 'name', width: 300, fixed: 'left', ellipsis: { showTitle: false }, render: (_: any, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.name} /> },
        { title: <FormattedMessage id="TestSuite.alias" />, dataIndex: 'alias', width: 100, ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: <FormattedMessage id="TestSuite.domain" />, width: 100, dataIndex: 'domain_name_list', ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: <FormattedMessage id="TestSuite.timeout" />, dataIndex: 'timeout', width: 160 },
        { title: <FormattedMessage id="TestSuite.default.repeat" />, width: '120px', dataIndex: 'repeat', ellipsis: true },
        {
            title: <FormattedMessage id="TestSuite.var" />,
            ellipsis: {
                showTitle: false
            },
            key: "var",
            width: 100,
            render: (_: number, row: any) => (
                <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                    {
                        row.var && row.var != '[]' ? JSON.parse(row.var).map((item: any) => {
                            return `${item.name}=${item.val || '-'},${item.des || '-'};`
                        }) : '-'
                    }
                </ColumnEllipsisText>
            )
        },
        {
            title: <FormattedMessage id="TestSuite.desc" />,
            ellipsis: true,
            width: 100,
            key: "desc",
            render: (_: any, row: any) => (
                <ButtonEllipsis title={row.doc} width={70} isCode={true}>
                    <EditOutlined
                        className={styles.edit}
                        onClick={() => descFastEdit.current.show(row)}
                    />
                </ButtonEllipsis>
            )
        },
        {
            title: <FormattedMessage id="TestSuite.default.case" />,
            dataIndex: 'doc',
            width: '80px',
            render: (_: any, row: any) => row.is_default ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
        },
        {
            title: <FormattedMessage id="TestSuite.is_certified" />,
            dataIndex: 'certificated',
            width: '80px',
            render: (_: any, row: any) => row.certificated ? <FormattedMessage id="operation.yes" /> : <FormattedMessage id="operation.no" />
        },
        {
            title: <FormattedMessage id="TestSuite.gmt_created" />,
            dataIndex: 'gmt_created',
            ellipsis: {
                showTitle: false
            },
            width: '190px',
            render: (_: number, row: any) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.gmt_created} />
        },
        {
            title: (
                <Row justify="space-between" style={{ width: "100%" }}>
                    <FormattedMessage id="Table.columns.operation" />
                    <Button type='primary' size='small' onClick={newCase}>
                        <FormattedMessage id="operation.new" />
                    </Button>
                </Row>
            ),
            key: 'option',
            width: 140,
            fixed: 'right',
            render: (_: number, row: any) => (
                <Space>
                    <Typography.Link onClick={() => editInner({ ...row })}>
                        <FormattedMessage id="operation.edit" />
                    </Typography.Link>
                    <Typography.Link onClick={() => deleteInner({ ...row })}>
                        <FormattedMessage id="operation.delete" />
                    </Typography.Link>
                </Space>
            ),
        },
    ]

    const handlePage = (page_num: number, page_size: number) => {
        setConfPage(page_num)
        setConfPageSize(page_size)
    }

    const handleEditDesc = async (data: any) => {
        const { code, msg } = await editCase(data.id, { doc: data.doc })
        if (code === 200) {
            message.success(formatMessage({ id: 'operation.success' }))
            descFastEdit.current.hide()
            setConfRefresh(!confRefresh)
        }
        else requestCodeMessage(code, msg)
    }

    return (
        <div className={`${styles.warp} case_table_wrapper`} >
            {
                query.test_type === 'performance' &&
                <Tabs
                    defaultActiveKey={'1'}
                    activeKey={innerKey}
                    onChange={(key) => handleInnerTab(key, id)}
                    className={styles.caseTabCls}
                >
                    <TabPane
                        tab="Test Conf"
                        key="1"
                    />
                    <TabPane
                        tab={<FormattedMessage id="TestSuite.conf.metric" />}
                        key="2"
                    />
                </Tabs>
            }
            {
                innerKey == '1' ?
                    <CommonTable
                        columns={columns as any}
                        name="sys-suite-manage-case"
                        scroll={{ x: 1400 }}
                        rowKey={record => record.id}
                        loading={expandLoading}
                        dataSource={expandList?.data || []}
                        page={expandList.page_num}
                        rowSelection={rowSelection}
                        totalPage={expandList.total_page}
                        total={expandList.total}
                        pageSize={expandList.page_size}
                        handlePage={handlePage}
                        expandable={
                            query.test_type == 'performance' ?
                                {
                                    expandedRowRender: (record: any) => <MetricTable componentType={"case"} id={record.id} innerKey={innerKey} />,
                                    onExpand: (_: any, record: any) => {
                                        _ ? onExpand(record) : setExpandInnerKey([])
                                    },
                                    indentSize: 0,
                                    expandedRowKeys: expandInnerKey,
                                    expandIcon: ({ expanded, onExpand, record }: any) =>
                                        expanded ? (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                                } :
                                {}
                        }
                    />
                    : <MetricTable componentType={"suite"} id={id} innerKey={innerKey} />
            }
            <DesFastEditDrawer ref={descFastEdit} onOk={handleEditDesc} />
            <DeleteTips basePath={`/refenerce/conf/`} ref={deleteTipsRef} onOk={remInnner} />
            <DeleteDefault ref={deleteDefaultRef} onOk={remInnner} />
        </div>
    );
});
