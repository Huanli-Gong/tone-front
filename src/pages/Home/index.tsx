/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useRef } from 'react'
import styles from './index.less'
import { history, useModel, Access, useAccess, FormattedMessage, useIntl } from 'umi'
import { Layout, Row, Col, Button, Table, Space, Typography, notification, message, Empty, Tag, Spin, Tabs, Input, Tooltip, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
// import JoinPopover from './Component/JoinPopover'
import { queryHomeWorkspace, queryWorkspaceTopList } from '@/services/Workspace'
import { ReactComponent as HomeBackground } from '@/assets/svg/home/home_background.svg';
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'
import LogoEllipsis from '@/components/LogoEllipsis/index'
import lodash from 'lodash'
import { queryDocList } from '@/pages/DOC/services'
import HomePush from './Component/HomePush'
import AvatarCover from '@/components/AvatarCover'
import CommonPagination from '@/components/CommonPagination'
import { jumpWorkspace, OPENANOLIS_LOGIN_URL, redirectErrorPage } from '@/utils/utils'
import { ColumnEllipsisText } from '@/components/ColumnComponents'

const { TabPane } = Tabs;
const { Paragraph } = Typography;

type wsParmas = {
    scope: string,
    keyword?: string,
    page_size: number | undefined,
    page_num: number
}

const EllipsisRect = (props: any): JSX.Element => {
    const { text, wsPublic } = props
    const ellipsis = useRef<any>(null)
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (ellipsis && ellipsis.current) {
            const clientWidth = ellipsis.current.clientHeight
            const scrollWidth = ellipsis.current.scrollHeight
            setShow(clientWidth < scrollWidth)
        }
    }, [wsPublic])

    return (
        <span className={styles.ws_description} id='wsdescription' ref={ellipsis}>
            {show ?
                <Tooltip title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                    <Paragraph ellipsis={{ rows: 1 }}>{text}</Paragraph>
                </Tooltip > :
                text
            }
        </span>
    )
}

const avatarStyle = {
    borderRadius: 6,
    fontSize: 40,
    width: 72,
    height: 72,
    lineHeight: '72px',
    display: 'inline-block',
    marginRight: 10
}

