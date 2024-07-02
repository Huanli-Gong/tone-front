import React from 'react'
import { Popover, Button } from 'antd'
import { FormattedMessage, getLocale  } from 'umi'
import styles from '../index.less'
import { LogOffContent } from './'

const Logoff: React.FC = () => {
    const [visible, setVisible] = React.useState(false)

    return (
        <Popover
            content={
                <LogOffContent
                    handleCancel={
                        () => setVisible(false)
                    }
                />
            }
            visible={visible}
            onVisibleChange={visible => setVisible(visible)}
            overlayClassName={styles.cancleWs}
            trigger="click"
            title={<FormattedMessage id="ws.config.tips" />}
        >
            <Button onClick={() => setVisible(true)}>
                <span style={getLocale() === 'en-US' ? {letterSpacing: 'unset'}: undefined}><FormattedMessage id="operation.log.off" /></span>
            </Button>
        </Popover>
    )
}

export default Logoff