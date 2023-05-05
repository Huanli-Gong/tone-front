/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Typography, Input, notification, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, Access, useAccess } from 'umi';
import { AccessTootip } from '@/utils/utils';
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
        btn: boolean,
        btnConfirm: boolean,
        isInput?: boolean,
        onOk: any
    }) => {

    const { formatMessage } = useIntl()
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
        if (_.isNull(title) || _.isUndefined(title)) return formatMessage({ id: 'report.not.filled.in' })
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
    creator,
}:
    {
        saveData: any,
        style?: any,
        field: string,
        space?: string,
        fontStyle?: any,
        defaultHolder?: string,
        creator: number,
    }) => {
    const access = useAccess();
    const { formatMessage } = useIntl()
    const [btn, setBtn] = useState(false)
    const [title, setTitle] = useState('')

    useEffect(() => {
        if (field === 'custom') {
            setTitle(saveData.test_conclusion.custom)
        } else if (field === 'text') {
            setTitle(saveData.test_env.text)
        } else {
            setTitle(saveData[field])
        }
    }, [saveData, field])

    const openNotification = (name: string) => {
        notification['success']({
            message: `${name}`,
            placement: 'bottomRight'
        });
    };

    const changeName = (name: any) => {
        const list = {
            description: formatMessage({ id: 'report.description.save' }),
            test_background: formatMessage({ id: 'report.test_background.save' }),
            test_method: formatMessage({ id: 'report.test_method.save' }),
            custom: formatMessage({ id: 'report.test_conclusion.save' }),
            text: formatMessage({ id: 'report.text.save' }),
        }
        return list[name];
    }

    const handleBlur = async () => {
        const { id } = saveData
        const obj: any = {
            report_id: id,
        }
        if (field === 'custom') {
            obj.test_conclusion = {
                custom: title
            }
        } else if (field === 'text') {
            obj.test_env = {
                text: title
            }
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
        if (_.isNull(title) || _.isUndefined(title)) return <FormattedMessage id="report.not.filled" />
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
                        <Access accessible={access.WsTourist()}>
                            <Access
                                accessible={access.WsMemberOperateSelf(creator)}
                                fallback={
                                    <EditOutlined onClick={() => AccessTootip()} style={{ paddingLeft: 10 }} />
                                }
                            >
                                <EditOutlined style={{ paddingLeft: 10 }} onClick={() => setBtn(true)} />
                            </Access>
                        </Access>
                    </div>
            }
        </>
    )
}