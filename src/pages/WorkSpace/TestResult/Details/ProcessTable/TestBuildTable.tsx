/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from 'react'

import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { Table, Card, Typography, message, Space, Row, Col } from 'antd'
import { evnPrepareState, tooltipTd } from '../components/index'
import Clipboard from 'clipboard'
import { queryBuildList } from '../service'
import { useRequest, useParams, useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components';

const BuildTable = styled(Table)`
    .expanded-row-padding-no>td {
        padding : 0 !important;
    }
    .buildWrap {
        height: 122px;
        padding: 20px 70px;
    }
`

const CopyLink: React.FC<{ name: string, link: string }> = ({ name, link }) => {
    const { formatMessage } = useIntl()
    const handleCopy = ($link: string) => {
        const dom = document.createElement("a")
        dom.style.width = "0px";
        dom.style.height = "0px"
        document.body.appendChild(dom)
        const cp = new Clipboard(dom, {
            text: () => $link
        })

        cp.on("success", () => {
            message.success(formatMessage({ id: 'ws.result.details.copied' }))
        })

        dom.click()
        cp.destroy()
        document.body.removeChild(dom)
    }

    if (!link) return <></>

    return (
        <Row gutter={16} style={{ width: "100%" }}>
            <Col span={2} xs={3} md={2} style={{ textAlign: "right" }}>
                <Typography.Text strong>{name}<FormattedMessage id="ws.result.details.package" /></Typography.Text>
            </Col>
            <Col span={18}>
                <Space>
                    <Typography.Link>{link}</Typography.Link>
                    <span onClick={() => handleCopy(link)} style={{ cursor: "pointer" }}><IconLink /></span>
                </Space>
            </Col>
        </Row>
    )
}

type IProps = {
    refresh?: boolean;
    job_id?: string | number;
}

const BuildKernelTable: React.FC<IProps> = (props) => {
    const { id: job_id } = useParams() as any
    const { refresh = false } = props
    const [dataSource, setDataSource] = useState<any[]>([])

    const { loading, run, data } = useRequest(
        () => queryBuildList({ job_id }),
        {
            manual: true
        }
    )

    React.useEffect(() => {
        if (data && JSON.stringify(data) !== "{}")
            setDataSource([data])
    }, [data])

    useEffect(() => {
        run()
    }, [refresh])

    const columns = [
        {
            dataIndex: 'name',
            title: <FormattedMessage id="ws.result.details.name" />,
            ...tooltipTd(),
        },
        {
            dataIndex: 'state',
            title: <FormattedMessage id="ws.result.details.state" />,
            render: evnPrepareState
        },
        {
            dataIndex: 'git_repo',
            title: <FormattedMessage id="ws.result.details.git_repo" />,
            ellipsis: true,
            render: (_: string) => (
                _ ?
                    <a href={_} target="_blank">{_}</a>
                    : '-'
            )
        },
        {
            dataIndex: 'git_branch',
            title: <FormattedMessage id="ws.result.details.git_branch" />,
            ...tooltipTd(),
        },
        {
            dataIndex: 'git_commit',
            title: 'commit',
            ...tooltipTd(),
        },
        {
            dataIndex: 'cbp_link',
            title: <FormattedMessage id="ws.result.details.cbp_link" />,
            ellipsis: true,
            render: (_: string) => (
                _ ?
                    <a href={_} target="_blank">{_}</a>
                    : '-'
            )
        },
        {
            dataIndex: 'start_timne',
            title: <FormattedMessage id="ws.result.details.start_time" />,
            ...tooltipTd(),
        },
        {
            dataIndex: 'end_time',
            title: <FormattedMessage id="ws.result.details.end_time" />,
            ...tooltipTd(),
        },
    ]


    return (
        dataSource && dataSource.length ?
            <Card
                title={<FormattedMessage id="ws.result.details.build.kernel" />}
                bodyStyle={{ paddingTop: 0 }}
                headStyle={{ borderBottom: 'none', borderTop: 'none' }}
                style={{ marginBottom: 10, borderTop: 'none' }}
            >
                <BuildTable
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="name"
                    loading={loading}
                    size="small"
                    //className={ styles.buildTable }
                    pagination={false}
                    expandable={{
                        expandedRowClassName: () => 'expanded-row-padding-no',
                        expandedRowRender: (record: any) => (
                            <Space direction="vertical" style={{ width: "100%", padding: 16 }}>
                                <CopyLink name="kernel" link={record.kernel_package} />
                                <CopyLink name="devel" link={record.devel_package} />
                                <CopyLink name="headers" link={record.headers_package} />
                            </Space>
                        ),
                        expandIcon: ({ expanded, onExpand, record }: any) => (
                            expanded ?
                                (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                                (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                        )
                    }}
                />
            </Card>
            : <></>
    )
}

//Build内核 
export default BuildKernelTable