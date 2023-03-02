
import React from 'react';
import { Avatar, Space, Typography } from 'antd';
import { auth_admin } from '../services/Workspace';
import { useIntl, useParams, history, Helmet } from 'umi'
import { useClientSize } from '@/utils/hooks';
import { ReactComponent as UnaccessIcon } from "@/assets/img/unaccess.svg"

import { Container, Wrapper } from './500'

const UnaccessPage: React.FC<any> = () => {
    const { height } = useClientSize()
    const intl = useIntl()
    const { ws_id } = useParams() as any

    const [source, setSource] = React.useState<any>({})

    const authAdmin = async () => {
        if (!ws_id) return
        if (!/[a-zA-Z0-9]{8}/.test(ws_id)) return
        const { code, ...rest } = await auth_admin({ ws_id })
        if (code === 200) setSource(rest)
    }

    React.useEffect(() => {
        authAdmin()
    }, [ws_id])

    return (
        <Container height={height - 50}>
            <Helmet>
                <title>
                    {intl.formatMessage({ id: `menu.server.401` })}
                </title>
            </Helmet>
            <Wrapper>
                <Space size={20}>
                    <UnaccessIcon />
                    <Space direction="vertical" size={28}>
                        <Space direction="vertical" size={8}>
                            <Typography.Title level={3} style={{ margin: 0, fontSize: 56 }}>
                                无权限
                            </Typography.Title>
                            <Space direction="vertical" size={0}>
                                <Typography.Text style={{ fontSize: 16, color: "rgba(0,0,0,0.45)" }}>
                                    {intl.formatMessage({ id: `page.401.desc`, defaultMessage: "您没有访问权限。" })}
                                </Typography.Text>
                                {
                                    JSON.stringify(source) !== "{}" &&
                                    <Space wrap={true} size={8}>
                                        <Typography.Text>
                                            请联系
                                            <Typography.Link style={{ cursor: "default" }}>“{source?.ws_info?.show_name}”</Typography.Link>
                                            管理员
                                        </Typography.Text>
                                        {
                                            source?.data?.map((item: any) => (
                                                <Space key={item.name} size={4}>
                                                    <Avatar src={item.avatar} size={28} />
                                                    <Typography.Text>{item.name}</Typography.Text>
                                                </Space>
                                            ))
                                        }
                                    </Space>
                                }
                            </Space>
                        </Space>
                        <Typography.Link onClick={() => history.push(`/`)}>
                            {intl.formatMessage({ defaultMessage: "返回首页", id: "page.500.button" })}
                        </Typography.Link>
                    </Space>
                </Space>
            </Wrapper>
        </Container>
    )
}

export default UnaccessPage;
