import { CloseOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import React from "react";
import styled from "styled-components"
import AnswerContent from "./AnswerContent";
import cls from "classnames"
import SelfHelpModule from "./SelfHelpModule";
import Feedback from "./Feedback";

const Container = styled.div`
    position: absolute;
    width: 400px;
    height: 500px;
    background-color: #F0F3F6;
    box-shadow: 0 0 6px 0 rgba(0,0,0,0.12), 0 0 12px 5px rgba(0,0,0,0.09);
    border-radius: 10px;
    overflow: hidden;

    left: -410px;
    top: -390px;
    z-index: 1000;
`

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
`

const Navbar = styled.div`
    height: 48px;
    width: 400px;
    background-color: #FFFFFF;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.05);
    border-radius: 10px 10px 0 0 ;
    border-bottom: 1px solid #D9D9D9;

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 16px;
    padding-right: 16px;
`

const MenuBar = styled.div`
    height: 40px;
    width: 400px;
    background-color: #FFFFFF;
    display: flex;
    border-bottom: 1px solid #D9D9D9;

    div::before {
        content: '';
        position: absolute;
        right: 0;
        height: 20px;
        width: 1px;
        background-color: #D9D9D9;
    }

    .active,div {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: pointer;

        &::after {
            content: '';
            position: absolute;
            bottom: 5px;
            width: 62px;
            height: 2px;
        }
    }

    .active {
        color: #205CE8;
        font-weight: 500;
        &::after {
            background-color: #205CE8;
        }
    }
`

const ChartWrapper = styled.div`
    height: 452px;
    wdith: 100%;
`

const HelperContext: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const [open, setOpen] = React.useState(false)

    const [active, setActive] = React.useState(0)
    const [feedback, setFeedback] = React.useState(false)

    React.useImperativeHandle(ref, () => ({
        toggle() {
            setOpen(!open)
        },
        show() {
            setOpen(true)
        }
    }))

    const handleClose = () => {
        setOpen(false)
    }

    if (!open)
        return <></>

    return (
        <Container>
            {
                !feedback ?
                    <Wrapper>
                        <Navbar >
                            <Typography.Text strong>
                                T-one答疑助手
                            </Typography.Text>

                            <Space>
                                <Typography.Text onClick={() => setFeedback(true)}>
                                    意见反馈
                                </Typography.Text>
                                <Typography.Text>
                                    转人工
                                </Typography.Text>
                                <CloseOutlined style={{ color: '#BFBFBF' }} onClick={handleClose} />
                            </Space>
                        </Navbar>
                        <ChartWrapper >
                            <MenuBar >
                                <div className={cls(active === 0 ? 'active' : '')} onClick={() => setActive(0)}>
                                    常见问题
                                </div>

                                <div className={cls(active === 1 ? 'active' : '')} onClick={() => setActive(1)}>
                                    自助排查
                                </div>
                            </MenuBar>

                            <div>
                                {
                                    active === 0 ?
                                        <AnswerContent /> :
                                        <SelfHelpModule />
                                }
                            </div>
                        </ChartWrapper>
                    </Wrapper> :
                    <Feedback back={() => setFeedback(false)} />
            }
        </Container>
    )
}

export default React.forwardRef(HelperContext)