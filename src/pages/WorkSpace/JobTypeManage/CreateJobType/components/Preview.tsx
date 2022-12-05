import React, { useImperativeHandle, forwardRef, useState, useMemo, useRef } from 'react'

import { Tag, Row, Col, Space, Typography } from 'antd'

import BasicForm from '@/pages/WorkSpace/TestJob/components/JobForms/BasicForm'
import EnvForm from '@/pages/WorkSpace/TestJob/components/JobForms/EnvForm'
import MoreForm from '@/pages/WorkSpace/TestJob/components/JobForms/MoreForm'
import SelectSuite from '@/pages/WorkSpace/TestJob/components/SelectSuite'
import styles from '@/pages/WorkSpace/TestJob/index.less'

import { ArrowLeftOutlined } from '@ant-design/icons'
import { switchServerType, switchTestType } from '@/utils/utils'
import { useParams, FormattedMessage, useIntl } from 'umi'
import { useClientSize } from '@/utils/hooks'

interface PreviewProps {
    item_dict: any,
    name: string,
    server_type: string,
    test_type: string,
    description: string,
    onOk: () => void
}

export default forwardRef(
    ({ item_dict = {}, name = '', server_type = '', test_type = '', description = '', onOk }: PreviewProps, ref: any) => {
        const { formatMessage } = useIntl()
        const { ws_id }: any = useParams()
        const [visible, setVisible] = useState(false)
        const [projectId, setProjectId] = useState()
        const bodyRef = useRef<any>()
        const { width: windowWidth }: any = useClientSize()

        const bodyPaddding = useMemo(() => {
            if (windowWidth >= 1240) return (1240 - 1000) / 2
            return 20
        }, [windowWidth])

        useImperativeHandle(ref, () => (
            {
                show: () => setVisible(true)
            }
        ))

        const items = useMemo(() => {
            return Object.keys(item_dict).reduce(
                (pre: any, cur: any) => {
                    const nape = item_dict[cur]
                    pre[cur] = nape.reduce(
                        (p: any, c: any) => {
                            if (c.select)
                                p[c.name] = c
                            return p
                        }, {}
                    )
                    return pre
                }, {}
            )
        }, [item_dict])

        const queryProjectId = (id: any) => {
            setProjectId(id)
        }

        const handleBack = () => {
            setVisible(false)
        }

        if (!visible) return <></>

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: '#fff',
                    zIndex: 999,
                    overflow: 'auto'
                }}
            >
                <div style={{ background: '#f5f5f5', paddingTop: 50, paddingBottom: 80, minHeight: '100vh', }}>
                    <Row
                        justify="space-between"
                        align="middle"
                        className={styles.page_preview_nav}
                    >
                        <Space>
                            <ArrowLeftOutlined onClick={handleBack} style={{ fontSize: 20 }} />
                            <Typography.Title level={4}><FormattedMessage id="job.types.Preview" /></Typography.Title>
                        </Space>
                    </Row>

                    <div className={styles.page_header} >
                        <div style={{ height: 250, minWidth: 1080, background: '#fff', position: 'absolute', left: 0, top: 0, width: '100%' }} />
                        <Row className={styles.page_title} justify="center">
                            <div
                                style={{
                                    width: windowWidth > 1240 ? 1240 : bodyRef.current.clientWidth,
                                    zIndex: 10
                                }}
                            >
                                <div><Typography.Text>{name}</Typography.Text></div>
                                <div className={styles.page_tags}>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchServerType(server_type, formatMessage)}</Tag>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchTestType(test_type, formatMessage)}</Tag>
                                </div>
                                <div className={styles.page_dec}>{description}</div>
                            </div>
                        </Row>
                    </div>

                    <div ref={bodyRef} className={styles.page_body_content} style={{ paddingLeft: bodyPaddding, paddingRight: bodyPaddding }}>
                        <Row justify="center" className={styles.page_body} >
                            <Col span={24} style={{ width: 1000, flex: 'none' }} >
                                <Row className={styles.page_body_title}><FormattedMessage id="job.types.create.job" /></Row>
                            </Col>
                            <Col span={24} style={{ width: 1000, flex: 'none' }}>
                                {
                                    JSON.stringify(items['basic']) !== '{}' &&
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span><FormattedMessage id="job.types.base" /></span>
                                        </div>
                                        <BasicForm disabled={false} contrl={items.basic} callBackProjectId={queryProjectId} />
                                    </Row>
                                }
                                {
                                    JSON.stringify(items['env']) !== '{}' &&
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span><FormattedMessage id="job.types.env" /></span>
                                        </div>
                                        <EnvForm disabled={false} contrl={items.env} project_id={projectId} />
                                    </Row>
                                }
                                {
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span><FormattedMessage id="job.types.caseAndserver" /></span>
                                        </div>
                                        <Col span={21} offset={3}>
                                            <SelectSuite
                                                handleData={() => { }}
                                                server_type={server_type}
                                                test_type={test_type}
                                                contrl={items.server}
                                                disabled={false}
                                                isPreviewPage={true}
                                                setPageLoading={() => { }}
                                            />
                                        </Col>
                                    </Row>
                                }
                                {
                                    JSON.stringify(items['more']) !== '{}' &&
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span><FormattedMessage id="job.types.moreConfig" /></span>
                                        </div>
                                        <MoreForm disabled={false} ws_id={ws_id} contrl={items.more} />
                                    </Row>
                                }
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
)