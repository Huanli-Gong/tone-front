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
        fontStyle,
        defaultHolder,
        btn = false,
    }:
    {
        name: string,
        field:string,
        suite:any,
        dataSource:any,
        setDataSource:any,
        style?:any,
        space?:string,
        fontStyle?:any,
        defaultHolder?:string,
        btn: Boolean,
    }) => {

    const [title, setTitle] = useState('')
    

    useEffect(() => {
        setTitle(name)
    }, [name])

    const handleEle = (item:any,field:any,data:any) => {
        let ret = item.list.map((i:any) => {
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
        setDataSource(dataSource.map((ele:any) => {
            if(ele.is_group){
                let list = ele.list.map((l: any) => handleEle(l,field,suite))
                return {
                    ...ele,
                    list,
                }
            }else{
                let list = handleEle(ele,field,suite)
                return {
                    ...ele,
                    list,
                }
            }
        }))
    }
    
    const handleChange = (title:any) => {
        if(_.isNull(title) || _.isUndefined(title)) return '未填写'
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
                                style={{ padding:'10px', ...fontStyle }}
                                value={title}
                                onChange={evt => setTitle(evt.target.value)}
                                onBlur={handleBlur}
                                />
                            </div>
                   }
                </>
                :  
                <div style={{ width:'100%', ...style }}>
                    <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                </div>
            }
        </>    
    )
}