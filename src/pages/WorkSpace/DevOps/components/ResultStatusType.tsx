import { Radio, Space, Typography, Tag } from 'antd'
import React from 'react'
import ConfigRow from './ConfigRow'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'

const ResultTestType: React.FC<{ dataSource: any, update: any, field: string }> = (props) => {
    const { dataSource, update, field } = props
    const fieldValue = dataSource[field]
    const onChange: any = ({ target }: any) => update({ [field]: target.value })

    return (
        <ConfigRow title={'功能测试结果类型'} >
            <Radio.Group
                defaultValue={fieldValue}
                onChange={onChange}
                value={fieldValue}
            >
                <Radio value={'1'}>
                    type1
                </Radio>
                <Radio value={'2'}>
                    <QusetionIconTootip
                        title="type2"
                        desc={
                            <Space direction="vertical">
                                <Typography.Text>
                                    <Typography.Text strong>type1：</Typography.Text>
                                    <Typography.Text>按照执行结果为依据展示</Typography.Text>
                                </Typography.Text>
                                <Space>
                                    <Typography.Text strong>拥有状态：</Typography.Text>
                                    <Tag color="#81BF84" >Complete</Tag>
                                    <Tag color="#649FF6" >Running</Tag>
                                    <Tag color="#C84C5A" >Fail</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Pending</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Stop</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Skip</Tag>
                                </Space>
                                <Typography.Text>
                                    <Typography.Text strong>type2：</Typography.Text>
                                    <Typography.Text>按照case结果为依据展示</Typography.Text>
                                </Typography.Text>
                                <Space>
                                    <Typography.Text strong>拥有状态：</Typography.Text>
                                    <Tag color="#81BF84" >Pass</Tag>
                                    <Tag color="#649FF6" >Running</Tag>
                                    <Tag color="#C84C5A" >Fail</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Pending</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Stop</Tag>
                                </Space>
                            </Space>
                        }
                    />
                </Radio>
            </Radio.Group>
        </ConfigRow>
    )
}

export default ResultTestType