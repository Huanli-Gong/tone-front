import React from 'react'
import { Row, Col, Checkbox, Space } from 'antd'
import styles from './index.less'
import { EditShowName } from './EditNameModal'

interface checkSelectProps {
    title: string,
    desc: string,
    data: any,
    name: string,
    defaultValue: Array<number>,
    onSelect: (vals: Array<number>, name: string) => void,
    onEdit: (name: string, id: number, alias: string) => void,
}


export default ({ name, title, desc, data, onSelect, onEdit, defaultValue }: checkSelectProps) => {
    const handleChange = (val: any) => {
        onSelect(val, name)
    }

    return (
        <Row className={styles.step_row_mt}>
            <Col span={24}>
                <span className={ styles.step_title }>{ title }</span>
                <span className={ styles.step_desc }>{ desc }</span>
            </Col>
            <Col span={24}>
                <Checkbox.Group style={{ width: '100%' }} value={defaultValue} onChange={handleChange}>
                    <Row className={styles.step_check_box}>
                        {data.map((item: any, index: number) => (
                            item.name.toLowerCase().indexOf('console') > -1 ?
                                (
                                    <div style={{ width: '33%' }} key={item.id}>
                                        <Checkbox disabled={true}>{item.name}</Checkbox>
                                    </div>
                                ) : (
                                    <Col style={{ width: '33%' }} key={item.id} className={styles.step_check_col}>
                                        <Space>
                                            <Checkbox value={item.id} />
                                            <EditShowName name={name} item={item} onEdit={onEdit} />
                                        </Space>
                                        <Row className={styles.step_check_desc}>
                                            {item.description}
                                        </Row>
                                    </Col>
                                )
                            )
                        )}
                    </Row>
                </Checkbox.Group>
            </Col>
        </Row>
    )
}