import { Popover, Table } from 'antd'
import React from 'react'
import { evnPrepareState , tooltipTd } from '../components/index'
import styles from './index.less'

export default ( { title = '' , need_reboot , setup_info , cleanup_info , step } : any ) => {
    const columns = [
        {
            title : '步骤',
            dataIndex : 'stage',
            ...tooltipTd(),
        },
        {
            title : '状态',
            dataIndex : 'state',
            render : evnPrepareState
        },
        {
            title : '输出结果',
            dataIndex : 'result',
            ...tooltipTd(),
        },
        {
            title : 'TID',
            dataIndex : 'tid',
            ...tooltipTd(),
        },
        {
            dataIndex : 'start_time',
            title : '开始时间',
            ...tooltipTd(),
        },
        {
            dataIndex : 'end_time',
            title : '结束时间',
            ...tooltipTd(),
        }
    ]
    let needReboot = need_reboot ? '重启机器' : ''
    let hasScript = setup_info || cleanup_info ? '执行脚本' : '' 

    if ( needReboot || hasScript ) 
        return (
            <Popover 
                // placement={ 'leftTop' }
                overlayStyle={{
                    width : 850
                }}
                arrowPointAtCenter
                className={ styles.step_table_popover }
                title={ title }
                content={
                    <Table 
                        size="small"
                        rowKey="uid"
                        columns={ columns }
                        style={{ width : 810 }}
                        dataSource={ step }
                        pagination={ false }
                    />
                }
            >
                <span className={ styles.popover_text_span }>
                    { `${ needReboot }${ ( needReboot && hasScript ) && '、' }${ hasScript }` }
                </span>
            </Popover>
        )
    return <>-</>
}