import React from "react";
import styled from "styled-components";
import { Input, Row, Space, Tag, Typography } from 'antd'
import RichEditor from "@/components/RichEditor";
import { ReactComponent as SendBtnIcon } from '@/assets/boot/send.svg'
import { ReactComponent as RefreshBtn } from '@/assets/boot/refresh.svg'
import { useHelperBootContext } from "../Provider";
import { getUsualProblem } from "./services";

const Container = styled.div`
    
`

const ChatBar = styled.div`
    height: 48px;
    width: 400px;
    background-color: #FFFFFF;
    border-radius: 0 0 10px 10px;
    padding-left: 16px;

    display: flex;
    align-items: center;
`

const EnterInput = styled(Input)`
    height: 32px;
    width: 336px !important;
    box-shadow: 0 -8px 20px 0 rgba(0,0,0,0.03);
    border-radius: 15px !important;
    background-color: #F0F2F5 !important;
    outline: none;

    &:focus {
        border-color: transparent !important;
        box-shadow: none !important;
    }
`

const ChartBox = styled.div`
    height: 364px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    overflow-y: auto;

    .date {
        font-weight: 400;
        font-size: 14px;
        color: #8C8C8C;
        width: 100%;
        text-align: center;
    }

    .server {
        width: 320px;
        background-color: #FFFFFF;
        border-radius: 0 10px 10px 10px;
        padding: 16px;

        .problem-content {
            display: -webkit-box; /* 使用弹性盒子布局模型 */
            -webkit-box-orient: vertical; /* 垂直方向的子元素排列 */
            -webkit-line-clamp: 3; /* 限制在三行内 */
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .empty {
            .p {
                font-weight: 400;
                font-size: 14px;
                color: rgba(0,0,0,0.85);
                margin-bottom: 8px;
            }

            .p1 {
                font-weight: 500;
                font-size: 12px;
                color: rgba(0,0,0,0.85);
            }
        }

        .answers,
        .reason {
            width: 100%;
        }

        .answers {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .reason-title {
            font-weight: 500;
            font-size: 14px;
            color: rgba(0,0,0,0.85);
        }
    }

    .chart,
    .client,
    .server {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .message-box {
        display: flex;
        justify-content: flex-end;

        .message {
            max-width: 320px;
            display: inline-block;
            background-color: #205CE8;
            border-radius: 10px 0 10px 10px;
            font-weight: 400;
            font-size: 14px;
            color: #FFFFFF;
            padding: 13px 16px;
        }
    }
`

