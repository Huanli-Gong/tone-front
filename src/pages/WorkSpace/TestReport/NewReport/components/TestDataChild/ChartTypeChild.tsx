import { useState } from 'react';
import { Typography, Space, Select, } from 'antd';
import { FormattedMessage } from 'umi';

const ChartTypeChild = (props: any) => {
    const { btn, isReport, obj, suiteId, setPerData } = props;
    const [chartType, setChartType] = useState('1')
    const hanldeChangeChartType = (val: string) => {
        setChartType(val)
        if (isReport) {
            setPerData({
                ...obj, list: obj.list.map((item: any) => {
                    if (suiteId === item.suite_id) {
                        return {
                            ...item,
                            chartType: val
                        }
                    }
                    return item
                })
            })
        } else {
            setPerData(obj.map((item: any) => {
                if (suiteId === item.suite_id) {
                    return {
                        ...item,
                        chartType: val
                    }
                }
                return item
            }))
        }
    }
    return (
        <>
            {!btn &&
                <Space style={{ position: 'absolute', right: 12 }}>
                    <Typography.Text ><FormattedMessage id="report.view" />：</Typography.Text>
                    <Select value={chartType} style={{ width: 395 }} onChange={hanldeChangeChartType}>
                        <Select.Option value="1"><FormattedMessage id="report.type1" /></Select.Option>
                        <Select.Option value="2"><FormattedMessage id="report.type2" /></Select.Option>
                        <Select.Option value="3"><FormattedMessage id="report.type3" /></Select.Option>
                    </Select>
                </Space>
            }
        </>
    )
}
export default ChartTypeChild;