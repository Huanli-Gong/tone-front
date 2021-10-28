import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle  } from 'react';
import { Popover, Tooltip, Space, message, Button, Popconfirm, Modal, Checkbox, Typography } from 'antd';
import { FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import CommonTable from '@/components/Public/CommonTable';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';
import AddConfDrawer from './AddConfDrawer';
import { delCase, queryConf, delBentch } from '../../../../../service';
import { queryConfirm } from '@/pages/WorkSpace/JobTypeManage/services';
import styles from './index.less';

/**
 * @module 业务测试
 * @description conf级列表
 */
export default forwardRef(({ suite_id, test_type, domainList, }: any, ref : any) => {
  const [loading, setLoading] = useState<any>(false)
  const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1, page_size: 10 })
	// 复选行
	const [selectedRow, setSelectedRow] = useState<any>([])
	const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
	const addConfDrawer: any = useRef(null)
	// 删除
	const [deleteState, setDeleteState] = useState<any>({ visible: false, success: '', action: '' }) // action:单个/批量删除
	const [deleteRow, setDeleteRow] = useState<any>({})
	const [deleteLoading, setDeleteLoading] = useState<boolean>(false)

  // 1.请求列表数据
  const getTableData = async (query: any) => {
    setLoading(true)
    try {
      const res: any = await queryConf({ suite_id, ...query });
      const { code, msg } = res || {}
      if (code === 200) {
        setData(res)
      } else {
        message.error(msg ||'请求数据失败');
      }
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }
	// 2.单个删除
	const submitDelConf = async () => {
		setDeleteLoading(true)
		try {
			const { code, msg }: any = await delCase(deleteRow.id) || {};
			if (code === 200) {
				message.success('删除成功');
        // *判断单个删除行时，对批量选中行的影响
				if (selectedRowKeys.includes(deleteRow.id)) {
					const tempKeys = selectedRowKeys.filter((item)=> item !== deleteRow.id)
					const tempRows = selectedRow.filter((item: any)=> item.id !== deleteRow.id)
          setSelectedRowKeys( tempKeys)
					setSelectedRow( tempRows)
				}
				onCancel()
				getTableData({ page_num: data.page_num, page_size: data.page_size })
			} else {
				message.error(msg ||'删除失败');
			}
			setDeleteLoading(false)
		} catch (e) {
			console.log(e)
			setDeleteLoading(false)
		}
	}
	// 3.批量删除
	const deleteAll = async () => {
		const { code, msg } = await delBentch({ id_list: selectedRowKeys.join() }) || {}
		if (code === 200) {
			// 初始化状态&&关闭对话框
			setSelectedRow([])
		  setSelectedRowKeys([])
			onCancel()
      // 刷新表格数据
			getTableData({ page_num: 1, page_size: data.page_size })
		} else {
			message.error(msg ||'批量删除失败');
		}
	}
	// 4.查看引用
	const handleDetail = () => {
		const type = deleteState.action

		let newData: any = []
		selectedRow.map((item: any) => newData.push(item.name))
		if (type == 'multiple') {
				window.open(`/refenerce/conf/?name=${newData.join(',')}&id=${selectedRowKeys.join(',')}`)
		} else {
				window.open(`/refenerce/conf/?name=${deleteRow.name}&id=${deleteRow.id}`)
		}
  }

	useEffect(() => {
		getTableData({ page_num: 1, page_size: data.page_size })
  }, []);

	// 刷新列表
	useImperativeHandle(
		ref,
		() => ({
			refresh: ({ refreshId }: any) => {
				// console.log('refreshId:', refreshId)
				if (suite_id === refreshId && data?.data?.length === 0) {  
		      getTableData({ page_num: 1, page_size: data.page_size })
				}
			}
		})
	)

	// 打开对话框
	const onOk = (data: any, record: any, action:any)=> {
		// 删除查询：201表示可以直接删除，200表示有引用
		if (data.code === 200) {
			setDeleteState({ visible: true, success: 200, action })
		} else if (data.code === 201){
			setDeleteState({ visible: true, success: 201, action })
		}
		setDeleteRow(record)
	}
	// 关闭对话框
	const onCancel = ()=> {
		setDeleteState({ visible: false, success: '', action: '' }); 
		setDeleteRow({});
	}
	// 确定删除
	const onSubmit = ()=> {
		if (deleteState.action === 'single') {
			submitDelConf();
		} else if (deleteState.action === 'multiple') {
			deleteAll();
		}
	}

	const handelAddOrEdit = ({ type, record={} }: any) => {
		if (type === 'add') {
			addConfDrawer.current?.show('新增Test Conf', { ...record })
		}	else if (type === 'edit') {
			addConfDrawer.current?.show('编辑Test Conf', { ...record })
		}
	}
	const handelCallback = (info: any) => {
		if (info.type === 'editAll') {
			setSelectedRow([])
      setSelectedRowKeys([])
		}
		getTableData({ page_num: 1, page_size: data.page_size })
	}

	// 单个删除前查询
	const queryDeleteSingle = async ({ record={} }: any) => {
		try {
			const data = await queryConfirm({ flag: 'pass', case_id_list: record.id }) || {}
			if (data.code) {
        onOk(data, record, 'single')
			}
		} catch (e) {
			console.log(e)
		}
	}
	// 批量删除前查询
	const queryDeleteAll = async () => {
		try {
			const data = await queryConfirm({ flag: 'pass', case_id_list: selectedRowKeys.join() }) || {}
			if (data.code) {
				onOk(data, {}, 'multiple')
			}
		} catch (e) {
			console.log(e)
		}
	}
 
	// 批量编辑
	const editAll = () => {
		addConfDrawer.current.show('批量编辑Test Conf', { editAll: true })
  }

	// 1.业务测试
	let columnsBusiness: any = [
		{
			title: 'Test Conf',
			dataIndex: 'name',
			fixed: 'left',
			width: 150,
      render: (text:any) => <PopoverEllipsis title={text} />,
		},
		{
			title: '领域',
			dataIndex: 'domain_name_list',
			width: 100,
			render: (text:any) => <PopoverEllipsis title={text} />
		},
		{
			title: '最大运行时长（秒）',
			dataIndex: 'timeout',
			width: 150,
			// onCell: () => ({ style: { maxWidth: 130 } }),
			render: (text:any) => <span>{text || '-'}</span>,
		},
		{
			title: '默认运行次数',
			dataIndex: 'repeat',
			width: 110,
			render: (text:any) => <span>{text || '-'}</span>,
		},
    {
			title: 'CI类型',
			dataIndex: 'ci_type',
			width: 110,
			render: (text:any) => {
				return <PopoverEllipsis title={text} />
			}
		},
    {
			title: '创建时间',
			dataIndex: 'gmt_created',
			width: 170,
			render: (text:any) => {
				return <PopoverEllipsis title={text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'} width={170} />
			}
		},
		{
			title: '说明',
			dataIndex: 'description',
			width: 200,
			render: (text:any) => <PopoverEllipsis title={text} />,
		},
    {
			title: (<div>操作<Button type="primary" onClick={()=> handelAddOrEdit({ type: 'add' })} style={{ marginLeft:10}}>新增</Button></div>),
			width: 150,
			fixed: 'right',
			render: (text: any, record: any) => {
				return (<div>
					<Space>
						<a><span onClick={()=> handelAddOrEdit({ type: 'edit', record })}>编辑</span></a>
						<a><span onClick={()=> queryDeleteSingle({ record })}>删除</span></a>
					</Space>
				</div>
				)
			},
		}
	];

  const onChange = (page:number, pageSize:number) => {
    getTableData({ page_num: page, page_size: pageSize })
  }
	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: any[], selectedRows: any) => {
			setSelectedRow(selectedRows)
			setSelectedRowKeys(selectedRowKeys)
		}
  }

	let list = data.data, total = data.total, pageNum = data.page_num, pageSize = data.page_size
	return (
		<div>
			<CommonTable className={styles.confList_root}
				columns={columnsBusiness}
				list={list}
				loading={loading}
				page={pageNum}
				pageSize={pageSize}
				total={total}
				handlePage={onChange}
				rowSelection={rowSelection}
				scrollType={1100}
				paginationBottom={true}
			/>
			<Modal title="删除提示"
				centered={true}
				okText="删除"
				cancelText="取消"
				visible={deleteState.visible}
				onCancel={onCancel}
				width={['', 201].includes(deleteState.success) ? 300 : 600}
				maskClosable={false}
				footer={[
					<Button key="submit" onClick={onSubmit} loading={deleteLoading}>
							确定删除
					</Button>,
					<Button key="back" type="primary" onClick={onCancel}>
							取消
					</Button>
			  ]}
			>
				<>
				  {/** 200表示有引用; 201表示可以直接删除 */}
					{['', 201].includes(deleteState.success) ? (
						<div style={{ color:'red',marginBottom: 5 }}> 
							<ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign:'middle' }}/>
							确定要删除吗？
						</div>
					) : (
						<div>
							<div style={{ color: 'red', marginBottom: 5 }}>
									<ExclamationCircleOutlined style={{ marginRight: 4 }} />
									{`${deleteState.action === 'single' ? `该Conf(${deleteRow.name})` : `有Conf`}已被Worksapce引用，删除后将影响以下Workspace的Test Suite管理列表，以及应用该Suite的Job、模板、计划，请谨慎删除！！`}
							</div>
							<div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 5 }}>
									删除conf影响范围：运行中的job、测试模板、对比分析报告
							</div>
							<div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
						</div>
					)}
				</>
			</Modal>

			{selectedRowKeys.length > 0 &&
				<div className={styles.deleteAll}>
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

      <AddConfDrawer ref={addConfDrawer} callback={handelCallback} 
				test_suite_id={suite_id}
				test_type={test_type}
				domainList={domainList}
				confIds={selectedRowKeys}
				/>
		</div>
  )
});
