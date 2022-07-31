import React, { useState, useEffect } from 'react'
import { Popover, Table, Typography, Button, TableColumnProps } from 'antd'
import styles from './index.less'
import { Scrollbars } from 'react-custom-scrollbars';
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import Highlighter from 'react-highlight-words'
import SearchInput from '@/components/Public/SearchInput'
import SelectUser from '@/components/Public/SelectUser'
import { FilterFilled, CaretDownOutlined } from '@ant-design/icons';
import { history, useModel, Access, useAccess, useParams } from 'umi'
import _ from 'lodash'

const styleObj = {
    container: 245,
    button_width: 122
}

export default (props: any) => {
    const { ws_id } = useParams() as any
    const { initialState } = useModel('@@initialState');
    const { dreType, jobInfo, origin, buttonStyle = {}, title } = props
    const viewAllReport = jobInfo && jobInfo.report_li
    const page_default_params: any = { name: '', creator_name: '' }

    const [autoFocus, setFocus] = useState(true)
    const [params, setParams] = useState(page_default_params)
    const [jobRefReport, setJobRefAllReport] = useState([])
    const [visible, setVisible] = useState(false)

    const handleMemberFilter = (val: [], name: string) => {
        let searchVal: any = val || ''
        if (_.isArray(searchVal)) searchVal = searchVal.join(',')
        const obj = {}
        obj[name] = searchVal;

        let refAllJobCopy = _.cloneDeep(viewAllReport)
        if (searchVal === '') {
            refAllJobCopy = nameFilterFn(params.name || '', refAllJobCopy)
        } else {
            refAllJobCopy = nameFilterFn(params.name || '', refAllJobCopy)
            refAllJobCopy = creatorFilterFn(searchVal, refAllJobCopy)
        }
        setJobRefAllReport(refAllJobCopy)
        setParams({ ...params, ...obj })
    }
    const creatorFilterFn = (creatorVal: string, arr: any[]) => {
        let refAllJobCopy = _.cloneDeep(arr)
        if (creatorVal) {
            refAllJobCopy = refAllJobCopy.filter((item: any) => {
                const arr = creatorVal.split(',').map((val: any) => val && val.trim())
                const creator = _.get(item, 'creator')
                return arr.includes(String(creator))
            })
        }
        return refAllJobCopy
    }
    const nameFilterFn = (nameVal: string, arr: any[]) => {
        let refAllJobCopy = _.cloneDeep(arr)
        if (nameVal) {
            refAllJobCopy = refAllJobCopy.filter((item: any) => {
                const name = _.get(item, 'name')
                return name.includes(nameVal.trim())
            })
        }
        return refAllJobCopy
    }
    const columns: TableColumnProps<any>[] = [
        {
            dataIndex: 'name',
            title: '报告名称',
            width: 165,
            ellipsis: {
                showTitle: false,
            },
            filterDropdown: ({ confirm }: any) => <SearchInput
                confirm={confirm}
                autoFocus={autoFocus}
                styleObj={styleObj}
                onConfirm={(val: any) => {
                    let refAllJobCopy = _.cloneDeep(viewAllReport)
                    if (val === undefined) {
                        refAllJobCopy = creatorFilterFn(params.creator_name || '', refAllJobCopy)
                    } else {
                        refAllJobCopy = creatorFilterFn(params.creator_name || '', refAllJobCopy)
                        refAllJobCopy = nameFilterFn(val, refAllJobCopy)
                    }
                    setJobRefAllReport(refAllJobCopy)
                    setParams({ ...params, name: val })
                }}
                placeholder="支持搜索报告名称"
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
                            textToHighlight={row && row.name || '-'}
                            onClick={() => window.open(`/ws/${ws_id}/test_report/${row.id}`)}
                        />
                    </PopoverEllipsis>
                )
            }
        },
        {
            dataIndex: 'creator_name',
            width: 100,
            title: '创建人',
            filterDropdown: ({ confirm }: any) => <SelectUser autoFocus={autoFocus} confirm={confirm} onConfirm={(val: []) => handleMemberFilter(val, 'creator_name')} page_size={20} />,
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus)
                }
            },
            filterIcon: () => <FilterFilled style={{ color: params.creator_name ? '#1890ff' : undefined }} />,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        },
        {
            dataIndex: 'gmt_created',
            title: '保存时间',
            width: 200,
            render: (_: any) => <PopoverEllipsis title={_ || '-'} />
        }
    ]
    const handleEdit = async (id: any, name: string) => {
        window.open(`/ws/${ws_id}/test_report/${id}`)

    }
    const handleViewReport = (e: any, all: any) => {
        e.stopPropagation()
        if (!_.isArray(all)) all = []
        if (all.length === 1) {
            handleEdit(all[0].id, 'detail')
            return
        }
        setVisible(!visible)
        setJobRefAllReport(all)
    }
    const handleClick = (e: any) => {
        e.stopPropagation()
        setVisible(true)
    }
    const windowClick = (e: any) => {
        setVisible(false)
    }
    useEffect(() => {
        window.addEventListener('click', windowClick)
        return () => {
            window.removeEventListener('click', windowClick)
        }
    }, [])
    const getContent = (data: any) => {
        return (
            <div onClick={handleClick}>
                <Scrollbars style={{ height: 244 }}>
                    <Table
                        size="small"
                        rowKey="id"
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        rowClassName={styles.row_table}
                    />
                </Scrollbars>
            </div>
        );
    }
    const isFlag = _.get(jobInfo, 'report_li') && jobInfo.report_li.length
    return (
        <div className={styles.conf_item_box} key={isFlag}>
            <Popover placement={dreType} title="查看报告" content={getContent(jobRefReport)} trigger="click" overlayClassName={styles.popover_job} visible={visible}>
                {
                    origin === 'jobList' ? <Typography.Text style={{ color: '#1890FF', cursor: 'pointer', display: isFlag ? 'inlineBlock' : 'none' }}>
                        <span onClick={_.partial(handleViewReport, _, jobInfo && jobInfo.report_li)}>{title || '查看报告'}<CaretDownOutlined style={{ display: isFlag > 1 ? 'inline-block' : 'none' }} />
                        </span>
                    </Typography.Text> :
                        <Button type="primary"
                            onClick={_.partial(handleViewReport, _, jobInfo && jobInfo.report_li)}
                            style={{ marginRight: 8, display: isFlag ? 'inlineBlock' : 'none', ...buttonStyle }}>
                            {title || '查看报告'}<CaretDownOutlined style={{ display: isFlag > 1 ? 'inline-block' : 'none' }} />
                        </Button>
                }
            </Popover>
        </div>
    )
}
