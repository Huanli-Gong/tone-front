/* eslint-disable react-hooks/exhaustive-deps */
import { Row, Col, Space, Typography, Tag, Tooltip } from "antd"
import React from "react"
import { useParams, useIntl, FormattedMessage } from "umi"
import { cloudList as queryCloudServer, queryClusterMachine } from "@/pages/WorkSpace/DeviceManage/CloudManage/service"
import styled from 'styled-components'
import { queryClusterServer } from "@/pages/WorkSpace/TestJob/components/SuiteSelectDrawer/services"

const Wrapper = styled(Space)`
    width: 100%;
    & .ant-row{
        width: 100%;
        & div:first-child {
            text-align: right;
            font-size: 14px;
            color: rgba(0,0,0,.45);
        }
        & div:last-child {
            font-size: 14px;
            color: #000000;
        }
    }
`

const Container = styled.div`
    width: 100%;
    padding: 20px;
`

export const dataSetMethod = (dict: any, formatMessage?: any) => {
    const obj: any = {
        cloud: formatMessage({ id: 'common.cloud' }),
        cloud_efficiency: formatMessage({ id: 'common.cloud_efficiency' }),
        cloud_ssd: formatMessage({ id: 'common.cloud_ssd' }),
        cloud_essd: formatMessage({ id: 'common.cloud_essd' }),
    }
    return obj[dict]
}

type TRowProps = {
    label: string;
}

const TRow: React.FC<TRowProps> = ({ label, children }) => {
    return (
        <Row gutter={8}>
            <Col span={6}>{label}</Col>
            <Col span={18}>{children || '-'}</Col>
        </Row>
    )
}

const LTRow: React.FC<TRowProps> = ({ label, children }) => {
    return (
        <Row gutter={8}>
            <Col span={4}>{label}</Col>
            <Col span={20}>{children || '-'}</Col>
        </Row>
    )
}

const SpaceVertical: React.FC<any> = (props) => <Space direction="vertical" style={{ width: "100%" }} {...props} />

const ElseTag: React.FC<any> = (props) => {
    const { tag_list } = props
    const { formatMessage } = useIntl()
    return (
        <Wrapper direction="vertical" size={20}>
            {
                (tag_list && !!tag_list.length) &&
                <SpaceVertical>
                    <Typography.Text strong><FormattedMessage id="ws.result.details.scheduling.tab" /></Typography.Text>
                    <Row>
                        {

                            tag_list.map(
                                (item: any) => (
                                    <Tag color={item.tag_color} key={item.id} >{item.name}</Tag>
                                )
                            )
                        }
                    </Row>
                </SpaceVertical>
            }

            <SpaceVertical>
                <Typography.Text strong><FormattedMessage id="ws.result.details.other.information" /></Typography.Text>
                <TRow label={`${formatMessage({ id: 'ws.result.details.configuration.name' })}:`}>{props?.name}</TRow>
                <TRow label="Owner:">{props?.owner_name}</TRow>
                <TRow label={`${formatMessage({ id: 'ws.result.details.gmt_created' })}:`}>{props?.gmt_created}</TRow>
                <TRow label={`${formatMessage({ id: 'ws.result.details.gmt_modified' })}:`}>{props?.gmt_modified}</TRow>
                <TRow label={`${formatMessage({ id: 'ws.result.details.test_summary' })}:`}>{props?.description}</TRow>
            </SpaceVertical>
        </Wrapper>
    )
}

