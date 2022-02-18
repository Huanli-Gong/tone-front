import React from 'react'
import { Popover, Button } from 'antd'
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
            title="提示"
        >
            <Button onClick={() => setVisible(true)}>注销</Button>
        </Popover>
    )
}

export default Logoff