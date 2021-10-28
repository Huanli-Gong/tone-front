import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import styles from './index.less';
import styled from 'styled-components';
import ChartRender from './ChartPublic'
const CreateTag = styled.span`
    width:88px;
    height:22px;
    background:#0089ff;
    color:#fff;
    border-radius:4px;
    display:inline-block;
    padding-left:8px;
    margin-right:8px;    
`
const CreateCompare = styled.span`
    width:16px;
    height:12px;
    border-radius:4px;
    display:inline-block;
    margin-right:3px;    
`
const Warpper = styled.div`
    width:100%;
    height:auto;
    position:relative;
`
const WarpperChart = styled.div`
    width:97%;
    position:absolute;
    top:10px;
`
const LegendStyle = styled.div`
    float:left;
    cursor:pointer;
    margin-right:8px;
    flex:none;
`
const RenderLenged = (props: any) => {
    const { data, identify, index, idx } = props
    const [legend, setLegend] = useState('')
    const [chartH,setChartH] = useState(0)
    const chartHeight : any = useRef()
    const handleToggle = (name: any) => {
        setLegend(name)
    }
    useEffect(()=>{
        setChartH(chartHeight?.current?.clientHeight + 10)
    },[chartHeight])
    let color = ['#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB']
    const legData = useMemo(() => {
        let le: any = []
        le.push({
            name: `对比标识：${identify?.base_group.tag}`,
            inner: <div>
                    <CreateTag>BaseGroup</CreateTag>
                    <CreateCompare style={{background: color[0]}}></CreateCompare>
                    对比标识：{identify?.base_group.tag}
                </div>
        })
       
        
        for (let compare = identify.compare_groups, k = 0; k < compare.length; k++) {
            if(compare.length > 3) color.push('#FAD337', '#4DCB73', '#3BA0FF', '#36CBCB')
            le.push({
                name: `对比标识：${compare[k].tag}`,
                inner: <>
                        <CreateCompare style={{ background: color[k + 1] }}></CreateCompare>
                        <span>对比标识：{compare[k].tag}</span>
                    </>
            })
        }
        return le
    }, [identify])
    return (
        <Warpper id={`conf-${idx}-${index}`}>
            <WarpperChart ref={chartHeight}>
                {
                    legData.map((i: any) => <LegendStyle onClick={() => handleToggle(i.name)}>{i.inner}</LegendStyle>)
                }
            </WarpperChart>
            <div style={{ paddingTop: chartH }} >
            {
                data.metric_list.map((metric: any, i: number) => (
                    <ChartRender setLegend={setLegend} name={legend} metric={metric} idx={index} conf={data.conf_name} metricLen={data.metric_list.length} confLen={i} identify={props.identify} />
                ))
            }
            </div>
        </Warpper>
    )
}

const RenderChart = (props: any) => {
    const { loading } = props
    const [ anchor,setAnchor ] = useState('')

    const handleScroll = (suiteIndex:number,idx: number) => {
        setAnchor(`${suiteIndex}-${idx}`)
        document.querySelector(`#conf-${suiteIndex}-${idx}`)?.scrollIntoView()
    }

   const confLen = props.chartData?.conf_list
    return (
        <Spin spinning={loading}>
            {
                props.chartData == null ?
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    :
                    <Row>
                        <Col span={16} style={{ minHeight:320, height: confLen.length > 2 ? confLen.length * 30 + 50 : '100%' }} className={styles.test_chart}>
                            {
                                confLen.map((item: any, idx: number) => (
                                    <RenderLenged data={item} index={idx} identify={props.identify} idx={props.idx}/>
                                ))
                            }
                        </Col>
                        <Col span={8} >
                            <div className={styles.test_conf}>Test Conf({confLen.length})</div>
                            {
                                confLen.map((item: any, index: number) => (
                                    <div className={styles.test_conf_detail} 
                                        style={{ color: anchor == `${props.idx}-${index}` ? '#1890FF' : '#000'}} 
                                        onClick={() => handleScroll(props.idx,index)}>{`Config${index + 1} ：${item.conf_name}`}</div>
                                ))
                            }
                        </Col>
                    </Row>
            }
        </Spin>

    )
}
export default RenderChart;