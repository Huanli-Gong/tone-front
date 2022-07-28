import React, { useEffect, useRef, useState } from 'react'
import { history, useAccess } from 'umi'
import classes from 'classnames'
import { useModel } from 'umi';
import styles from './index.less'
import { Layout, Row, Col, Form, Input, Radio, Button, Upload, Space, Typography, message, notification } from 'antd'
import { QuestionCircleOutlined, CloseOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { CheckCircleFilled } from '@ant-design/icons'
import { createWorkspace, checkWorkspace } from '@/services/Workspace'
import CropperImage from '@/components/CropperImage'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils';

const QuestionTip = (props: {
    tip: String,
    path: String,
    name: String
}): React.ReactElement => {
    const [visible, setVisible] = useState(false)
    // onClick={ () => history.push() }
    return (
        <Row>
            <Col span={24}>
                <Typography.Text>{props.name}</Typography.Text>
                <span
                    className={styles.question_tip_layout}
                    onMouseEnter={() => setVisible(true)}
                    onMouseLeave={() => setVisible(false)}
                >
                    <QuestionCircleOutlined
                        className={styles.question_icon}
                    />
                    <div
                        style={{ display: visible ? 'block' : 'none' }}
                        className={classes(styles.question_tip_wrapper, styles.w_384)}
                    >
                        <p>{props.tip}</p>
                        {/* <Button type="link" style={{ padding : 0 }}>查看更多</Button> */}
                    </div>
                </span>
            </Col>
        </Row>
    )
}

export default (props: any): React.ReactElement => {
    const [imgUrl, setImgUrl] = useState({ path: '', link: '' })
    const access = useAccess();
    const [isWsInit, setIsWsInit] = useState(false)
    const [form] = Form.useForm()
    const [pedding, setPedding] = useState(false)
    const [heightBox, setHeightBox] = useState(innerHeight)
    const timer: any = useRef(null)
    const cropperRef = React.useRef<any>()

    // user_id :ws创建者
    // const [ extra , setExtra ] = useState('只允许英文小写、下划线和数字，最多20个字符')
    useEffect(() => {
        let createWsInfo: any = window.sessionStorage.getItem('create_ws_info')
        if (createWsInfo) {
            window.sessionStorage.removeItem('create_ws_info');
            createWsInfo = JSON.parse(createWsInfo)
            form.setFieldsValue({
                show_name: _.get(createWsInfo, 'ws_info.show_name') && _.get(createWsInfo, 'ws_info.show_name').split('[')[0],
                name: _.get(createWsInfo, 'ws_info.name') && _.get(createWsInfo, 'ws_info.name').split('[')[0],
                description: _.get(createWsInfo, 'ws_info.description'),
                reason: _.get(createWsInfo, 'reason'),
                is_public: _.get(createWsInfo, 'ws_info.is_public'),
                logo: _.get(createWsInfo, 'ws_info.logo'),
            })
            setImgUrl({ ...imgUrl, link: _.get(createWsInfo, 'ws_info.logo') })
        }
    }, [])

    const handleBeforeUpload = (file: any) => {
        const fileReader = new FileReader()
        fileReader.onload = (e: any) => {
            cropperRef.current?.show(e.target.result)
        }
        fileReader.readAsDataURL(file)

        return false
    }

    const queryCreateWs = async (wsInto: any) => {
        let { data, code, msg } = await createWorkspace(wsInto)
        if (code === 200) {
            clearInterval(timer.current)
            history.push(`/ws/${data.id}/workspace/initSuccess`)
        }
        else {
            message.error(msg || '系统初始化失败', 2, () => {
                clearInterval(timer.current)
                setIsWsInit(false)
            })
        }
    }

    useEffect(() => {
        const box: any = document.querySelector('#createWs #rigthContent')
        if (box) setHeightBox(box.offsetHeight + 26)
    }, [])

    const getCommon = () => {
        const aSpan = document.querySelectorAll('#createWs .dot')
        if (aSpan) {
            Array.from(aSpan).forEach((item: any) => {
                item.style.opacity = 0
            })
            return aSpan
        }
        return
    }

    useEffect(() => {
        if (isWsInit) {
            const arr: any = getCommon()
            if (arr && arr.length) {
                arr[0].style.opacity = 1
                let index = 0
                timer.current = setInterval(() => {
                    index = index + 1 < 3 ? index + 1 : 0
                    if (index === 0) getCommon()
                    arr[index].style.opacity = 1
                }, 500)
            }
        }
        return () => {
            clearInterval(timer.current)
        }
    }, [isWsInit])

    const checkField = async (name: string, value: string) => {
        const { code, msg } = await checkWorkspace({ [name]: value })
        if (code !== 200) {
            form.setFields([{ name, errors: [msg] }])
            return
        }
        return true
    }

    return (
        <Layout.Content className={styles.create_layout} id="createWs">
            <Row className={styles.create_main} gutter={8} justify="space-between">
                <Col span={10} className={styles.mb_55} style={{ marginTop: 20 }}>
                    <Col span={18} offset={6}>
                        <Form
                            form={form}
                            layout="vertical"
                            className={styles.full_width}
                            initialValues={{
                                is_public: false
                            }}
                            onFinish={
                                async (values) => {
                                    setPedding(true)

                                    const { show_name, name } = values

                                    const showNameValidate = await checkField("show_name", show_name)
                                    if (!showNameValidate) return setPedding(false)
                                    const nameValidate = await checkField("name", name)
                                    if (!nameValidate) return setPedding(false)

                                    if (access.IsAdmin()) {
                                        setIsWsInit(true)
                                        queryCreateWs({ ...values, logo: imgUrl.path })
                                        setPedding(false)
                                    }
                                    else {
                                        let data = await createWorkspace({
                                            ...values,
                                            logo: imgUrl.path
                                        })

                                        if (data.code === 200) {
                                            notification.open({
                                                message: '提交成功',
                                                description: <span>Workspace创建申请提交成功，可在【个人中心】-【我的申请】中<span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => history.push('/personCenter?person=approve')}>查看审批进度</span></span>,
                                                icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
                                                duration: 3,
                                            })
                                            setPedding(false)
                                            history.go(-1)
                                        }
                                        else {
                                            requestCodeMessage(data.code, data.msg)
                                            setPedding(false)
                                        }
                                    }
                                }
                            }
                        >
                            <Form.Item label=" ">
                                <Space>
                                    <Typography.Title level={3}>创建Workspace</Typography.Title>
                                </Space>
                            </Form.Item>
                            <Form.Item
                                rules={[
                                    {
                                        required: true,
                                        validator: async (rule, value) => {
                                            if (!value)
                                                return Promise.reject("Workspace显示名不能为空")

                                            if (!/^[A-Za-z0-9\u4e00-\u9fa5\._-]{1,30}$/.test(value))
                                                return Promise.reject("仅允许包含汉字、字母、数字、下划线、中划线、点，最多30个字符")

                                            return Promise.resolve()
                                        }
                                    }
                                ]}
                                label={"Workspace显示名"}
                                name="show_name"
                            >
                                <Input
                                    autoComplete="off"
                                    placeholder="workspace对外的展示名称，允许中文"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item
                                rules={[
                                    {
                                        required: true,
                                        validator: async (rule, value) => {
                                            if (!value)
                                                return Promise.reject("Workspace名称不能为空")

                                            if (!/^[a-z0-9_-]{0,30}$/.test(value))
                                                return Promise.reject("只允许英文小写、下划线和数字，最多30个字符")

                                            return Promise.resolve()
                                        }
                                    },
                                ]}
                                label={
                                    <QuestionTip
                                        name="Workspace名称"
                                        tip="【Workspace名称】会用在测试结果文件的目录树中"
                                        path=""
                                    />
                                }
                                name="name"
                            >
                                <Input
                                    autoComplete="off"
                                    placeholder="只允许英文小写、下划线和数字，最多30个字符"
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item
                                rules={[{ required: true, max: 200 }]}
                                label="Workspace简介"
                                name="description"
                            >
                                <Input.TextArea
                                    rows={3}
                                    allowClear
                                    placeholder="请描述workspace的用途，例如产品/项目相关的测试介绍"
                                />
                            </Form.Item>
                            <Form.Item
                                rules={[{ required: true, max: 200 }]}
                                label="申请理由"
                                name="reason"
                            >
                                <Input.TextArea
                                    allowClear
                                    rows={4}
                                    placeholder="例：方便高效协作和团队管理"
                                />
                            </Form.Item>
                            <Form.Item
                                rules={[{ required: true }]}
                                name="is_public"
                                label={
                                    <QuestionTip
                                        name="是否公开"
                                        tip="Workspace权限的开放和私密，决定了测试数据是否共享给平台用户查看，是否允许平台用户申请加入。"
                                        path=""
                                    />
                                }
                            >
                                <Radio.Group>
                                    <Radio value={false} className={styles.mb_16}>
                                        私密<span>需申请才可加入</span>
                                    </Radio>
                                    <br />
                                    <Radio value={true}>
                                        公开<span>T-one用户均可加入</span>
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="项目封面" >
                                <Form.Item name="logo" noStyle>
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                        <div style={{ marginRight: 16 }}>
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/api/sys/upload/"
                                                beforeUpload={handleBeforeUpload}
                                                onChange={
                                                    (info: any) => {
                                                        if (info.file.status === 'done') {
                                                            setImgUrl(info)
                                                        }
                                                    }
                                                }
                                            >
                                                {
                                                    imgUrl.link ?
                                                        <img
                                                            src={
                                                                imgUrl.link
                                                            }
                                                            alt="avatar"
                                                            style={{ width: '100%' }}
                                                        /> :
                                                        <PlusOutlined />
                                                }
                                            </Upload>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Row>
                                                <Col span={24}>
                                                    可拖拽照片到左侧区域上传
                                                </Col>
                                                <Col span={24}>
                                                    封面大小：96*96   支持图片类型：jpg, png
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Form.Item>
                            </Form.Item>
                            <Form.Item style={{ marginTop: 30 }}>
                                <Button type="primary" disabled={pedding} htmlType="submit">提交审核</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Col>
                <Col span={14} className={styles.rigth_content} id="rigthContent">
                    <Row>
                        <Col offset={3} span={3} style={{ borderLeft: '1px solid rgba(0,0,0,.06)' }}></Col>
                        <Col span={12}>
                            <Row className={styles.create_banner}></Row>
                            <Row className={styles.issue_title}>关于Workspace</Row>
                            <Row>
                                <ul className={styles.performance_ul}>
                                    <li><Typography.Text type="secondary">Workspace创建成功后将拥有独立的空间，独立资源，独立配置，独立的团队管理，高效协作</Typography.Text></li>
                                    <li><Typography.Text type="secondary">每一个Workspace在数据上是隔离的</Typography.Text></li>
                                    <li><Typography.Text type="secondary">满足不同领域个性化测试的需求</Typography.Text></li>
                                </ul>
                            </Row>
                            <Row >
                                <Button type="link" onClick={() => history.push('/help_doc')}>查看更多</Button>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Button className={styles.close_btn} onClick={() => history.go(-1)}><CloseOutlined />关闭</Button>
                <CropperImage
                    ref={cropperRef}
                    onOk={
                        (info: any) => {
                            info && setImgUrl(info)
                        }
                    }
                />
            </Row>
            {
                isWsInit &&
                <div style={{ height: heightBox }} className={styles.systerm_init}>
                    <div className={styles.init_box}>
                        <div className={styles.init_container}>
                            <div className={styles.icon_gif} />
                            <div className={styles.init_text}>
                                系统初始化中
                                <span className="dot" />
                                <span className="dot" />
                                <span className="dot" />
                            </div>
                        </div>
                    </div>
                </div>
            }
        </Layout.Content>
    )
}
