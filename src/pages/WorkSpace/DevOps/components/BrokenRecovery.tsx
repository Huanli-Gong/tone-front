import { InputNumber, Space, Typography, Button, Switch } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'

const BrokenRecovery = (props: any) => {
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

        const dayStr: string = minute / day >= 1 ? `${parseInt((minute / day) as any)}天` : ''
        const hourStr: string = getHours >= 60 ? `${parseInt((getHours / hours) as any)}小时` : ''
        const minuteStr: string = `${parseInt((getHours % hours) as any)}分钟`

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
                checkedChildren="开启"
                checked={tigger}
                unCheckedChildren="关闭"
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
                                <Typography.Text>分钟</Typography.Text>
                                <Button size="small" onClick={handleCancel}>取消</Button>
                                <Button size="small" type="primary" onClick={handleOk}>更新</Button>
                            </> :
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