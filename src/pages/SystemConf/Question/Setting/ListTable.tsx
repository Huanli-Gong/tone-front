import React from "react";
import { Button, Row, Space, Table } from "antd"

const ListTable: React.FC = () => {

    return (
        <Space style={{ width: '100%' }} direction="vertical">
            <Row justify={'end'}>
                <Button >新建</Button>
            </Row>

            <Table
                rowKey={'id'}
                dataSource={[]}
            />
        </Space>
    )
}

export default ListTable