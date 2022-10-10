import React, { useState, useEffect } from 'react'
import { Typography, Row, Select, Space, Button, Divider, Input, Layout, Spin, Radio, Alert } from 'antd'
import styles from './index.less'
import _ from 'lodash'

import { saveWorkspaceConfig, deleteWorkspace } from '@/services/Workspace'
import { useParams, history, useIntl, FormattedMessage, getLocale } from 'umi'
import { requestCodeMessage } from '@/utils/utils'
import { queryWorkspaceMember } from '@/services/Workspace'
import produce from 'immer'

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
                <Radio value={true}><FormattedMessage id="ws.config.public"/></Radio>
                <Radio value={false}><FormattedMessage id="ws.config.private"/></Radio>
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
    size?: any,
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
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

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
                <Alert message={<FormattedMessage id="ws.config.transfer.Alert"/>} type="warning" showIcon style={{ width: '100%', height: enLocale ? 64: 32 }} />
            </Row>
            <Row className={styles.full_width}>
                <Typography.Text strong><FormattedMessage id="ws.config.transfer.user"/></Typography.Text>
            </Row>
            <Row style={{ marginTop: 6 }} className={styles.full_width}>
                <Select
                    style={{ width: '100%' }}
                    onChange={val => setId(val)}
                    value={id}
                    showSearch
                    onSearch={_.debounce(handleSearch, 500)}
                    placeholder={formatMessage({id: 'ws.config.transfer.placeholder'})}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={false}
                    options={members}
                />
            </Row>
            <Divider style={{ marginTop: 24, marginBottom: 10, width: 'calc(100% + 48px)', transform: 'translateX(-24px)' }} />
            <Row justify="end" className={styles.full_width}>
                <Space>
                    <Button onClick={props.handleCancel}><FormattedMessage id="operation.cancel"/></Button>
                    <Button type="primary" onClick={() => handleSubmit()}><FormattedMessage id="operation.ok"/></Button>
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
                <Typography.Text style={{ color: '(0,0,0,0.65)', lineHeight: '22px' }}>
                    <FormattedMessage id="ws.config.warning"/>
                </Typography.Text>
            </Row>
            <Divider style={{ marginTop: 24, marginBottom: 10, width: 'calc(100% + 48px)', transform: 'translateX(-24px)' }} />
            <Row justify="end" className={styles.full_width}>
                <Space>
                    <Button onClick={handleCancel}><FormattedMessage id="operation.cancel"/></Button>
                    <Button type="primary" onClick={() => handleSubmit && handleSubmit()} ><FormattedMessage id="operation.log.off"/></Button>
                </Space>
            </Row>
        </Layout.Content>
    )
}
