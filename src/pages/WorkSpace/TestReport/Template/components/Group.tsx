import React, { memo, useRef } from 'react'

import { useRefWidth } from '../hooks'
import { Group, GroupTitle } from '../styled'
import { Space, Typography, Col, Row, Divider } from 'antd'
import { Access } from 'umi'
import { ReactComponent as GroupIcon } from '@/assets/svg/TestReport/TestGroup.svg'
import EditSpan from './EditSpan'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import TestItem from './Term'
import { useProvider } from '../Provider'

const TestGroup: React.FC<any> = ({ dataItem, conf, source, ...rest }) => {
    const { handleFieldChange, hanldeRemoveField, handleGroupAddTestItem, contrl } = useProvider()
    const title = useRef<any>()
    const titleWidth = useRefWidth(title)

    return (
        <Group id={`${dataItem}-${source.rowkey}`}>
            {/* 测试组 */}
            <Col span={24} >
                <GroupTitle justify="space-between" ref={title} >
                    <Access
                        accessible={contrl}
                        fallback={
                            <Space align="center">
                                <GroupIcon style={{ transform: 'translate(0px, 1px)' }} />
                                <Typography.Text strong>{source.name}</Typography.Text>
                            </Space>
                        }
                    >
                        <EditSpan
                            icon={<GroupIcon />}
                            title={source.name}
                            width={titleWidth - 80}
                            rowkey={`${dataItem}-${source.rowkey}`}
                            onOk={(val: any) => handleFieldChange(val, 'name', source.rowkey, dataItem)}
                        />
                        <span onClick={() => hanldeRemoveField(source.rowkey, dataItem)} >
                            <CloseOutlined />
                        </span>
                    </Access>
                </GroupTitle>
            </Col>
            <Col span={24} style={{ padding: 16 }}>
                {
                    source.list.map(
                        (i: any, index: any) => (
                            <TestItem
                                key={index}
                                source={i}
                                {...rest}
                                conf={conf}
                                dataItem={dataItem}
                            />
                        )
                    )
                }
                <Access accessible={contrl}>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row>
                        <span onClick={() => handleGroupAddTestItem(source.rowkey, dataItem)}>
                            <Typography.Link >
                                <Space>
                                    <PlusOutlined />
                                    测试项
                                </Space>
                            </Typography.Link>
                        </span>
                    </Row>
                </Access>
            </Col>
        </Group>
    )
}

export default memo(TestGroup)