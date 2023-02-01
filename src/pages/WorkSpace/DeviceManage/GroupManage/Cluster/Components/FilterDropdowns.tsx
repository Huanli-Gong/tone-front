import React, { useState, useEffect, memo } from 'react'
import { Row, Select, Space, Button, Divider, Tag } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { queryMember } from '@/services/Workspace'
import { queryServerTagList } from '../../services'

export const MembersFilter = memo(
    (props: any) => {
        const [members, setMembers] = useState([])
        const [selectValue, setSelectValue] = useState([])

        const getMemberList = async (name: string = '') => {
            let { data } = await queryMember({ keyword: name, scope: 'aligroup' })
            setMembers(data)
        }

        useEffect(() => {
            getMemberList()
        }, [])

        const handleSearch = () => {
            props.confirm?.()
            props.onOk(selectValue)
        }

        return (
            <Row style={{ padding: 8, width: 170 }}>
                <div style={{ width: '100%' }}>
                    <Select
                        style={{ width: '100%' }}
                        onSearch={getMemberList}
                        size="small"
                        mode="multiple"
                        value={selectValue}
                        onChange={val => setSelectValue(val)}
                    >
                        {
                            members.map(
                                (item: any) => (
                                    <Select.Option key={item.id} value={item.id} >{item.last_name}</Select.Option>
                                )
                            )
                        }
                    </Select>
                </div>
                <Divider style={{ margin: '5px 0' }} />
                <Space>
                    <Button size="small" type="link" style={{ width: 75 }} onClick={handleSearch}><FormattedMessage id="operation.search"/></Button>
                    <Button size="small" type="link" style={{ width: 75 }} onClick={() => setSelectValue([])}><FormattedMessage id="operation.reset"/></Button>
                </Space>
            </Row>
        )
    }
)

export const ServerTagsFilter = memo(
    (props: any) => {

        const { ws_id } = props
        const [tags, setTags] = useState([])
        const [tagsValue, setTagsValue] = useState([])

        const getTagList = async () => {
            let { data } = await queryServerTagList({ ws_id, page_size: 500 }) //{ run_environment : "aligroup",run_mode : "cluster" }
            setTags(data)
        }

        useEffect(() => {
            getTagList()
        }, [])

        const handleSearch = () => {
            props.confirm?.()
            props.onOk(tagsValue)
        }

        return (
            <Row style={{ padding: 8, width: 170 }}>
                <div style={{ width: '100%' }}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        value={tagsValue}
                        onChange={val => setTagsValue(val)}
                    >
                        {
                            tags.map(
                                (item: any) => (
                                    <Select.Option key={item.id} value={item.id}>
                                        <Tag color={item.tag_color} >{item.name}</Tag>
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                </div>
                <Divider style={{ margin: '5px 0' }} />
                <Space>
                    <Button size="small" type="link" style={{ width: 75 }} onClick={handleSearch}><FormattedMessage id="operation.search"/></Button>
                    <Button size="small" style={{ width: 75 }} onClick={() => setTagsValue([])}><FormattedMessage id="operation.reset"/></Button>
                </Space>
            </Row>
        )
    }
) 