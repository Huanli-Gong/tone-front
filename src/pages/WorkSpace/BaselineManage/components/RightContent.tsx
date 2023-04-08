import React from "react"
import styled from "styled-components"
import { Row, Col, Typography, Dropdown, Menu, message } from "antd"
import { useIntl, Access, useAccess } from "umi"
import { useSize } from "ahooks"
import { MoreOutlined, EditOutlined } from "@ant-design/icons"
import BaseTable from "./SuiteTable"
import { ReactComponent as ExportBtn } from "@/assets/svg/export_baseline.svg"

import { exportBaseline, exportBaselineQueryState } from "../services"

export const baseline_detail_zhCn = {
    "baseline.detail.menu.export": "导出基线",
}

export const baseline_detail_enUs = {
    "baseline.detail.menu.export": 'Export Baseline',
}

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
    const LOADING_MESSAGE_KEY = `download_running_${current?.id || ""}`

    const exportRef = React.useRef<HTMLAnchorElement>(null)

    const [start, setStart] = React.useState(false)

    const hanldeEdit = () => {
        editRef.current?.show(current)
    }

    const getExportState = async () => {
        const { data: source, code } = await exportBaselineQueryState({ baseline_id: current?.id + "" })
        if (code !== 200) return
        const { state, target_url } = source
        if (state === "fail") {
            setStart(false)
            message.destroy(LOADING_MESSAGE_KEY)
            message.error("系统错误，请重新操作！")
            return
        }
        if (state !== "success") {
            message.loading({
                key: LOADING_MESSAGE_KEY,
                content: intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download.running` }),
                duration: 0,
            });
            setStart(true)
            return
        }
        setStart(false)
        message.destroy(LOADING_MESSAGE_KEY)
        if (exportRef.current) {
            exportRef.current.href = target_url
            exportRef.current.setAttribute("download", "基线下载.tar")
            exportRef.current?.click()
        }
    }

    React.useEffect(() => {
        if (!start) return
        const timer = setInterval(getExportState, 3000)
        return () => {
            if (timer)
                clearInterval(timer)
        }
    }, [start])

    const handleExport = async () => {
        if (start) return
        const { code } = await exportBaseline({ baseline_id: current?.id + "" })
        if (code !== 200)
            return message.error("系统错误，请重新操作！")
        getExportState()
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
                                    <Menu.Item onClick={hanldeEdit} icon={<EditOutlined />}>
                                        {intl.formatMessage({ id: "baseline.edit.info" })}
                                    </Menu.Item>
                                    <Menu.Item onClick={handleExport} icon={<ExportBtn />}>
                                        {intl.formatMessage({ id: "baseline.detail.menu.export" })}
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
            <a
                ref={exportRef}
                style={{ display: "none" }}
                rel="noreferrer"
            />
        </ContentCls>
    )
}

export default RightContent