import React from 'react';
import { Form, Select, Spin, Empty } from 'antd';
import { useRequest } from 'umi'
import { member } from './service'

export default () => {
    const { data: user, loading: fetchLoading, run: fetchUserRunner } = useRequest(
        (keyword = '') => member({ keyword, scope: 'aligroup', page_num:1, page_size:200 }),
        {
            initialData: [],
            debounceInterval: 300,
        }
    )
    const handleSearch = async (word: any = '') => {
        fetchUserRunner(word)
    }
    return (
        <Form.Item
            name="emp_id"
            label="Owner"
            rules={[{ required: true, message: '请选择' }]}
        >
            <Select
                allowClear
                notFoundContent={
                    fetchLoading ?
                        <Spin size="small" /> :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                placeholder="请选择Owner"
                filterOption={false}
                onSearch={handleSearch}
                style={{ width: '100%' }}
                showArrow={false}
                showSearch
            >
                {
                    user?.map((item: any, index: number) => {
                        return (
                            <Select.Option
                                value={item.emp_id}
                                key={index}
                            >
                                {item.first_name === "" ? item.last_name : item.first_name}
                            </Select.Option>
                        )
                    })
                }
            </Select>
        </Form.Item>
    )
}