/* eslint-disable react/no-array-index-key */
import React, { useRef } from 'react'

import { useRefWidth } from '../hooks'
import { Term, TermTitle, Suite, SuiteTitle, Case } from '../styled'
import { Space, Typography, Col, Row, Button } from 'antd'
import { Access, FormattedMessage } from 'umi'
import EditSpan from './EditSpan'
import { CloseOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { ReactComponent as TermIcon } from '@/assets/svg/TestReport/TestItem.svg'
import { useProvider } from '../Provider'

const TestTerm: React.FC<Record<string, any>> = ({ source, dataItem }) => {
    const { handleFieldChange, hanldeRemoveField, handleRemoveSuiteField, hanldeChangeSuiteName, suiteSelectRef, contrl } = useProvider()
    const title = useRef<any>()

    const titleWidth = useRefWidth(title)

    return (
        <Term id={`${dataItem}-${source.rowkey}`} >
            <TermTitle span={24} ref={title}>
                <Row justify="space-between" >
                    <Access
                        accessible={contrl}
                        fallback={
                            <Space align="center">
                                <TermIcon style={{ transform: 'translate(0px, 2px)' }} />
                                <Typography.Text strong style={{ width: titleWidth - 80, display: 'inline-block' }}>{source.name}</Typography.Text>
                            </Space>
                        }
                    >
                        <EditSpan
                            {...source}
                            icon={<TermIcon style={{ transform: 'translate(0px, 2px)' }} />}
                            key={source.rowkey}
                            title={source.name}
                            width={titleWidth - 80}
                            onOk={(val: any) => handleFieldChange(val, 'name', source.rowkey, dataItem)}
                        />
                        <span onClick={() => hanldeRemoveField(source.rowkey, dataItem)} >
                            <CloseOutlined />
                        </span>
                    </Access>
                </Row>
            </TermTitle>
            <Col span={24} style={{ padding: '10px 16px 16px' }}>
                <Access accessible={contrl}>
                    <Row>
                        <Button
                            type="primary"
                            ghost
                            onClick={() => suiteSelectRef.current.show(source, source.rowkey, dataItem)}
                        >
                            <FormattedMessage id="report.select.case" />
                        </Button>
                    </Row>
                </Access>
                <Row>
                    {
                        source.list.map(
                            (item: any) => (
                                <Suite span={24} key={item.rowkey}>
                                    <SuiteTitle justify="space-between" >
                                        <Access accessible={contrl} fallback={<span>{item.suite_show_name}</span>}>
                                            <EditSpan
                                                {...item}
                                                title={item.suite_show_name}
                                                key={item.rowkey}
                                                width={titleWidth - 100}
                                                onOk={(val: any) => hanldeChangeSuiteName(item.test_suite_id, dataItem, source.rowkey, val)}
                                            />
                                            <MinusCircleOutlined
                                                onClick={() => handleRemoveSuiteField(item, dataItem, true)}
                                            />
                                        </Access>
                                    </SuiteTitle>
                                    <Row>
                                        {
                                            item.case_source?.map(
                                                (i: any, idx: any) => (
                                                    <Case
                                                        key={idx}
                                                        span={24}
                                                        len={item.case_source.length - 1}
                                                        idx={idx}
                                                    >
                                                        <Row justify="space-between" align="middle">
                                                            <Typography.Text>{i.test_conf_name}</Typography.Text>
                                                            <Access accessible={contrl}>
                                                                <MinusCircleOutlined
                                                                    onClick={() => handleRemoveSuiteField(i, dataItem, false)}
                                                                />
                                                            </Access>
                                                        </Row>
                                                    </Case>
                                                )
                                            )
                                        }
                                    </Row>
                                </Suite>
                            )
                        )
                    }
                </Row>
            </Col>
        </Term >
    )
}

export default TestTerm