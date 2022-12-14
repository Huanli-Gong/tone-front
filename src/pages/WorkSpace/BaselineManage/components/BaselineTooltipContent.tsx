import React from "react"
import { Row, Typography, Divider } from "antd"
import { useIntl } from "umi"
import { useCopyText } from "@/utils/hooks"

export const toFixed = (val: string | number) => Number(val).toFixed(2)

type BaselineValue = {
    Max?: string;
    Min?: string;
    Avg?: string;
    CV?: string;
}
type ContentIProps = {
    baseline_value?: BaselineValue;
    value_list?: string;
    metric?: string;
}

export const BaselineTooltipContent: React.FC<ContentIProps> = (props) => {
    const { baseline_value, value_list, metric } = props;
    const intl = useIntl()
    const handleCopyText = useCopyText(intl.formatMessage({ id: "request.copy.success" }))
    const ref = React.useRef<HTMLDivElement | any>()

    return (
        <div style={{ width: 176 }}>
            <Row justify="space-between" style={{ padding: "6px 16px", width: "100%" }}>
                <Typography.Text strong={true}>
                    {intl.formatMessage({ id: "pages.workspace.baseline.mertricDetail.data" })}
                </Typography.Text>
                <Typography.Link
                    onClick={() => handleCopyText((ref?.current as HTMLDivElement)?.innerText)}
                >
                    {intl.formatMessage({ id: "operation.copy" })}
                </Typography.Link>
            </Row>
            <div ><Divider style={{ margin: 0 }} /></div>
            <div ref={ref}>
                <div style={{ opacity: 0, height: 0, position: 'absolute' }}>
                    {metric}{intl.formatMessage({ id: "pages.workspace.baseline.mertricDetail.data" })}
                </div>
                <div style={{ padding: "6px 16px", display: 'flex', flexDirection: "column" }}>
                    <Row justify="space-between" style={{ flexDirection: "column" }}>
                        {
                            baseline_value && Object.keys(baseline_value).map((key: string) => (
                                <div key={key}>
                                    <Typography.Text strong={true} >{`${key}：`}</Typography.Text>
                                    <Typography.Text ellipsis={true} >{baseline_value[key]}</Typography.Text>
                                </div>
                            ))
                        }
                    </Row>
                    <Typography.Text strong={true}>Test Record</Typography.Text>
                    <Row justify="space-between" style={{ flexDirection: "column" }}>
                        {
                            value_list && JSON.parse(value_list).map((item: any, index: number) => (
                                <div key={index}>
                                    <Typography.Text strong={true} >{`(${index + 1}) `}</Typography.Text>
                                    <Typography.Text ellipsis={true} >
                                        {toFixed(item)}
                                    </Typography.Text>
                                </div>
                            ))
                        }
                    </Row>
                </div>
            </div>
        </div>
    )
}