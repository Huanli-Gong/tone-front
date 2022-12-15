import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Modal, Row, Col, Typography, Button, Spin, Empty, Tooltip } from 'antd'
import { useRequest, FormattedMessage } from 'umi'
import hljs from 'highlight.js'
import styles from './index.less'

import { queryHistroyVersion } from '../services'
import classNames from "classnames"

export default forwardRef(
    (props: any, ref: any) => {
        const { stage } = props
        const [visible, setVisible] = useState(false)
        const [current, setCurrent] = useState<any>({})
        const [modalHeight, setModalHeight] = useState<any>(innerHeight * .7)

        const { loading, run, data } = useRequest(
            (params) => queryHistroyVersion(params),
            {
                manual: true,
                initialData: [],
            }
        )

        useImperativeHandle(
            ref,
            () => ({
                show: (item: any) => {
                    setVisible(true)
                    run({ config_key: item.config_key })
                }
            })
        )

        useEffect(() => {
            if (Object.keys(data).length > 0)
                setCurrent(data[0])
        }, [data])

        const getModalBodyHeight = () => setModalHeight(innerHeight * .7)

        useEffect(() => {
            window.addEventListener('resize', getModalBodyHeight)
            return () => {
                window.removeEventListener('resize', getModalBodyHeight)
            }
        }, [])

        const handleChangeCurrent = (item: any) => setCurrent(item)

        const handleCancel = () => {
            setCurrent({})
            setVisible(false)
        }

        const transStageZn = (s: string) => {
            let bindStageText = ''
            stage.forEach(({ name, value }: any) => {
                if (s === value)
                    bindStageText = name
            })
            return bindStageText
        }

        const { language, value } = React.useMemo(() => {
            if (current.config_value) {
                const { language, value } = hljs.highlightAuto(current.config_value)
                return {
                    language, value
                }
            }
            return {}
        }, [current.config_value])

        return (
            <Modal
                title={<FormattedMessage id="basic.historical.version" />}
                centered
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={handleCancel}
                width={1000}
                className={styles.script_version_modal}
                footer={false}
                maskClosable={false}
            >
                <Spin spinning={loading}>
                    <Row style={{ height: modalHeight }}>
                        <div style={{ width: 210, borderRight: '1px solid #eee', maxHeight: '100%', overflow: 'auto' }} >
                            {
                                data?.map(
                                    (item: any) => (
                                        <div
                                            className={+ current.id === + item.id ? styles.history_left_item_active : styles.history_left_item}
                                            onClick={() => handleChangeCurrent(item)}
                                            key={item.id}
                                        >
                                            <div className={styles.histroy_left_time}>{item.source_gmt_created}</div>
                                            <div className={styles.histroy_left_time}>{item.update_user}</div>
                                            {
                                                + current.id === + item.id &&
                                                <div className={styles.histroy_active_line} />
                                            }
                                        </div>
                                    )
                                )
                            }
                        </div>
                        <div style={{ width: `calc( 100% - 210px )`, padding: 20 }}>
                            {
                                data.length === 0 ?
                                    <Empty /> :
                                    <>
                                        <Row style={{ width: '100%', height: 50, marginBottom: 20 }} align="middle">
                                            <Col span={24}>
                                                <Row>
                                                    <Col span={8} className={styles.history_top_info}>
                                                        <Typography.Text className={styles.script_right_name}><FormattedMessage id="basic.script_name" />：</Typography.Text>
                                                        <Typography.Text>
                                                            <Tooltip title={current.config_key} placement="bottomLeft">
                                                                {current.config_key}
                                                            </Tooltip>
                                                        </Typography.Text>
                                                    </Col>
                                                    <Col span={6} className={styles.history_top_info}>
                                                        <Typography.Text className={styles.script_right_name}><FormattedMessage id="basic.atomic_step" />：</Typography.Text>
                                                        <Typography.Text>{transStageZn(current.bind_stage)}</Typography.Text>
                                                    </Col>
                                                    <Col span={10} className={styles.history_top_info}>
                                                        <Typography.Text className={styles.script_right_name}><FormattedMessage id="basic.desc" />：</Typography.Text>
                                                        <Typography.Text className={styles.desc_content_style}>
                                                            <Tooltip title={current.description} placement="bottomLeft">
                                                                {current.description}
                                                            </Tooltip>
                                                        </Typography.Text>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            {/* <Col span={ 24 }>
                                            <Space>
                                                <Typography.Text className={ styles.script_right_name }>是否启用：</Typography.Text>
                                                <Typography.Text>{ current.enable ? '启用' : '停用' }</Typography.Text>
                                            </Space>
                                        </Col> */}
                                        </Row>
                                        <Row style={{ height: modalHeight - 54.6 - 70 - 52, overflow: 'hidden' }} className={styles.code_view_wrapper}>
                                            {
                                                value &&
                                                <pre >
                                                    <code
                                                        className={classNames(`hljs language-${language}`)}
                                                        dangerouslySetInnerHTML={{
                                                            __html: value
                                                        }}
                                                    />
                                                </pre>
                                            }
                                        </Row>
                                        <Row style={{ height: 32, marginTop: 20 }} justify="space-between">
                                            <Typography.Text>Comment：{current.commit}</Typography.Text>
                                            <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                                        </Row>
                                    </>
                            }
                        </div>
                    </Row>
                </Spin>
            </Modal>
        )
    }
)