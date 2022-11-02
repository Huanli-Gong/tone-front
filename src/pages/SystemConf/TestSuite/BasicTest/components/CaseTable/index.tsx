import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useContext, } from 'react';
import { Button, Space, Tabs, message, Modal } from 'antd';
import { CaretRightFilled, CaretDownFilled, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { editCase, delCase, openSuite } from '../../../service';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
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
    const { setSelectedRowKeys, setSelectedRow, selectedRowKeys, confDrawerShow, confRefresh, setConfRefresh } = useContext(TestContext)
    const [innerKey, setInnerKey] = useState<string>('1')
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [confPage, setConfPage] = useState<number>(1)
    const [confPageSize, setConfPageSize] = useState<number>(10)
    const [expandList, setExpandList] = useState<any>([])
    const [expandLoading, setExpandLoading] = useState<boolean>(true)
    const [expandInnerKey, setExpandInnerKey] = useState<string[]>([])
    const descFastEdit: any = useRef(null)

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
        const data = await queryConfirm({ flag: 'pass', case_id_list: row.id })
        if (data.code === 200) setDeleteVisible(true)
        else setDeleteDefault(true)
        setDeleteObj(row)
    }

    const handleInnerTab = (key: string, id: number) => {
        setInnerKey(key)
        if (innerKey == '1') return
        setConfRefresh(!confRefresh)
    }

    const remInnner = async () => {
        setDeleteVisible(false)
        setDeleteDefault(false)
        await delCase(deleteObj.id)
        message.success(formatMessage({id: 'operation.success'}) );
        setConfRefresh(!confRefresh)
    }
    const handleDetail = () => {
        window.open(`/refenerce/conf/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    const newCase = () => {
        confDrawerShow('new', { bentch: false, test_suite_id: id })
    }
    const rowSelection = + status === 0 ? {
        selectedRowKeys,
        onChange: (selectedRowKeys: any[], selectedRows: any) => {
            setSelectedRow(selectedRows)
            setSelectedRowKeys(selectedRowKeys)
        }
    } : undefined

    const onExpand = async (record: any) => {
        setExpandInnerKey([record.id])
    }

    const columns = [
        { title: 'Test Conf', dataIndex: 'name', width: 300, fixed: 'left', ellipsis: true, render: (_: any, row: any) => <PopoverEllipsis title={row.name} /> },
        { title: <FormattedMessage id="TestSuite.alias"/>, dataIndex: 'alias', width: 100, ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: <FormattedMessage id="TestSuite.domain"/>, width: 100, dataIndex: 'domain_name_list', ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: <FormattedMessage id="TestSuite.timeout"/>, dataIndex: 'timeout', width: 160 },
        { title: <FormattedMessage id="TestSuite.default.repeat"/>, width: '120px', dataIndex: 'repeat', ellipsis: true },
        {
            title: <FormattedMessage id="TestSuite.var"/>,
            ellipsis: {
                showTitle: false
            },
            width: 100,
            render: (_: number, row: any) =>
                <PopoverEllipsis
                    title={
                        row.var && JSON.parse(row.var).map((item: any, index: number) => {
                            return <p key={index}>{`${item.name}=${item.val || '-'},${item.des || '-'}`};</p>
                        })
                    }
                >
                    <span>
                        {
                            row.var && row.var != '[]' ? JSON.parse(row.var).map((item: any) => {
                                return `${item.name}=${item.val || '-'},${item.des || '-'};`
                            }) : '-'
                        }
                    </span>
                </PopoverEllipsis>,
        },
        {
            title: <FormattedMessage id="TestSuite.desc"/>,
            ellipsis: true,
            width: 100,
            render: (_: any, row: any) => (
                <div>
                    <ButtonEllipsis title={row.doc} width={70} isCode={true}>
                        <EditOutlined
                            className={styles.edit}
                            onClick={() => descFastEdit.current.show(row)}
                        />
                    </ButtonEllipsis>
                </div>

            )
            // render: (text: string) => <PopoverEllipsis title={text || ''}></PopoverEllipsis>
        },
        {
            title: <FormattedMessage id="TestSuite.default.case"/>,
            dataIndex: 'doc',
            width: '80px',
            render: (_: any, row: any) => row.is_default ? <FormattedMessage id="operation.yes"/> : <FormattedMessage id="operation.no"/>
        },
        {
            title: <FormattedMessage id="TestSuite.is_certified"/>,
            dataIndex: 'certificated',
            width: '80px',
            render: (_: any, row: any) => row.certificated ? <FormattedMessage id="operation.yes"/> : <FormattedMessage id="operation.no"/>
        },
        {
            title: <FormattedMessage id="TestSuite.gmt_created"/>,
            dataIndex: 'gmt_created',
            ellipsis: {
                showTitle: false
            },
            width: '190px',
            render: (_: number, row: any) => <PopoverEllipsis title={row.gmt_created} />
        },
        {
            title: <div><FormattedMessage id="Table.columns.operation"/><Button type='primary' onClick={newCase} style={{ marginLeft: 10 }}><FormattedMessage id="operation.new"/></Button></div>,
            valueType: 'option',
            dataIndex: 'id',
            width: 150,
            fixed: 'right',
            render: (_: number, row: any) => <Space>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editInner({ ...row })}><FormattedMessage id="operation.edit"/></Button>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deleteInner({ ...row })}><FormattedMessage id="operation.delete"/></Button>
            </Space>,
        },
    ];

    const handlePage = (page_num: number, page_size: number) => {
        setConfPage(page_num)
        setConfPageSize(page_size)
    }

    const handleEditDesc = async (data: any) => {
        const { code, msg } = await editCase(data.id, { doc: data.doc })
        if (code === 200) {
            message.success(formatMessage({id: 'operation.success'}) )
            descFastEdit.current.hide()
            setConfRefresh(!confRefresh)
        }
        else requestCodeMessage(code, msg)
    }

    return (
        <div className={`${styles.warp} case_table_wrapper`}
        >
            {
                query.test_type === 'performance' &&
                <Tabs defaultActiveKey={'1'} activeKey={innerKey} onChange={(key) => handleInnerTab(key, id)} >
                    <TabPane
                        tab="Test Conf"
                        key="1"
                    >
                    </TabPane>
                    <TabPane
                        tab={<FormattedMessage id="TestSuite.conf.metric"/>}
                        key="2"
                    >
                    </TabPane>
                </Tabs>
            }
            {
                innerKey == '1' ?
                    <CommonTable
                        columns={columns}
                        // scrollType={1400}
                        scroll={{ x: 1400 }}
                        loading={expandLoading}
                        list={expandList.data}
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
                                        // setSelectedRowKeys([])
                                        _ ? onExpand(record) : setExpandInnerKey([])
                                    },
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
            <Modal
                title={<FormattedMessage id="delete.tips"/>}
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                centered={true}
                className={styles.modalChange}
                visible={deleteVisible}
                onCancel={() => setDeleteVisible(false)}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    {formatMessage({id: 'TestSuite.conf.name.delete.warning'},{data: deleteObj.name})}
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    <FormattedMessage id="TestSuite.conf.delete.range"/>
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="view.reference.details"/></div>
            </Modal>
            <Modal
                title={<FormattedMessage id="delete.tips"/>}
                centered={true}
                className={styles.modalChange}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        <FormattedMessage id="operation.confirm.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    <FormattedMessage id="delete.prompt"/>
                </div>
            </Modal>
        </div>
    );
});
