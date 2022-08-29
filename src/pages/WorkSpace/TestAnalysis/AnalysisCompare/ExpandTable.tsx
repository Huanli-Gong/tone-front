import React, { useState, useRef, useEffect, useMemo } from 'react'
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
    const { itemSuitData, handleChangeDefaultJob, currentTab, setCurrentJobIndex, currentJobIndex } = props
    const tab = Number(currentTab.replace('group', ''))
    const selectedConfData =_.get(itemSuitData, 'conf_list') || {}
    const [allConf, setAllConf] = useState({})
    const page_default_params: any = { job_id: '', job_name: '' }
    const [autoFocus, setFocus] = useState(true)
    const [refAllJob, setRefAllJob] = useState([])
    const [params, setParams] = useState(page_default_params)
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [popoverVisible, setPopoverVisible] = useState(false)

    const allJob = useRef(null)

    const fn = () => {
        setPopoverVisible(false)
    }
    useEffect(() => {
        window.addEventListener('click', fn, false)
        return () => {
            window.removeEventListener('click', fn, false)
        }
    }, []);

    useEffect(()=> {
        setAllConf(selectedConfData)
    },[tab])

    const columns: any = [
        {
            title: 'JobID',
            dataIndex: 'job_id',
            width: 100,
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => {
                    let refAllJobCopy: any = null
                    if (val === undefined) {
                        refAllJobCopy = _.cloneDeep(allJob.current)
                        if (params.job_name) {
                            refAllJobCopy = refAllJobCopy.filter((item: any) => {
                                const name = _.get(item, 'job_name')
                                return name.includes(params.job_name.trim())
                            })
                        }
                    } else {
                        refAllJobCopy = _.cloneDeep(refAllJob)
                        refAllJobCopy = refAllJobCopy.filter((item: any) => String(_.get(item, 'job_id')) === val.trim())
                    }

                    setRefAllJob(refAllJobCopy)
                    setParams({ ...params, job_id: val })
                }}
                placeholder="支持搜索JobID"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.job_id ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => _,
        },
        {
            title: 'Job名称',
            dataIndex: 'job_name',
            width: 265,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => {
                    let refAllJobCopy: any = null
                    if (val === undefined) {
                        refAllJobCopy = _.cloneDeep(allJob.current)
                        if (params.job_id) refAllJobCopy = refAllJobCopy.filter((item: any) => String(_.get(item, 'job_id')) === params.job_id.trim())

                    } else {
                        refAllJobCopy = _.cloneDeep(refAllJob)
                        refAllJobCopy = refAllJobCopy.filter((item: any) => {
                            const name = _.get(item, 'job_name')
                            return name.includes(val.trim())
                        })
                    }
                    setRefAllJob(refAllJobCopy)
                    setParams({ ...params, job_name: val })
                }}
                placeholder="支持搜索Job名称"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.job_name ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => {
                return (
                    <PopoverEllipsis title={row.job_name} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[params.job_name || '']}
                            autoEscape
                            textToHighlight={row && row.job_name}
                        />
                    </PopoverEllipsis>
                )
            }
        },
        {
            title: '创建人',
            width: 140,
            dataIndex: 'create_user',
            ellipsis: true,
        },
    ]

    const onChange = (e: any) => {
        e.stopPropagation();
        const arr = refAllJob.map((val: any) => {
            if (String(val.job_id) === String(e.target.value)) return { ...val, isSelect: true }
            return { ...val, isSelect: false }
        })
        allConf[currentIndex].job_list = arr
        setAllConf(allConf)
        // let num = currentTab.slice(currentTab.length - 1)
        // let cur = num === 0 ? currentIndex : refAllJob.length + currentIndex
        setSelectedRowKeys([e.target.value])
        handleChangeDefaultJob(allConf,currentIndex)
        setPopoverVisible(false)
    }
    const rowSelection = {
        selectedRowKeys,
        preserveSelectedRowKeys: false,
        renderCell: (checked: any, record: any) => {
            return (
                <Radio.Group onChange={onChange} value={selectedRowKeys[0]}>
                    <Radio value={record.job_id} />
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

    const handleSelectJob = (e: any, all: any, num: number, selJob: number, confId: any) => {
        e.stopPropagation();
        setCurrentJobIndex(confId)
        if (!_.isArray(all)) all = []
        const defaultSelKeys: any = [selJob]
        setSelectedRowKeys(defaultSelKeys)
        setRefAllJob(all)
        allJob.current = all
        setCurrentIndex(num) // conf下标
        if (confId === currentJobIndex) setPopoverVisible(!popoverVisible)
        if (confId !== currentJobIndex) setPopoverVisible(true)
    }
    
    return (
        <>
            {Object.values(allConf).map((row: any, index: number) => {
                if (isNaN(tab)) return ''
                let jobList = row.job_list
                let selJob = (jobList[0] && jobList[0]['job_id']) || ''
                jobList.forEach((item: any) => {
                    if (item && item.isSelect) selJob = item.job_id
                })
                if (!selJob || jobList.length === 1) return ''
                return (
                    <div key={index} className={styles.conf_item_box}>
                        <Space>
                            <span>{row.conf_name}</span>
                            <Tag color='#f2f4f6' style={{ color: '#515B6A' }}>{selJob}</Tag>
                            <Popover 
                                placement="right" 
                                title="选择Job" 
                                content={getContent(refAllJob)} 
                                trigger="click" 
                                overlayClassName={styles.popover_job} 
                                visible={currentJobIndex === row.conf_id && popoverVisible}
                            >
                                <SelectJob onClick={(e) => handleSelectJob( e, jobList, index, selJob, row.conf_id)}>
                                    选择Job
                                </SelectJob>
                            </Popover>
                        </Space>
                    </div>
                )
            })}
        </>
    )
}