const EnterButton = styled.div`
    width: calc(100% - 336px);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Server: React.FC<any> = (props) => {
    const { setCharts, getChartItem, getTopAnswer } = useHelperBootContext()
    const { from, date, content, isTop, rowkey, getAnswer, scrollChange } = props

    const handleRefreshAnswer = () => {
        const { page_num, page_size, total } = props
        const totalPage = Math.ceil(total / page_size)
        const $params = {
            page_size,
            page_num: page_num + 1 > totalPage ? 1 : page_num + 1,
        }
        getTopAnswer($params, rowkey)
    }

    const handleSelectProblem = (pb: string) => {
        getAnswer(pb)
        setCharts((p: any) => p.concat(getChartItem({ from: 'client', content: pb })))
        scrollChange()
    }

    const problemRender = React.useMemo(() => {
        if (content?.length === 1) {
            const [item] = content
            return (
                <div className="problem-content">
                    {/* <div className="pb">
                        {item.problem}
                    </div>
                    <Divider /> */}
                    <div className="answers">
                        {
                            item.answers?.map((item: any) => (
                                <Space key={item.answer_id} className="reason" direction="vertical">
                                    <div className="reason-title">
                                        <Tag color="processing">原因</Tag>
                                        {item.reason}
                                    </div>
                                    <div className="reason-text">

                                        <RichEditor
                                            editable={false}
                                            content={item.answer}
                                            styledCss={`
                                                img { width: 100%; }
                                                .tiptap.ProseMirror { padding: 0 !important;}
                                            `}
                                        />

                                    </div>
                                </Space>
                            ))
                        }
                    </div>
                </div>
            )
        }

        return (
            <Space style={{ width: '100%' }} direction="vertical" >
                {
                    isTop &&
                    <Row style={{ width: '100%' }} justify={'space-between'} align={'middle'}>
                        <Typography.Text strong style={{ color: 'rgba(0,0,0,0.85)' }}>
                            猜您想了解：
                        </Typography.Text>
                        <Space onClick={handleRefreshAnswer} style={{ cursor: 'pointer', color: '#8C8C8C' }}>
                            <RefreshBtn style={{ display: 'flex' }} />
                            <Typography.Text type='secondary'>
                                换一批
                            </Typography.Text>
                        </Space>
                    </Row>
                }
                {
                    content.map((i: any, idx: number) => (
                        <Typography.Link
                            key={i.problem_id}
                            onClick={() => handleSelectProblem(i.problem)}
                        >
                            [{idx + 1}] {i.problem}
                        </Typography.Link>
                    ))
                }
            </Space>
        )
    }, [content])

    return (
        <div className="chart">
            <div className="date">
                {date}
            </div>
            <div className={from}>
                {
                    (isTop || content?.length) > 0 ?
                        problemRender :
                        <div className="empty">
                            <div className="p">
                                暂时未查询到相关内容！
                            </div>
                            <div className="p1">
                                您可以点击上方【加入答疑群】联系开发人员！
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

const AnswerContent: React.FC = () => {
    const { charts, setCharts, getChartItem } = useHelperBootContext()
    const [problem, setProblem] = React.useState('')
    const chartBoxRef = React.useRef<HTMLDivElement>(null)

    const scrollChange = () => {
        try {
            /* @ts-ignore */
            chartBoxRef.current.scrollTop = chartBoxRef.current.scrollHeight
        }
        catch (err) {
            console.log(err)
        }
    }

    const getAnswer = async (pb: string) => {
        const { data, code, msg } = await getUsualProblem({ problem: pb })

        if (code !== 200) {
            return console.log(msg)
        }

        setCharts((p: any) => p.concat(getChartItem({
            from: 'server',
            content: data,
        })))
        scrollChange()
    }

    const handleEnterProblem = () => {
        if (!problem) return
        getAnswer(problem)
        setProblem('')
        setCharts((p: any) => p.concat(getChartItem({
            from: 'client',
            content: problem,
        })))
        scrollChange()
    }

    return (
        <Container >
            <ChartBox ref={chartBoxRef}>
                {
                    charts.map((ctx: any) => {
                        const { from, date, content, rowkey } = ctx
                        if (from === 'server') {
                            return (
                                <Server
                                    key={rowkey}
                                    {...ctx}
                                    setCharts={setCharts}
                                    getAnswer={getAnswer}
                                    scrollChange={scrollChange}
                                />
                            )
                        }
                        return (
                            <div key={rowkey} className={`${from} chart`}>
                                <div className="date">
                                    {date}
                                </div>
                                <div className="message-box">
                                    <div className="message">
                                        {content}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </ChartBox>

            <ChatBar>
                <EnterInput
                    placeholder="有什么问题问我吧！"
                    value={problem}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setProblem(evt.target?.value)}
                    onPressEnter={handleEnterProblem}
                />
                <EnterButton
                    onClick={handleEnterProblem}
                >
                    <SendBtnIcon />
                </EnterButton>
            </ChatBar>
        </Container>
    )
}

export default AnswerContent



/* React.useEffect(() => {
    if (charts.length > 0) {
        const ls = Array.from(document.querySelectorAll('.chart'))
        const last = ls[ls.length - 1]
        try {
            scrollIntoView(last, {
                behavior: 'smooth',
                block: 'start',
                inline: 'start',
            })
        }
        catch (err) {
            console.log(err)
        }
    }
}, [charts]) */