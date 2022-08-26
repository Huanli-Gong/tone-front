import { Row, Col, Space, Typography, Tag, Tooltip } from "antd"
import React from "react"
import { useParams } from "umi"
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

export const dataSetMethod = (dict: any) => {
    const obj = {
        cloud: '普通云盘',
        cloud_efficiency: '高效云盘',
        cloud_ssd: 'SSD云盘',
        cloud_essd: 'ESSD云盘',
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

const ServerDetail: React.FC<any> = (props) => {
    const { $type } = props
    return (
        <Container>
            <Wrapper direction="vertical" size={20}>
                <SpaceVertical>
                    <Typography.Text strong>硬件</Typography.Text>
                    <SpaceVertical>
                        {
                            $type !== 0 &&
                            <>
                                <TRow label={"实例ID:"}>{props?.instance_id}</TRow>
                                <TRow label={"IP地址:"}>{props?.private_ip}</TRow>
                            </>
                        }
                        <TRow label={"Region/Zone:"}>{props?.region_zone}</TRow>
                        <TRow label={"规格:"}>{props?.instance_type}</TRow>
                        <TRow label={"带宽:"}>{props?.bandwidth}</TRow>
                        {
                            props?.manufacturer !== 'aliyun_eci' &&
                            <>
                                <TRow label={"系统盘:"}>{dataSetMethod(props?.system_disk_category)}/{props?.system_disk_size}G</TRow>
                                <TRow label={"数据盘:"}>{dataSetMethod(props?.storage_type)}/{props?.storage_size}G/{props?.storage_number}个</TRow>
                            </>
                        }
                    </SpaceVertical>
                </SpaceVertical>

                <SpaceVertical>
                    <Typography.Text strong>软件</Typography.Text>
                    <TRow label={"镜像:"}>{props?.image_name}</TRow>
                </SpaceVertical>

                {
                    $type !== 0 &&
                    <>
                        <SpaceVertical>
                            <Typography.Text strong>使用状态</Typography.Text>
                            <TRow label={"机器状态:"}>{props?.real_state}</TRow>
                        </SpaceVertical>

                        <SpaceVertical>
                            <Typography.Text strong>控制通道</Typography.Text>
                            <TRow label={"Channel:"}>{props?.image_name}</TRow>
                            <TRow label={"状态:"}>{props?.image_name}</TRow>
                            {/* <Col span={18}>{channelState?.toString()}</Col> */}
                        </SpaceVertical>
                    </>
                }
                {
                    JSON.stringify(props?.extra_param) !== '{}' &&
                    <SpaceVertical>
                        <Typography.Text strong>扩展字段</Typography.Text>
                        {
                            props?.extra_param?.map(
                                (item: any) => (
                                    (item.param_key && item.param_value !== '') &&
                                    <TRow label=" ">
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

const ElseTag: React.FC<any> = (props) => {
    const { tag_list } = props
    return (
        <Wrapper direction="vertical" size={20}>
            {
                (tag_list && !!tag_list.length) &&
                <SpaceVertical>
                    <Typography.Text strong>调度标签</Typography.Text>
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
                <Typography.Text strong>其它信息</Typography.Text>
                <TRow label="配置名称:">{props?.name}</TRow>
                <TRow label="Owner:">{props?.owner_name}</TRow>
                <TRow label="创建时间:">{props?.gmt_created}</TRow>
                <TRow label="修改时间:">{props?.gmt_modified}</TRow>
                <TRow label="备注:">{props?.description}</TRow>
            </SpaceVertical>
        </Wrapper>
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
                集群名称：{name}
            </CLusterTitle>
            <Wrapper direction="vertical" style={{ padding: 20 }}>
                {/* <ElseTag {...props} /> */}
                <SpaceVertical style={{ padding: "0 20px", width: "100%" }}>
                    <LTRow label="配置名称:">{props?.name}</LTRow>
                    <LTRow label="Owner:">{props?.owner_name}</LTRow>
                    <LTRow label="创建时间:">{props?.gmt_created}</LTRow>
                    <LTRow label="修改时间:">{props?.gmt_modified}</LTRow>
                    <LTRow label="备注:">{props?.description}</LTRow>
                    <LTRow label="调度标签:">
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
                        const title = `机器${item.is_instance ? "实例" : "配置"}名称：${item.name}`
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
                    in_pool: is_instance ? "" : "all"
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
                visible={visible}
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
                onVisibleChange={handleVisible}
            >
                {basicText}
            </Tooltip>
        )
    return <Tooltip title={basicText}>{basicText}</Tooltip>
}

export {
    ServerTooltip
}