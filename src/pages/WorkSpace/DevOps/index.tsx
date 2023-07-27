/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Typography, message, Spin, Radio, InputNumber, Button, Row, Col, Space } from 'antd'
import { useIntl, FormattedMessage, useParams } from 'umi'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'

import { queryDevOpsConfig, updateDevOpsConfig } from './service'
import { OperationTabCard } from '@/components/UpgradeUI'
import styled from 'styled-components'

import ResultStatusType from './components/ResultStatusType'
import MatrixBranch from './components/Matrix'

const RowWrapper = styled(Row)`
    margin-top:16px;
    &:first-child {
        margin-top:0px;
    }
`

const ColTitle = styled(Col)`
    text-align:right;
    width: 260px;
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
    const { formatMessage } = useIntl()
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
                title={<FormattedMessage id={`menu.Workspace.${props.route.name}`} />}
            >
                <RowWrapper gutter={20}>
                    <ColTitle>
                        <Typography.Text>
                            <FormattedMessage id="broken.automatic.recovery" />：
                        </Typography.Text>
                    </ColTitle>
                    <Col>
                        <Radio.Group onChange={hanldeChange} value={autoServe}>
                            <Radio value={'1'}><FormattedMessage id="operation.yes" /></Radio>
                            <Radio value={'0'}><FormattedMessage id="operation.no" /></Radio>
                        </Radio.Group>
                    </Col>
                </RowWrapper>
                {
                    autoServe == '1' &&
                    <>
                        <RowWrapper gutter={20}>
                            <ColTitle>
                                <Typography.Text>
                                    <FormattedMessage id="devOps.time" />：
                                </Typography.Text>
                            </ColTitle>
                            <Col>
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
                            </Col>
                        </RowWrapper>
                        <RowWrapper gutter={20}>
                            <ColTitle>&emsp;</ColTitle>
                            <Col>
                                <Space size={"large"}>
                                    <Button size="small" type="primary" onClick={handleOk} disabled={btnSwitch}>
                                        <FormattedMessage id="operation.update" />
                                    </Button>
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

                {
                    !BUILD_APP_ENV &&
                    <>
                        <MatrixBranch
                            iType="aligroup"
                            field="matrix_repo_aligroup"
                            data={dataSource['matrix_repo_aligroup']}
                            update={update}
                        />

                        <MatrixBranch
                            iType="aliyun"
                            field="matrix_repo_aliyun"
                            data={dataSource['matrix_repo_aliyun']}
                            update={update}
                        />
                    </>
                }
            </OperationTabCard>
        </Spin>
    )
}

export default DevOps
