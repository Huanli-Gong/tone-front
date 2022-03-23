import React, { useEffect, useState } from 'react'

import { CaretDownFilled, CaretRightFilled } from '@ant-design/icons'
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { Table, Card, Typography, message, Space, Row, Col } from 'antd'
import { evnPrepareState, tooltipTd } from '../components/index'
import Clipboard from 'clipboard'
import { queryBuildList } from '../service'
import { useRequest, useParams } from 'umi'
//import styles from './index.less'
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
    const handleCopy = (link: string) => {
        const dom = document.createElement("a")
        dom.style.width = "0px";
        dom.style.height = "0px"
        document.body.appendChild(dom)
        const cp = new Clipboard(dom, {
            text: () => link
        })

        cp.on("success", () => {
            message.success("已复制到剪切板！")
        })

        dom.click()
        cp.destroy()
        document.body.removeChild(dom)
    }

    if (!link) return <></>

    return (
        <Row gutter={16} style={{ width: "100%" }}>
            <Col span={2} xs={3} md={2} style={{ textAlign: "right" }}>
                <Typography.Text strong>{name}包</Typography.Text>
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
    const [dataSource, setDataSource] = useState<Array<{}>>([])

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
            title: '名称',
            ...tooltipTd(),
        },
        {
            dataIndex: 'state',
            title: '状态',
            render: evnPrepareState
        },
        {
            dataIndex: 'git_repo',
            title: '仓库',
            ellipsis: true,
            render: (_: string) => (
                _ ?
                    <a href={_} target="_blank">{_}</a>
                    : '-'
            )
        },
        {
            dataIndex: 'git_branch',
            title: '分支',
            ...tooltipTd(),
        },
        {
            dataIndex: 'git_commit',
            title: 'commit',
            ...tooltipTd(),
        },
        {
            dataIndex: 'cbp_link',
            title: 'cbp链接',
            ellipsis: true,
            render: (_: string) => (
                _ ?
                    <a href={_} target="_blank">{_}</a>
                    : '-'
            )
        },
        {
            dataIndex: 'start_timne',
            title: '开始时间',
            ...tooltipTd(),
        },
        {
            dataIndex: 'end_time',
            title: '结束时间',
            ...tooltipTd(),
        },
    ]


    return (
        dataSource && dataSource.length ?
        <Card
            title="Build内核"
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