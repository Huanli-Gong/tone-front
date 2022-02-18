import React from 'react'
import { Popover, Button } from 'antd'
import { TransferContent } from './'
import styles from '../index.less'

type IProps = {
    refresh: () => void
}

const Transfer: React.ForwardRefRenderFunction<{}, IProps> = (props, ref) => {
    const { refresh } = props

    const [visible, setVisible] = React.useState(false)

    const handleOk = () => {
        refresh()
        setVisible(false)
    }

    return (
        <Popover
            content={
                <TransferContent
                    handleCancel={() => setVisible(false)}
                    refresh={handleOk}
                />
            }
            trigger="click"
            title="转交所有权"
            onVisibleChange={v => setVisible(v)}
            visible={visible}
            overlayClassName={styles.transferOwnerWs}
        >
            <Button onClick={() => setVisible(true)} >所有权转交</Button>
        </Popover>
    )
}

export default React.forwardRef(Transfer)