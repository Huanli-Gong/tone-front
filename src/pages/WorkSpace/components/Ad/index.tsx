import React from "react"
import styled from "styled-components"
import { Carousel, Space, Row, Button } from "antd"
import { Third } from '@/pages/Home/Component/HomePush/components';
import { ReactComponent as Close } from "@/assets/svg/close.svg"
import imgPic from "@/assets/img/image.png"
import { useParams, history, useModel } from "umi";

const AdContainer = styled.div`
    position: fixed;
    left: 0 ;
    top: 0;
    bottom: 0;
    right: 0;
    backdrop-filter: blur(5px);
    z-index: 9999;
`

const AdWrapper = styled.div`
    margin: 0 auto;
    top: 50%;
    transform: translateY(-50%);
    width: 1300px;
    height: 700px;
    position: relative;
    overflow: hidden;
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);
    pointer-events: auto;

    .ant-carousel {
        width: 100%;
        height: 100%;

        .slick-dots li.slick-active button { 
            background: #1890FF;
            opacity: 1;
        }

        .slick-dots li button {
            height: 6px;
            width: 6px;
            border-radius: 50%;
            background: #000;
            opacity: 0.2;
        }

        .slick-dots li.slick-active {
            width: 16px;
        }
    }
`

const AdCarouseItem = styled.div`
    width: 1300px;
    height: 700px;
    display: flex;
    overflow: hidden;
    position: relative;
    img {
        width: 100%;
        height: 100%;
    }
`
const CloseOutlie = styled.div`
    position: absolute;
    right: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    svg {
        width: 100%;
        height: 100%;
        fill: #fff;
    }
`

const AdCompoent: React.FC = () => {
    const { ws_id } = useParams() as any

    const { initialState, setInitialState } = useModel("@@initialState")
    const { wsAdShow } = initialState

    const [visible, setVisible] = React.useState<boolean>(false)

    const handleClose = () => {
        setVisible(false)
        setInitialState(p => ({ ...initialState, wsAdShow: null }))
        localStorage.setItem(`ad_str_${ws_id}_display`, "1")
    }

    React.useEffect(() => {
        const isDisplay = localStorage[`ad_str_${ws_id}_display`]
        if (isDisplay === "1")
            setInitialState(p => ({ ...p, wsAdShow: null }))
    }, [])

    React.useEffect(() => {
        setVisible(wsAdShow === ws_id)
    }, [wsAdShow, ws_id])

    if (!visible) return <></>

    return (
        <AdContainer>
            <AdWrapper>
                <Carousel
                    autoplay
                >
                    <AdCarouseItem>
                        <div style={{ padding: 30 }}>
                            <Third />
                            <Row
                                justify="center"
                                style={{ marginTop: 30 }}
                            >
                                <Button
                                    type="primary"
                                    onClick={() => history.push(`/ws/:ws_id/test_result`)}
                                >
                                    查看详情
                                </Button>
                            </Row>
                        </div>
                    </AdCarouseItem>
                    <AdCarouseItem >
                        <img src={imgPic} />
                    </AdCarouseItem>
                </Carousel>
            </AdWrapper>
            <CloseOutlie onClick={handleClose}>
                <Close />
            </CloseOutlie>
        </AdContainer>
    )
}

export default AdCompoent