const ServerDetail: React.FC<any> = (props) => {
    const { $type } = props
    const { formatMessage } = useIntl()
    return (
        <Container>
            <Wrapper direction="vertical" size={20}>
                <SpaceVertical>
                    <Typography.Text strong><FormattedMessage id="common.hardware" /></Typography.Text>
                    <SpaceVertical>
                        {
                            $type !== 0 &&
                            <>
                                <TRow label={`${formatMessage({ id: 'common.instance.ID' })}:`}>{props?.instance_id}</TRow>
                                <TRow label={`${formatMessage({ id: 'common.private_ip' })}:`}>{props?.private_ip}</TRow>
                            </>
                        }
                        <TRow label={"Region/Zone:"}>{props?.region_zone}</TRow>
                        <TRow label={`${formatMessage({ id: 'common.instance_type' })}:`}>{props?.instance_type}</TRow>
                        <TRow label={`${formatMessage({ id: 'common.bandwidth' })}:`}>{props?.bandwidth}</TRow>
                        {
                            props?.manufacturer !== 'aliyun_eci' &&
                            <>
                                <TRow label={`${formatMessage({ id: 'common.system_disk' })}:`}>{dataSetMethod(props?.system_disk_category, formatMessage)}/{props?.system_disk_size}G</TRow>
                                <TRow label={`${formatMessage({ id: 'common.storage_type' })}:`}>{dataSetMethod(props?.storage_type, formatMessage)}/{props?.storage_size}G/{props?.storage_number}个</TRow>
                            </>
                        }
                    </SpaceVertical>
                </SpaceVertical>

                <SpaceVertical>
                    <Typography.Text strong><FormattedMessage id="common.soft" /></Typography.Text>
                    <TRow label={`${formatMessage({ id: 'common.image_name' })}:`}>{props?.image_name}</TRow>
                </SpaceVertical>

                {
                    $type !== 0 &&
                    <>
                        <SpaceVertical>
                            <Typography.Text strong><FormattedMessage id="ws.result.details.use_state" /></Typography.Text>
                            <TRow label={`${formatMessage({ id: 'common.server.state' })}:`}>{props?.real_state}</TRow>
                        </SpaceVertical>

                        <SpaceVertical>
                            <Typography.Text strong><FormattedMessage id="common.channel_type" /></Typography.Text>
                            <TRow label={"Channel:"}>{props?.image_name}</TRow>
                            <TRow label={`${formatMessage({ id: 'ws.result.details.state' })}:`}>{props?.image_name}</TRow>
                            {/* <Col span={18}>{channelState?.toString()}</Col> */}
                        </SpaceVertical>
                    </>
                }
                {
                    JSON.stringify(props?.extra_param) !== '{}' &&
                    <SpaceVertical>
                        <Typography.Text strong><FormattedMessage id="common.extended.field" /></Typography.Text>
                        {
                            props?.extra_param?.map(
                                (item: any, idx: number) => (
                                    (item.param_key && item.param_value !== '') &&
                                    // eslint-disable-next-line react/no-array-index-key
                                    <TRow label=" " key={idx}>
                                        {item.param_key}:{item.param_value}
                                    </TRow>
                                )
                            )
                        }
                    </SpaceVertical>
                }

                <ElseTag {...props} />
            </Wrapper>
        </Container>
    )
}

const ClusterContainer = styled.div`
    width: 100%;
`

const CLusterTitle = styled.div`
    height: 42px;
    width: 100%;
    padding: 0 20px;
    background: #F5F5F5;
    color: rgba(0,0,0,0.85);
    line-height: 42px;
    font-weight: 700;
`

const CLusterTerm = styled.div`
    width: 100%;
    border: 1px solid rgba(0,0,0,0.10);
`

const TermTitle = styled.div`
    height: 40px;
    line-height: 40px;
    width: 100%;
    border-bottom: 1px solid rgba(0,0,0,0.10);
    background-color: #F5F5F5;
    font-weight: 700;
    padding: 0 20px;
    color: rgba(0,0,0,0.85);
`

