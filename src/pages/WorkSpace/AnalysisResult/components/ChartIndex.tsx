import React, { useState, useEffect } from 'react';
import { Select, Empty } from 'antd';
import ChartsType1 from './ChartsType1';
import ChartsType2 from './ChartsType2';
import ChartsType3 from './ChartsType3';
import { compareChart } from '../service'

import styles from './index.less';
const { Option } = Select
const ChartsIndex = (props: any) => {
    const [type, setType] = useState('type1')
    const [loading,setLoading] = useState(false)
    const [chartData1, setChartData1] = useState(null)
    const [chartData2, setChartData2] = useState(null)
    const queryChart = async (newObj: any, type: string) => {
        setLoading(true)
        const res = await compareChart(newObj)
        if (res.code === 200) {
            setLoading(false)
            if (type === 'type1' || type === 'type3')
                setChartData1(res.data)
            else
                setChartData2(res.data)
        }
    }
    let obj: any = {}
    useEffect(() => {
        obj.show_type = 1
        //obj.compare_groups = props.compareData
        obj.base_suite_obj = {
            suite_id: props.suite_id,
            suite_name: props.suite_name,
            conf_dic:{}
        },
        props.conf_list?.map((conf: any,index:number) => {
            obj.base_suite_obj.conf_dic[conf.conf_id] = {
                conf_name: conf.conf_name,
                is_job: conf.is_job || conf.conf_source.is_job,
                obj_id: conf.obj_id || conf.conf_source.obj_id,
                compare_objs:conf.conf_compare_data || conf.compare_conf_list
            }
        })
        queryChart(obj, 'type1')
    }, [props.conf_list])
    const handleType = async (value: any) => {
        if(value === 'type2')
        obj.show_type = 2
        else
        obj.show_type = 1
        //obj.compare_groups = props.compareData
        obj.base_suite_obj = {
            suite_id: props.suite_id,
            suite_name: props.suite_name,
            conf_dic:{}
        },
        props.conf_list?.map((conf: any) => {
            obj.base_suite_obj.conf_dic[conf.conf_id] = {
                conf_name: conf.conf_name,
                is_job: conf.is_job || conf.conf_source.is_job,
                obj_id: conf.obj_id || conf.conf_source.obj_id,
                compare_objs:conf.conf_compare_data || conf.compare_conf_list
            }
        })

        queryChart(obj, value)
        setType(value)
    }
    return (
        <>
            {
                props.conf_list && props.conf_list.length ?
                <>
                    <div className={styles.charts_title}>
                    
                        <span className={styles.charts_sub_title}>{props.suite_name} (Test Conf Num:{props.conf_list.length})</span>
                        <span className={styles.select_model}>
                            视图: <Select defaultValue="type1" style={{ width: 220 }} onSelect={handleType}>
                                <Option value="type1">所有指标拆分展示(type1)</Option>
                                <Option value="type2">多Conf同指标合并(type2)</Option>
                                <Option value="type3">单Conf多指标合并(type3)</Option>
                            </Select>
                        </span>
                    </div>
                    {/* <RenderItem /> */}
                    { type === 'type1' &&  <ChartsType1 loading={loading} chartData={chartData1} idx={props.index} identify={props.identify} /> }
                    { type === 'type2' &&  <ChartsType2 loading={loading} chartData={chartData2} idx={props.index} identify={props.identify} confLen={props.conf_list.length}/> }
                    { type === 'type3' &&  <ChartsType3 loading={loading} chartData={chartData1} idx={props.index} identify={props.identify} /> }
                </>
                :
                <></>
            }
        </>
    )
}

export default ChartsIndex;