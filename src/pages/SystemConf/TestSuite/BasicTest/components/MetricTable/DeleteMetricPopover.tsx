
import { Radio, Button, Row, Modal } from 'antd'
import React, { useState } from 'react'
import { FormattedMessage } from 'umi'
import styles from '../../style.less';

const DeleteMetricPopover: React.FC<AnyType> = ({ onOk, isBatch }) => {
    const [visible, setVisible] = useState(false)

    const handleCancel = (visi: boolean) => {
        setVal(0)
        setVisible(visi)
    }

    const handleOk = () => {
        onOk(val)
        setVisible(false)
    }

    const hadleClick = () => {
        setVisible(true)
    }

    const [val, setVal] = useState(0)

    const handleChange = ({ target }: any) => setVal(target.value)

    return (
        <>
            {
                isBatch ?
                    <Button onClick={hadleClick}>
                        <FormattedMessage id={"operation.batch.delete"} />
                    </Button> :
                    <Button style={{ padding: 0 }} size="small" type="link" onClick={hadleClick} >
                        <FormattedMessage id="operation.delete" />
                    </Button>
            }
            <Modal
                title={<FormattedMessage id="delete.tips" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
                okType="danger"
                centered={true}
                className={styles.modalChange}
                okText={<FormattedMessage id="operation.delete" />}
                visible={visible}
                onOk={handleOk}
                onCancel={() => handleCancel(false)}
                width={480}
                maskClosable={false}
            >
                <p><FormattedMessage id="TestSuite.metric.delete.range" /></p>
                <Row style={{ width: 224, marginBottom: 10 }}>
                    <Radio.Group value={val} onChange={handleChange}>
                        <Radio value={0}><FormattedMessage id="TestSuite.delete.only" /></Radio>
                        <Radio value={1}><FormattedMessage id="TestSuite.synchronize.delete" /></Radio>
                    </Radio.Group>
                </Row>
            </Modal>
        </>
    )
}

export default DeleteMetricPopover