/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import { useState, useEffect } from 'react';
import { Popover, Table, Radio } from 'antd';
import styles from './index.less'
import { FilterFilled } from '@ant-design/icons';
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import _ from 'lodash'
import styled from 'styled-components'
import { useIntl } from "umi"
import { ColumnEllipsisText } from '@/components/ColumnComponents';
const SelectJob = styled.span`
    color: #1890FF;
    
`
const styleObj = {
    container: 210,
    button_width: 105
}
export default (props: any) => {
    let { jobList } = props
    const { formatMessage } = useIntl()
    if (!_.isArray(jobList)) jobList = []
    const defaultSelKeys = jobList.length ? [jobList[0].id] : []
    const [visiblePopover, setVisiblePopover] = useState(false);
    // const { current, currentIndex } = props
    const page_default_params: any = { id: '', name: '' }
    const [autoFocus, setFocus] = useState(true)
    const [refAllJob, setRefAllJob] = useState(jobList)
    const [params, setParams] = useState(page_default_params)
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>(defaultSelKeys)
    const fn = () => {
        setVisiblePopover(false)
    }
    useEffect(() => {
        window.addEventListener('click', fn, false)
        // window.addEventListener('click',fn,true)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            window.removeEventListener('click', fn, false)
        }
    }, []);
    // const handleAddJob = (e: any) => {
    //     e.stopPropagation();
    //     setVisiblePopover(!visiblePopover)
    //     props.handleAddJob(current, currentIndex)
    // }
    // const handleAddGroupItem = (e: any,type) => {
    //     e.stopPropagation();
    //     setVisiblePopover(false)
    //     props.handleAddGroupItem({...current,type}, currentIndex)
    // }
    const columns = [
        {
            title: 'JobID',
            dataIndex: 'id',
            width: 100,
            ellipsis: true,
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                onConfirm={(val: any) => {
                    let refAllJobCopy = _.cloneDeep(refAllJob)
                    refAllJobCopy = refAllJobCopy.filter((item: any) => _.get(item, 'id') === val)
                    setRefAllJob(refAllJobCopy)
                    setParams({ ...params, id: val })
                }}
                placeholder="支持搜索JobID"
            />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.id ? '#1890ff' : undefined }} />,
            render: (_: any, row: any) => _,
        },
        {
            title: 'Job名称',
            dataIndex: 'name',
            width: 268,
            ellipsis: {
                shwoTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => {
                    let refAllJobCopy = _.cloneDeep(refAllJob)
                    refAllJobCopy = refAllJobCopy.filter((item: any) => {
                        const name = _.get(item, 'name')
                        return name.includes(val)
                    })
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
                    <ColumnEllipsisText ellipsis={{ tooltip: row.name }} >
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[params.name || '']}
                            autoEscape
                            textToHighlight={row && row.name}
                        />
                    </ColumnEllipsisText>
                )
            }
        },
        {
            title: '创建人',
            width: 100,
            dataIndex: 'creator_name'
        },
    ]
    const onChange = (e: any) => {
        e.stopPropagation();
        setSelectedRowKeys([e.target.value])
    }

    const rowSelection = {
        selectedRowKeys,
        // onSelect: selectedChange,
        preserveSelectedRowKeys: false,
        /* @ts-ignore */
        renderCell: (checked, record) => {
            return (
                <Radio.Group onChange={onChange} value={selectedRowKeys[0]}>
                    <Radio value={record.id} />
                </Radio.Group>
            )
        },
        hideSelectAll: true
    };
    const getContent = (jobList: any) => {
        return (
            <div className={styles.selectJobBox}>
                <Table
                    rowSelection={rowSelection}
                    size="small"
                    rowKey="id"
                    columns={columns as any}
                    dataSource={jobList}
                    pagination={false}
                />
            </div>
        );
    }
    const handleSelectJob = (e: any) => {
        e.stopPropagation();
        setVisiblePopover(!visiblePopover)
    }

    return (
        <Popover
            title={
                formatMessage({ id: "analysis.select.job" })
            }
            trigger="click"
            placement='right'
            content={getContent(refAllJob)}
            overlayClassName={styles.popover_group}
            visible={visiblePopover}
        >
            {/* <div style={{ cursor: 'pointer', marginBottom: 0 }} onClick={handleAddJob} className={styles.create_job_type}>
                添加job <CaretDownOutlined style={{ fontSize: 10 }} />
            </div> */}
            <SelectJob onClick={handleSelectJob}>
                {formatMessage({ id: "analysis.select.job" })}
            </SelectJob>
        </Popover>
    )
}
