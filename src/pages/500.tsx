import { Space, Typography } from "antd"
import React from "react"

import { ReactComponent as PageErrorIcon } from "@/assets/img/page_500.svg"
import styled from "styled-components"
import { useClientSize } from "@/utils/hooks"

import { history, useIntl } from "umi"

type ContainerProps = {
    height: any;
}

export const Container = styled.div.attrs((props: ContainerProps) => ({
    style: {
        height: props.height,
    }
})) <ContainerProps>`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
`

export const Wrapper = styled.div`
    min-width: 766px;
    height: 268px;
    margin: 0 auto;
`

const ErrorPage: React.FC = () => {
    const { height } = useClientSize()
    const intl = useIntl()

    return (
        <Container height={height - 50}>
            <Wrapper>
                <Space size={120}>
                    <PageErrorIcon />
                    <Space direction="vertical" size={48}>
                        <Space direction="vertical" size={0}>
                            <Typography.Title level={3} style={{ margin: 0, fontSize: 56 }}>500</Typography.Title>
                            <Typography.Text style={{ fontSize: 16, color: "rgba(0,0,0,0.45)" }}>
                                {intl.formatMessage({ id: `page.500.desc`, defaultMessage: "系统异常，请联系系统管理员" })}
                            </Typography.Text>
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

export default ErrorPage