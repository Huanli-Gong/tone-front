import React, { useImperativeHandle, forwardRef, useState, useMemo, useRef } from 'react'

import { Tag, Row, Col, Space, Typography } from 'antd'

import BasicForm from '@/pages/TestJob/components/JobForms/BasicForm'
import EnvForm from '@/pages/TestJob/components/JobForms/EnvForm'
import MoreForm from '@/pages/TestJob/components/JobForms/MoreForm'
import SelectSuite from '@/pages/TestJob/components/SelectSuite'
import styles from '@/pages/TestJob/index.less'

import { ArrowLeftOutlined } from '@ant-design/icons'
import { switchServerType, switchTestType } from '@/utils/utils'
import { useParams } from 'umi'
import { resizeClientSize } from '@/utils/hooks'

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
        const { ws_id }: any = useParams()
        const [visible, setVisible] = useState(false)

        const bodyRef = useRef<any>()
        const { windowWidth }: any = resizeClientSize()

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
                            <Typography.Title level={4} >Job类型预览</Typography.Title>
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
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }} >{switchServerType(server_type)}</Tag>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchTestType(test_type)}</Tag>
                                </div>
                                <div className={styles.page_dec}>{description}</div>
                            </div>
                        </Row>
                    </div>

                    <div ref={bodyRef} className={styles.page_body_content} style={{ paddingLeft: bodyPaddding, paddingRight: bodyPaddding }}>
                        <Row justify="center" className={styles.page_body} >
                            <Col span={24} style={{ width: 1000, flex: 'none' }} >
                                <Row className={styles.page_body_title}>新建Job</Row>
                            </Col>
                            <Col span={24} style={{ width: 1000, flex: 'none' }}>
                                {
                                    JSON.stringify(items['basic']) !== '{}' &&
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span>基础配置</span>
                                        </div>
                                        <BasicForm disabled={false} contrl={items.basic} />
                                    </Row>
                                }
                                {
                                    JSON.stringify(items['env']) !== '{}' &&
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span>环境准备</span>
                                        </div>
                                        <EnvForm disabled={false} contrl={items.env} />
                                    </Row>
                                }
                                {
                                    <Row className={styles.form_row}>
                                        <div className={styles.page_body_nav}>
                                            <span>用例和机器</span>
                                        </div>
                                        <Col span={21} offset={3}>
                                            <SelectSuite
                                                handleData={() => { }}
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
                                            <span>更多配置</span>
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