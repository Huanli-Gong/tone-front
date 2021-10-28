import React, { useEffect, useState } from 'react';
import { Space, Typography, Input, Button, Row } from 'antd';
//import { EditTwoTone } from '@ant-design/icons'
import { EditOutlined } from '@ant-design/icons'
import styled from 'styled-components';
const { TextArea } = Input;
const Warpper = styled.span`
    margin-left:5px;
    .edit{
        font-size:12px;
        color:#000;
    }
`
const Detail = styled(Row)`
    margin:8px 0 16px 0;
`
const SpaceWarp = styled(Space)`
   
`
export const SettingEdit = ({
    name,
    position,
    text,
    btn,
    onOk,
}:
    {
        name: string,
        position: string,
        text: string,
        btn: Boolean,
        onOk: Function
    }) => {
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState(false)
    const handleOk = () => {
        onOk(title)
        setStatus(false)
    }

    useEffect(() => {
        setTitle(name)
    }, [name])

    if (status) {
        return (
            <>
                {
                    position == 'center' &&
                    <Space>
                        <Input
                            autoComplete="off"
                            size="small"
                            defaultValue={title}
                            value={title}
                            onChange={evt => setTitle(evt.target.value)}
                        />
                        <Button size="small" type="primary" onClick={handleOk}>保存</Button>
                        <Button size="small" onClick={() => {
                            setStatus(false)
                            setTitle(name)
                        }}>取消</Button>
                    </Space>
                }
                {
                    position == 'bottom' &&
                    <>
                        <div>{text}</div>
                        <Detail>
                            <Space>
                                <Input
                                    autoComplete="off"
                                    size="small"
                                    defaultValue={title}
                                    value={title}
                                    onChange={evt => setTitle(evt.target.value)}
                                />
                                <Button size="small" type="primary" onClick={handleOk}>保存</Button>
                                <Button size="small" onClick={() => {
                                    setStatus(false)
                                    setTitle(name)
                                }}>取消</Button>
                            </Space>
                        </Detail>
                    </>

                }
            </>

        )
    }

    return (
        <>
            {
                position == 'center' &&
                <>
                    <Typography.Text>{title}</Typography.Text>
                    <Warpper>
                        {btn && <EditOutlined onClick={() => setStatus(true)} className="edit" />}
                    </Warpper>
                </>
            }
            {
                position == 'bottom' &&
                <>
                    <Space>
                        <Typography.Text>
                            {text}
                        </Typography.Text>
                        <Warpper>
                            {btn && <EditOutlined onClick={() => setStatus(true)} className="edit" />}
                        </Warpper>
                    </Space>
                    <Detail>
                        {title}
                    </Detail>
                </>
            }
        </>
    )
}

export const SettingTextArea = ({
    name,
    position,
    text,
    btn,
    onOk,
}:
    {
        name: string,
        position: string,
        text: string,
        btn: Boolean,
        onOk: Function
    }) => {
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState(false)
    const handleOk = () => {
        onOk(title)
        setStatus(false)
    }

    useEffect(() => {
        setTitle(name)
    }, [name])

    if (status) {
        return (
            <>
                {
                    position == 'center' &&
                    <Space >
                        <TextArea
                            rows={3}
                            style={{ width: 450 }}
                            autoComplete="off"
                            size="small"
                            value={title}
                            onChange={evt => setTitle(evt.target.value)}
                        />
                        <Space>
                            <Button size="small" type="primary" onClick={handleOk}>保存</Button>
                            <Button size="small" onClick={() => {
                                setStatus(false)
                                setTitle(name)
                            }}>取消</Button>
                        </Space>
                    </Space>
                }
                {
                    position == 'bottom' &&
                    <>
                        <div>{text}</div>
                        <Detail>
                            <Space direction="vertical">
                                <TextArea
                                    rows={3}
                                    style={{ width: 450 }}
                                    autoComplete="off"
                                    size="small"
                                    defaultValue={title}
                                    value={title}
                                    onChange={evt => setTitle(evt.target.value)}
                                />
                                <Space>
                                    <Button size="small" type="primary" onClick={handleOk}>保存</Button>
                                    <Button size="small" onClick={() => {
                                        setStatus(false)
                                        setTitle(name)
                                    }}>取消</Button>
                                </Space>
                            </Space>
                        </Detail>
                    </>

                }
            </>

        )
    }

    return (
        <>
            {
                position == 'center' &&
                <>
                    <Typography.Text>{title}</Typography.Text>
                    <Warpper>
                        {btn && <EditOutlined onClick={() => setStatus(true)} className="edit" />}
                    </Warpper>
                </>
            }
            {
                position == 'bottom' &&
                <>
                    <Space>
                        <Typography.Text>
                            {text}
                        </Typography.Text>
                        <Warpper>
                            {btn && <EditOutlined onClick={() => setStatus(true)} className="edit" />}
                        </Warpper>
                    </Space>
                    <Detail>
                        {title}
                    </Detail>
                </>
            }
        </>
    )
}