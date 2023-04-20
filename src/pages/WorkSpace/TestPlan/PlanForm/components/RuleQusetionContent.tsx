/* eslint-disable react/no-array-index-key */
import React from "react";
import { useIntl } from "umi";
import { QusetionIconTootip } from '@/pages/WorkSpace/TestResult/Details/components'
import { Space, Typography } from "antd";

const BASICE_LOCALE_STRING = "plan.trigger.rule"

const rules = [
    ["format", 5, "example"],
    ["symbols", 4,],
    ["example", 4]
]

const RuleQusetionContent: React.FC = () => {
    const intl = useIntl()

    return (
        <div style={{ position: 'absolute', right: -22, top: -4 }}>
            <QusetionIconTootip
                title=""
                placement="left"
                desc={
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {
                            rules.map((i: any) => {
                                const [title, runum, example] = i
                                return (
                                    <React.Fragment key={title}>
                                        <Typography.Text strong>
                                            {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${title}` })}
                                        </Typography.Text>
                                        {
                                            example &&
                                            <Typography.Text>
                                                {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${title}.${example}` })}
                                            </Typography.Text>
                                        }
                                        {
                                            new Array(runum).fill("")?.map((x, r: number) => (
                                                <Typography.Text key={r} style={{ textIndent: "2em", display: "inline-block" }}>
                                                    {intl.formatMessage({ id: `${BASICE_LOCALE_STRING}.${title}.${r + 1}` })}
                                                </Typography.Text>
                                            ))
                                        }
                                    </React.Fragment>
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