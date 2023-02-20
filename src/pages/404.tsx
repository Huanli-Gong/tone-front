import { Layout, Space, Typography } from 'antd';
import React, { useEffect } from 'react';
import Icon from '@/assets/img/loss.png';
import { useClientSize } from '@/utils/hooks';
import { useIntl, useParams, history } from 'umi';

import { Container, Wrapper } from "./500"

const NoFoundPage: React.FC<{}> = () => {
    const intl = useIntl()
    const { ws_id } = useParams() as any

    useEffect(() => {
        const otitle = document.getElementsByTagName("title")[0]
        if (otitle) otitle.innerText = '404页面'
    }, [])

    const { height } = useClientSize()

    return (
        <Container height={height - 50}>
            <Wrapper >
                <Space>
                    <div style={{ display: 'inline-block' }}>
                        <img alt="icon" src={Icon} />
                    </div>
                    <div style={{ textAlign: 'left', display: 'inline-block', marginLeft: 80 }}>
                        <Space size={28} direction="vertical">
                            <Space direction="vertical" size={0}>
                                <div style={{ color: '#000', fontSize: 48, opacity: 0.85, fontWeight: 'bold' }}>抱歉，页面无法访问…</div>
                                <div style={{ color: '#000', fontSize: 16, opacity: 0.45, }}>页面链接可能已失效或被删除</div>
                            </Space>
                            <Typography.Link
                                onClick={() => history.push(ws_id ? `/ws/${ws_id}/test_result` : `/`)}
                            >
                                {intl.formatMessage({ defaultMessage: "返回首页", id: "page.500.button" })}
                            </Typography.Link>
                        </Space>
                    </div>
                </Space>
            </Wrapper>
        </Container>
    )
}

export default NoFoundPage;
