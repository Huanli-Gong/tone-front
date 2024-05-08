import { Empty, Input, Space, Tabs, Tag, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { getSelfServices } from './services';
import { ReactComponent as EmptyResult } from '@/assets/boot/empty_result.svg';
import { ReactComponent as EmptyIcon } from '@/assets/boot/empty.svg';
import RichEditor from '@/components/RichEditor';
import { useHelperBootContext } from '../Provider';
import { useLocation } from 'umi';
import cls from 'classnames';
import DevelopmentIcon from '@/assets/svg/development_bg.svg';

const ContentStyle = styled.div`
    height: 412px;
    width: 100%;
    display: flex;
    flex-direction: column;

    .nav {
        height: 40px;
        width: 400px;
        background-color: #ffffff;

        display: flex;
        justify-content: start;
        align-items: center;
    }

    .problem {
        width: 100%;
        height: 270px;
        padding: 16px 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: scroll;

        .ant-empty {
            margin-top: 35px;
        }

        .problem_block {
            width: 368px;
            background-color: #ffffff;
            border-radius: 6px;
            margin: 0 auto;
            padding: 26px 16px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: relative;

            .tips {
                position: absolute;
                top: 0;
                left: 0;
                height: 18px;
                border-radius: 6px 0 6px 0;
                font-weight: 500;
                font-size: 12px;
                color: #ffffff;
                padding: 0 6px;
            }

            .t-error {
                background-color: #ff4d4f;
            }

            .t-info {
                background-color: #1677ff;
            }

            .reason-title {
                font-weight: 500;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.85);
            }

            .problem-title {
                width: 100%;
                word-break: break-all;
                font-weight: 500;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.85);
            }

            .influence-text {
                font-weight: 400;
                width: 100%;
                word-break: break-all;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.85);
            }
        }
    }
`;

const ModuleTabs = styled(Tabs)`
    width: 400px;
    background-color: #ffffff;

    .ant-tabs-tab + .ant-tabs-tab {
        margin-left: 0px;
    }

    .ant-tabs-nav-wrap {
        padding-left: 0;
    }

    .ant-tabs-nav {
        margin: 0 !important;
    }

    .ant-tabs-tab {
        width: 100px;
        display: flex;
        justify-content: center;
        position: relative;
        &:not(:last-child)::after {
            content: '';
            position: absolute;
            width: 1px;
            height: 14px;
            background-color: #d9d9d9;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
`;

const ServiceButton = styled.div<{ disabled?: boolean }>`
    cursor: pointer;
    height: 22px;
    width: 56px;
    font-weight: 400;
    color: ${({ disabled }) => (disabled ? 'rgba(0, 0, 0, 0.45)' : 'rgba(32, 92, 232, 0.85)')};
    position: absolute;
    right: 16px;
    top: 6px;
`;

const ServiceHeader = styled.div`
    height: 102px;
    background-color: #0052d9;

    .bg {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .p {
        font-weight: 400;
        font-size: 14px;
        color: #ffffff;
    }

    .input {
        height: 32px;
        width: 336px;
        background-color: #ffffff;
        border-radius: 16px;
        margin-top: 12px;

        position: relative;

        .ant-input {
            border-radius: 16px;
            height: 32px;
            width: 100%;
            outline: none;

            &:focus {
                border-color: transparent !important;
                box-shadow: none !important;
            }
        }
    }
`;

const DEFAULT_SERVICES_ITEMS = [
    {
        key: 'system',
        label: `系统调度(0)`,
    },
    {
        key: 'test_prepare',
        label: `测试准备(0)`,
    },
    {
        key: `run_case`,
        label: `执行用例(0)`,
    },
    {
        key: `test_result`,
        label: `测试结果(0)`,
    },
];

const service_label_map = new Map(DEFAULT_SERVICES_ITEMS.map(({ key, label }) => [key, label]));

const SelfHelpModule: React.FC = () => {
    const { selfHepler, setSelfHelper, setInp, inp } = useHelperBootContext();

    const { pathname } = useLocation() as any;

    const [loading, setLoading] = React.useState<any>(false);
    const [tabkey, setTabkey] = React.useState<any>('system');
    const [list, setList] = React.useState<any>(DEFAULT_SERVICES_ITEMS);

    const onChange = (key: string) => {
        setTabkey(key);
    };

    const init = async ($job_id: any) => {
        if (!$job_id) return;
        setLoading(true);
        const { data, code, msg } = await getSelfServices({ job_id: $job_id });
        setLoading(false);

        if (code !== 200) {
            setList(DEFAULT_SERVICES_ITEMS);
            setSelfHelper({});
            return console.log(msg);
        }
        setSelfHelper(data);
    };

    React.useEffect(() => {
        if (!selfHepler) return;
        const dataEntries = Object.entries(selfHepler);
        let tab: any;
        setList(
            dataEntries.reduce((p: any, c: any) => {
                const [k, v] = c;
                if (!tab && v?.length > 0) tab = k;
                return p.concat([
                    {
                        key: k,
                        label: service_label_map.get(k)?.replace(/\(.*?\)/, `(${v.length})`),
                    },
                ]);
            }, []),
        );

        setTabkey(tab || 'system');
    }, [selfHepler]);

    React.useEffect(() => {
        if (selfHepler) return;
        if (!!~pathname.indexOf('/test_result/')) {
            const job_id = pathname.replace(/.*?\/test_result\/((\d)+)/, '$1');

            if (Object.prototype.toString.call(+job_id) === '[object Number]') {
                setInp(job_id);
                init(job_id);
            }
        }
    }, [pathname, selfHepler]);

    const scrollChange = () => {
        setTimeout(() => {
            document.querySelector('.self-help-module .problem')?.scroll({
                top: 0,
            });
        }, 80);
    };

    React.useEffect(() => {
        scrollChange();
    }, [tabkey]);

    return (
        <div className="self-help-module">
            <ContentStyle>
                {BUILD_APP_ENV !== 'opensource' && (
                    <ServiceHeader>
                        <div className="bg">
                            <div className="p">一键诊断 智能解答，让自助成为解决问题的钥匙</div>
                            <div className="input">
                                <Input
                                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                        setInp(evt.target.value);
                                    }}
                                    onPressEnter={() => init(inp?.trim())}
                                    value={inp}
                                    placeholder="请输入Job ID"
                                />
                                <ServiceButton
                                    onClick={() => {
                                        init(inp?.trim());
                                    }}
                                >
                                    立即排查
                                </ServiceButton>
                            </div>
                        </div>
                    </ServiceHeader>
                )}

                {selfHepler && (
                    <ModuleTabs items={list} activeKey={tabkey} size="small" onChange={onChange} />
                )}
                {BUILD_APP_ENV !== 'opensource' ? (
                    <>
                        {loading ? (
                            <div className="problem">
                                <Empty image={<EmptyIcon />} description="正在努力排查中..." />
                            </div>
                        ) : (
                            <div className="problem">
                                {selfHepler?.[tabkey]?.map((i: any, idx: number) => {
                                    return (
                                        <div key={i.problem || idx} className="problem_block">
                                            {i.problem && (
                                                <div className="problem-title">{i.problem}</div>
                                            )}

                                            {i.answers.map((ctx: any, idx: number) => (
                                                <Space
                                                    key={ctx.reason}
                                                    style={{ width: '100%' }}
                                                    direction="vertical"
                                                    size={12}
                                                >
                                                    {ctx.reason && (
                                                        <div className="reason-title">
                                                            <Tag color="processing">
                                                                原因{idx + 1}
                                                            </Tag>
                                                            {ctx.reason}
                                                        </div>
                                                    )}
                                                    {ctx.answer && (
                                                        <RichEditor
                                                            editable={false}
                                                            content={ctx.answer}
                                                            styledCss={`
                                                            img { width: 100%; }
                                                            .tiptap.ProseMirror { padding: 0 !important;}
                                                        `}
                                                        />
                                                    )}
                                                </Space>
                                            ))}

                                            {i.influence && (
                                                <div className="influence-text">
                                                    <Typography.Paragraph
                                                        ellipsis={{
                                                            rows: 3,
                                                            expandable: true,
                                                            symbol: '展开',
                                                        }}
                                                    >
                                                        {i.influence}
                                                    </Typography.Paragraph>
                                                </div>
                                            )}
                                            <div className={cls('tips', `t-${i.level}`)}>
                                                {i.level === 'error' ? '异常' : '提示'}
                                            </div>
                                        </div>
                                    );
                                })}
                                {JSON.stringify(selfHepler) === '{}' && (
                                    <Empty
                                        image={<EmptyResult />}
                                        description={'Job ID错误或不存在，请检查后再尝试'}
                                    />
                                )}
                                {JSON.stringify(selfHepler) !== '{}' &&
                                    selfHepler?.[tabkey]?.length === 0 && (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="暂无异常"
                                        />
                                    )}
                                {!!!selfHepler && (
                                    <Empty
                                        image={<EmptyIcon />}
                                        description="立即排查您关注的Job"
                                    />
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '30%',
                        }}
                    >
                        <Empty image={DevelopmentIcon} description="功能开发中..." />
                    </div>
                )}
            </ContentStyle>
        </div>
    );
};

export default SelfHelpModule;
