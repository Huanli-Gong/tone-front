/* eslint-disable react-hooks/exhaustive-deps */
import { Select, Form, Tag } from 'antd'
import { queryDispatchTags } from './services';
import { useContext, useEffect, useState } from 'react'
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

    const dispatchRequest = async (page_num = 1) => {
        setFetching(true)
        const { data, code } = await queryDispatchTags({
            ws_id,
            run_mode,
            page_num,
            run_environment: server_type,
            page_size: PAGE_SIZE
        })
        if (code === 200 && data)
            setTagList((p: any) => data.reduce((pre: any, cur: any) => {
                const ids = p.map(({ id }: any) => id)
                if (ids.includes(cur.id)) return pre
                return pre.concat(cur)
            }, []))
        setFetching(false)
    }

    useEffect(() => {
        if (serverObjectType === 'server_tag_id') {
            setTagList([])
            dispatchRequest(1)
            setTagPageNum(1)
        }
    }, [serverObjectType])

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
                message: formatMessage({ id: 'select.suite.server_tag_id.message' })
            }]}
        >
            <Select
                // title={formatMessage({id: 'select.suite.server_tag_id.message'})}
                placeholder={<FormattedMessage id="select.suite.server_tag_id.message" />}
                style={{ width: '100%' }}
                allowClear
                filterOption={(input, option) => (option?.name ?? '').toLowerCase().includes(input.toLowerCase())}
                tagRender={tagRender}
                mode="multiple"
                loading={fetching}
                onPopupScroll={handleTagePopupScroll}
                options={tagList?.map((i: any) => ({
                    value: i.id,
                    label: <Tag color={i.tag_color}>{i.name}</Tag>,
                    name: i.name,
                }))}
            />
        </Form.Item>
    )
}

export default DispathTagSelect