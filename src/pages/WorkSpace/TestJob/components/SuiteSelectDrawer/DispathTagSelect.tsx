import { Select, Form, Tag } from 'antd'
import { queryDispatchTags } from './services';
import React, { useContext, useEffect, useState } from 'react'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import { DrawerProvider } from './Provider'
import { useParams, useIntl, FormattedMessage } from 'umi'
import { tagRender } from '../untils'

const DispathTagSelect = (props: any) => {
    const { formatMessage } = useIntl()
    const { run_mode, server_type, serverObjectType, tagList } = props

    const { ws_id } = useParams<any>()
    const { setTagList } = useContext<any>(DrawerProvider)

    const PAGE_SIZE = 100

    const [tagPageNum, setTagPageNum] = useState(1)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (serverObjectType === 'server_tag_id') {
            setTagList([])
            dispatchRequest(1)
            setTagPageNum(1)
        }
    }, [serverObjectType])

    const dispatchRequest = async (page_num = 1) => {
        setFetching(true)
        const { data, code } = await queryDispatchTags({
            ws_id,
            run_mode,
            page_num,
            run_environment: server_type,
            page_size: PAGE_SIZE
        })
        if (code === 200 && data) setTagList(tagList.concat(data))
        setFetching(false)
    }

    const handleTagePopupScroll = ({ target }: any) => { //tag
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            const num = tagPageNum + 1
            setTagPageNum(num)
            dispatchRequest(num)
        }
    }

    return (
        <Form.Item
            name="server_tag_id" 
            rules={[{ 
                required: true, 
                message: formatMessage({id: 'select.suite.server_tag_id.message'})
            }]}
        >
            <Select
                title={formatMessage({id: 'select.suite.server_tag_id.message'})}
                placeholder={<FormattedMessage id="select.suite.server_tag_id.message" />}
                style={{ width: '100%' }}
                allowClear
                filterOption={false}
                tagRender={tagRender}
                mode="multiple"
                loading={fetching}
                onPopupScroll={handleTagePopupScroll}
            >
                {
                    tagList.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                            <Tag color={item.tag_color}>{item.name}</Tag>
                        </Select.Option>
                    ))
                }
            </Select>
        </Form.Item>
    )
}

export default DispathTagSelect