import React from "react"
import { Space, Row, Typography, Button } from "antd"
import { UpOutlined, DownOutlined } from "@ant-design/icons"
import styled from "styled-components"
import type { ButtonProps } from "antd/es/button"
import { FormattedMessage } from 'umi'

type StyledProps = {
    width?: string;
    expanded?: boolean
}

const DomainList = styled.div<StyledProps>`
    width: 100%;
    ${({ expanded }) => !expanded ? "height: 32px; overflow: hidden;" : ""}
`

type IProps = {
    onChange?: (name: string) => void;
    dataSource?: [];
    active?: any
}

const DomainExpaned: React.FC<IProps> = (props) => {
    const { dataSource, onChange, active } = props
    const lyRef = React.useRef(null)

    const listRef = React.useRef(null)

    const [expanded, setExpanded] = React.useState(false)

    const [isEllipsis, setIsEllipsis] = React.useState(false)

    const oberverCallback = React.useCallback(
        (entries: IntersectionObserverEntry[]) => {
            for (let en = 0, l = entries.length; en < l; en++) {
                const ctx = entries[en]
                if (ctx.intersectionRatio === 0)
                    return setIsEllipsis(true)
            }
        },
        []
    )

    React.useEffect(() => {
        const oberver = new IntersectionObserver(oberverCallback, { root: listRef.current })
        if (listRef.current) {
            const { childNodes }: any = listRef.current
            childNodes.forEach((node: Element) => oberver.observe(node))
        }
        return () => {
            oberver.disconnect()
        }
    }, [])

    return (
        <Row style={{ display: 'flex', flexFlow: 'row nowrap' }}>
            <div ref={lyRef} ><Typography.Text strong><FormattedMessage id="select.suite.domain" /></Typography.Text></div>
            <div style={{ flex: 1 }}>
                <DomainList
                    expanded={expanded}
                    ref={listRef}
                >
                    {
                        [{ name: "", id: "" }].concat(dataSource || [])
                            .map((i: any) => {
                                const buttonProps: ButtonProps = {
                                    onClick() {
                                        onChange?.(i.name === "全部" ? "" : i.name)
                                    },
                                    size: "small",
                                    style: {
                                        marginBottom: 8,
                                        marginRight: 8,
                                        border: "none",
                                        boxShadow: "none",
                                        transition: "none"
                                    },
                                    type: active === i.name ? "primary" : "ghost"
                                }

                                return (
                                    <Button
                                        key={i.id}
                                        {...buttonProps}
                                    >
                                        {i.name || <FormattedMessage id="all" />}
                                    </Button>
                                )
                            })
                    }
                </DomainList>
            </div>
            {
                isEllipsis &&
                <Typography.Link style={{ userSelect: "none" }}>
                    {
                        expanded ?
                            <Space style={{ cursor: "pointer" }} onClick={() => setExpanded(false)}>
                                <UpOutlined />
                                <Typography.Link><FormattedMessage id="operation.collapse" /></Typography.Link>
                            </Space> :
                            <Space style={{ cursor: "pointer" }} onClick={() => setExpanded(true)}>
                                <DownOutlined />
                                <Typography.Link><FormattedMessage id="operation.expand" /></Typography.Link>
                            </Space>
                    }
                </Typography.Link>
            }
        </Row>
    )
}

export default DomainExpaned