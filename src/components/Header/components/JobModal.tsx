import React from 'react'
import { Layout, Row, Input, message, Spin, Tag, Col, Typography, Space } from 'antd'
import { switchServerType, switchChineseType } from '@/utils/utils'
import { history } from 'umi'
import styles from './jobModel.less'
import { SearchOutlined, FrownOutlined } from '@ant-design/icons'

import { useHeaderContext } from '../Provider'

const defaultParams = { enable: "True", page_num: 1, page_size: 999 }

const JobTemplateModal: React.FC<Record<string, any>> = (props) => {
    const { ws_id, jobTemplates, templatesRun, templateFetchLoading } = useHeaderContext()

    const dataSourceCopy = props.getData(jobTemplates)

    return (
        <Layout.Content style={{ minWidth: 468, maxWidth: 912, paddingBottom: 8 }} key={props.testType}>
            <Row style={{ paddingLeft: 20, paddingRight: 19, marginBottom: 16 }}>
                <Input
                    autoComplete="off"
                    prefix={<SearchOutlined />}
                    className={styles.job_search_inp}
                    placeholder="搜索模板"
                    onChange={({ target }: any) => templatesRun({ name: target.value, ...defaultParams, ws_id })}
                />
            </Row>
            <Spin spinning={templateFetchLoading}>
                <div
                    style={{ width: 912, maxHeight: 320, overflowX: "hidden", overflowY: "scroll" }}
                >
                    {
                        dataSourceCopy.length > 0 &&
                        dataSourceCopy.map(
                            (item: any) => (
                                <Row
                                    key={item.id}
                                    style={{
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                        cursor: "pointer"
                                    }}
                                    onClick={(): any => {
                                        if (!item.job_type)
                                            return message.error('问题模板，请及时删除')
                                        props.onOk()
                                        history.push(`/ws/${ws_id}/test_job/${item.job_type_id}?template_id=${item.id}`)
                                    }}
                                >
                                    <Col
                                        span={24}
                                        style={{
                                            borderTop: "1px solid rgba(0,0,0,.06)",
                                            paddingTop: 5,
                                            paddingBottom: 5,
                                        }}
                                    >
                                        <Space
                                            style={{ width: "100%" }}
                                            direction="vertical"
                                            size={4}
                                        >
                                            <Typography.Text
                                                style={{
                                                    wordBreak: "break-all",
                                                    color: "rgba(0,0,0,.65)"
                                                }}
                                            >
                                                {item.name}
                                            </Typography.Text>
                                            <Space>
                                                {
                                                    [
                                                        ["server_provider", switchServerType],
                                                        ["test_type", switchChineseType]
                                                    ].map((fields: any) => {
                                                        const [field, func] = fields
                                                        return (
                                                            <Tag
                                                                key={field}
                                                                color="#F2F4F6"
                                                                style={{ color: '#515B6A' }}
                                                            >
                                                                {func(item[field])}
                                                            </Tag>
                                                        )
                                                    })
                                                }
                                            </Space>
                                        </Space>
                                    </Col>
                                </Row>
                            )
                        )
                    }
                </div>
                {
                    dataSourceCopy.length === 0 &&
                    <div style={{ height: 80, lineHeight: '80px', textAlign: 'center', color: 'rgba(0,0,0,.35)' }}>
                        <FrownOutlined style={{ marginRight: 8 }} />暂无模板
                    </div>
                }
            </Spin>
        </Layout.Content>
    )
}

export default JobTemplateModal