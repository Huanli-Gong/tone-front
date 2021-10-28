import React from 'react';
import { Row, Col, Empty, Spin  } from 'antd';
import styles from './index.less';
import ChartRender from './ChartMetric'
const RenderChart = (props: any) => {
    const { loading, confLen } = props
    const handleScroll = (name: string, idx: number) => {
        document.querySelector(`#${name}-${idx}`)?.scrollIntoView()
    }
    return (
        <Spin spinning={loading}>
            {
                props.chartData == null
                ?
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                <Row>
                    <Col span={16}>
                        {
                            Object.keys(props.chartData.metric_dic).map((key: any, idx: number) => (
                                <ChartRender metric={props.chartData.metric_dic[key]} data={props.chartData.metric_dic} conf={props.chartData.metric_dic[key].map((item: any) => item.conf_name)} idx={idx} identify={props.identify} />
                            ))
                        }
                    </Col>
                    <Col span={8}>
                        {
                            Object.keys(props.chartData.metric_dic).map((key: any) => (
                                <div style={{ height: 310,overflowY:'auto',overflowX:'hidden' }}>
                                    <div className={styles.test_conf}> Test Conf({confLen}) 
                                        {
                                            props.chartData.metric_dic[key].map((item: any, index: number) => (
                                                <div className={styles.test_conf_detailt} >{`Config${index + 1} ：${item.conf_name}`}</div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </Col>
                </Row>
            }
        </Spin>

    )
}
export default RenderChart;