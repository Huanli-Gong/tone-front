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
import { useLocation } from 'umi';

/**
 * Conf级列表
 * @param id 父级列表suite_id
 * @returns 
 */
export default forwardRef(({ id }: any, ref: any) => {
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
                // console.log('refreshId:', refreshId)
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
        confDrawerShow('编辑Test Conf', row)
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
        message.success('操作成功');
        setConfRefresh(!confRefresh)
    }
    const handleDetail = () => {
        window.open(`/refenerce/conf/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    const newCase = () => {
        confDrawerShow('新增Test Conf', { bentch: false, test_suite_id: id })
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
        { title: '别名', dataIndex: 'alias', width: 100, ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: '领域', width: 100, dataIndex: 'domain_name_list', ellipsis: true, render: (_: any) => <>{_ ? _ : '-'}</> },
        { title: '最大运行时长（秒）', dataIndex: 'timeout', width: 160 },
        { title: '默认运行次数', width: '120px', dataIndex: 'repeat', ellipsis: true },
        {
            title: '变量',
            ellipsis: true,
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
            title: '说明',
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
            title: '默认用例',
            dataIndex: 'doc',
            width: '80px',
            render: (_: any, row: any) => row.is_default ? '是' : '否'
        },
        {
            title: '是否认证',
            dataIndex: 'certificated',
            width: '80px',
            render: (_: any, row: any) => row.certificated ? '是' : '否'
        },
        {
            title: '创建时间',
            dataIndex: 'gmt_created',
            ellipsis: true,
            width: '190px',
            render: (_: number, row: any) => <PopoverEllipsis title={row.gmt_created} />
        },
        {
            title: <div>操作<Button type='primary' onClick={newCase} style={{ marginLeft: 10 }}>新增</Button></div>,
            valueType: 'option',
            dataIndex: 'id',
            width: 150,
            fixed: 'right',
            render: (_: number, row: any) => <Space>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => editInner({ ...row })}>编辑</Button>
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => deleteInner({ ...row })}>删除</Button>
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
            message.success('操作成功')
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
                        // tab="Metric"
                        tab="指标"
                        key="2"
                    >
                    </TabPane>
                </Tabs>
            }
            {
                innerKey == '1' ?
                    <CommonTable
                        columns={columns}
                        scrollType={1400}
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
                title="删除提示"
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        取消
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
                    该Conf({deleteObj.name})已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    删除conf影响范围：运行中的job、测试模板、对比分析报告
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            <Modal
                title="删除提示"
                centered={true}
                className={styles.modalChange}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={remInnner}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        取消
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    确定要删除吗？
                </div>
            </Modal>
        </div>
    );
});
