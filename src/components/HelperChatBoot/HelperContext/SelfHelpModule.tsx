import { Empty, Input, Space, Tabs, Typography } from "antd"
import React from "react"
import styled from "styled-components"
import { getSelfServices } from "./services";
import { ReactComponent as EmptyResult } from '@/assets/boot/empty_result.svg'
import { ReactComponent as EmptyIcon } from '@/assets/boot/empty.svg'
import RichEditor from "@/components/RichEditor";

const ContentStyle = styled.div`
    height: 412px;
    width: 100%;
    display: flex;
    flex-direction: column;

    .nav {
        height: 40px;
        width: 400px;
        background-color: #FFFFFF;

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
            background-color: #FFFFFF;
            border-radius: 6px;
            margin: 0 auto;
            padding: 26px 16px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;

            .reason-title {
                font-weight: 500;
                font-size: 14px;
                color: rgba(0,0,0,0.85);
            }

            .problem-title {
                font-weight: 500;
                font-size: 16px;
                color: rgba(0,0,0,0.85);
            }

            .influence-text {
                font-weight: 400;
                font-size: 14px;
                color: rgba(0,0,0,0.85);
            }
        }
    }
`

const ModuleTabs = styled(Tabs)`
    width: 400px;
    background-color: #FFFFFF;

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
            background-color: #D9D9D9;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
`

const ServiceButton = styled.div`
    height: 22px;
    width: 56px;
    font-weight: 400;
    color: rgba(32,92,232,0.85);
    position: absolute;
    right: 16px;
    top: 6px;
`

const ServiceHeader = styled.div`
    height: 102px;
    background-color: #0052D9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .p {
        font-weight: 400;
        font-size: 14px;
        color: #FFFFFF;
    }

    .input {
        height: 32px;
        width: 336px;
        background-color: #FFFFFF;
        border-radius: 16px;
        margin-top: 12px;

        position: relative;

        .ant-input {
            border-radius: 16px;
            height: 32px;
            width: 100%;
        }
    }
`

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
]

const service_label_map = new Map(
    DEFAULT_SERVICES_ITEMS.map(({ key, label }) => [key, label])
)

const SelfHelpModule: React.FC = () => {
    const [inp, setInp] = React.useState("")
    const [tabkey, setTabkey] = React.useState<any>("system")
    const [list, setList] = React.useState<any>(DEFAULT_SERVICES_ITEMS)
    const [source, setSource] = React.useState<any>(undefined)

    const onChange = (key: string) => {
        setTabkey(key)
    };

    const init = async (job_id: any) => {
        const { data, code, msg } = await getSelfServices({ job_id })
        if (code !== 200) {
            setList(DEFAULT_SERVICES_ITEMS)
            setSource({})
            return console.log(msg)
        }

        const dataEntries = Object.entries(data)
        let tab: any;
        setList(dataEntries.reduce((p: any, c: any) => {
            const [k, v] = c
            if (!tab && v?.length > 0) tab = k
            return p.concat([{
                key: k,
                label: service_label_map.get(k)?.replace(/\(.*?\)/, `(${v.length})`)
            }])
        }, []))

        if (tab) setTabkey(tab)
        setSource(data)
    }

    return (
        <div className="self-help-module" >
            <ContentStyle>
                <ServiceHeader>
                    <div className="p">一键诊断 智能解答，让自助成为解决问题的钥匙</div>
                    <div className="input">
                        <Input
                            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                setInp(evt.target.value)
                            }}
                            value={inp}
                            placeholder="请输入Job ID"
                        />
                        <ServiceButton
                            onClick={() => {
                                init(inp)
                                // setInp('')
                            }}
                        >
                            立即排查
                        </ServiceButton>
                    </div>
                </ServiceHeader>

                {
                    JSON.stringify(source) !== '{}' && source?.[tabkey]?.length > 0 &&
                    <ModuleTabs
                        items={list}
                        activeKey={tabkey}
                        size="small"
                        onChange={onChange}
                    />
                }

                <div className="problem">
                    {
                        source?.[tabkey]?.map((i: any, idx: number) => {
                            return (
                                <div key={i.problem || idx} className="problem_block">
                                    {
                                        i.problem &&
                                        <div className="problem-title">
                                            {i.problem}
                                        </div>
                                    }

                                    {
                                        i.answers.map((ctx: any) => (
                                            <Space key={ctx.reason} style={{ width: '100%' }} direction="vertical" size={12}>
                                                {
                                                    ctx.reason &&
                                                    <div className="reason-title">
                                                        {ctx.reason}
                                                    </div>
                                                }
                                                {
                                                    ctx.answer &&
                                                    <RichEditor
                                                        editable={false}
                                                        content={ctx.answer}
                                                        styledCss={`
                                                            img { width: 100%; }
                                                            .tiptap.ProseMirror { padding: 0 !important;}
                                                        `}
                                                    />
                                                }
                                            </Space>
                                        ))
                                    }

                                    {
                                        i.influence &&
                                        <div className="influence-text">
                                            <Typography.Paragraph
                                                ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
                                            >
                                                {i.influence}
                                            </Typography.Paragraph>
                                        </div>
                                    }

                                </div>
                            )
                        })
                    }
                    {
                        JSON.stringify(source) === '{}' &&
                        <Empty image={<EmptyResult />} description={'Job ID错误或不存在，请检查后再尝试'} />
                    }
                    {
                        JSON.stringify(source) !== '{}' && source?.[tabkey]?.length === 0 &&
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无异常" />
                    }
                    {
                        !!!source &&
                        <Empty image={<EmptyIcon />} description="立即排查您关注的Job" />
                    }
                </div>
            </ContentStyle>
        </div >
    )
}

export default SelfHelpModule
