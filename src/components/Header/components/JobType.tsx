import React,{ useRef } from 'react'
import { Space, Tag, Tooltip } from 'antd'
import { history } from 'umi'
import { switchServerType , switchTestType } from '@/utils/utils'

import styles from './JobType.less'

export default ({ ws_id , dataSource , onOk = () => {}, getData} : any ) => {
    //const { initialState } = useModel('@@initialState')
    // const handleCreateJobType = () => {
    //     onOk()
    //     history.push({ pathname:`/ws/${ ws_id }/job/create` })
    // }
    const TootipOver : React.FC<any> = (props:any) => {
        let content = props.children
        if(content.length > 23){
            return <Tooltip title={content}>
                {content}
            </Tooltip>
        }else{
            return content
        }
    }
    const dataSourceCopy = getData(dataSource)
    return (
        <div className={ styles.job_type }>
                {
                    dataSourceCopy.map(
                        (item: any, index: number) => (
                            <div
                                key={item.id}
                                className={styles.type_modal_item}
                                style={{ margin: dataSourceCopy.length > 12 ? '0 7px 16px 7px' : '0 8px 16px 8px' }}
                                onClick={() => {
                                    onOk()
                                    history.push(`/ws/${ws_id}/test_job/${item.id}`)
                                }}
                            >
                                { item.is_first && <span className={styles.right_default}></span>}
                                {/* <div style={{
                                    height: 56,
                                    borderLeft: item.test_type === 'functional' ? '2px solid #1890FF' : '2px solid #FF6A18'
                                }}
                                    className={styles.left_line}
                                /> */}
                                <div className={styles.type_modal_title}>
                                    <TootipOver>{item.name}</TootipOver>
                                </div>
                                <div style={{ paddingLeft:16 }}>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchServerType(item.server_type)}</Tag>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchTestType(item.test_type)}</Tag>
                                </div>
                            </div>
                        )
                    )
            }
        </div>
    )
}