const ClusterServer: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { id, name, is_instance } = props
    const [source, setSource] = React.useState([])

    const [ellipsis, setEllipsis] = React.useState(false)
    const init = async () => {
        const { data, code } = await queryClusterMachine({ cluster_id: id })
        if (code === 200)
            setSource(data.map((item: any) => ({ ...item, ...item.test_server })))
    }

    React.useEffect(() => {
        init()
    }, [id])

    return (
        <ClusterContainer>
            <CLusterTitle >
                <FormattedMessage id="ws.result.details.cluster.name" />：{name}
            </CLusterTitle>
            <Wrapper direction="vertical" style={{ padding: 20 }}>
                {/* <ElseTag {...props} /> */}
                <SpaceVertical style={{ padding: "0 20px", width: "100%" }}>
                    <LTRow label={`${formatMessage({ id: 'ws.result.details.configuration.name' })}:`}>{props?.name}</LTRow>
                    <LTRow label="Owner:">{props?.owner_name}</LTRow>
                    <LTRow label={`${formatMessage({ id: 'ws.result.details.gmt_created' })}:`}>{props?.gmt_created}</LTRow>
                    <LTRow label={`${formatMessage({ id: 'ws.result.details.gmt_modified' })}:`}>{props?.gmt_modified}</LTRow>
                    <LTRow label={`${formatMessage({ id: 'ws.result.details.test_summary' })}:`}>{props?.description}</LTRow>
                    <LTRow label={`${formatMessage({ id: 'ws.result.details.scheduling.tab' })}:`}>
                        {
                            (props.tag_list && !!props.tag_list.length) ?
                                props?.tag_list.map(
                                    (item: any) => (
                                        <Tag color={item.tag_color} key={item.id} >{item.name}</Tag>
                                    )
                                ) : "-"
                        }
                    </LTRow>
                </SpaceVertical>
                {
                    source.map((item: any) => {
                        const title = item.is_instance ?
                            formatMessage({ id: 'ws.result.details.server.instance.name' }, { data: item.name })
                            : formatMessage({ id: 'ws.result.details.server.configuration.name' }, { data: item.name })

                        return (
                            <CLusterTerm key={item.server_id}>
                                <TermTitle>
                                    {
                                        ellipsis ?
                                            <Tooltip
                                                title={item.name}
                                            >
                                                <Typography.Text ellipsis>{title}</Typography.Text>
                                            </Tooltip> :
                                            <Typography.Text ellipsis={{ onEllipsis: () => setEllipsis(true) }}>
                                                {title}
                                            </Typography.Text>
                                    }
                                </TermTitle>
                                <ServerDetail $type={is_instance} {...item} />
                            </CLusterTerm>
                        )
                    })
                }
            </Wrapper>
        </ClusterContainer>
    )
}

const ServerTooltip: React.FC<any> = ({ server_ip, is_instance, run_mode, provider_name }) => {
    const { ws_id } = useParams() as any
    const [source, setSource] = React.useState([])
    const [visible, setVisible] = React.useState(false)
    const { formatMessage } = useIntl()
    const $isNumber = Object.prototype.toString.call(is_instance) === "[object Number]"

    const handleVisible = async ($visible: boolean) => {
        if ($visible && $isNumber) {
            if (run_mode === "cluster") {
                const { data, code } = await queryClusterServer({ ws_id, cluster_type: "aliyun", name: server_ip })
                if (code === 200)
                    setSource(data[0])
                else {
                    setVisible(false)
                    return
                }
            }
            if (run_mode === "standalone") {
                const { data, code } = await queryCloudServer({
                    ws_id, [is_instance ? "private_ip" : "server_conf"]: server_ip,
                    in_pool: is_instance ? "" : "all",
                    query_size: 1
                })
                if (code === 200) {
                    if (Object.prototype.toString.call(data) === "[object Array]" && !!data.length)
                        setSource(data)
                    else {
                        setVisible(false)
                        return
                    }
                }
            }
        }

        setVisible($visible)
    }

    const basicText = server_ip || '-'
    if (provider_name === "aliyun" && !["", null, "随机"].includes(server_ip) && $isNumber)
        return (
            <Tooltip
                open={visible}
                overlayStyle={{
                    width: 510,
                    maxWidth: "unset",
                    padding: 0,
                    maxHeight: 450,
                    overflowY: "auto",
                    boxShadow: "-12px 0 48px 16px rgba(0,0,0,0.03), -9px 0 28px 0 rgba(0,0,0,0.05), -6px 0 16px -8px rgba(0,0,0,0.08)"
                }}
                color="#fff"
                placement="right"
                title={
                    run_mode === "cluster" ?
                        <ClusterServer {...source} is_instance={is_instance} /> :
                        source.map((item: any) => <ServerDetail key={item.id} {...item} $type={is_instance} />)
                }
                onOpenChange={handleVisible}
            >
                {basicText}
            </Tooltip>
        )
    else if (['随机'].includes(server_ip)) {
        return <Tooltip title={formatMessage({ id: 'common.random' })}><FormattedMessage id="common.random" /></Tooltip>
    }
    return <Tooltip title={basicText}>{basicText}</Tooltip>
}

export {
    ServerTooltip
}