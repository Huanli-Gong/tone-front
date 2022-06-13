import React, { useState, useEffect, useRef } from 'react';
import { useClientSize } from '@/utils/hooks';
import { FilterFilled } from '@ant-design/icons'
import { queryJobList, queryProductList, queryProduct } from './services'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import styles from './index.less'
import CommonPagination from '@/components/CommonPagination';
import SelectRadio from '@/components/Public/SelectRadio';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash'
import { Table,message, Select, Divider, Space,Button, DatePicker, Row, Col } from 'antd';
import SearchInput from '@/components/Public/SearchInput'
import {resizeDocumentHeight} from './CommonMethod'
import SelectUser from '@/components/Public/SelectUser'
import { requestCodeMessage } from '@/utils/utils';
const { Option } = Select;
const { RangePicker } = DatePicker
const defaultResult = {
                all_job: 0,
                data: [],
                fail_job: 0,
                my_job: 0,
                pending_job: 0,
                running_job: 0,
                stop_job: 0,
                success_job: 0,
            }
const defaultList = [{ id: 1, name: '功能' }, { id: 0, name: '性能' }]
const styleObj = {
    container: 230,
    button_width: 115
}
const getSelJobFn = (allGroup:any,allNoGroupData:any) => {
   const allGroupJob = _.reduce(allGroup,(arr:any,group:any) => {
        const members = _.get(group,'members')
        return [...arr,...members]
    },[])
    const allJob = [...allNoGroupData,...allGroupJob]
    const allJobId = allJob.map((item:any) => _.get(item, 'id'))
    return allJobId
}
export default ( props : any ) => {
    
    const {height: layoutHeight} = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const scollMaxHeight = maxHeight - 400 > 430 ? 430 : maxHeight - 400
    resizeDocumentHeight(scollMaxHeight)
    const { ws_id, onCancel, onOk,currentGroup} = props
    let {allGroup,allNoGroupData} = props
    allGroup = _.isArray(allGroup) ? allGroup : []
    allNoGroupData = _.isArray(allNoGroupData) ? allNoGroupData : []
    const selectedId: any = getSelJobFn(allGroup, allNoGroupData)
    const defaultVersion = currentGroup && _.get(currentGroup, 'members[0].product_version')
    const product_id = currentGroup && _.get(currentGroup, 'members[0].product_id')
    const pruductName = currentGroup && _.get(currentGroup, 'members[0].product_name')
    const page_default_params: any = {
        page_num: 1,
        page_size: 10,
        ws_id,
        creators: null,
        creation_time: null,
        state: 'success,fail,skip,stop,running',
        filter_id: selectedId.join(','),
        product_version: defaultVersion,
        product_id: product_id,
    }
    const [dataSource, setDataSource] = useState(defaultResult)
    const [loading,setLoading] = useState(false)
    const [params,setParams] = useState(page_default_params)
    const [pruductVersion,setPruductVersion] = useState(defaultVersion || '')
    const [allVersion,setAllVersion] = useState([])
    let [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    let [selectRowData, setSelectRowData] = useState<any>([])
    const [autoFocus, setFocus] = useState(true)
    const [allProduct,setAllProduct] = useState([])
    const [pruductId,setPruductId] = useState<any>(product_id)

    const getProductList = async () => {
        let result = await queryProductList({product_id: pruductId})
        if (result.code === 200) {
            let data = result.data.filter((val:any) => val.trim())
            data = data.map((item:any,index:number) => ({label: index,value:item}))
            setAllVersion(data)
            const defaultProVersion = data.length ? data[0].value : ''
            setPruductVersion(defaultProVersion)

        } else {
            requestCodeMessage( result.code , result.msg )
        }
        setLoading(false)
        // defaultOption(result)
    }
    const getProductData = async () => {
        let result = await queryProduct({ws_id})
        
        if (result.code === 200) {
            let data = _.isArray(result.data) ? result.data : []
            setAllProduct(data)
            if(data.length) {
                setPruductId(data[0].id)
                return
            }
        } else {
            requestCodeMessage( result.code , result.msg )
        }
        setLoading(false)
    }

    const getJobList = async (params:any) => {
        let data = await queryJobList(params)
        defaultOption(data)
    }
    useEffect(() => {
        setLoading(true)
        if (pruductVersion) {
            getJobList(params)
        } else {
            setDataSource(defaultResult)
            setLoading(false)
        }
    }, [params])
    useEffect(() => {
        if (!(currentGroup && _.get(currentGroup, 'members').length) && pruductId) getProductList()
    }, [pruductId])
    useEffect(() => {
        if(currentGroup && _.get(currentGroup, 'members').length) return
        setLoading(true)
        getProductData()
    }, [])
    useEffect(() => {
        let paramsCopy = _.cloneDeep(params)
        paramsCopy = {...paramsCopy,ws_id}
        setParams(paramsCopy)
    }, [ws_id])

    useEffect(() => {
        const paramsCopy = _.cloneDeep(params)
        setParams({...paramsCopy,product_version: pruductVersion,product_id: pruductId})
    }, [pruductVersion])

    const defaultOption = (ret: any) => {
        setLoading(false)
        if (ret.code === 200) {
            setDataSource(ret)
        } else {
            setDataSource(defaultResult)
            requestCodeMessage( ret.code , ret.msg )
        }
    }
    const onChange = (value:any) => {
        setPruductVersion(value)
        setSelectedRowKeys([]);
        setSelectRowData([]); 
    }
    const onProductChange = (value:any) => {
        setPruductId(value)
        setSelectedRowKeys([]);
        setSelectRowData([]); 
    }
    const handleMemberFilter = (val: []) => {
        setParams({ ...params, creators: val ? JSON.stringify([val]) : null })
    }
    const handleSelectTime = (date:any,dateStrings:any,confirm:any) => {
        const start_time= dateStrings[0]
        const end_time= dateStrings[1]
        if(!start_time && !end_time) setParams({ ...params, creation_time: null })
        if(start_time && end_time) setParams({ ...params, creation_time: JSON.stringify({start_time,end_time})  })
        confirm()
    }
  
    const columns = [
        {
            title: 'JobID',
            dataIndex: 'id',
            width: 100,
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				onConfirm={(val: any) => {setParams({...params,job_id:val,page_num: 1})}}
				placeholder="支持搜索JobID"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: params.job_id ? '#1890ff' : undefined }} />,
            render: (_:any, row:any) => _,
        },
        {
            title: 'Job名称',
            dataIndex: 'name',
            width: 300,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
				confirm={confirm}
				autoFocus={autoFocus}
				styleObj={styleObj}
				onConfirm={(val: any) => {setParams({...params,name:val,page_num: 1})}}
				// currentBaseline={{server_provider:ws_id,test_type: key,id: 'name' }}
				placeholder="支持搜索Job名称"
			/>,
			onFilterDropdownVisibleChange: (visible: any) => {
				if (visible) {
					setFocus(!autoFocus)
				}
			},
			filterIcon: () => <FilterFilled style={{ color: params.name ? '#1890ff' : undefined }} />,
			render: (_:any, row: any) => {
				return (
					<PopoverEllipsis title={row.name} >
						<Highlighter
							highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
							searchWords={[params.name || '']}
							autoEscape
							textToHighlight={row && row.name}
						/>
					</PopoverEllipsis>
                )
            }

        },
        {
            title: '测试类型',
            // width:100,
            dataIndex: 'test_type',
            render: (_: any, row: any) => row.test_type,
            filterIcon: () => <FilterFilled style={{ color: params.test_type ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => <SelectRadio
                list={defaultList}
                confirm={confirm}
                onConfirm={(val: any) => {
                    let value = undefined
                    if (val === 1) value = 'functional'
                    if (val === 0) value = 'performance'
                    setParams({ ...params, test_type: value })
                }} />,
        },
        {
            title: '创建人',
            // width:80,
            dataIndex: 'creator_name',

            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} mode="" confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val, 'creators')} page_size={9999} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creators && params.creators !== '[]' ? '#1890ff' : undefined }} />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        },
        {
            title: '测试时间',
            // width:180,
            dataIndex: 'start_time',
            filterDropdown: ({ confirm }: any) => <RangePicker
                size="middle"
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={_.partial(handleSelectTime,_,_,confirm)}
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creation_time ? '#1890ff' : undefined }} />,
            ellipsis: true,
            render: (record: any) => {
                return record || '-'
            }
        },

    ]
    const selectedChange = (record: any, selected: any) => {
        // 去掉未选组的job 开始
        let arrKeys = _.cloneDeep(selectedRowKeys)
        let arrData = _.cloneDeep(selectRowData)
        if(selected) {
            arrKeys = [...arrKeys,record.id]
            arrData = [...arrData,record]
        } else {
            arrKeys = arrKeys.filter((keys:any) => Number(keys) !== Number(record.id))
            arrData = arrData.filter((obj:any) => obj && Number(obj.id) !== Number(record.id))
        }
        setSelectedRowKeys(arrKeys);
        setSelectRowData(arrData);  
    }
    const handleSelectCancle = () =>{
        setSelectedRowKeys([]);
        setSelectRowData([]);  
    }
    const handleCancle = () =>{
        onCancel()
    }
    const handleOk = () =>{
        const groupData = _.cloneDeep(currentGroup)
        groupData.members = _.isArray(groupData.members) ?  [...groupData.members,...selectRowData] : selectRowData
        onOk(groupData)
    }
    const allSelectFn = (allData:any) => {
        // const arr = _.isArray(allData.data) ? allData.data : []
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys([...selectedRowKeys,...keysArr])
        setSelectRowData([...selectRowData,...arr])
    }
    const cancleAllSelectFn = (allData:any) => {
        const arr = _.isArray(allData) ? allData : []
        const keysArr: any = []
        arr.forEach((item: any) => keysArr.push(item.id))
        setSelectedRowKeys(_.difference(selectedRowKeys, keysArr))
        setSelectRowData(_.differenceBy(selectRowData, arr, 'id'))
    }
    const rowSelection = {
        selectedRowKeys,
        // onChange: onSelectChange,
        getCheckboxProps: (record:any) => {
            // 有用
            let flag = record.state !== 'success' && record.state !== 'fail'
            const selProductId = pruductId || _.get(selectRowData[0],'product_id')
            if(selProductId) flag = _.get(record,'product_id') !== selProductId
            
            // const flag = false
            return({
                disabled: flag , // Column configuration not to be checked
                name: record.name,
              })
        },
        preserveSelectedRowKeys: false,
        onSelect: selectedChange,
        onSelectAll: (selected: boolean, selectedRows: [], changeRows: []) => {
            // isAllSelected.current = selected
            if (selected) {
                // allSelectFn(dataSource)
                allSelectFn(changeRows)
                return
            } else {
                cancleAllSelectFn(changeRows)
            }
            // setSelectedRowKeys([])
            // setSelectRowData([])
        },
    };
    // 滚动条参数
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: maxHeight - 339 > 430 ? 430 : maxHeight - 339,
        // height: scollMaxHeight
    }
    let tableData = _.isArray(dataSource.data) ? dataSource.data : []
    return (
        <div className={styles.list_container} id="list_container">
            <div className={styles.select_product}>
                <Row>
                    <Col span={12} >
                        <span>产品：</span>
                        <Select
                            showSearch
                            style={{ width: 'calc(100% - 75px)' }}
                            placeholder="请选择产品"
                            defaultValue={product_id ? pruductName : pruductId}
                            value={product_id ? pruductName : pruductId}
                            optionFilterProp="children"
                            onChange={onProductChange}
                            disabled={currentGroup && _.get(currentGroup, 'members').length}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {
                                allProduct.map((item: any) => <Option value={item.id} key={item.id}>{item.name}</Option>)
                            }
                        </Select>
                    </Col>
                    <Col span={12} >
                        <span>产品版本：</span>
                        <Select
                            showSearch
                            style={{ width: 'calc(100% - 75px)' }}
                            placeholder="请选择产品版本"
                            defaultValue={pruductVersion}
                            value={pruductVersion}
                            optionFilterProp="children"
                            onChange={onChange}
                            disabled={currentGroup && _.get(currentGroup, 'members').length}
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {
                                allVersion.map((item: any) => <Option value={item.value} key={item.label}>{item.value}</Option>)
                            }
                        </Select>
                    </Col>
                </Row>

                <div className={styles.job_text}>Job列表</div>
                <Divider className={styles.line} />
            </div>
            <Scrollbars style={scroll} className={styles.scroll}>
            <Table
                rowSelection={rowSelection}
                rowKey='id'
                columns={columns}
                loading={loading}
                dataSource={tableData}
                pagination={false}
                size="small"
            />
            </Scrollbars>
            <CommonPagination
                total={dataSource.total}
                currentPage={params && params.page_num}
                pageSize={params && params.page_size}
                onPageChange={(page_num, page_size) => {
                    let paramsCopy = _.cloneDeep(params)
                    paramsCopy = { ...paramsCopy, page_num, page_size }
                    setParams(paramsCopy)
                }}
            />
            <Divider className={styles.footer_line} />
            <div className={styles.footer}>
                <span>
                    <span>已选择</span>
                    <span className={styles.text_num}>{`${selectRowData.length}`}</span>
                    <span>项</span>
                    <span className={styles.text_cancle} onClick={handleSelectCancle}>全部取消</span>
                </span>
                <span>
                    <Space>
                        <Button onClick={handleCancle}>取消</Button>
                        <Button type="primary" onClick={handleOk}>确定</Button>
                    </Space>
                </span>
            </div>
        </div>

    )
}
