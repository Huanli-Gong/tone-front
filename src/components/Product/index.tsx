import React  from 'react'
import { Tooltip , Space } from 'antd'
import styles from './index.less'
import { QuestionCircleOutlined  } from '@ant-design/icons'

export const QusetionIconTootip : React.FC<any> = ({ title , desc , list } : any ) => (
    <Space>
        <span style={{ color : 'rgba(0, 0, 0, 0.85)' }} >{ desc }</span>
        <Tooltip 
            overlayClassName={ styles.table_question_tooltip } 
            placement="bottomLeft" 
            arrowPointAtCenter
            title={ title }
        >
            <QuestionCircleOutlined style={{ color : 'rgba(0, 0, 0, 0.65)'}}/>
        </Tooltip>
    </Space>
)


