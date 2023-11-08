import React from "react"
import ConfigRow from "./ConfigRow"

import { FormattedMessage, useIntl } from 'umi'
import { Radio, Typography, Space, InputNumber, Button } from "antd"
import { useDevOpsContext } from "../Provider"
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'
import styled from 'styled-components'

const TypographyText = styled(Typography.Text)`
    margin-left:9px;
`

const TypographyIcon = styled(Typography.Text)`
    position: relative;
    /* top: -5px;
    left: -5px; */
`
const AutomaticRecovery: React.FC<AnyType> = (props) => {
    const { field } = props
    const { dataSource, update } = useDevOpsContext()
    const { formatMessage } = useIntl()

    const data = dataSource[field]

    const [minute, setMinute] = React.useState<number>(0)
    const [day, setDay] = React.useState<number>(0)
    const [hours, setHours] = React.useState<number>(0)
    const [btnSwitch, setBtnSwitch] = React.useState(true)

    const countMinute = React.useMemo(() => {
        const m = minute
        const h = hours * 60
        const d = day * 24 * 60

        if (day === 7) {
            if (minute || hours) {
                setMinute(0)
                setHours(0)
            }
        }

        const t = d + h + m
        setBtnSwitch(t < 5 || (t === + dataSource.recover_server_protect_duration))
        return t
    }, [minute, day, hours])

    React.useEffect(() => {
        setMinute(dataSource.recover_server_protect_duration)
    }, [dataSource])

    return (
        <>
            <ConfigRow
                title={
                    <FormattedMessage id="broken.automatic.recovery" />
                }
            >
                <Radio.Group
                    onChange={({ target }) => update({ [field]: target.value })}
                    value={data}
                    options={[{
                        value: '1',
                        label: <FormattedMessage id="operation.yes" />
                    }, {
                        value: '0',
                        label: <FormattedMessage id="operation.no" />
                    }]}
                />
            </ConfigRow>
            {
                dataSource?.[field] === '1' &&
                <ConfigRow title={<FormattedMessage id="devOps.time" />} >
                    <Space direction='vertical'>
                        <Space align='center'>
                            <Typography.Text>
                                <InputNumber
                                    size={'small'}
                                    min={0}
                                    max={7}
                                    style={{ width: 60 }}
                                    value={day}
                                    onChange={(val: any) => setDay(typeof val === 'number' ? val : 0)}
                                />
                                <TypographyText>
                                    <FormattedMessage id="devOps.day" />
                                </TypographyText>
                            </Typography.Text>
                            <Typography.Text>
                                <InputNumber
                                    size={'small'}
                                    min={0}
                                    max={23}
                                    style={{ width: 60 }}
                                    value={hours}
                                    onChange={(val: any) => setHours(typeof val === 'number' ? val : 0)}
                                />
                                <TypographyText><FormattedMessage id="devOps.hours" /></TypographyText>
                            </Typography.Text>
                            <Typography.Text>
                                <InputNumber
                                    size={'small'}
                                    min={0}
                                    max={59}
                                    style={{ width: 60 }}
                                    value={minute}
                                    onChange={(val: any) => setMinute(typeof val === 'number' ? val : 0)}
                                />
                                <TypographyText><FormattedMessage id="devOps.minute" /></TypographyText>
                            </Typography.Text>

                            <Typography.Text>=</Typography.Text>
                            <Typography.Text>{countMinute}<FormattedMessage id="devOps.minute" /></Typography.Text>
                            <TypographyIcon>
                                <QusetionIconTootip
                                    title=""
                                    desc={formatMessage({ id: 'devOps.recovery.time.range' })}
                                />
                            </TypographyIcon>
                        </Space>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => update({
                                recover_server_protect_duration: `${minute}`
                            })}
                            disabled={btnSwitch}>
                            <FormattedMessage id="operation.update" />
                        </Button>
                    </Space>
                </ConfigRow>
            }
        </>
    )
}

export default AutomaticRecovery