import React,{ useState } from 'react';
import { Typography, Space, Select, } from 'antd';
const ChartTypeChild = (props:any) => {
    const { btn, isReport, obj, suiteId, setPerData } = props;
    const [chartType, setChartType] = useState('1')
    const hanldeChangeChartType = (val: string) => {
        setChartType(val)
        if(isReport){
            setPerData({
                ...obj, list: obj.list.map((item: any) => {
                    if(suiteId === item.suite_id){
                        return {
                            ...item,
                            chartType: val
                        }
                    }
                    return item
                })
            })
        }else{
            setPerData(obj.map((item: any) => {
                if(suiteId === item.suite_id){
                    return {
                        ...item,
                        chartType: val
                    }
                }
                return item
            }))
        }
    }
    return(
        <>
            {!btn && <Space style={{ position: 'absolute', right: 12 }}>
                <Typography.Text>视图：</Typography.Text>
                <Select value={chartType} style={{ width: 230 }} onChange={hanldeChangeChartType}>
                    <Select.Option value="1">所有指标拆分展示(type1)</Select.Option>
                    <Select.Option value="2">多Conf同指标合并(type2)</Select.Option>
                    <Select.Option value="3">单Conf多指标合并(type3)</Select.Option>
                </Select>
            </Space>
            }
        </>
    )
}
export default ChartTypeChild;