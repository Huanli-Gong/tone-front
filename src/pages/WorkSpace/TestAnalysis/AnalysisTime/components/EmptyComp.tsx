import React from "react"
import { CardWrapper } from "./PerformanceCharts/styled"
import { Row, Empty } from "antd"

const EmptyComp: React.FC = () => {
    return (
        <CardWrapper style={{ width: '100%' }} bordered={false}>
            <Row style={{ height: innerHeight - 176 - 50 - 120 }} justify="center" align="middle">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Row>
        </CardWrapper>
    )
}

export default EmptyComp