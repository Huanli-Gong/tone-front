import { Space } from 'antd';
import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import styled from 'styled-components'

interface StateTagprop {
    color : string;
}

const StateTag = styled.span<StateTagprop>`
    color:${props => props.color};
    background : ${props => hex2rgb( props.color )};
    height: 18px;
    min-width: 36px;
    font-size: 14px;
    line-height:18px;
    text-align : center;
    // font-weight: 700;
    display:inline-block;
    padding:0 7px;
`
const StateTagCircle = styled.span<StateTagprop>`
    color:${props => props.color};
    background : ${props => hex2rgb( props.color )};
    height: 18px;
    min-width: 36px;
    font-size: 14px;
    line-height:18px;
    text-align : center;
    display:inline-block;
    border-radius: 12px;
    // font-weight: 700;
    padding:0 7px;
`


function hex2rgb( a: string ) {
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

export const pendingColr = '#000000a6'
export const failColr = '#C84C5A'
export const complateColr = '#39C15B'
export const runningColr = '#649FF6'

export const StateTagRender : React.FC<any>= ( { state } ) => {
    switch ( state ) {
        case 'pending':  return <StateTag color={ pendingColr } >Pending</StateTag>
        case 'running':  return <StateTag color={ runningColr } >Running</StateTag>
        case 'success':  return <StateTag color={ complateColr } >Complete</StateTag>
        case 'fail':  return <StateTag color={ failColr } >Fail</StateTag>
        default : return <>-</>
    }
    return <>-</>
}

export const RenderCountTags = ( { total , pass , fail } : any ) => (
    <Space>
        <StateTagCircle color={ runningColr } >{ total || '-' }</StateTagCircle>
        <StateTagCircle color={ complateColr } >{ pass || '-'}</StateTagCircle>
        <StateTagCircle color={ failColr } >{ fail || '-'}</StateTagCircle>
    </Space>
)

const DataRowSpace = styled( Space )`
    span { font-size : 12px; }
`
export const RenderDataRow = ( props : any ) => (
    <DataRowSpace>
        <div>
            <span><FormattedMessage id="plan.trigger_count"/>：</span><span style={{ marginRight: 8, color: runningColr }}>{ props.trigger_count }</span>
            <span><FormattedMessage id="plan.success"/>：</span><span style={{ marginRight: 8, color: complateColr }}>{ props.success_count }</span>
            <span><FormattedMessage id="plan.fail"/>：</span><span style={{ marginRight: 8, color: failColr }}>{ props.fail_count }</span>
        </div>
        {
            props.next_time && 
            <>
                <span><FormattedMessage id="plan.next_time"/>：</span> 
                <span>{ props.next_time }</span>
            </>
        }
    </DataRowSpace>
)