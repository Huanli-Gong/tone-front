import React from 'react';
import styled from 'styled-components';
import { Empty, Input, Row, Space, Tag, Typography } from 'antd';
import RichEditor from '@/components/RichEditor';
import { ReactComponent as SendBtnIcon } from '@/assets/boot/send.svg';
import { ReactComponent as RefreshBtn } from '@/assets/boot/refresh.svg';
import { useHelperBootContext } from '../Provider';
import { getUsualProblem } from './services';

const Container = styled.div``;

const ChatBar = styled.div`
    height: 48px;
    width: 400px;
    background-color: #ffffff;
    border-radius: 0 0 10px 10px;
    padding-left: 16px;

    display: flex;
    align-items: center;
`;

const EnterInput = styled(Input)`
    height: 32px;
    width: 336px !important;
    box-shadow: 0 -8px 20px 0 rgba(0, 0, 0, 0.03);
    border-radius: 15px !important;
    background-color: #f0f2f5 !important;
    outline: none;

    &:focus {
        border-color: transparent !important;
        box-shadow: none !important;
    }
`;

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
        color: #8c8c8c;
        width: 100%;
        text-align: center;
    }

    .server {
        width: 320px;
        background-color: #ffffff;
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
                color: rgba(0, 0, 0, 0.85);
                margin-bottom: 8px;
            }

            .p1 {
                font-weight: 500;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.85);
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
            color: rgba(0, 0, 0, 0.85);
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
            background-color: #205ce8;
            border-radius: 10px 0 10px 10px;
            font-weight: 400;
            font-size: 14px;
            color: #ffffff;
            padding: 13px 16px;
            word-break: break-all;
        }
    }
