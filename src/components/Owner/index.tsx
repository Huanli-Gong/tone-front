import React from 'react';
import { Form, Select, Spin, Empty } from 'antd';
import { useRequest, useParams, useIntl } from 'umi'
import { member } from './service'

const Owner: React.FC = () => {
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams();
    const { data: user, loading: fetchLoading, run: fetchUserRunner } = useRequest(
        (keyword = '') => member({ keyword, scope: 'aligroup', ws_id, page_num: 1, page_size: 500 }),
        {
            debounceInterval: 300,
        }
    )

    const handleSearch = async (word: any = '') => {
        fetchUserRunner(word)
    }

    if (!user)
        return (
            <Form.Item
                label="Owner"
                rules={[{ required: true, message: '请选择' }]}
            >
                <Select
                    placeholder="请选择Owner"
                />
            </Form.Item>
        )
    return (
        <Form.Item
            name="emp_id"
            label="Owner"
            rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
        >
            <Select
                allowClear
                notFoundContent={
                    fetchLoading ?
                        <Spin size="small" /> :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                placeholder={formatMessage({ id: 'select.owner' })}
                filterOption={false}
                onSearch={handleSearch}
                style={{ width: '100%' }}
                showArrow={true}
                showSearch
                listHeight={160}
                getPopupContainer={node => node.parentNode}
            >
                {
                    user?.map((item: any, index: number) => {
                        return (
                            <Select.Option
                                value={item.emp_id}
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                            >
                                {item.last_name}({item.first_name === "" ? item.last_name : item.first_name}){!BUILD_APP_ENV && ` - ${item.emp_id}`}
                            </Select.Option>
                        )
                    })
                }
            </Select>
        </Form.Item>
    )
}

export default Owner