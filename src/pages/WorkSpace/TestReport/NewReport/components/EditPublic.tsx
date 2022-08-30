import React, { useEffect, useState } from 'react';
import { Typography, Input, notification, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import _ from 'lodash';
import { editReportInfo } from '../../services';

const { TextArea } = Input;

const TextAreaWarrper = styled(TextArea)`
    width: 100%;
`
export const SettingTextArea = ({
    name,
    style,
    space = '0px',
    fontStyle = {
        fontSize: 14,
        fontFamily: 'PingFangSC-Regular',
        color: 'rgba(0,0,0,0.65)',
        whiteSpace: 'pre-wrap',
    },
    defaultHolder,
    btn = false,
    btnConfirm = false,
    isInput = false,
    onOk,
}:
    {
        name: string,
        style?: any,
        space?: string,
        fontStyle?: any,
        defaultHolder?: string,
        btn: Boolean,
        btnConfirm: Boolean,
        isInput?: Boolean,
        onOk: Function
    }) => {

    const [title, setTitle] = useState('')
    useEffect(() => {
        if (btnConfirm) {
            onOk(title)
        }
    }, [btnConfirm])

    useEffect(() => {
        setTitle(name)
    }, [name])

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
                            isInput ?
                                <Input
                                    autoComplete="off"
                                    size="small"
                                    placeholder={defaultHolder}
                                    style={{ padding: '6px 8px 6px 8px', width: '93%', ...fontStyle }}
                                    value={title}
                                    onChange={evt => setTitle(evt.target.value)}
                                />
                                :
                                <div style={{ marginBottom: space }}>
                                    <TextAreaWarrper
                                        autoComplete="off"
                                        size="small"
                                        placeholder={defaultHolder}
                                        style={{ padding: '10px', ...fontStyle }}
                                        value={title}
                                        onChange={evt => setTitle(evt.target.value)}
                                    />
                                </div>
                        }

                    </>
                    :
                    isInput ? <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                        :
                        <div style={{ width: '100%', ...style }}>
                            <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                        </div>
            }
        </>
    )
}

export const SettingRegUpdate = ({
    saveData,
    style,
    field,
    space = '0px',
    fontStyle = {
        fontSize: 14,
        fontFamily: 'PingFangSC-Regular',
        color: 'rgba(0,0,0,0.65)',
        whiteSpace: 'pre-wrap',
    },
    defaultHolder,
}:
    {
        saveData: any,
        style?: any,
        field: string,
        space?: string,
        fontStyle?: any,
        defaultHolder?: string,
    }) => {
    const [btn, setBtn] = useState(false)
    const [title, setTitle] = useState('')

    useEffect(() => {
        if (field === 'custom') {
            setTitle(saveData.test_conclusion.custom)
        } else if(field === 'text'){ 
            setTitle(saveData.test_env.text)
        } else {
            setTitle(saveData[field])
        }
    }, [saveData, field])

const openNotification = (name: string) => {
    notification['success']({
        message: `${name}保存成功`,
        placement: 'bottomRight'
    });
};

const changeName = (name: any) => {
    const list = {
        description: '报告描述',
        test_background: '测试背景',
        test_method: '测试方法',
        custom: '测试结论',
        text: '环境描述'
    }
    return list[name];
}

const handleBlur = async () => {
    const { id } = saveData
    let obj: any = {
        'description': '',
        'test_background': '',
        'test_method': '',
        test_conclusion: {
            custom: ''
        },
        test_env: {
            text: ''
        },
        report_id: id,
    }
    if (field === 'custom') {
        obj.test_conclusion.custom = title
    } else if (field === 'text') {
        obj.test_env.text = title
    } else {
        obj[field] = title
    }
    const { code, msg } = await editReportInfo({ ...obj })
    if (code === 200) {
        openNotification(changeName(field))
        setBtn(false)
    } else {
        message.error(msg)
    }
}

const handleChange = (title: any) => {
    if (_.isNull(title) || _.isUndefined(title)) return '未填写'
    return title
}
return (
    <>
        {
            btn ?
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
                :
                <div style={{ width: '100%', ...style }}>
                    <Typography.Text style={fontStyle}>{handleChange(title)}</Typography.Text>
                    <EditOutlined style={{ paddingLeft: 10 }} onClick={() => setBtn(true)} />
                </div>
        }
    </>
)
}