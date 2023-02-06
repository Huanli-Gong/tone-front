import React from "react"
import styled from "styled-components"
import { Row, Col, Typography, Dropdown, Menu } from "antd"
import { useIntl, Access, useAccess } from "umi"
import { useSize } from "ahooks"
import { MoreOutlined } from "@ant-design/icons"
import BaseTable from "./SuiteTable"

const ContentCls = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
`

const Nav = styled(Row)`
    width: 100%;
    height: 74px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 15px;
    border-top: 1px solid rgba(0,0,0,.06);
    border-bottom: 1px solid rgba(0,0,0,.06);
    position: relative;
`

const Title = styled.span`
    display: inline-flex;
    font-size: 14px;
    color: rgba(0,0,0,.85);
    font-weight: 600;
    &::after{
        content: "：";
    }
`

const Text = styled(Typography.Text)`
    display: inline-block;
`

const ListBody = styled.div`
    width: 100%;
    height: calc(100% - 74px - 16px);
`

type NavIProps = {
    text?: string;
    title?: string;
    span?: number;
}

const NavItem: React.FC<NavIProps> = ({ text, title, span }): JSX.Element => {
    const ref = React.useRef<any>(null)
    const { width } = useSize(ref)

    return (
        <Col span={span}>
            <Title ref={ref}>
                {title}
            </Title>
            <Text style={{ width: `calc(100% - ${width}px)` }} ellipsis={{ tooltip: true }}>
                {text || "-"}
            </Text>
        </Col>
    )
}

type IProps = {
    current?: Workspace.BaselineItem;
    data?: Workspace.BaselineItem[];
    editRef?: any;
    refresh?: () => void;
    test_type?: string;
}

const RightContent: React.FC<IProps> = (props) => {
    const { current, data, editRef } = props
    const intl = useIntl()
    const access = useAccess()

    const hanldeEdit = () => {
        editRef.current?.show(current)
    }

    return (
        <ContentCls>
            <Nav>
                {
                    [
                        [
                            intl.formatMessage({ id: "baseline.baseline_name" }),
                            "name",
                            12
                        ],
                        [
                            intl.formatMessage({ id: "baseline.product_version" }),
                            "version",
                            12,
                        ],
                        [
                            intl.formatMessage({ id: "baseline.baseline_desc" }),
                            "description",
                            24,
                        ]
                    ].map((item: any) => {
                        const [title, field, span] = item
                        return (
                            <NavItem
                                text={current?.[field]}
                                title={title}
                                span={span}
                                key={field}
                            />
                        )
                    })
                }
                {
                    data && !!data.length &&
                    <Access accessible={access.WsMemberOperateSelf(current?.creator)}>
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item onClick={hanldeEdit}>
                                        {intl.formatMessage({ id: "baseline.edit.info" })}
                                    </Menu.Item>
                                </Menu>
                            }
                        >
                            <MoreOutlined
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 5,
                                    cursor: 'pointer',
                                }}
                            />
                        </Dropdown>
                    </Access>
                }
            </Nav>
            <ListBody>
                <BaseTable {...props} />
            </ListBody>
        </ContentCls>
    )
}

export default RightContent