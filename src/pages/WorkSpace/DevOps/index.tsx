import React, { useEffect, useState } from 'react'
import { Typography, message, Spin, Radio, InputNumber, Button, Row, Col, Space } from 'antd'
import { FormattedMessage, useParams } from 'umi'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'

import { queryDevOpsConfig, updateDevOpsConfig } from './service'
import { OperationTabCard } from '@/components/UpgradeUI'
import styled from 'styled-components'

import ResultStatusType from './components/ResultStatusType'

const RowWrapper = styled(Row)`
    margin-top:16px;
    &:first-child {
        margin-top:0px;
    }
`

const ColTitle = styled(Col)`
    text-align:right;
`

const TypographyText = styled(Typography.Text)`
    margin-left:9px;
`

const TypographyIcon = styled(Typography.Text)`
    position: relative;
    /* top: -5px;
    left: -5px; */
`

const DevOps = (props: any) => {
    const { ws_id } = useParams() as any
    const [loading, setLoading] = useState<boolean>(false)
    const [btnSwitch, setBtnSwitch] = useState(true)
    const [autoServe, setAutoServe] = useState<string>('0')
    const [dataSource, setDataSource] = useState<any>({})

    const [minute, setMinute] = useState<number>(0)
    const [day, setDay] = useState<number>(0)
    const [hours, setHours] = useState<number>(0)

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

    const initConfig = async () => {
        setLoading(true)
        const { data, code, msg } = await queryDevOpsConfig({ ws_id })
        if (code !== 200) return message.warning(msg)
        setDataSource(data)
        setAutoServe(data.auto_recover_server)
        setMinute(parseInt(data.recover_server_protect_duration))
        setLoading(false)
    }

    const updateConfig = async (params: any) => {
        setLoading(true)
        const { code, msg } = await updateDevOpsConfig({ ws_id, ...params })
        if (code !== 200) {
            setLoading(false)
            return message.warning(msg)
        }
        initConfig()
        //message.success('操作成功!')
        setBtnSwitch(true)
    }

    const update = async (params: any) => {
        setLoading(true)
        const { code, msg } = await updateDevOpsConfig({ ws_id, ...dataSource, ...params })
        if (code !== 200) {
            setLoading(false)
            return message.warning(msg)
        }
        initConfig()
    }

    const hanldeChange = (e: any) => {
        updateConfig({ auto_recover_server: e.target.value })
        setAutoServe(e.target.value);
    }

    const handleOk = () => {
        updateConfig({
            auto_recover_server: autoServe,
            recover_server_protect_duration: `${minute}`
        })
    }
    useEffect(() => {
        initConfig()
    }, [])

    return (
        <Spin spinning={loading}>
            <OperationTabCard
                title={<FormattedMessage id={`Workspace.${props.route.name}`} />}
            >
                <RowWrapper gutter={20}>
                    <ColTitle span={4}>
                        <Typography.Text>
                            broken机器自动恢复：
                        </Typography.Text>
                    </ColTitle>
                    <Col span={20}>
                        <Radio.Group onChange={hanldeChange} value={autoServe}>
                            <Radio value={'1'}>是</Radio>
                            <Radio value={'0'}>否</Radio>
                        </Radio.Group>
                    </Col>
                </RowWrapper>
                {
                    autoServe == '1' &&
                    <>
                        <RowWrapper gutter={20}>
                            <ColTitle span={4}>
                                <Typography.Text>
                                    时间：
                                </Typography.Text>
                            </ColTitle>
                            <Col span={20}>
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
                                        <TypographyText>天</TypographyText>
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
                                        <TypographyText>时</TypographyText>
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
                                        <TypographyText>分钟</TypographyText>
                                    </Typography.Text>

                                    <Typography.Text>=</Typography.Text>
                                    <Typography.Text>{countMinute}分钟</Typography.Text>
                                    <TypographyIcon>
                                        <QusetionIconTootip
                                            title=""
                                            desc={'最短恢复时间5分钟，最长恢复时间7天'}
                                        />
                                    </TypographyIcon>
                                </Space>
                            </Col>
                        </RowWrapper>
                        <RowWrapper gutter={20}>
                            <Col span={20} offset={4}>
                                <Space size={"large"}>
                                    <Button size="small" type="primary" onClick={handleOk} disabled={btnSwitch}>更新</Button>
                                </Space>
                            </Col>
                        </RowWrapper>
                    </>
                }
                <ResultStatusType
                    field="func_result_view_type"
                    dataSource={dataSource}
                    update={update}
                />
            </OperationTabCard>
        </Spin>
    )
}

export default DevOps
