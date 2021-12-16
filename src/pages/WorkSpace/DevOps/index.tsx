import React, { useEffect, useState } from 'react'
import { Typography, message, Spin, Radio, InputNumber, Button, Row, Col } from 'antd'
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
    top: -5px;
    left: -5px;
`

const DevOps = (props: any) => {
    const { ws_id } = useParams() as any
    const [loading, setLoading] = useState<boolean>(false)
    const [btnSwitch, setBtnSwitch] = useState(true)
    const [autoServe, setAutoServe] = useState<string>('0')
    const [minute, setMinute] = useState<number>(5)
    const [dataSource, setDataSource] = useState<any>({})

    const initConfig = async () => {
        setLoading(true)
        const { data, code, msg } = await queryDevOpsConfig({ ws_id })
        if (code !== 200) return message.warning(msg)
        setDataSource(data)
        setAutoServe(data.auto_recover_server)
        setMinute(data.recover_server_protect_duration)
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
    const handleSwitch = (val: any) => {
        setMinute(val)
        setBtnSwitch(false)
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
                        <TypographyIcon>
                            <QusetionIconTootip
                                title=""
                                desc={'最短恢复时间5分钟，最长恢复时间7天'}
                            />
                        </TypographyIcon>
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
                                <InputNumber
                                    size={'small'}
                                    min={5}
                                    max={7 * 24 * 60}
                                    value={minute}
                                    onChange={(val: any) => handleSwitch(val)}
                                />
                                <TypographyText>分钟</TypographyText>
                            </Col>
                        </RowWrapper>
                        <RowWrapper gutter={20}>
                            <Col span={20} offset={4}>
                                <Button size="small" type="primary" onClick={handleOk} disabled={btnSwitch}>更新</Button>
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




// import React, { useEffect, useState } from 'react'
// import { Typography, message, Spin } from 'antd'
// import { FormattedMessage } from 'umi'

// import ConfigRow from './components/ConfigRow'
// import BrokenRecovery from './components/BrokenRecovery'
// import { QusetionIconTootip } from '@/pages/TestJob/components/untils'

// import { queryDevOpsConfig, updateDevOpsConfig } from './service'
// import { SingleTabCard } from '@/components/UpgradeUI'

// const DevOps = (props: any) => {
//     const { ws_id } = props.match.params
//     const [devConf, setDevConf] = useState<any>(null)
//     const [loading,setLoading] = useState<boolean>(false)
//     const initConfig = async () => {
//         setLoading(true)
//         const { data, code, msg } = await queryDevOpsConfig({ ws_id })
//         if (code !== 200) return message.warning(msg)
//         setDevConf(data)
//         setLoading(false)
//     }

//     const updateConfig = async (params: any) => {
//         const { code, msg } = await updateDevOpsConfig({ ws_id, ...params })
//         if (code !== 200) return message.warning(msg)
//         initConfig()
//         message.success('操作成功!')
//     }

//     useEffect(() => {
//         initConfig()
//     }, [])

//     return (
//         <Spin spinning={loading}>
//             <SingleTabCard
//                 title={<FormattedMessage id={`Workspace.${props.route.name}`} />}
//             >
//                 <ConfigRow
//                     title={
//                         <QusetionIconTootip
//                             title={<Typography.Text strong>broken机器自动恢复</Typography.Text>}
//                             desc={'最短恢复时间5分钟，最长恢复时间7天'}
//                         />
//                     }
//                     setting={<BrokenRecovery {...devConf} loading={loading} onUpdate={updateConfig} />}
//                 />
//             </SingleTabCard>
//         </Spin>
//     )
// }

// export default DevOps