import React, { useEffect, useState } from 'react';
import { Typography, Input } from 'antd';
import styled from 'styled-components';
import _ from 'lodash';
const { TextArea } = Input;

const TextAreaWarrper = styled(TextArea)`
    width: 100%;
`
export const PerfTextArea = ({
        name,
        field,
        suite,
        dataSource,
        setDataSource,
        style,
        space = '0px',
        fontStyle={
            fontSize: 14,
            fontFamily: 'PingFangSC-Regular',
            color: 'rgba(0,0,0,0.65)',
            whiteSpace: 'pre-wrap',
        },
        defaultHolder,
        btn = false,
    }:
    {
        name: string,
        field: string,
        suite: any,
        dataSource: any,
        setDataSource: any,
        style?: any,
        space?: string,
        fontStyle?:any,
        defaultHolder?: string,
        btn: Boolean,
    }) => {

    const [title, setTitle] = useState('')

    useEffect(() => {
        setTitle(name)
    }, [name])

    const handleEle = (item:any,field:any,data:any) => {
         return item.list.map((i:any) => {
            if (i.suite_id == data.suite_id && i.rowKey == data.rowKey) {
                i[field] = title
            }
            return {
                ...i,
            }
        })
       
    }
    const handleEleGroup = (item:any,field:any,data:any) => {
        let ret = item.list.map((i: any) => {
            if (i.suite_id == data.suite_id && i.rowKey == data.rowKey) {
                i[field] = title
            }
            return {
                ...i,
            }
        })
        return {
            ...item,
            list: ret,
        }
   }
    const handleBlur = () => {
        setDataSource(dataSource.map((ele: any) => {
            if (ele.is_group) {
                let list = ele.list.map((l: any) => handleEleGroup(l, field, suite))
                return {
                    ...ele,
                    list,
                }
            } else {
                let list = handleEle(ele, field, suite)
                return {
                    ...ele,
                    list,
                }
            }
        }))
    }
    
    const handleChange = (title: any) => {
        if (_.isNull(title) || _.isUndefined(title)) return '未填写'
        return title
    }
    return (
        <>
            {
                btn ?
                    <>
                        {
                            <div style={{ marginBottom: space }}>
                                <TextAreaWarrper
                                    autoComplete="off"
                                    size="small"
                                    placeholder={defaultHolder}
                                    style={{ padding: '10px', ...fontStyle }}
                                    value={title}
                                    onChange={evt => setTitle(evt.target.value)}
                                    onBlur={handleBlur}
                                />
                            </div>
                        }

                    </>
                    :
                    <div style={{ width: '100%', ...style }}>
                        <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                    </div>
            }
        </>
    )
}

export const GroupItemText = ({
    name,
    rowKey,
    btn = false,
    dataSource,
    setDataSource,
    defaultHolder,
}:
{
    name: string,
    rowKey:any,
    btn: Boolean,
    dataSource:any,
    setDataSource:any,
    defaultHolder?:string,
    
}) => {
    const [title, setTitle] = useState('')

    useEffect(() => {
        setTitle(name)
    }, [name])

    const handleBlur = () => {
        setDataSource(dataSource.map((ele: any) => {
            if (ele.is_group) {
                if (ele.rowKey == rowKey) {
                    ele.name = title
                }
                let list = ele.list.map((l: any) => {
                    if (l.rowKey == rowKey) {
                        l.name = title
                    }
                    return {
                        ...l,
                    }
                })
                return {
                    ...ele,
                    list
                }
            } else {
                if (ele.rowKey == rowKey) {
                    ele.name = title
                }
                return {
                    ...ele,
                }
            }
        }))
    }
    const fontStyle = {
        fontSize: 14,
        fontFamily: 'PingFangSC-Medium',
        color: 'rgba(0,0,0,0.85)'
    }
    const handleChange = (title: any) => {
        if (_.isNull(title) || _.isUndefined(title)) return '未填写'
        return title
    }
    return (
        <>
            {
                btn ?
                    <Input
                        autoComplete="off"
                        size="small"
                        placeholder={defaultHolder}
                        style={{ padding: '6px 8px 6px 8px', width: '93%', ...fontStyle }}
                        value={title}
                        onChange={evt => setTitle(evt.target.value)}
                        onBlur={handleBlur}
                    />
                    :
                    <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
            }
        </>
    )
}