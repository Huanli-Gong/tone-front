import React, { useState, useEffect } from 'react'
import {
    Layout,
    Form,
    Button,
    Typography,
    Popover,
    Row,
    Space,
    Avatar,
    Col,
    message,
    Upload,
} from 'antd'
import { SettingEdit, LogOffContent, TransferContent, IsPublicComponent } from './Components'
import { Access, useAccess } from 'umi'
import { queryWorkspaceDetail, queryWorkspaceMember, deleteWorkspace, saveWorkspaceConfig } from '@/services/Workspace'
import CropperImage from '@/components/CropperImage'
import { history, useModel } from 'umi'
import AvatarCover from '@/components/AvatarCover'
import PartDom from '@/components/Public/TitlePart'
import styles from './index.less'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'
const { Text } = Typography

export default (props: any) => {
    const { ws_id } = props.match.params
    const access = useAccess();
    const { initialState, setInitialState } = useModel<any>('@@initialState')
    const [transferVisible, setTransferVisible] = useState(false)
    const [logOffVisible, setLogOffVisible] = useState(false)
    const [members, setMembers] = useState([])
    const [cropperModalVisible, setCropperModalVisible] = useState(false)
    const [cropperUrl, setCropperUrl] = useState('')

    const [detail, setDetail]: Array<any> = useState({
        logo: '',
        show_name: '',
        name: '',
        description: '',
        is_public: false,
        owner_name: '',
        proposer_dep: '',
        gmt_created: '',
        member_count: 0
    })
    const [errorReg, setErrorReg] = useState({
        regName: false,
        regShowName: false,
        regDescription: false
    })
    const [firstDetail, setFirstDetail] = useState({
        logo: '',
        show_name: '',
        name: '',
        description: '',
        is_public: false,
        owner_name: '',
        proposer_dep: '',
        gmt_created: '',
        member_count: 0
    })
    const workspaceInit = async () => {
        handleChangeWsList()
        const { data, code, msg } = await queryWorkspaceDetail(ws_id)
        if (code === 200) {
            setDetail(_.cloneDeep(data))
            setInitFormStatus(data)
            setFirstDetail(data)
        }
        else requestCodeMessage(code, msg)
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

    const handleTransfer = async () => {
        let { data, code, msg } = await queryWorkspaceMember({ ws_id })
        if (code === 200) {
            setMembers(data)
            setTransferVisible(true)
        }
        else requestCodeMessage(code, msg)
    }

    const uploadProps = {
        name: 'file',
        action: '/api/sys/upload/',
        beforeUpload: (file: any) => {
            const fileReader = new FileReader()
            fileReader.onload = (e: any) => {
                setCropperUrl(e.target.result)
                setCropperModalVisible(true)
            }
            fileReader.readAsDataURL(file)

            return false
        },
        onChange: async (info: any) => {
            if (info.file.status === 'done') {
                const { code, msg } = await saveWorkspaceConfig({ id: ws_id, logo: info.file.response.path })
                if (code === 200) {
                    workspaceInit()
                    message.success('更新成功！')
                }
                else requestCodeMessage(code, msg)
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    }
    const ellipsisText = (name: string) => {
        return name.slice(0, 1)
    }

    const handleChangeWsList = () => {
        setInitialState({ ...initialState, refreshWorkspaceList: !initialState?.refreshWorkspaceList })
    }
    const handleSave = async () => {
        const obj = {
            show_name: detail.show_name,
            name: detail.name,
            description: detail.description,
            id: ws_id,
            is_public: detail.is_public,
        }
        const { code, msg } = await saveWorkspaceConfig(obj)
        if (code === 200) {
            workspaceInit()
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
    const auth = window.localStorage.getItem('role_ws_title')

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
                    <Form.Item label="">
                        <Row style={{ width: '100%', marginBottom: 0 }}>
                            <AvatarCover size="large" {...detail} />
                            <div style={{ width: 'calc(100% - 96px - 20px)', marginLeft: 16 }} className={styles.first_part}>
                                <Row style={{ marginBottom: 8 }}>
                                    <Access
                                        accessible={access.canSysTestAdmin()}
                                        fallback={<Button disabled={true}>更新封面</Button>}
                                    >
                                        <Upload {...uploadProps}>
                                            <Button>更新封面</Button>
                                        </Upload>
                                    </Access>
                                </Row>
                                <Row style={{ marginBottom: 4 }}>
                                    <Typography.Text>支持图片类型：jpg、png，封面大小：96*96。</Typography.Text>
                                </Row>
                                <Row>
                                    <Typography.Text></Typography.Text>
                                </Row>
                            </div>
                        </Row>
                    </Form.Item>
                    <Form.Item
                        label="显示名 "
                        name="show_name"
                        validateStatus={errorReg.regShowName ? 'error' : undefined}
                        help={errorReg.regShowName && '长度最多20位,仅允许包含汉字、字母、数字、下划线、中划线、点'}
                    >
                        <SettingEdit
                            ws_id={ws_id}
                            keyName="show_name"
                            auth={auth}
                            name={detail.show_name}
                            changeText={changeText}
                            errorReg={errorReg}
                            inputType="show_name"
                            setErrorReg={setErrorReg} />
                    </Form.Item>
                    <Form.Item
                        label="名称 "
                        name="name"
                        validateStatus={errorReg.regName ? 'error' : undefined}
                        help={errorReg.regName && '只允许英文小写、下划线和数字，最多20个字符'}
                    >
                        <SettingEdit
                            ws_id={ws_id}
                            keyName="show_name"
                            auth={auth}
                            name={detail.name}
                            changeText={changeText}
                            disabled={true}
                            inputType="name"
                            errorReg={errorReg}
                            setErrorReg={setErrorReg} />
                    </Form.Item>
                    <Form.Item
                        validateStatus={errorReg.regDescription ? 'error' : undefined}
                        help={errorReg.regDescription && '长度最多200位'}
                        label="介绍 "
                        name="description">
                        <SettingEdit
                            ws_id={ws_id}
                            type="textarea"
                            size="large"
                            auth={auth}
                            keyName="description"
                            name={detail.description}
                            changeText={changeText}
                            inputType="description"
                            errorReg={errorReg}
                            setErrorReg={setErrorReg} />
                    </Form.Item>
                    <Form.Item label="是否公开 " style={{ marginBottom: 16 }} name="is_public">
                        <IsPublicComponent
                            ws_id={ws_id}
                            title={detail.is_public}
                            keyName="is_public"
                            disabled={_.get(detail, 'is_common')}
                            auth={auth}
                            changeText={changeText} />
                    </Form.Item>
                    <Access
                        accessible={access.canSysTestAdmin()}
                        fallback={<Button style={{ marginBottom: 16 }} disabled={true} type="primary">确定</Button>}
                    >
                        {<Button style={{ marginBottom: 16 }} disabled={isOk} onClick={isOk ? () => { } : handleSave} type="primary">确定</Button>}
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
                                    <Avatar size={25} src={detail.creator_avatar} />
                                    <Text>{detail.owner_name}</Text>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Text style={{ color: 'rgba(0,0,0,0.5)' }}>{detail.proposer_dep}</Text>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.second_part}>
                        <span style={{ width: 70, textAlign: 'right' }}>创建时间：</span>
                        <Text>{detail.gmt_created}</Text>
                    </div>
                    <div className={styles.second_part} style={{ marginBottom: 16 }}>
                        <span style={{ width: 70, textAlign: 'right' }}>人数：</span>
                        <Text>{detail.member_count}</Text>
                    </div>
                </Form>
            </Row>

            <Access
                accessible={
                    BUILD_APP_ENV ?
                        access.canSuperAdmin() :
                        access.canSysTestAdmin()
                }
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
                                <Popover
                                    content={
                                        <TransferContent
                                            handleCancel={() => setTransferVisible(false)}
                                            handleSubmit={
                                                async (id: number) => {
                                                    const { code, msg } = await saveWorkspaceConfig({ id: ws_id, owner: id })
                                                    if (code === 200) {
                                                        setTransferVisible(false)
                                                        workspaceInit()
                                                        message.success('操作成功！')
                                                    }
                                                    else
                                                        requestCodeMessage(code, msg)
                                                }
                                            }
                                            member={members}
                                        />
                                    }
                                    trigger="click"
                                    title="转交所有权"
                                    onVisibleChange={visible => setTransferVisible(visible)}
                                    visible={transferVisible}
                                    overlayClassName={styles.transferOwnerWs}
                                >
                                    <Access
                                        accessible={access.canSysTestAdmin()}
                                        fallback={<Button disabled={true} >所有权转交</Button>}
                                    >
                                        <Button onClick={handleTransfer} >所有权转交</Button>
                                    </Access>
                                </Popover>
                                {
                                    !_.get(detail, 'is_common') &&
                                    <Popover
                                        content={
                                            <LogOffContent
                                                handleCancel={
                                                    () => setLogOffVisible(false)
                                                }
                                                handleSubmit={
                                                    async (reason: string) => {
                                                        const { code, msg } = await deleteWorkspace({ id: ws_id, reason }) // user_id 么有
                                                        if (code === 200) {
                                                            history.push('/')
                                                            setLogOffVisible(false)
                                                        }
                                                        else
                                                            requestCodeMessage(code, msg)
                                                    }
                                                }
                                            />
                                        }
                                        visible={logOffVisible}
                                        onVisibleChange={visible => setLogOffVisible(visible)}
                                        overlayClassName={styles.cancleWs}
                                        trigger="click"
                                        title="提示"
                                    >
                                        <Button onClick={() => setLogOffVisible(true)}>注销</Button>
                                    </Popover>
                                }
                            </Space>
                        </Form.Item>
                    </Form>
                </Row>
            </Access>
            {/* </Access> */}
            {
                cropperModalVisible &&
                <CropperImage
                    visible={cropperModalVisible}
                    url={cropperUrl}
                    onCancel={() => setCropperModalVisible(false)}
                    onOk={
                        async info => {
                            const { code, msg } = await saveWorkspaceConfig({ id: ws_id, logo: info.path })
                            if (code === 200) {
                                workspaceInit()
                                setCropperModalVisible(false)
                                message.success('更新成功！')
                            }
                            else
                                requestCodeMessage(code, msg)
                        }
                    }
                />
            }
        </Layout.Content>
    )
}
