import React from 'react'
import { Popover, Radio, Typography, Button } from 'antd'
import { FormattedMessage } from 'umi'
import styled from "styled-components"

const FlexColGap = styled.div<{ gap?: string }>`
    display: flex;
    flex-direction: column;
    gap: ${({ gap }) => gap || 10}px;
`

const SharePopover: React.FC<any> = (props) => {
    const { onCopy, children, list } = props

    const [shareRadioVal, setShareRadioVal] = React.useState<any>(1)

    return (
        <Popover
            placement='bottomRight'
            destroyTooltipOnHide
            title={
                <FormattedMessage id='analysis.share_link' />
            }
            content={
                <FlexColGap>
                    <Typography.Text strong>
                        <FormattedMessage id="analysis.share_link.desc" />
                    </Typography.Text>
                    <Radio.Group
                        value={shareRadioVal}
                        defaultValue={1}
                        onChange={(evt: any) => setShareRadioVal(evt?.target?.value)}
                    >
                        <FlexColGap>
                            {
                                list.map((i: any) => (
                                    <div key={i.value}>
                                        <Radio value={i.value}>{i.label}</Radio>
                                    </div>
                                ))
                            }
                        </FlexColGap>
                    </Radio.Group>
                    <Button onClick={() => onCopy(shareRadioVal)}>
                        <FormattedMessage id='ws.test.job.copy.link' />
                    </Button>
                </FlexColGap>
            }
        >
            {children}
        </Popover>
    )
}

export default SharePopover