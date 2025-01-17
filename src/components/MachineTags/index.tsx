/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Form, Select, Spin, Empty, message, Tag } from 'antd';
import { useParams, useIntl, FormattedMessage } from 'umi';
import { queryTag } from './service'
const { Option } = Select;

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { isQuery, list } = props;
    const { ws_id }: any = useParams()
    const [fetching, setFetching] = useState<boolean>(true)
    const [tagList, setTagList] = useState<any>([])
    const [tagWord, setTagword] = useState<string>()
    const [tagParam, setTagParam] = useState({
        total: 0,
        page_num: 1,
        page_size: 20
    })


    const requestData = async (query: any, option = "concat") => {
        setFetching(true)
        try {
            const res = await queryTag(query)
            if (res.code === 200) {
                if (option === 'concat') {
                    const data = tagList.concat(res.data || [])
                    setTagList(data || [])
                } else if (option === 'reset') {
                    setTagList(res.data || [])
                }
                setTagParam(res);
            } else {
                message.error(res.msg || formatMessage({ id: 'operation.failed' }));
            }
            setFetching(false)
        } catch (err) {
            setFetching(false)
        }
    }


    const getServerTagList = async (word?: string) => {
        const param = word && word.replace(/\s*/g, "")
        if (tagWord && tagWord == param) return
        setTagword(param)
        requestData({ name: param, page_num: 1, page_size: 20, ws_id }, 'reset')
    }

    useEffect(() => {
        if (isQuery === 'edit') {
            requestData({ tag_id_list: list + '', page_num: 1, page_size: 20, ws_id }, 'reset')
        }

        if (isQuery === 'add') {
            getServerTagList()
        }

    }, [isQuery, list])

    const handlePopupScroll = (e: any) => {
        const { page_num, page_size, total, } = tagParam
        const { clientHeight, scrollHeight, scrollTop } = e.target
        if (clientHeight + scrollTop >= scrollHeight && !isNaN(page_num) && Math.ceil(total / page_size) > page_num) {
            requestData({ name: tagWord, page_num: page_num + 1, page_size, ws_id }, 'concat')
        }
    }

    // 过滤后清除重调查询接口
    const handleClear = () => {
        getServerTagList()
    }

    const tagRender = ($props: any) => {
        const { label, closable, onClose } = $props;
        const { color, children } = label.props || {}
        return (
            <Tag color={color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                {children}
            </Tag>
        )
    }

    return (
        <Form.Item
            name="tags"
            label={<FormattedMessage id="device.tag" />}
        >
            <Select
                mode="multiple"
                allowClear
                notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                filterOption={false}
                loading={fetching}
                placeholder={<FormattedMessage id="device.tag.dispatch.tag" />}
                onSearch={getServerTagList}
                style={{ width: '100%' }}
                showArrow={true}
                onClear={handleClear}
                onPopupScroll={handlePopupScroll}
                tagRender={tagRender}
            >
                {
                    tagList.map(
                        (item: any) => (
                            <Option key={item.id} value={item.id}>
                                <Tag color={item.tag_color} key={item.id}>{item.name}</Tag>
                            </Option>
                        )
                    )
                }
            </Select>
        </Form.Item>
    )
}