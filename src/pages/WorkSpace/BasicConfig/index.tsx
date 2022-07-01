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
import { useModel, useParams } from 'umi'
import PartDom from '@/components/Public/TitlePart'
import styles from './index.less'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'

import Transfer from './Components/Transfer'
import Logoff from './Components/Logoff'
import Cover from './Components/Cover'

const { Text } = Typography

const WorkspaceBasicConfig: React.FC = () => {
    const { ws_id } = useParams() as any

    const access = useAccess();
    const { initialState, setInitialState } = useModel<any>('@@initialState')

    const [detail, setDetail]: Array<any> = useState()
    const [firstDetail, setFirstDetail] = useState()

    const [errorReg, setErrorReg] = useState({
        regName: false,
        regShowName: false,
        regDescription: false
    })

    const workspaceInit = async () => {
        const { data, code, msg } = await queryWorkspaceDetail(ws_id)
        if (code === 200) {
            setDetail(_.cloneDeep(data))
            setInitFormStatus(data)
            setFirstDetail(data)
        }
        else requestCodeMessage(code, msg)
    }

    const refresh = async () => {
        await workspaceInit()
        handleChangeWsList()
    }

    useEffect(() => {
        workspaceInit()
    }, [location.pathname])

    const setInitFormStatus = (data: any) => {
        const { show_name, name, description } = data
        let regShowName = !(/^[A-Za-z0-9\u4e00-\u9fa5\._-]{1,20}$/g.test(show_name))
        let regName = !(/^[a-z0-9_-]{1,20}$/.test(name))
        let regDescription = !(/^([\w\W]){1,200}$/.test(description))
        setErrorReg({ regShowName, regName, regDescription })
    }

    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    }

    const handleChangeWsList = () => {
        setInitialState({ ...initialState, refreshWorkspaceList: !initialState?.refreshWorkspaceList })
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
            message.success('成功保存')
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

    return (
        <Layout.Content style={{ background: '#f5f5f5' }}>
            <Row className={styles.row_box}>
                <Form
                    {...layout}
                    colon={true}
                    layout="vertical"
                    style={{ width: '100%' }}
                >
                    <PartDom text='封面信息' />
                    <Cover intro={detail} refresh={refresh} />
                    <Form.Item
                        label="显示名 "
                        name="show_name"
                        validateStatus={errorReg.regShowName ? 'error' : undefined}
                        help={errorReg.regShowName && '长度最多20位,仅允许包含汉字、字母、数字、下划线、中划线、点'}
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
                        label="名称 "
                        name="name"
                        validateStatus={errorReg.regName ? 'error' : undefined}
                        help={errorReg.regName && '只允许英文小写、下划线和数字，最多20个字符'}
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
                        validateStatus={errorReg.regDescription ? 'error' : undefined}
                        help={errorReg.regDescription && '长度最多200位'}
                        label="介绍 "
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
                    <Form.Item label="是否公开 " style={{ marginBottom: 16 }} name="is_public">
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
                            确定
                        </Button>
                    </Access>
                </Form>
            </Row>
            <Row className={styles.row_box}>
                <Form
                    {...layout}
                    colon={true}
                    style={{ width: '100%' }}
                >
                    <PartDom text='Workspace信息' />
                    <div className={styles.second_part}>
                        <span style={{ width: 70, textAlign: 'right' }}>所有者：</span>
                        <Row style={{ width: 'calc(100% - 70px)' }}>
                            <Col span={24}>
                                <Space>
                                    <Avatar size={25} src={detail?.creator_avatar} />
                                    <Text>{detail?.owner_name}</Text>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text style={{ color: 'rgba(0,0,0,0.5)' }}>{detail?.proposer_dep}</Text>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.second_part}>
                        <span style={{ width: 70, textAlign: 'right' }}>创建时间：</span>
                        <Text>{detail?.gmt_created}</Text>
                    </div>
                    <div className={styles.second_part} style={{ marginBottom: 16 }}>
                        <span style={{ width: 70, textAlign: 'right' }}>人数：</span>
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
                        <PartDom text='更多操作' />
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