export default (): React.ReactNode => {
    const access = useAccess();

    const { formatMessage } = useIntl()
    const docType = {
        'mustRead': formatMessage({ id: 'pages.home.mustRead', defaultMessage: "" }),
        'course': formatMessage({ id: 'pages.home.course' }),
        'docs': formatMessage({ id: 'pages.home.docs' }),
    }
    const noticeType = {
        'maintain': formatMessage({ id: 'pages.home.maintain' }),
        'notice': formatMessage({ id: 'pages.home.notice' }),
        'upgrade': formatMessage({ id: 'pages.home.upgrade' }),
        'stop': formatMessage({ id: 'pages.home.stop' }),
    }
    const allKey = [
        { tab: formatMessage({ id: 'pages.home.tab.all' }), key: 'all' },
        { tab: formatMessage({ id: 'pages.home.tab.history' }), key: 'history' },
        { tab: formatMessage({ id: 'pages.home.tab.joined' }), key: 'joined' },
        { tab: formatMessage({ id: 'pages.home.tab.created' }), key: 'created' },
    ]
    const tourKey = [{
        tab: formatMessage({ id: 'pages.home.tab.all' }), key: 'all'
    },]

    const [wsData, setWsData]: any = useState([])
    const [wsPublic, setWsPublic] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [wsLoading, setWsLoading] = useState(true)
    const { initialState } = useModel('@@initialState');
    const { user_id, } = initialState?.authList || {}
    const [wsParmas, setWsPasmas] = useState<wsParmas>({
        page_size: 50,
        page_num: 1,
        scope: access.loginBtn() ? 'history' : 'all'
    })
    const [helps, setHelps] = useState<any>([])
    const [topWs, setTopWs] = useState([])

    const homePushRef = useRef<any>(null);

    const wsTableData = async (parmas: wsParmas) => {
        setLoading(true)
        const data = await queryHomeWorkspace(parmas)
        const { code, msg } = data
        if (code === 200) {
            if (parmas.scope === 'public') {
                setWsPublic(lodash.get(data, 'data') || [])
                return
            }
            setWsData(data || [])
        }
        else
            msg && message.error(msg)
        setLoading(false)
    }

    const queryWsTopList = async () => {
        setWsLoading(true)
        const { data, code } = await queryWorkspaceTopList()
        if (code === 200) {
            setWsLoading(false)
            setTopWs(data)
        }
    }
    const handleTabChange = (key: string) => {
        const { keyword } = wsParmas
        setWsPasmas({ page_size: 50, page_num: 1, scope: key, keyword })
    }

    const wsDom = () => {
        const tab = access.IsAdmin() ? allKey : allKey.filter((item: any) => item.key !== 'created')
        const allTab = BUILD_APP_ENV ? tab : allKey
        const arrKey = access.loginBtn() ? allTab : tourKey

        return (
            <Tabs defaultActiveKey="history" onChange={handleTabChange}>
                {
                    arrKey.map((item) => {
                        return <TabPane tab={item.tab} key={item.key} />
                    })
                }
            </Tabs>
        )
    }

    const onSearch = (value: string) => {
        setWsPasmas({ ...wsParmas, keyword: value, page_num: 1 })
    }

    const wsHelpDoc = async () => {
        const { data } = await queryDocList()
        if (Array.isArray(data)) {
            setHelps(data)
        }
    }

    useEffect(() => {
        notification.config({ top: 88 })
        queryWsTopList()
        wsTableData({ scope: 'public', page_size: 999, page_num: 1 })
        wsHelpDoc()

        const homePushFlag = localStorage.getItem('homePush_Flag')
        if (!homePushFlag) {
            homePushRef?.current?.show({ initial: true })
            localStorage.setItem('homePush_Flag', '1')
        }
    }, [])


    useEffect(() => {
        wsTableData(wsParmas)
    }, [wsParmas])

    const enterWorkspace = async (record: any) => {
        if (record.is_public || record.is_member || access.IsAdmin()) {
            history.push(jumpWorkspace(record.id))
            return
        }

        if (!user_id && !record.is_public) {
            if (BUILD_APP_ENV === 'openanolis') {
                return window.location.href = OPENANOLIS_LOGIN_URL
            }
            return history.push(`/login?redirect_url=${jumpWorkspace(record.id)}`)
        }

        redirectErrorPage(401)
    }

    const columns: any = [
        {
            title: 'show_name',
            dataIndex: 'show_name',
            width: 210,
            render: (_: any, record: any) => (
                <div
                    onClick={() => enterWorkspace(record)}
                    className={styles.showName}
                >
                    <LogoEllipsis props={record} size={'small'} />
                </div>
            )
        },
        {
            title: 'owner_name',
            dataIndex: 'owner_name',
            width: 175,
            render: (_: any) => (
                <Space>
                    <UserOutlined />
                    <Typography.Text>{_}</Typography.Text>
                </Space>
            )
        },
        {
            title: 'description',
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: 'is_public',
            dataIndex: 'is_public',
            width: 120,
            render: (_: any) => (
                <Space>
                    {_ ? <PublicIcon /> : <NPublicIcon />}
                    {_ ? <FormattedMessage id="pages.home.public" /> : <FormattedMessage id="pages.home.private" />}
                </Space>
            )
        },
        {
            title: <FormattedMessage id="Table.columns.operation" />,
            align: 'center',
            width: 120,
            render: (_: any) => (
                <Button onClick={() => enterWorkspace(_)} >
                    {/* 进入 */}
                    <FormattedMessage id="pages.home.enter" />
                </Button>
            )
        }
    ]

    const filterDocList = (list: any[], name: string) => list.reduce((pre: any, cur: any) => {
        const { doc_type, active } = cur
        return doc_type === name && active ? pre.concat(cur) : pre
    }, [])

    const helpDocAll = React.useMemo(() => {
        return filterDocList(helps, 'help_doc')
    }, [helps])

    const noticeAll = React.useMemo(() => {
        return filterDocList(helps, 'notice')
    }, [helps])

    useEffect(() => {
        const aDoms = document.querySelectorAll('.notice_content')
        aDoms.forEach((item: any, index: number) => {
            let str = noticeAll[index]?.brief_content || ''
            str = lodash.replace(str, '<p><br></p>', '')
            item.innerHTML = str
        })
    }, [helps])

    return (
        <Layout className={styles.content}>
            <HomePush ref={homePushRef} />
            <div className={styles.welcome_box}>
                <Row className={styles.welcome}>
                    <Typography.Title level={2} style={{ fontWeight: 'normal' }}><FormattedMessage id="pages.home.title" /></Typography.Title>
                    <Row>
                        <Space>
                            <Typography.Text style={{ color: 'rgba(0,0,0,0.50)' }}><FormattedMessage id="pages.home.subTitle" /></Typography.Text>
                            <span className={styles.home_push_button} onClick={() => { homePushRef?.current?.show({ initial: false }) }}>
                                <FormattedMessage id="pages.home.more.introduction" />
                            </span>
                        </Space>
                    </Row>
                </Row>
                <div className={styles.home_push_background_img}>
                    <HomeBackground />
                </div>
            </div>
            <Row gutter={20} justify="space-between" style={{ marginLeft: 0, marginRight: 0 }}>
                <div style={{ display: 'inline-block', width: 'calc(100% - 356px)' }} id='bannerLayout'>
                    <Layout.Content className={styles.banner}>
                        <Row className={styles.title} style={{ padding: '0 20px' }} align="middle" justify="space-between">
                            <Typography.Text><FormattedMessage id="pages.home.recommend.Workspace" /></Typography.Text>
                        </Row>
                        {/* <Row style={{ padding: '5px 4px 5px 20px',position: 'relative' }}> */}
                        <Spin spinning={wsLoading}>
                            <Row className={styles.ws_row}>
                                {
                                    <div className={styles.ws_group} >
                                        {
                                            topWs.map((item: any, number: any) => {
                                                return (
                                                    <div
                                                        className={styles.workspace}
                                                        // eslint-disable-next-line react/no-array-index-key
                                                        key={number}
                                                        style={{ marginRight: (number + 1) % 3 ? 12 : 0, }}
                                                        onClick={() => enterWorkspace(item)}
                                                    >
                                                        <Row style={{ width: '100%', height: '100%' }}>
                                                            <Col span={24} style={{ alignItems: 'flex-start', display: 'flex', height: 48, marginBottom: 8 }}>
                                                                <AvatarCover size={'middle'} style={avatarStyle} {...item} />
                                                                <div className={styles.right_part}>
                                                                    <b className={styles.ws_name}>{item.show_name}</b>
                                                                    <Space size={3}>
                                                                        <Avatar size={16} src={item.avatar} />
                                                                        <Typography.Text type="secondary" ellipsis={true}>{item.owner_name} </Typography.Text>
                                                                    </Space>
                                                                    <EllipsisRect text={item.description} wsPublic={wsPublic} />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                }
                            </Row>
                        </Spin>
                    </Layout.Content>
                    <Layout.Content className={styles.banner}>
                        <Row className={styles.ws_list_title} style={{}}>
                            {wsDom()}
                            <div>
                                <Space align='end'>
                                    <Input.Search placeholder={formatMessage({ id: 'pages.home.input.placeholder' })} onSearch={onSearch} style={{ width: 270 }} allowClear={true} />
                                    <Access accessible={access.ApplyPrivate()}>
                                        <Button onClick={() => history.push('/workspace/create')}>
                                            <FormattedMessage id="pages.home.create.workspace" />
                                        </Button>
                                    </Access>
                                </Space>
                            </div>
                        </Row>
                        <Row>
                            <Table
                                size="small"
                                rowKey="id"
                                loading={loading}
                                className={styles.workspace_list}
                                dataSource={wsData.data}
                                columns={columns}
                                showHeader={false}
                                pagination={false}
                            />
                            <Col span={24} style={{ paddingLeft: 20, paddingRight: 20 }}>
                                <CommonPagination
                                    pageSize={wsData.page_size}
                                    total={wsData.total}
                                    currentPage={wsData.page_num}
                                    onPageChange={
                                        (page, size) => setWsPasmas({ ...wsParmas, page_size: size, page_num: page })
                                    }
                                />
                            </Col>
                        </Row>
                    </Layout.Content>
                </div>
                <div style={{ display: 'inline-block', width: 336 }}>
                    <Row>
                        <div className={styles.notice}>
                            <div className={styles.title}>
                                {/* 公告 */}
                                <FormattedMessage id="pages.home.announcement" />
                                <div
                                    onClick={() => history.push(`/notice`)}
                                    className={styles.helps_list_more}>
                                    {/* 查看全部 */}
                                    <FormattedMessage id="pages.home.view.all" />
                                </div>
                            </div>
                            <div className={styles.content} style={{ height: !noticeAll.length ? 110 : 'auto', paddingBottom: !noticeAll.length ? 0 : 20 }}>
                                {
                                    noticeAll.length !== 0 &&
                                    <div className={styles.notice_item}>
                                        {
                                            noticeAll.slice(0, 2).map(
                                                (item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className={styles.notice_item_left}
                                                        onClick={() => history.push(`/notice/${item.id}`)}>
                                                        <Tag
                                                            color={item && item.order_id === 1 ? '#FF4D4D' : ''}
                                                            style={{ color: item && item.order_id === 1 ? '#fff' : 'rgba(0,0,0,0.65)' }}
                                                            className={styles.notice_tag}>{item && noticeType[item.tags] || '-'}
                                                        </Tag>
                                                        <div className={styles.notice_title}>
                                                            <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                                                                {item.title}
                                                            </ColumnEllipsisText>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        }
                                    </div>
                                }
                                {
                                    !noticeAll.length &&
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="pages.home.empty.notice" />} />
                                }
                            </div>
                        </div>
                    </Row>
                    <div className={styles.helps}>
                        <div className={styles.title}>
                            {/* 使用帮助 */}
                            <FormattedMessage id="pages.home.using.help" />
                            <div
                                onClick={() => history.push(helpDocAll[0]?.id ? `/help_doc/${helpDocAll[0].id}` : '/help_doc/')}
                                style={{ marginRight: 0 }}
                                className={styles.helps_list_more}>
                                {/* 查看全部 */}
                                <FormattedMessage id="pages.home.view.all" />
                            </div>
                        </div>
                        <div className={styles.helps_box} style={{ height: !noticeAll.length ? 90 : 'auto' }}>
                            {
                                helpDocAll.length !== 0 &&
                                <div className={styles.helps_list}>
                                    {
                                        helpDocAll.slice(0, 4).map(
                                            (item: any) => (
                                                <div
                                                    key={item.id}
                                                    className={styles.helps_list_item}
                                                    onClick={() => history.push(`/help_doc/${item.id}`)}>
                                                    <Tag
                                                        color={item && item.order_id === 1 ? '#108ee9' : ''}
                                                        style={{ color: item && item.order_id === 1 ? '#fff' : 'rgba(0,0,0,0.65)' }}
                                                        className={styles.notice_tag}>{item && docType[item.tags] || '-'}
                                                    </Tag>
                                                    <div className={styles.notice_title}>
                                                        <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                                                            {item.title}
                                                        </ColumnEllipsisText>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            }
                            {
                                !helpDocAll.length &&
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="pages.home.no.help" />} />
                            }
                        </div>
                    </div>
                </div>
            </Row>
        </Layout>
    )
}
