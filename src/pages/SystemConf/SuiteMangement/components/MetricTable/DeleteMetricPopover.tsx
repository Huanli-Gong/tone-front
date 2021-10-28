
import { Radio, Button, Row, Modal } from 'antd'
import React, { useState } from 'react'
import styles from '../../style.less';
export default ({ onOk }: any) => {
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
        <div>
            <Button style={{ padding: 0 }} size="small" type="link" onClick={hadleClick}>删除</Button>
            <Modal
                title="删除提示"
                cancelText="取消"
                okType="danger"
                centered={true}
                className={styles.modalChange}
                okText="删除"
                visible={visible}
                onOk={handleOk}
                onCancel={() => handleCancel(false)}
                width={480}
                maskClosable={false}
            >
                <p>删除当前指标，将影响应用的Job及模版数据，请谨慎操作</p>
                <Row style={{ width: 224, marginBottom: 10 }}>
                    <Radio.Group value={val} onChange={handleChange}>
                        <Radio value={0}>仅删除本条Metric</Radio>
                        <Radio value={1}>同步删除TestConf下该Metric</Radio>
                    </Radio.Group>
                </Row>
            </Modal>
        </div>

    )
}