`;

const EnterButton = styled.div`
    width: calc(100% - 336px);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Server: React.FC<any> = (props) => {
    const { setCharts, getChartItem, getTopAnswer, setActive, setFeedback } =
        useHelperBootContext();
    const { from, date, content, isTop, rowkey, getAnswer, scrollChange, page_size, page_num } =
        props;

    const handleRefreshAnswer = () => {
        if (content?.length === 0) return;
        const { page_num, page_size, total } = props;
        const totalPage = Math.ceil(total / page_size);
        const $params = {
            page_size,
            page_num: page_num + 1 > totalPage ? 1 : page_num + 1,
        };
        getTopAnswer($params, rowkey);
    };

    const handleSelectProblem = (pb: string) => {
        getAnswer(pb);
        setCharts((p: any) => p.concat(getChartItem({ from: 'client', content: pb })));
        scrollChange();
    };

    const renderProblemText = (problemText) => {
        const regex = /<problem>(.*?)<\/problem>/g;
        let parts = [];
        let lastIndex = 0;
        let result = [];

        problemText.replace(regex, (match, p1, offset) => {
            // 添加匹配前的文本到parts数组，这部分直接作为HTML
            parts.push({ type: 'html', content: problemText.substring(lastIndex, offset) });

            // 添加问题部分，这部分将作为React组件
            parts.push({ type: 'link', content: p1 });

            lastIndex = offset + match.length;
        });

        // 添加最后一个匹配后的文本到parts数组
        if (lastIndex < problemText.length) {
            parts.push({ type: 'html', content: problemText.substring(lastIndex) });
        }

        // 将parts数组中的内容转换为适当的React元素
        parts.forEach((part, index) => {
            if (part.type === 'html') {
                result.push(<span key={index} dangerouslySetInnerHTML={{ __html: part.content }} />);
            } else if (part.type === 'link') {
                result.push(
                    <span><Typography.Link key={index} onClick={() => handleSelectProblem(part.content)} style={{ cursor: 'pointer' }}>
                        {part.content}
                    </Typography.Link></span>
                );
            }
        });

        return <>{result}</>;
    };

    const problemRender = React.useMemo(() => {
        if ('response' in content) {
            const response = content.response;
            let result = (
                <div>
                    {renderProblemText(response)}
                </div>
            );
            if ('reference' in content && content.reference !== null) {
                const references = Array.from(content.reference).map(([doc_id, displayText]) => {
                    const url = `https://tone.openanolis.cn/help_doc/${doc_id}`;
                    return (
                        <li key={doc_id}>
                            <a href={url}>{displayText}</a>
                        </li>
                    );
                });
                result = (
                    <>
                        {result}
                        参考：
                        <ul>
                        {references}
                        </ul>
                    </>
                );
            }

            return result
        }


        if (!isTop && content?.length === 1) {
            const [item] = content;
            return (
                <div className="problem-content">
                    {/* <div className="pb">
                        {item.problem}
                    </div>
                    <Divider /> */}
                    <div className="answers">
                        {item.answers?.map((item: any, idx: number) => (
                            <Space key={item.answer_id} className="reason" direction="vertical">
                                <div className="reason-title">
                                    <Tag color="processing">原因{idx + 1}</Tag>
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
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <Space style={{ width: '100%' }} direction="vertical">
                <Row style={{ width: '100%' }} justify={'space-between'} align={'middle'}>
                    <Typography.Text strong style={{ color: 'rgba(0,0,0,0.85)' }}>
                        猜您想了解：
                    </Typography.Text>
                    {isTop && (
                        <Space
                            onClick={handleRefreshAnswer}
                            style={{ cursor: 'pointer', color: '#8C8C8C' }}
                        >
                            <RefreshBtn style={{ display: 'flex' }} />
                            <Typography.Text type="secondary">换一批</Typography.Text>
                        </Space>
                    )}
                </Row>
                {isTop && content?.length === 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无推荐'} />
                )}
                {content.map((i: any, idx: number) => (
                    <Typography.Link
                        key={i.problem_id}
                        onClick={() => handleSelectProblem(i.problem)}
                        style={{ display: 'flex', flexDirection: 'row', gap: 4 }}
                    >
                        <span style={{ display: 'inline-block', flexShrink: 0 }}>
                            [{((page_num || 0) - 1) * (page_size || 0) + (idx + 1)}]
                        </span>
                        <span style={{ display: 'inline-block' }}>{i.problem}</span>
                    </Typography.Link>
                ))}
            </Space>
        );
    }, [content]);

    return (
        <div className="chart">
            <div className="date">{date}</div>
            <div className={from}>
                {(isTop || content?.length || 'response' in content) > 0 ? (
                    problemRender
                ) : (
                    <div className="empty">
                        <div className="p">暂时未查询到相关内容！</div>
                        <div className="p1">
                            您可以使用
                            <Typography.Link onClick={() => setActive(1)}>
                                【自助排查】
                            </Typography.Link>
                            或
                            <Typography.Link onClick={() => setFeedback(true)}>
                                【意见反馈】
                            </Typography.Link>
                            解决！
                        </div>
                        <div className="p1">也可以点击上方【加入答疑群】联系开发人员！</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AnswerContent: React.FC = () => {
    const { charts, setCharts, getChartItem, active } = useHelperBootContext();
    const [problem, setProblem] = React.useState('');
    const chartBoxRef = React.useRef<HTMLDivElement>(null);

    const scrollToView = () => {
        chartBoxRef.current?.scroll({
            top: chartBoxRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    const scrollChange = () => {
        setTimeout(scrollToView, 150);
    };

    const getAnswer = async (pb: string) => {
        const { data, code, msg } = await getUsualProblem({ problem: pb });

        if (code !== 200) {
            return console.log(msg);
        }

        setCharts((p: any) =>
            p.concat(
                getChartItem({
                    from: 'server',
                    content: data,
                }),
            ),
        );
        scrollToView();
    };

    React.useEffect(() => {
        scrollChange();
    }, [active]);

    const handleEnterProblem = () => {
        if (!problem?.trim()) return;
        getAnswer(problem?.trim());
        setProblem('');
        setCharts((p: any) =>
            p.concat(
                getChartItem({
                    from: 'client',
                    content: problem?.trim(),
                }),
            ),
        );
        scrollChange();
    };

    return (
        <Container>
            <ChartBox ref={chartBoxRef}>
                {charts.map((ctx: any) => {
                    const { from, date, content, rowkey } = ctx;
                    if (from === 'server') {
                        return (
                            <Server
                                key={rowkey}
                                {...ctx}
                                setCharts={setCharts}
                                getAnswer={getAnswer}
                                scrollChange={scrollChange}
                            />
                        );
                    }
                    return (
                        <div key={rowkey} className={`${from} chart`}>
                            <div className="date">{date}</div>
                            <div className="message-box">
                                <div className="message">{content}</div>
                            </div>
                        </div>
                    );
                })}
            </ChartBox>

            <ChatBar>
                <EnterInput
                    placeholder="有什么问题问我吧！"
                    value={problem}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                        setProblem(evt.target?.value)
                    }
                    onPressEnter={handleEnterProblem}
                />
                <EnterButton onClick={handleEnterProblem}>
                    <SendBtnIcon />
                </EnterButton>
            </ChatBar>
        </Container>
    );
};

export default AnswerContent;
