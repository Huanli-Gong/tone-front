/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { Button, Empty, Select, Space, Spin, Tag, Popconfirm, Tooltip } from 'antd'
import moment from "moment"
import { tagList as queryTagList } from '@/pages/WorkSpace/TagManage/service'
import { useRequest, Access, useAccess, useIntl, FormattedMessage, useParams } from 'umi'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { updateJobTags } from '../service'

import JobTagsCreate from './JobTagsCreate'

import styles from './index.less'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'

import lodash from 'lodash'

export const tagRender = ({ label, closable, onClose, value }: any) => (
    <Tag
        color={label.props?.color}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
    >
        {label.props?.children || value}
    </Tag>
)

const editBtn = {
    paddingTop: 5,
    paddingRight: 8
}

// 任务标签清理时间间隔
const tag_catch = [
    {id: 'keep_three_months', name: '保留三个月'},
    {id: 'keep_six_months', name: '保留六个月'},
    {id: 'keep_one_year', name: '保留一年'},
]
const tag_catch_name = tag_catch.map((key)=> key.id)

const TagsEditer: React.FC<any> = ({ tags = [], onOk, creator_id, width }) => {
    const { ws_id, id: job_id, share_id } = useParams() as any
    const isSharePage = !!share_id
    const access = useAccess();
    const { formatMessage } = useIntl()

    const DEFAULT_LIST_PARAMS = { ws_id, page_num: 1, page_size: 100 }

    const [state, setState] = useState(false)
    const [keys, setKeys] = useState([])
    const [params, setParams] = React.useState<any>(DEFAULT_LIST_PARAMS)
    const [list, setList] = React.useState([])
    const [selectedTag, setSelectedTag] = useState([]);
    const jobTagsCreateModal: any = useRef(null)

    const { data: tagList, loading, refresh } = useRequest(
        () => queryTagList(params),
        { initialData: [], formatResult: (response: any) => response, refreshDeps: [params], ready: state }
    )

    const handleCancel = () => {
        setState(false)
    }

    React.useEffect(() => {
        return () => {
            if (!state) {
                setList([])
                setParams(DEFAULT_LIST_PARAMS)
            }
        }
    }, [state])

    const handleOk = async () => {
        const { code, msg } = await updateJobTags({ job_id, tag_id: keys, ws_id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return;
        }
        onOk()
        handleCancel()
    }

    React.useEffect(() => {
        if (tagList?.data) {
            setList((p: any) => p.concat(tagList?.data))
        }
    }, [tagList])

    useEffect(() => {
        setKeys(tags.map((i: any) => i.id))
        const tempList = tags?.map((item: any)=> ({value: item.id, label: item.name})) || []
        setSelectedTag(tempList)
    }, [tags])

    const handleSetTags = () => {
        setState(true)
    }

    const handleSelectChange = (val: any, option: any) => {
        setKeys(val)
        const tempList = option?.map((item: any)=> ({value: item.value, label: item.label.props.children})) || []
        setSelectedTag(tempList)
    }

    const newLabel = () => {
        jobTagsCreateModal.current?.show()
    }

    const handleTagePopupScroll = ({ target }: any) => { //tag
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            const totalPage = params.page_num + 1
            if (totalPage <= tagList?.total_page)
                setParams((p: any) => ({ ...p, page_num: p.page_num + 1 }))
        }
    }

    // 已选中标签中包含的time标签
    const timeTagList: any = selectedTag.filter((x: any) => tag_catch_name.indexOf(x.label) > -1 )

    return (
        <div style={{ width: `calc(100% - ${width}px)` }}>
            {
                !state ?
                    <Space wrap size={4}>
                        {
                            !isSharePage &&
                            <Access
                                accessible={access.WsTourist() && access.WsMemberOperateSelf(creator_id)}
                                fallback={<EditOutlined onClick={() => AccessTootip()} style={editBtn} />}
                            >
                                <EditOutlined onClick={handleSetTags} style={editBtn} />
                            </Access>
                        }

                        {
                            tags.length > 0
                                ? tags.map((tag: any) => {
                                    return <Tooltip title={tag.time_keep_to? (
                                        moment(tag.time_keep_to).unix() > moment().unix() ?
                                            formatMessage({id: 'ws.result.details.delete.tag'}, {data: tag.time_keep_to})
                                            : formatMessage({id: 'ws.result.details.deleted.today'})
                                        )
                                        : null}
                                    >
                                        <Tag style={{ margin: 0 }} color={tag.color} key={tag.id}>{tag.name}</Tag>
                                    </Tooltip>
                                })
                                : <span style={{ color: 'rgba(0,0,0,0.85)' }}>-</span>
                        }
                    </Space> :
                    <Space size={8}>
                        <Select
                            mode="multiple"
                            value={keys}
                            loading={loading}
                            size="small"
                            style={{ width: 600 }}
                            tagRender={tagRender}
                            onChange={handleSelectChange}
                            allowClear
                            onPopupScroll={handleTagePopupScroll}
                            getPopupContainer={node => node.parentNode}
                            onSearch={lodash.debounce((name) => {
                                setList([])
                                setParams({ ...DEFAULT_LIST_PARAMS, name })
                            }, 300)}
                            filterOption={false}
                            defaultActiveFirstOption={false}
                            notFoundContent={
                                loading ? <Spin /> :
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                            dropdownRender={menu => (
                                <div>
                                    {menu}
                                    {
                                        access.WsMemberOperateSelf() &&
                                        <div style={{ maxHeight: 300, overflow: 'auto', padding: '10px', borderTop: '1px solid #eee', marginBottom: '-4px' }} onClick={newLabel}>
                                            <span className={styles.test_summary_job}><PlusOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                                <FormattedMessage id="ws.result.details.new.tag" />
                                            </span>
                                        </div>
                                    }
                                </div>
                            )}
                            options={
                                list.map((tag: any) => {
                                    // 判断：时间标签选项已有选时，则其他时间项不能再选
                                    const intersect: any = selectedTag.filter((x: any) => tag_catch_name.indexOf(x.label) > -1 );
                                    const disabled = tag_catch_name.includes(tag.name)? (intersect.length? (tag.name !== intersect[0].label): false): false
                                    const text = disabled? <span style={{color:'#bfbfbf'}}>{tag.name}</span>: tag.name
                                    return ({
                                        value: tag.id,
                                        label: <Tag color={tag.tag_color} >{text}</Tag>,
                                        disabled,
                                    })
                                })
                            }
                        />
                        <Space>
                            <Button onClick={handleCancel} size="small"  ><FormattedMessage id="operation.cancel" /></Button>
                            {/** 有时间的系统标签时，二次弹框确认； */}
                            {timeTagList.length ?
                                <Popconfirm
                                    title={
                                        formatMessage({ id: 'ws.result.details.keep.time.job.tag' }, { data: timeTagList[0].label }) 
                                    }
                                    onConfirm={handleOk}
                                    okText={<FormattedMessage id="operation.ok" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                    placement="topRight"
                                >
                                    <Button size="small" type="primary"><FormattedMessage id="operation.ok" /></Button>
                                </Popconfirm>
                                :
                                <Button onClick={handleOk} size="small" type="primary"><FormattedMessage id="operation.ok" /></Button>
                            }
                        </Space>
                    </Space>
            }
            <JobTagsCreate ref={jobTagsCreateModal} ws_id={ws_id} onOk={refresh} />
        </div>
    )
}

export default TagsEditer