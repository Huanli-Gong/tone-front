import { Radio, Space, Typography, Tag } from 'antd'
import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import ConfigRow from './ConfigRow'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'

const ResultTestType: React.FC<{ dataSource: any, update: any, field: string }> = (props) => {
    const { formatMessage } = useIntl()
    const { dataSource, update, field } = props
    const fieldValue = dataSource[field]
    const onChange: any = ({ target }: any) => update({ [field]: target.value })

    return (
        <ConfigRow title={formatMessage({id: 'devOps.function.test.result.type'}) }>
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
                                    <Typography.Text><FormattedMessage id="devOps.display.execution.results"/></Typography.Text>
                                </Typography.Text>
                                <Space>
                                    <Typography.Text strong><FormattedMessage id="devOps.ownership.status"/>：</Typography.Text>
                                    <Tag color="#81BF84" >Complete</Tag>
                                    <Tag color="#649FF6" >Running</Tag>
                                    <Tag color="#C84C5A" >Fail</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Pending</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Stop</Tag>
                                    <Tag color="#D9D9D9" style={{ color: "#1d1d1d" }} >Skip</Tag>
                                </Space>
                                <Typography.Text>
                                    <Typography.Text strong>type2：</Typography.Text>
                                    <Typography.Text><FormattedMessage id="devOps.display.execution.case.results"/></Typography.Text>
                                </Typography.Text>
                                <Space>
                                    <Typography.Text strong><FormattedMessage id="devOps.ownership.status"/>：</Typography.Text>
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