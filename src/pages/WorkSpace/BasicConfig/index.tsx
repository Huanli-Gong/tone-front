import React, { useState, useEffect } from 'react'
import {
    Layout,
    Form,
    Button,
    Typography,
    Row,
    Space,
    Avatar,
    Col,
    message,
} from 'antd'
import { SettingEdit, IsPublicComponent } from './Components'
import { Access, useAccess } from 'umi'
import { queryWorkspaceDetail, saveWorkspaceConfig } from '@/services/Workspace'
import { useModel, useParams, useIntl, FormattedMessage, getLocale } from 'umi'
import PartDom from '@/components/Public/TitlePart'
import styles from './index.less'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'

import Transfer from './Components/Transfer'
import Logoff from './Components/Logoff'
import Cover from './Components/Cover'

const { Text } = Typography

const WorkspaceBasicConfig: React.FC = () => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

    const { ws_id } = useParams() as any

    const access = useAccess();
    const { setInitialState } = useModel<any>('@@initialState')

    const [detail, setDetail] = useState<any>()
    const [firstDetail, setFirstDetail] = useState()

    const [errorReg, setErrorReg] = useState({
        regName: false,
        regShowName: false,
        regDescription: false
    })

    const setInitFormStatus = (data: any) => {
        const { show_name, name, description } = data
        const regShowName = !(/^[A-Za-z0-9\u4e00-\u9fa5\._-]{1,30}$/g.test(show_name))
        const regName = !(/^[a-z0-9_-]{1,30}$/.test(name))
        const regDescription = !(/^([\w\W]){1,200}$/.test(description))
        setErrorReg({ regShowName, regName, regDescription })
    }
    
    const workspaceInit = async () => {
        const { data, code, msg } = await queryWorkspaceDetail(ws_id)
        if (code === 200) {
            setDetail(_.cloneDeep(data))
            setInitFormStatus(data)
            setFirstDetail(data)
            setInitialState((p: any) => ({
                ...p, workspaceHistoryList: p.workspaceHistoryList.reduce((pre: any, cur: any) => {
                    if (cur.id === ws_id) return pre.concat(data)
                    return pre.concat(cur)
                }, [])
            }))
        }
        else requestCodeMessage(code, msg)
    }

    const refresh = async () => {
        await workspaceInit()
    }

    useEffect(() => {
        workspaceInit()
    }, [location.pathname])

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    }

    const handleSave = async () => {
        const { show_name, description, name, is_public } = detail
        const { code, msg } = await saveWorkspaceConfig({
            show_name,
            name,
            is_public,
            description,
            id: ws_id,
        })
        if (code === 200) {
            refresh()
            message.success(formatMessage({ id: 'request.save.success' }))
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const changeText = (data: any) => {
        setDetail({ ...detail, ...data })
    }

    let isOk = errorReg.regShowName || errorReg.regShowName || errorReg.regDescription
    isOk = isOk ? isOk : (_.get(detail, 'show_name') === _.get(firstDetail, 'show_name')
        && _.get(detail, 'name') === _.get(firstDetail, 'name')
        && _.get(detail, 'description') === _.get(firstDetail, 'description')
        && _.get(detail, 'is_public') === _.get(firstDetail, 'is_public'))

    const widthLocale = enLocale ? 120 : 70
    const wsInfoStyles = { width: widthLocale, textAlign: 'right' }

    return (
        <Layout.Content style={{ background: '#f5f5f5', overflowY: 'auto' }}>
            <Row className={styles.row_box}>
                <Form
                    {...layout}
                    layout="vertical"
                    style={{ width: '100%' }}
                >
                    <PartDom text={formatMessage({ id: 'ws.config.cover.info' })} />
                    <Cover intro={detail} refresh={refresh} />
                    <Form.Item
                        label={<FormattedMessage id="ws.config.show_name" />}
                        name="show_name"
                        validateStatus={errorReg.regShowName ? 'error' : undefined}
                        help={errorReg.regShowName ? formatMessage({ id: 'ws.config.show_name.help' }) : undefined}
                    >
                        <SettingEdit
                            keyName="show_name"
                            name={detail?.show_name}
                            changeText={changeText}
                            errorReg={errorReg}
                            inputType="show_name"
                            setErrorReg={setErrorReg}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="ws.config.name" />}
                        name="name"
                        validateStatus={errorReg.regName ? 'error' : undefined}
                        help={errorReg.regName ? formatMessage({ id: 'ws.config.name.help' }) : undefined}
                    >
                        <SettingEdit
                            keyName="show_name"
                            name={detail?.name}
                            changeText={changeText}
                            disabled={true}
                            inputType="name"
                            errorReg={errorReg}
                            setErrorReg={setErrorReg}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<FormattedMessage id="ws.config.description" />}
                        validateStatus={errorReg.regDescription ? 'error' : undefined}
                        help={errorReg.regDescription ? formatMessage({ id: 'ws.config.description.help' }) : undefined}
                        name="description">
                        <SettingEdit
                            type="textarea"
                            size="large"
                            keyName="description"
                            name={detail?.description}
                            changeText={changeText}
                            inputType="description"
                            errorReg={errorReg}
                            setErrorReg={setErrorReg}
                        />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="ws.config.is_public" />}
                        style={{ marginBottom: 16 }} name="is_public">
                        <IsPublicComponent
                            title={detail?.is_public}
                            keyName="is_public"
                            disabled={_.get(detail, 'is_common')}
                            changeText={changeText}
                        />
                    </Form.Item>
                    <Access
                        accessible={access.WsBtnPermission()}
                    >
                        <Button
                            style={{ marginBottom: 16 }}
                            disabled={isOk}
                            onClick={isOk ? () => { } : handleSave}
                            type="primary"
                        >
                            <FormattedMessage id="operation.ok" />
                        </Button>
                    </Access>
                </Form>
            </Row>
            <Row className={styles.row_box}>
                <Form
                    {...layout}
                    style={{ width: '100%' }}
                >
                    <PartDom text={formatMessage({ id: 'ws.config.workspace.info' })} />
                    <div className={styles.second_part}>
                        <span style={wsInfoStyles}>
                            <FormattedMessage id="ws.config.owner" />：
                        </span>
                        <Row style={{ width: `calc(100% - ${widthLocale}px)` }}>
                            <Col span={24}>
                                <Space>
                                    <Avatar size={25} src={detail?.owner_avatar} />
                                    <Text>{detail?.owner_name}</Text>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text style={{ color: 'rgba(0,0,0,0.5)' }}>{detail?.proposer_dep}</Text>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.second_part}>
                        <span style={wsInfoStyles}>
                            <FormattedMessage id="ws.config.creation.time" />：
                        </span>
                        <Text>{detail?.gmt_created}</Text>
                    </div>
                    <div className={styles.second_part} style={{ marginBottom: 16 }}>
                        <span style={wsInfoStyles}>
                            <FormattedMessage id="ws.config.member_count" />：
                        </span>
                        <Text>{detail?.member_count}</Text>
                    </div>
                </Form>
            </Row>

            <Access
                accessible={access.WsTransfer()}
            >
                <Row className={styles.row_box}>
                    <Form
                        {...layout}
                        colon={false}
                        layout="vertical"
                        style={{ width: '100%' }}
                        className={styles.three_part}
                    >
                        <PartDom text={formatMessage({ id: 'ws.config.more.operation' })} />
                        <Form.Item>
                            <Space>
                                <Transfer refresh={refresh} />
                                {
                                    !_.get(detail, 'is_common') &&
                                    <Logoff />
                                }
                            </Space>
                        </Form.Item>
                    </Form>
                </Row>
            </Access>
        </Layout.Content>
    )
}

export default WorkspaceBasicConfig
