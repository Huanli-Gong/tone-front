import React from 'react'
import { Popover, Button } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { TransferContent } from './'
import styles from '../index.less'

type IProps = {
    refresh: () => void
}

const Transfer: React.ForwardRefRenderFunction<{}, IProps> = (props, ref) => {
    const { formatMessage } = useIntl()
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
            title={<FormattedMessage id="ws.config.transfer.ownership"/>}
            onVisibleChange={v => setVisible(v)}
            visible={visible}
            overlayClassName={styles.transferOwnerWs}
        >
            <Button onClick={() => setVisible(true)}>
                <FormattedMessage id="ws.config.transfer.of.ownership"/>
            </Button>
        </Popover>
    )
}

export default React.forwardRef(Transfer)