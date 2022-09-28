import React, { useEffect } from 'react'
import { Spin, Tag, Tooltip, Row } from 'antd'
import { history, useIntl, FormattedMessage, getLocale } from 'umi'
import { switchServerType, switchTestType } from '@/utils/utils'
// import { FrownOutlined } from '@ant-design/icons'
import { useHeaderContext } from '../Provider'

import styles from './JobType.less'

const TootipOver: React.FC<any> = ({ children }: any) => {
    let content = children
    if (content.length > 23) {
        return <Tooltip title={content}>
            {content}
        </Tooltip>
    } else {
        return content
    }
}

const JobTypeModal: React.FC<Record<string, any>> = (props) => {
    const locale = getLocale() === 'en-US'
    const { ws_id, jobTypes, typesRun, typeFetchLoading } = useHeaderContext()
    const { onOk = () => { }, getData } = props

    useEffect(() => {
        typesRun();
    }, [])

    const dataSourceCopy = getData(jobTypes)

    if (typeFetchLoading)
        return <Row justify="center" align="middle" style={{ padding: 8 }}><Spin /></Row>

    return (
        <div className={styles.job_type}>
            {
                dataSourceCopy.map(
                    (item: any) => (
                        <div
                            key={item.id}
                            className={styles.type_modal_item}
                            style={{ margin: dataSourceCopy.length > 12 ? '0 7px 16px 7px' : '0 8px 16px 8px' }}
                            onClick={() => {
                                onOk()
                                history.push(`/ws/${ws_id}/test_job/${item.id}`)
                            }}
                        >
                            {item.is_first && <span className={styles[locale ? 'right_default_en' : 'right_default']}></span>}

                            <div className={styles.type_modal_title}>
                                <TootipOver>{item.name}</TootipOver>
                            </div>
                            <div style={{ paddingLeft: 16 }}>
                                <Tag color="#F2F4F6" style={{ color: '#515B6A', padding: '0 4px' }}>
                                    {item.server_type && <FormattedMessage id={`header.${item.server_type}`} defaultMessage="" />}
                                </Tag>
                                <Tag color="#F2F4F6" style={{ color: '#515B6A', padding: '0 4px', marginRight: 0 }}>
                                    {item.test_type && <FormattedMessage id={`header.test_type.${item.test_type}`} defaultMessage="" />}
                                </Tag>
                            </div>
                        </div>
                    )
                )
            }
            {/* {
                dataSourceCopy.length === 0 &&
                <div style={{ height: 80, lineHeight: '80px', textAlign: 'center', color: 'rgba(0,0,0,.35)' }}>
                    <FrownOutlined style={{ marginRight: 8 }} />暂无Job类型
                </div>
            } */}
        </div >
    )
}

export default JobTypeModal