import { targetJump } from "@/utils/utils"
import { Row, Space, Typography, Tag, Empty, Skeleton } from "antd"
import React from "react"
import { FullSpace, Whiteboard } from "../styled"
import { useIntl } from "umi"
import styled from "styled-components"

const EmptyBlock = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    .ant-empty-normal {margin: 20px 0;}
`

const NoticeBlock: React.FC<Record<string, any>> = (props) => {
    const { title, path, list = [], firstTagColor, loading } = props

    const intl = useIntl()

    return (
        <Whiteboard
            style={{
                width: 310, overflow: "hidden",
                height: title === "notice" ? 116 : 240,
                display: "flex", alignItems: "start",
                padding: 10
            }}
        >
            <FullSpace direction="vertical">
                <Row justify="space-between" align="middle" style={{ height: 32, width: 290 }}>
                    <Typography.Text
                        style={{
                            fontWeight: 500,
                            fontSize: 16,
                            color: "rgba(0,0,0,.85)"
                        }}
                    >
                        {intl.formatMessage({ id: `pages.anolis_home.${title}` })}
                    </Typography.Text>
                    <Typography.Text
                        style={{
                            fontWeight: 400,
                            color: "rgba(0,0,0,.45)",
                            cursor: "pointer"
                        }}
                        onClick={() => targetJump(path)}
                    >
                        {intl.formatMessage({ id: "pages.home.view.all" })}
                    </Typography.Text>
                </Row>
                <Space style={{ width: 290 }} direction="vertical" size={10}>
                    {
                        list.map((doc: any, index: number) => {
                            const { tags, title: $title, id } = doc
                            return (
                                <Space
                                    key={id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => targetJump(`${path}/${id}`)}
                                >
                                    <Tag
                                        style={{ margin: 0, border: "none" }}
                                        color={index === 0 ? firstTagColor : ''}
                                    >
                                        {intl.formatMessage({ id: `pages.home.${tags}` })}
                                    </Tag>
                                    <Typography.Text
                                        ellipsis={{ tooltip: true }}
                                        style={{ width: "calc(336px - 40px - 40px - 8px)" }}
                                    >
                                        {$title}
                                    </Typography.Text>
                                </Space>
                            )
                        })
                    }
                    {
                        !list.length &&
                        <EmptyBlock >
                            {
                                loading ?
                                    <Skeleton
                                        title={{ width: "100%" }}
                                        paragraph={{ rows: title === "notice" ? 1 : 4, width: "100%" }}
                                        active
                                    /> :
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        style={{ margin: 0, padding: 0 }}
                                        description={intl.formatMessage({ id: `pages.anolis_home.${title}.empty.text` })}
                                    />
                            }
                        </EmptyBlock>
                    }
                </Space>
            </FullSpace>
        </Whiteboard >
    )
}

export default NoticeBlock