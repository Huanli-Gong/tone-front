/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { Button, Select, Space, Tag } from 'antd'

import { tagList as queryTagList } from '@/pages/WorkSpace/TagManage/service'
import { useRequest, Access, useAccess, FormattedMessage, useParams } from 'umi'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { updateJobTags } from '../service'

import JobTagsCreate from './JobTagsCreate'

import styles from './index.less'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'

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


const TagsEditer: React.FC<any> = ({ tags = [], onOk, creator_id, width }) => {
    const { ws_id, id: job_id } = useParams() as any
    const access = useAccess();

    const DEFAULT_LIST_PARAMS = { ws_id, page_num: 1, page_size: 20 }

    const [state, setState] = useState(false)
    const [keys, setKeys] = useState([])
    const [params, setParams] = React.useState(DEFAULT_LIST_PARAMS)
    const [list, setList] = React.useState([])
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
    }, [tags])

    const handleSetTags = () => {
        setState(true)
    }

    const handleSelectChange = (val: any) => {
        setKeys(val)
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

    return (
        <div style={{ width: `calc(100% - ${width}px)` }}>
            {
                !state ?
                    <Space wrap size={4}>
                        <Access
                            accessible={access.WsTourist() && access.WsMemberOperateSelf(creator_id)}
                            fallback={<EditOutlined onClick={() => AccessTootip()} style={editBtn} />}
                        >
                            <EditOutlined onClick={handleSetTags} style={editBtn} />
                        </Access>
                        {
                            tags.length > 0
                                ? tags.map((tag: any) => <Tag style={{ margin: 0 }} color={tag.color} key={tag.id}>{tag.name}</Tag>)
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
                                list.map((tag: any) => ({
                                    value: tag.id,
                                    label: <Tag color={tag.tag_color} >{tag.name}</Tag>
                                }))
                            }
                        />
                        <Space>
                            <Button onClick={handleCancel} size="small"  ><FormattedMessage id="operation.cancel" /></Button>
                            <Button onClick={handleOk} size="small" type="primary"><FormattedMessage id="operation.ok" /></Button>
                        </Space>
                    </Space>
            }
            <JobTagsCreate ref={jobTagsCreateModal} ws_id={ws_id} onOk={refresh} />
        </div>
    )
}

export default TagsEditer