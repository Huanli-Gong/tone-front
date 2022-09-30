import { InputNumber, Space, Typography, Button, Switch } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl, FormattedMessage } from 'umi'

const BrokenRecovery = (props: any) => {
    const { formatMessage } = useIntl()
    const { auto_recover_server = 0, recover_server_protect_duration = 5, onUpdate } = props

    const [tigger, setTigger] = useState(false)
    const [state, setState] = useState(false)
    const [minute, setMinute] = useState<number>(recover_server_protect_duration)

    useEffect(() => {
        setTigger(auto_recover_server - 0 === 1)
        setMinute(recover_server_protect_duration - 0)
    }, [auto_recover_server, recover_server_protect_duration])

    const time = useMemo(() => {
        let day: number = 60 * 24, hours: number = 60;

        const getHours: number = minute % day

        const dayStr: string = minute / day >= 1 ? `${parseInt((minute / day) as any)}${formatMessage({id: 'devOps.day'})}` : ''
        const hourStr: string = getHours >= 60 ? `${parseInt((getHours / hours) as any)}${formatMessage({id: 'devOps.hours.s'})}` : ''
        const minuteStr: string = `${parseInt((getHours % hours) as any)}${formatMessage({id: 'devOps.minute'})}`

        return dayStr + hourStr + minuteStr
    }, [minute])

    const handleOk = () => {
        onUpdate({
            auto_recover_server: tigger ? '1' : '0',
            recover_server_protect_duration: `${minute}`
        })
        setState(false)
    }

    const hanldeChange = (checked: boolean) => {
        checked && setState(true)
        !checked && onUpdate({ auto_recover_server: checked ? '1' : '0' })
        setTigger(checked)
    }

    const handleCancel = () => {
        setTigger(auto_recover_server - 0 === 1)
        setMinute(recover_server_protect_duration)
        setState(false)
    }

    return (
        <Space>
            <Switch
                checkedChildren={<FormattedMessage id="operation.open"/>}
                checked={tigger}
                unCheckedChildren={<FormattedMessage id="operation.close"/>}
                onChange={hanldeChange}
            />
            {
                tigger &&
                <>
                    {
                        state ?
                            <>
                                <InputNumber
                                    size={'small'}
                                    min={5}
                                    max={7 * 24 * 60}
                                    value={minute}
                                    onChange={(val: any) => setMinute(val)}
                                />
                                <Typography.Text><FormattedMessage id="devOps.minute"/></Typography.Text>
                                <Button size="small" onClick={handleCancel}><FormattedMessage id="operation.cancel"/></Button>
                                <Button size="small" type="primary" onClick={handleOk}><FormattedMessage id="operation.update"/></Button>
                            </>
                            :
                            <>
                                <Typography.Text>{time}</Typography.Text>
                                <EditOutlined onClick={() => setState(true)} />
                            </>
                    }
                </>
            }
        </Space>
    )
}

export default BrokenRecovery