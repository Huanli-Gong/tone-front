import React from "react"
import { Typography } from "antd"
import styled from "styled-components"
import { useIntl } from "umi"

const LayoutCls = styled.div`
    display: flex;
    width: 100%;
    padding: 12px;
    flex-direction: column;
    background-color: #fff;
    gap: 8px;
`

const ItemRow = styled.div`
    display: flex;
`

const ItemTitle = styled(Typography.Text)`
    white-space: nowrap;
    &::after {
        content: "：";
    }
`

const ItemText = styled.div`
    word-break: break-all;
`
type IProps = {
    env_info?: any;
}

const IntroRow: React.FC<IProps> = (props) => {
    const { formatMessage } = useIntl()

    const { env_info } = props

    const intl = (name: string) => formatMessage({ id: `pages.workspace.baseline.expandPerf.${name}` })
    return (
        <LayoutCls>
            <Typography.Text strong>
                {
                    formatMessage({
                        id: "pages.worksapce.baseline.metric.expand.title",
                        defaultMessage: "环境信息"
                    })
                }
            </Typography.Text>
            {
                [
                    ["SN", "sn"],
                    ["IP", "ip"],
                    [intl("sm_name"), "sm_name"],
                    ["CPU", "cpu"],
                    [intl("memory"), "memory"],
                    [intl("disk"), "disk"],
                    ["Image", "image"],
                    ["Bandwidth", "bandwidth"],
                    ["OS", "os"],
                    ["Kernel", "kernel"],
                    ["Glibc", "glibc"],
                    ["GCC", "gcc"],
                    [intl("ether"), "ether"],
                    ["RunMode", "run_mode"],
                ].map((i: any) => {
                    const [title, f] = i
                    const val = env_info[f]
                    if (!val) return
                    return (
                        <ItemRow>
                            <ItemTitle strong>
                                {title}
                            </ItemTitle>
                            <ItemText
                                dangerouslySetInnerHTML={{
                                    __html: val.toString()?.replace(/\n/g, `<br />`)
                                }}
                            />
                        </ItemRow>
                    )
                }).filter(Boolean)
            }

        </LayoutCls>
    )
}

export default IntroRow