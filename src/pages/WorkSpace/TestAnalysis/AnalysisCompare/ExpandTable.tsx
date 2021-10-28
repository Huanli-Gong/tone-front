import React, { useState, useRef, useEffect } from 'react'
import { Table, Space, Radio, Tag, Popover } from 'antd'
import { FilterFilled } from '@ant-design/icons';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import styles from './index.less'
import _ from 'lodash'

import { Scrollbars } from 'react-custom-scrollbars';
import styled from 'styled-components'
const SelectJob = styled.span`
    color: #1890FF;
    cursor: pointer;
`
const styleObj = {
    container: 210,
    button_width: 105
}
export default (props: any) => {
    const { itemSuitData,handleChangeDefaultJob,currentTab,setCurrentJobIndex, currentJobIndex} = props
    const tab = Number(currentTab.replace('group',''))
    const selectedConfData = _.get(itemSuitData, 'conf_dic') || {}
    // const data = Object.values(selectedConfData)
    const [allConf, setAllConf] = useState(selectedConfData)
    const page_default_params: any = { obj_id:'', name: '' }
    const [autoFocus, setFocus] = useState(true)
    const [refAllJob, setRefAllJob] = useState([])
    const [params,setParams] = useState(page_default_params)
    let [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [currentIndex,setCurrentIndex] = useState(0)
    const [popoverVisible,setPopoverVisible] = useState(false)

    const allJob = useRef(null)
    const fn = () => {
        setPopoverVisible(false)
    }
    useEffect(() => {
        window.addEventListener('click', fn, false)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            window.removeEventListener('click', fn, false)
        }
    }, []);
 
    const columns = [
        {
            title: 'JobID',
            dataIndex: 'obj_id',
            width: 100,
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => {
                    let refAllJobCopy:any = null
                    if(val === undefined) {
                        refAllJobCopy = _.cloneDeep(allJob.current)
                        if(params.name) {
                            refAllJobCopy = refAllJobCopy.filter((item: any) => {
                                const name = _.get(item, 'name')
                                return name.includes(params.name.trim())
                            })
                        }
                    } else {
                        refAllJobCopy = _.cloneDeep(refAllJob)
                        refAllJobCopy = refAllJobCopy.filter((item: any) => String(_.get(item, 'obj_id')) === val.trim())
                    }
                    
                    setRefAllJob(refAllJobCopy)
                    setParams({ ...params, obj_id: val })
                }}
                placeholder="支持搜索JobID"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.obj_id ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => _,
        },
        {
            title: 'Job名称',
            dataIndex: 'name',
            width: 265,
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => {
                    let refAllJobCopy:any = null
                    
                    if(val === undefined) {
                        refAllJobCopy = _.cloneDeep(allJob.current)
                        if(params.obj_id) refAllJobCopy = refAllJobCopy.filter((item: any) => String(_.get(item, 'obj_id')) === params.obj_id.trim())
                       
                    } else {
                        refAllJobCopy = _.cloneDeep(refAllJob)
                        refAllJobCopy = refAllJobCopy.filter((item: any) => {
                            const name = _.get(item, 'name')
                            return name.includes(val.trim())
                        })
                    }
                    setRefAllJob(refAllJobCopy)
                    setParams({ ...params, name: val })
                }}
                placeholder="支持搜索Job名称"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
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
            title: '创建人',
            width: 100,
            dataIndex: 'creator'
        },
    ]
    const onChange = (e: any) => {
        e.stopPropagation();
        const itemSuitDataCopy = _.cloneDeep(itemSuitData)
        const allConfCopy = _.cloneDeep(allConf)
       const arr = refAllJob.map((val:any) => {
            if(String(val.obj_id) === String(e.target.value)) return {...val,isSelect: true}
            return {...val,isSelect: false}
        })
        const brr:any = Object.entries(allConfCopy)
        if(tab === 0) {
            brr[currentIndex][1].base_obj_li = arr
        } else {
            brr[currentIndex][1].compare_groups[tab -1] = arr
        }
        
        const conf_dic = Object.fromEntries(brr)
        setAllConf(conf_dic)
        setSelectedRowKeys([e.target.value])
        handleChangeDefaultJob(itemSuitDataCopy.suite_id,{...itemSuitData,conf_dic:conf_dic})
        setPopoverVisible(false)
    }

    const rowSelection = {
        selectedRowKeys,
        // onSelect: selectedChange,
        preserveSelectedRowKeys: false,
        renderCell: (checked, record) => {

            return (
                <Radio.Group onChange={onChange} value={selectedRowKeys[0]}>
                    <Radio value={record.obj_id} />
                </Radio.Group>

            )
        },
        hideSelectAll: true
    };

    const getContent = (data: any) => {
        return (
            <Scrollbars style={{ height: 230 }}>
                <Table
                    rowSelection={rowSelection}
                    size="small"
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                />
            </Scrollbars>
        );
    }
    const handleSelectJob = (e:any,all:any, num:number,selJob:number,confId:any) => {
        e.stopPropagation();
        
        setCurrentJobIndex(confId)
        if (!_.isArray(all)) all = []
        const defaultSelKeys:any = [selJob]
        setSelectedRowKeys(defaultSelKeys)
        setRefAllJob(all)
        allJob.current = all
        setCurrentIndex(num) // conf下标
        if( confId === currentJobIndex) setPopoverVisible(!popoverVisible)
        if( confId !== currentJobIndex) setPopoverVisible(true)
        
        
    }
    // const trrArr = Object.values(allConf)
    // const allConfArr = [...trrArr,...trrArr,...trrArr,...trrArr]
    return (
        <>
            {Object.values(allConf).map((row: any, index: number) => {
                if (isNaN(tab)) return ''
                let jobList = []
                if (tab === 0) {
                    jobList = _.isArray(row.base_obj_li) ? row.base_obj_li : []
                } else {
                    const compare_groups = _.get(row, 'compare_groups')
                    const arr = compare_groups[tab - 1]
                    jobList = _.isArray(arr) ? arr : []
                }

                let selJob = (jobList[0] && jobList[0]['obj_id']) || ''
                jobList.forEach((item: any) => {
                    if (item && item.isSelect) selJob = item.obj_id
                })
                if(!selJob || jobList.length === 1) return ''

                return (
                    <div key={row.conf_id} className={styles.conf_item_box}>
                        <Space>
                            <span>{row.conf_name}</span>
                            {/* <span>{selJob}</span> */}
                            <Tag color='#f2f4f6' style={{color: '#515B6A'}}>{selJob}</Tag>
                            <Popover placement="right" title="选择Job" content={getContent(refAllJob)} trigger="click" overlayClassName={styles.popover_job} visible={currentJobIndex ===row.conf_id && popoverVisible}>
                                <SelectJob onClick={_.partial(handleSelectJob,_,jobList,index,selJob,row.conf_id)}>选择Job</SelectJob>
                            </Popover>
                        </Space>
                    </div>
                )
            })}
        </>
    )
}

