import { Typography, Space, Select, } from 'antd';
import { FormattedMessage } from 'umi';
import { useContext, useEffect } from 'react';
import { ReportContext } from '../../Provider';
const ChartTypeChild = (props: any) => {
    
    const { btn, isReport, obj, suiteId, setPerData, chartType, setChartType } = props;
    const reportData = isReport ? useContext(ReportContext) : {};
    const { collapsedTypes = [], setCollapsedTypes } = reportData;

    useEffect(() => {
        const param: any = new URLSearchParams(window.location.search)
        if (isReport) {
            setPerData({
                ...obj, 
                list: obj.list.map((item: any) => {
                    if(window.location.search.includes(item.item_suite_id)){
                        setChartType(param.get(item.item_suite_id))
                        return {
                            ...item,
                            chartType: param.get(item.item_suite_id)
                        }
                    }
                    return item
                })
            })
        } else {
            setPerData(obj.map((item: any) => {
                if(window.location.search.includes(item.item_suite_id)){
                    setChartType(param.get(item.item_suite_id))
                    return {
                        ...item,
                        chartType: param.get(item.item_suite_id)
                    }
                }
                return item
            }))
        }
    },[window.location.search])
    const onChange = (val: string) => {
        setChartType(val)
        if (isReport) {
            setPerData({
                ...obj, 
                list: obj.list.map((item: any) => {
                    if (suiteId === item.suite_id) {
                        setCollapsedTypes({
                            ...collapsedTypes,
                            [item.item_suite_id]: val
                        })
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
                    setCollapsedTypes({
                        ...collapsedTypes,
                        [item.item_suite_id]: val
                    })
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
                    <Select value={chartType} style={{ width: 395 }} onChange={onChange}>
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