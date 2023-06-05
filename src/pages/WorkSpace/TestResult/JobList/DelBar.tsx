import { Button, Space, Row, Tag, Popconfirm } from "antd"
import React from "react"
import { RightOutlined } from '@ant-design/icons'
import { FormattedMessage } from "umi"

import styled from "styled-components"

const WrapBox = styled.div`
    border-top: 1px solid rgba(0,0,0, 0.06);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 -1px 2px 0 rgba(0,0,0,0.03);
    background-color: #fff;
    z-index: 99;
`

const Title = styled.div`
    border-top: 2px solid #1890ff;
    padding-left: 20px;
    font-weight: 700;
    color: #000;
    opacity: .85;
    height: 38px;
    line-height: 38px;
    border-bottom: 1px solid rgba(0,0,0,.06);
`

const Body = styled.div`
    height: 68px;
    line-height: 22px;
    background: #fff;
    width: 100%;
    display: flex;
`

const Group = styled.div.attrs((props: any) => ({
    style: {
        width: `calc(100% - ${props?.width || 0}px)`,
    }
})) <any>`
    padding: 8px 20px;
    height: 100%;
    overflow-x: scroll;
    overflow-y: hidden;

    &>.ant-row {
        margin-bottom: 8px;
    }
`

const OptionBar = styled.div`
    height: 100%;
    width: 212px;
    background: #fff;
    box-shadow: -3px 0 2px 0 rgba(0,0,0,.05);
    padding: 0 10px;
    display: flex;
    align-items: center;
`

const renderRows = (list: any, setSelectedRowKeys: any) => (
    <Row wrap={false}>
        {
            list.map((i: any) => (
                <Tag
                    key={i}
                    closable
                    style={{ fontSize: 14, backgroundColor: "rgba(0,0,0,.04)" }}
                    onClose={() => setSelectedRowKeys((p: any) => p.filter((x: any) => x !== i))}
                >
                    {i}
                </Tag>
            ))
        }
    </Row>
)

const DelBar: React.FC<AnyType> = (props) => {
    const { selectedRowKeys, setSelectedRowKeys, onOk } = props

    const idContainerRef = React.useRef<any>(null)

    const count = React.useMemo(() => {
        if (selectedRowKeys?.length) return `（${selectedRowKeys.length}）`
        return ""
    }, [selectedRowKeys])

    const [show, setShow] = React.useState<any>(false)

    const onResizeWidth = () => {
        if (!idContainerRef.current) return
        const { offsetWidth, scrollWidth } = idContainerRef.current
        setShow(offsetWidth < scrollWidth)
    }

    React.useEffect(() => {
        onResizeWidth()
        window.addEventListener('resize', onResizeWidth)
        return () => {
            window.removeEventListener('resize', onResizeWidth)
        }
    }, [selectedRowKeys])

    return (
        <WrapBox>
            <Title>
                删除栏{count}
            </Title>
            <Body>
                <Group width={212} ref={idContainerRef}>
                    {
                        renderRows(
                            selectedRowKeys.filter((i: any, idx: number) => idx % 2 === 0),
                            setSelectedRowKeys
                        )
                    }
                    {
                        renderRows(
                            selectedRowKeys.filter((i: any, idx: number) => idx % 2 === 1),
                            setSelectedRowKeys
                        )
                    }
                </Group>
                <OptionBar >
                    <Space size={18} style={{ width: "100%", justifyContent: "end" }}>
                        {
                            /* @ts-ignore */
                            show &&
                            <RightOutlined
                                style={{ cursor: "pointer" }}
                                /* @ts-ignore */
                                onClick={() => idContainerRef.current?.scrollTo({ left: idContainerRef?.current.scrollWidth })}
                            />
                        }

                        <Space align="center" >
                            <Button onClick={() => setSelectedRowKeys([])}>
                                <FormattedMessage id="operation.cancel" />
                            </Button>
                            <Popconfirm
                                title={<FormattedMessage id="delete.prompt" />}
                                okText={<FormattedMessage id="operation.delete" />}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                                onConfirm={onOk}
                                placement="topLeft"
                            >
                                <Button>
                                    <FormattedMessage id="ws.result.list.batch.delete" />
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Space>
                </OptionBar>
            </Body>
        </WrapBox>
    )
}

export default DelBar