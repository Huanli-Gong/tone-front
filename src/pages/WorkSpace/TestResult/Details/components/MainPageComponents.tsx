
import React, { ChangeEvent } from "react"

import { useCopyText } from '@/utils/hooks'
import styled from 'styled-components'
import { Breadcrumb, Typography, message, Row, Tooltip, Space, Col, notification } from "antd"
import { useParams, useAccess, useIntl, FormattedMessage, Access, history, getLocale } from 'umi'
import { DownloadOutlined, ShareAltOutlined, EditOutlined, CloudUploadOutlined } from '@ant-design/icons'

import { queryDownloadLink, startDownloadTask } from '@/pages/WorkSpace/TestResult/Details/service'
import styles from "../index.less"
import EditRemarks from './EditRemarks'
import { AccessTootip } from '@/utils/utils';

import { createProject } from "@/pages/WorkSpace/TestUpload/services"

const BreadcrumbIcon = styled(Typography.Text)`
    cursor: pointer;
    font-size: 18px;
    &:hover {
        color: #1890ff
    }
`

export const CAN_STOP_JOB_STATES = ['running', 'pending', 'pending_q']

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export const BreadcrumbItem: React.FC<any> = (props) => {
    const { state: jobState, bottomHeight } = props
    const { ws_id, id: job_id } = useParams() as any
    const access = useAccess()
    const intl = useIntl()

    const downloadRef = React.useRef<HTMLAnchorElement>(null)
    const fileRef = React.useRef<HTMLInputElement>(null)

    const [downloadHerf, setDownloadHref] = React.useState()
    const [fetching, setFetching] = React.useState(false)
    const [fetchingDownloadLink, setFetchingDownloadLink] = React.useState(false)

    const handleCopy = useCopyText(intl.formatMessage({ id: "request.copy.success" }))

    const queryJobDownloadLink = async () => {
        setFetching(true)
        const { data, code } = await queryDownloadLink({ job_id })
        setFetching(false)

        if (code !== 200) return
        if (!data) return
        const { state, job_url } = data
        if (state === "running") {
            setFetchingDownloadLink(true)
            if (!fetchingDownloadLink)
                message.loading({
                    key: `download_running_${ws_id}_${job_id}`,
                    content: intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download.running` }),
                    duration: 0,
                });
            await sleep(1500)
            queryJobDownloadLink()
            return
        }

        message.destroy(`download_running_${ws_id}_${job_id}`)

        if (state === "success") {
            setDownloadHref(job_url)
            setFetchingDownloadLink(false)
        }
        if (state === "fail") {
            setFetchingDownloadLink(false)
            message.error(intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download.fail` }))
        }
    }

    const handleDownloadJob = async () => {
        if (downloadHerf) {
            downloadRef.current?.click()
            return
        }
        if (fetchingDownloadLink) return
        if (!fetching) {
            const { code } = await startDownloadTask({ job_id })
            if (code !== 200) return message.error(intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download.fail` }))
            queryJobDownloadLink()
        }
    }

    React.useEffect(() => {
        if (downloadHerf) downloadRef.current?.click()
    }, [downloadHerf])

    const handleUploadChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
        if (!target.files?.length) return
        const { code, msg } = await createProject({ job_id, ws_id, file: target?.files?.[0] })
        if (code !== 200)
            return message.error(msg)

        notification.success({
            top: 80,
            duration: null,
            message: intl.formatMessage({ id: 'ws.result.details.breadcrumb.button.upload.message' }),
            description: (
                <Space>
                    {intl.formatMessage({ id: 'ws.result.details.breadcrumb.button.upload.ok' })}
                    <Typography.Link target='_blank' href={`/ws/${ws_id}/offline_test`}>
                        {intl.formatMessage({ id: 'ws.result.details.breadcrumb.button.upload.ok.view' })}
                    </Typography.Link>
                </Space>
            )
        })

        /* @ts-ignore */
        fileRef.current.value = ''
    }

    const { origin, pathname } = window.location

    return (
        <Row justify={"space-between"}>
            <Breadcrumb style={{ marginBottom: bottomHeight }}>
                <Breadcrumb.Item >
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => history.push(`/ws/${ws_id}/test_result`)}
                    >
                        <FormattedMessage id="ws.result.details.test.result" />
                    </span>
                </Breadcrumb.Item>
                <Breadcrumb.Item><FormattedMessage id="ws.result.details.result.details" /></Breadcrumb.Item>
            </Breadcrumb>
            <Access accessible={access.IsWsSetting()}>
                <Space size={12}>
                    <Tooltip
                        placement="left"
                        title={intl.formatMessage({ id: `ws.result.details.breadcrumb.button.fail_case_upload` })}
                    >
                        <BreadcrumbIcon onClick={() => fileRef.current?.click()}>
                            <CloudUploadOutlined />
                        </BreadcrumbIcon>
                    </Tooltip>
                    <Tooltip
                        placement="left"
                        title={intl.formatMessage({ id: `ws.result.details.breadcrumb.button.share` })}
                    >
                        <BreadcrumbIcon onClick={() => handleCopy(origin + pathname)}>
                            <ShareAltOutlined />
                        </BreadcrumbIcon>
                    </Tooltip>
                    {
                        !CAN_STOP_JOB_STATES.includes(jobState) &&
                        <Tooltip
                            placement="left"
                            title={intl.formatMessage({ id: `ws.result.details.breadcrumb.button.download` })}
                        >
                            <BreadcrumbIcon onClick={handleDownloadJob}>
                                <DownloadOutlined />
                            </BreadcrumbIcon>
                        </Tooltip>
                    }
                </Space>
            </Access>
            <a
                ref={downloadRef}
                href={downloadHerf}
                target="_blank"
                style={{ display: "none" }}
                rel="noreferrer"
            />
            <input
                ref={fileRef}
                type="file"
                style={{ width: 0, height: 0, display: 'none', position: 'absolute', zIndex: -9999 }}
                onChange={handleUploadChange}
                accept="application/x-tar,application/x-gzip"
            />
        </Row>
    )
}


export const RenderDesItem: React.FC<any> = ({ name, dataIndex, isLink, onClick }) => {
    const locale = getLocale() === 'en-US';
    const widthStyle = locale ? 120 : 58

    return (
        <Col span={8} style={{ display: 'flex', alignItems: 'start' }}>
            <Typography.Text className={styles.test_summary_item} style={{ width: widthStyle }}>{name}</Typography.Text>
            {
                isLink ?
                    <Typography.Text
                        className={styles.test_summary_item_right}
                        style={{ cursor: 'pointer', color: '#1890FF', width: `calc(100% - ${widthStyle}px - 16px)` }}
                    >
                        <span onClick={onClick}>{dataIndex || '-'}</span>
                    </Typography.Text> :
                    <Typography.Text
                        className={styles.test_summary_item_right}
                        style={{ width: `calc( 100% - ${widthStyle}px - 16px)` }}
                    >
                        {dataIndex || '-'}
                    </Typography.Text>
            }
        </Col>
    )
}

export const EditNoteBtn: React.FC<any> = (props) => {
    const access = useAccess()
    const { creator_id, note, refresh } = props;
    const { id: job_id } = useParams() as any
    const ref: any = React.useRef()

    const handleOpenEditRemark = () => {
        ref.current?.show({ editor_obj: 'job', job_id, note })
    }

    const noteStyle: any = {
        paddingTop: 5,
        marginRight: 10,
    }

    return (
        <>
            <Access
                accessible={access.WsMemberOperateSelf(creator_id)}
                fallback={
                    <EditOutlined
                        onClick={() => AccessTootip()}
                        style={{ ...noteStyle }}
                    />
                }
            >
                <EditOutlined
                    onClick={handleOpenEditRemark}
                    style={{ ...noteStyle }}
                />
            </Access>
            <EditRemarks ref={ref} onOk={refresh} />
        </>
    )
}