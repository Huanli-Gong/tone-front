import React, { useState, useEffect } from 'react'
import { Typography, Row, Select, Space, Button, Divider, Input, Layout, Spin, Radio, Alert } from 'antd'
import styles from './index.less'
import _ from 'lodash'

import { saveWorkspaceConfig, deleteWorkspace } from '@/services/Workspace'
import { useParams, history } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import { queryWorkspaceMember } from '@/services/Workspace'
import produce from 'immer'

import type { SelectProps } from 'antd/es/select';

interface ContentProps {
    handleCancel?: () => void,
    handleSubmit?: (obj: {
        id?: number,
        reason?: string
    }) => void,
    member?: any[],
    onMemberSearch?: (name: string) => void;
    refresh?: () => void;
}

export const IsPublicComponent = (props: any) => {
    const [title, setTitle] = useState(false)
    useEffect(() => {
        setTitle(props.title)
    }, [props.title])
    const handleClick = (evt: any) => {
        setTitle(evt.target.value)
        const parmas = {
            [props.keyName]: evt.target.value,
        }
        props.changeText(parmas)
    }
    return (
        <Space>
            <Radio.Group onChange={handleClick} value={title} disabled={props.disabled}>
                <Radio value={true}>公开</Radio>
                <Radio value={false}>私密</Radio>
            </Radio.Group>
        </Space>
    )
}

export const SettingEdit = ({
    name,
    size = 'small',
    type = 'input',
    disabled,
    inputType,
    setErrorReg,
    errorReg,
    changeText,
}: {
    name: string,
    keyName: string,
    size?: string,
    type?: string,
    disabled?: boolean,
    inputType: string
    setErrorReg: any,
    errorReg: any,
    changeText: (data: any) => void
}) => {
    const [title, setTitle] = useState(name)
    useEffect(() => {
        setTitle(name)
    }, [name])
    const handleChange = (evt: any) => {
        setTitle(evt.target.value)
        const value = evt.target.value
        let reg = /^([\w\W])+$/
        let typeName = ''
        if (inputType === 'name') {
            reg = /^[a-z0-9_-]{1,20}$/
            typeName = 'regName'
        }
        if (inputType === 'show_name') {
            reg = /^[A-Za-z0-9\u4e00-\u9fa5\._-]{1,20}$/g
            typeName = 'regShowName'
        }
        if (inputType === 'description') {
            reg = /^([\w\W]){1,200}$/
            typeName = 'regDescription'
        }
        const flag = reg.test(value)
        setErrorReg({ ...errorReg, [typeName]: !flag })
        changeText({ [inputType]: value })
    }

    return (
        <>
            {
                type === 'input' ?
                    <Input
                        autoComplete="off"
                        style={{ width: 480, height: 32 }}
                        defaultValue={title}
                        value={title}
                        disabled={disabled}
                        onChange={handleChange}
                    /> :
                    <Input.TextArea
                        size={size}
                        style={{ width: 480 }}
                        defaultValue={title}
                        disabled={disabled}
                        value={title}
                        onChange={handleChange}
                    />
            }
        </>
    )
}

const nameRunder = ({ first_name, last_name }: { first_name: string, last_name: string }): string => {
    if (first_name && last_name) return `${first_name}（${last_name}）`
    if (first_name && !last_name) return first_name
    if (!first_name && last_name) return last_name
    return ''
}

export const TransferContent: React.FC<ContentProps> = (props) => {
    const { ws_id } = useParams() as any
    const { refresh } = props

    const [id, setId] = useState(null)
    const [members, setMembers] = React.useState([])
    const [fetching, setFetching] = React.useState(false)

    const handleSubmit = async () => {
        if (!id) return
        const { code, msg } = await saveWorkspaceConfig({ id: ws_id, owner: id })
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        if (refresh)
            refresh()
    }

    React.useEffect(() => {
        handleSearch()
        return () => {
            setMembers([])
            setId(null)
        }
    }, [])

    const handleSearch = async (keyword = '') => {
        setMembers([])
        setFetching(true)
        const { data, code, msg } = await queryWorkspaceMember({ ws_id, keyword })
        if (code !== 200) {
            setFetching(false)
            requestCodeMessage(code, msg)
            return
        }
        setFetching(false)
        setMembers(data.map((member: any) => ({ value: member.user_info.id, label: nameRunder(member.user_info) })))
    }

    return (
        <Layout.Content style={{ width: 400 }}>
            <Row style={{ marginTop: 4, marginBottom: 24 }} className={styles.full_width}>
                <Alert message="Workspace权限转移，将空间所有权限转交给指定成员" type="warning" showIcon style={{ width: '100%', height: 32 }} />
            </Row>
            <Row className={styles.full_width}>
                <Typography.Text strong >用户</Typography.Text>
            </Row>
            <Row style={{ marginTop: 6 }} className={styles.full_width}>
                <Select
                    style={{ width: '100%' }}
                    onChange={val => setId(val)}
                    value={id}
                    showSearch
                    onSearch={_.debounce(handleSearch, 500)}
                    placeholder="输入花名、姓名"
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    options={members}
                />
            </Row>
            <Divider style={{ marginTop: 24, marginBottom: 10, width: 'calc(100% + 48px)', transform: 'translateX(-24px)' }} />
            <Row justify="end" className={styles.full_width}>
                <Space>
                    <Button onClick={props.handleCancel}>取消</Button>
                    <Button type="primary" onClick={() => handleSubmit()}>确定</Button>
                </Space>
            </Row>
        </Layout.Content>
    )
}

export const LogOffContent: React.FC<ContentProps> = (props) => {
    const { ws_id } = useParams() as any
    const { handleCancel } = props

    const handleSubmit = async (reason = '') => {
        const { code, msg } = await deleteWorkspace({ id: ws_id, reason }) // user_id 么有
        if (code !== 200) {
            requestCodeMessage(code, msg)
            return
        }
        history.push('/')
        handleCancel && handleCancel()
    }

    return (
        <Layout.Content style={{ width: 400 }}>
            <Row>
                <Typography.Text style={{ color: '(0,0,0,0.65)', lineHeight: '22px' }}>一旦你注销Workspace，里面所有Job结果、测试计划、测试分析、测试报告中所有内容以及所关联的所有文档都将会被永久删除。这是一个不可恢复的操作，请谨慎对待！</Typography.Text>
            </Row>
            <Divider style={{ marginTop: 24, marginBottom: 10, width: 'calc(100% + 48px)', transform: 'translateX(-24px)' }} />
            <Row justify="end" className={styles.full_width}>
                <Space>
                    <Button onClick={handleCancel}>取消</Button>
                    <Button type="primary" onClick={() => handleSubmit && handleSubmit()} >注销</Button>
                </Space>
            </Row>
        </Layout.Content>
    )
}
