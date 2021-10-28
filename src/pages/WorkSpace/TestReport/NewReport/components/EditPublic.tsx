import React, { useEffect, useState } from 'react';
import { Typography, Input } from 'antd';
import styled from 'styled-components';
import _ from 'lodash';
const { TextArea } = Input;

const TextAreaWarrper = styled(TextArea)`
    width: 100%;
`
export const SettingTextArea = ({
        name,
        style,
        space = '0px',
        fontStyle,
        defaultHolder,
        btn = false,
        btnConfirm = false,
        isInput = false,
        onOk,
    }:
    {
        name: string,
        style?:any,
        space?:string,
        fontStyle?:any,
        defaultHolder?:string,
        btn: Boolean,
        btnConfirm: Boolean,
        isInput?:Boolean,
        onOk: Function
    }) => {

    const [title, setTitle] = useState('')
    useEffect(()=>{
        if(btnConfirm) {
            onOk(title)
        }
    }, [ btnConfirm ])

    useEffect(() => {
        setTitle(name)
    }, [name])

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
                       isInput ? 
                       <Input
                            autoComplete="off"
                            size="small"
                            placeholder={defaultHolder}
                            style={{ padding:'6px 8px 6px 8px',width:'93%', ...fontStyle }}
                            value={title}
                            onChange={evt => setTitle(evt.target.value)}
                        />
                       :
                       <div style={{ marginBottom: space }}>
                            <TextAreaWarrper
                                    autoComplete="off"
                                    size="small"
                                    placeholder={defaultHolder}
                                    style={{ padding:'10px', ...fontStyle }}
                                    value={title}
                                    onChange={evt => setTitle(evt.target.value)}
                                />
                            </div>
                   }
                    
                </>
                :  
                isInput ? <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                   :
                <div style={{ width:'100%', ...style }}>
                    <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                </div>
            }
        </>    
    )
}