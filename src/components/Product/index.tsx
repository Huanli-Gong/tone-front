import React from 'react'
import { Tooltip, Space } from 'antd'
import styles from './index.less'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { TooltipProps } from 'antd/es/tooltip'

type IProps = {
    title: React.ReactNode | null | undefined;
    desc: React.ReactNode | null | undefined;
} & TooltipProps

export const QusetionIconTootip: React.FC<IProps> = ({ desc, title, ...rest }) => (
    <Space>
        <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>{title}</span>
        <Tooltip
            overlayClassName={styles.table_question_tooltip}
            placement="bottomLeft"
            arrowPointAtCenter
            {...rest}
            title={desc}
            color="#fff"
        >
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.65)' }} />
        </Tooltip>
    </Space>
)


