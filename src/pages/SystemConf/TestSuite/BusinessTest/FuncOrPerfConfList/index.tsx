import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useContext, } from 'react';
import { Button, Space, Tabs, message, Modal, Checkbox, Typography } from 'antd';
import { CaretRightFilled, CaretDownFilled, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { addCase, editCase, delCase, delBentch, openSuite, editBentch } from '@/pages/SystemConf/TestSuite/service';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import CommonTable from '@/components/Public/CommonTable';
import ButtonEllipsis from '@/components/Public/ButtonEllipsis';

import ConfEditDrawer from '@/pages/SystemConf/TestSuite/BasicTest/components/CaseTable/ConfEditDrawer'
import DesFastEditDrawer from '@/pages/SystemConf/TestSuite/BasicTest/components/DesFastEditDrawer'

import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import { requestCodeMessage } from '@/utils/utils';
import MetricTable from './components/MetricTable';
import styles from './index.less';

const { TabPane } = Tabs;

/**
 * 功能测试、性能测试的conf列表
 * @param id 父级列表suite_id
 * @param type 父级列表 测试类型
 * @returns 
 */
export default forwardRef(({ id, type: test_type, domainList }: any, ref: any) => {
     
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
    const [selectedRow, setSelectedRow] = useState<any>([]);
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
    const confDrawer: any = useRef(null)
    const [confRefresh, setConfRefresh] = useState<any>(false);
    
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

    const getCase = async (query={}) => {
        setExpandList({ data: [] })
        setExpandInnerKey([])
        setExpandLoading(true)
        const params = { suite_id: id, page_num: confPage, page_size: confPageSize, ...query }
        const data = await openSuite(params)
        setExpandList(data)
        setExpandLoading(false)
    }
    // 2.单个删除
	const submitDelConf = async () => {
		// setDeleteLoading(true)
		try {
			const { code, msg }: any = await delCase(deleteObj.id) || {};
			if (code === 200) {
				message.success('删除成功');
                // *判断单个删除行时，对批量选中行的影响
				if (selectedRowKeys.includes(deleteObj.id)) {
					const tempKeys = selectedRowKeys.filter((item: any)=> item !== deleteObj.id)
					const tempRows = selectedRow.filter((item: any)=> item.id !== deleteObj.id)
                    setSelectedRowKeys( tempKeys)
					setSelectedRow( tempRows)
				}
				setDeleteVisible(false)
                setDeleteDefault(false)
                setDeleteObj({})
                // 
				getCase()
			} else {
				message.error(msg ||'删除失败');
			}
			// setDeleteLoading(false)
		} catch (e) {
			console.log(e)
			// setDeleteLoading(false)
		}
	}
	// 3.批量删除
	const submitDelConfAll = async () => {
		const { code, msg } = await delBentch({ id_list: selectedRowKeys.join() }) || {}
		if (code === 200) {
			// 初始化状态&&关闭对话框
			setSelectedRow([])
		    setSelectedRowKeys([])
			setDeleteVisible(false)
            setDeleteDefault(false)
            // 刷新表格数据
            getCase({ page_num: 1 })
		} else {
			message.error(msg ||'批量删除失败');
		}
	}

    useEffect(() => {
        getCase()
    }, [confPage, confPageSize, confRefresh]);


    // 新增|编辑｜批量编辑，回调函数。
    const submitCase = async (data: any, bentch: boolean) => {
        const { test_suite_id, id } = data
        const param = { ...data }
        if (bentch) {
            const params = { ...param, ...{ case_id_list: selectedRowKeys.join(',') } }
            await editBentch(params)
            setSelectedRowKeys([])
            setSelectedRow([])
        }
        else {
            let content = param.var
            if (Object.prototype.toString.call(param.var) === '[object String]') {
                try {
                    let valid = JSON.parse(content)
                    if (Object.prototype.toString.call(valid) === '[object Array]') {
                        let len = valid.length
                        for (var i = 0; i < len; i++) {
                            if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                                message.error('变量数据格式错误');
                                return
                            }
                        }
                    } else {
                        message.error('变量数据格式错误');
                        return
                    }
                } catch (e) {
                    message.error('变量数据格式错误');
                    return
                }
            }
            else {
                let arr: any = []
                content.map((item: any) => {
                    if (item.name) {
                        arr.push(item)
                    }
                })
                content = JSON.stringify(arr)
            }
            param.var = content
            // ...{ test_suite_id }
            const params = { ...param, ...{ test_suite_id } }
            const { code, msg } = id ? await editCase(id, params) : await addCase(params)
            if (code == 201) {
                message.error('Test Suite名称重复');
                return
            }
            if (code == 202) {
                message.error(msg);
                return
            }
        }

        confDrawer.current.hide()
        message.success('操作成功');
        setConfRefresh(!confRefresh)
    }

    // 单个编辑
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
        confDrawer.current.show('编辑Test Conf', row)
    }
    // 单个删除前查询
    const deleteInner = async (row: any) => {
        const data = await queryConfirm({ flag: 'pass', case_id_list: row.id })
        if (data.code === 200) setDeleteVisible(true)
        else setDeleteDefault(true)
        setDeleteObj(row)
    }

    // 批量删除前查询
	const queryDeleteAll = async () => {
		try {
			const data = await queryConfirm({ flag: 'pass', case_id_list: selectedRowKeys.join() }) || {}
			if (data.code === 200) setDeleteVisible(true)
            else setDeleteDefault(true)
            setDeleteObj({})
		} catch (e) {
			console.log(e)
		}
	}
	// 批量编辑
	const editAll = () => {
		confDrawer.current.show('批量编辑Test Conf', { bentch: true, test_suite_id: id })
    }

    const handleInnerTab = (key: string, id: number) => {
        setInnerKey(key)
        if (innerKey == '1') return
        setConfRefresh(!confRefresh)
    }

    // 确定删除
	const remInnner = ()=> {
		if (deleteObj.id) {
			submitDelConf();
		} else {
			submitDelConfAll();
		}
	}

    const handleDetail = () => {
        let newData: any = []
		selectedRow.foreach((item: any) => newData.push(item.name))
        if (!deleteObj.id) {
            window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
        } else {
            window.open(`/refenerce/conf/?name=${deleteObj.name}&id=${deleteObj.id}`)
        }
        
    }
    const newCase = () => {
        confDrawer.current.show('新增Test Conf', { bentch: false, test_suite_id: id })
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
        { title: '领域', width: 100, dataIndex: 'domain_name_list', render: (text: any) => <PopoverEllipsis title={text || '-'} /> },
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

    // 编辑描述回调
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
        <div className={`${styles.warp} case_table_wrapper`}>
            {test_type === 'performance' &&
                <Tabs defaultActiveKey={'1'} activeKey={innerKey} onChange={(key) => handleInnerTab(key, id)} >
                    <TabPane
                        tab="Test Conf"
                        key="1"
                    >
                    </TabPane>
                    <TabPane
                        tab="指标"
                        key="2"
                    >
                    </TabPane>
                </Tabs>
            }
            {innerKey == '1' ?
                <CommonTable className={styles.FuncOrPerfConfList_root}
                    columns={columns}
                    scrollType={1400}
                    loading={expandLoading}
                    list={expandList.data}
                    page={expandList.page_num}
                    rowSelection={rowSelection}
                    totalPage={expandList.total_page}
                    total={expandList.total}
                    pageSize={expandList.page_size}
                    paginationBottom={true}
                    handlePage={handlePage}
                    expandable={
                        test_type == 'performance' ?
                            {
                                expandedRowRender: (record: any) => <MetricTable componentType={"case"} id={record.id} innerKey={innerKey} />,
                                onExpand: (_: any, record: any) => {
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
                :
                <MetricTable componentType={"suite"} id={id} innerKey={innerKey} />
            }

            {/** 新增TestConf */}
            <ConfEditDrawer ref={confDrawer} onOk={submitCase} />

            {/** 编辑说明 */}
            <DesFastEditDrawer ref={descFastEdit} onOk={handleEditDesc} />

            {/** 200表示删除有引用;*/}
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
                    {`${deleteObj.name ? `该Conf(${deleteObj.name})` : `有Conf`}已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！`}
                </div>
                <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
                    删除conf影响范围：运行中的job、测试模板、对比分析报告
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            {/** 201表示可以直接删除 */}
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
                    <Button key="back" type="primary" onClick={() => { setDeleteDefault(false); setDeleteObj({}) } }>
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

            {/**批量操作 */}
            {selectedRowKeys.length > 0 &&
				<div className={styles.batch}>
                    <Space>
                        <Checkbox indeterminate={true} />
                        <Typography.Text>已选择{selectedRowKeys.length}项</Typography.Text>
                        <Button type="link" onClick={() => { setSelectedRow([]); setSelectedRowKeys([]) }}>取消</Button>
                    </Space>
                    <Space>
                        <Button onClick={queryDeleteAll}>批量删除</Button>
                        <Button type="primary" onClick={editAll}>批量编辑</Button>
                    </Space>
				</div>
			}
        </div>
    );
});
