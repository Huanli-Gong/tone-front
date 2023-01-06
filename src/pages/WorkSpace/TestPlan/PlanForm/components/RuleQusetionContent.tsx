import React from "react";
import { useIntl } from "umi";
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import { Space, Typography } from "antd";

const RuleQusetionContent: React.FC = () => {
    const intl = useIntl()
    const BASICE_LOCALE_STRING = "plan.trigger"

    const rules = [
        ["format", 4, "example"],
        ["symbols", 3,],
        ["example", 3]
    ]

    return (
        <div style={{ position: 'absolute', right: -22, top: -4 }}>
            <QusetionIconTootip
                title=""
                placement="rightBottom"
                desc={
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {
                            rules.map((i: any) => {
                                const [title, list, example] = i
                                return (
                                    <>
                                        <Typography.Text>
                                            {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${title}` })}
                                        </Typography.Text>
                                        {
                                            example &&
                                            <Typography.Text>
                                                {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${example}` })}
                                            </Typography.Text>
                                        }
                                        {
                                            list?.map((r: any) => (
                                                <Typography.Text key={r}>
                                                    {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${r}` })}
                                                </Typography.Text>
                                            ))
                                        }
                                    </>
                                )
                            })
                        }
                    </Space>
                }
            />
        </div>

    )
}

export default RuleQusetionContent