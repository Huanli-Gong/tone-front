import { Space } from 'antd';
import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'
interface StateTagprop {
    color: string;
}

const StateTag = styled.span<StateTagprop>`
    color:${props => props.color};
    background : ${props => hex2rgb(props.color)};
    height: 24px;
    width: 64px;
    font-size: 14px;
    line-height:24px;
    text-align : center;
    border-radius: 12px;
    padding:0 7px;
`
function hex2rgb(a: string) {
    if (a == "") {
        return ""
    }
    a = a.substring(1);
    a = a.toLowerCase();
    let b = new Array();
    for (let x = 0; x < 3; x++) {
        b[0] = a.substr(x * 2, 2);
        b[3] = "0123456789abcdef";
        b[1] = b[0].substr(0, 1);
        b[2] = b[0].substr(1, 1);
        b[20 + x] = b[3].indexOf(b[1]) * 16 + b[3].indexOf(b[2]);
    }
    return "rgba(" + b[20] + "," + b[21] + "," + b[22] + ",.1)";
}

export const failColr = '#C84C5A'
export const complateColr = '#39C15B'
export const runningColr = '#649FF6'

export const StateTagRender: React.FC<any> = ({ state }) => {
    switch (state) {
        case 'Running': return <StateTag color={failColr} >Running</StateTag>
        case 'Complete': return <StateTag color={complateColr} >Complete</StateTag>
        case 'Fail': return <StateTag color={runningColr} >Fail</StateTag>
        default: return <>-</>
    }
    return <>-</>
}

export const RenderCountTags = ({ count, complate, fail }: any) => (
    <Space>
        <StateTag color={failColr} >{count || '-'}</StateTag>
        <StateTag color={complateColr} >{complate || '-'}</StateTag>
        <StateTag color={runningColr} >{fail || '-'}</StateTag>
    </Space>
)

const DataRowSpace = styled(Space)`
    span { font-size : 12px; }
`
export const RenderDataRow = (props: any) => (
    <DataRowSpace>
        <div>
            <span>触发次数：</span><span style={{ marginRight: 8, color: runningColr }}>{_.get(props, 'itemData.trigger_count')}</span>
            <span>成功：</span><span style={{ marginRight: 8, color: complateColr }}>{_.get(props, 'itemData.success_count')}</span>
            <span>失败：</span><span style={{ marginRight: 8, color: failColr }}>{_.get(props, 'itemData.fail_count')}</span>
        </div>
        {
            _.get(props, 'itemData.last_time') &&
            <>
                <span>最近一次触发时间：</span>
                <span>{_.get(props, 'itemData.last_time') || '-'}</span>
            </>
        }
        {
            _.get(props, 'itemData.next_time') &&
            <>
                <span>下次触发时间：</span>
                <span>{_.get(props, 'itemData.next_time') || '-'}</span>
            </>
        }
    </DataRowSpace>
)