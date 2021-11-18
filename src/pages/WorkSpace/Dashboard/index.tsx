import { resizeDocumentHeightHook } from '@/utils/hooks'
import { Col, Divider, Empty, Layout, Row, Spin, Statistic, Typography , Button } from 'antd'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { useRequest, history, Access, useAccess } from 'umi'
import { queryWorkspaceProductData } from './services'

import { ReactComponent as Icondroduct } from '@/assets/svg/dashboard/icon_droduct.svg'
import { ReactComponent as Iconip } from '@/assets/svg/dashboard/icon_ip.svg'
import { ReactComponent as Iconjob } from '@/assets/svg/dashboard/icon_Job.svg'
import { ReactComponent as IconTestconf } from '@/assets/svg/dashboard/icon_Testconf.svg'

import { ReactComponent as Bad } from '@/assets/svg/dashboard/bad.svg'
import { ReactComponent as Well } from '@/assets/svg/dashboard/well.svg'
import { writeDocumentTitle } from '@/utils/hooks'

interface ContainerProps {
    height?: number;
}

const Container = styled(Layout) <ContainerProps>`
    min-height:unset;
    overflow:auto;
    padding:20px;
    ${({ height }) => height ? `height:${height}px;` : ''}
`

const WhiteBlock = styled(Row) <ContainerProps>`
    background: #FFFFFF;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.06);
    border-radius: 4px;
    width:100%;
    ${({ height }) => height ? `height:${height}px;` : ''}

    svg {
        margin-right:24px;
    }
`

const ProductTitle = styled(Row)`
    height:50px;
    line-height:50px;
`
const GaryBlock = styled.div`
    height: 133px;
    width: 268px;
    background: #F8FAFB;
    border-radius: 6px;
    background-color: #F8FAFB;
    margin-left:10px;
    padding:16px 16px 8px;
    margin-bottom:10px;
    cursor:pointer;
    position:relative;
`

const PaddingRow = styled.div<ContainerProps>`
    background: #FFFFFF;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.06);
    border-radius: 4px;
    width:100%;
    margin-bottom:10px;
    padding-top:10px;
    ${({ height }) => height ? `height:${height}px;` : ''}
`

const CommonStatic = styled(Statistic)`
    line-height:1.2!important;
    .ant-statistic-content,
    .ant-statistic-content-suffix{font-size:30px;}
`

const ProgressContainer = styled(Row)`
    width:100%;
    height:52px;
    position:relative;
    overflow:hidden;
`

const ProgressWrapper = styled.div`
    position:absolute;
    height:10px;
    width:100%;
    border-radius: 6px;
    top:50%;overflow: hidden;
    transform: translate(0, -50%);
`

const progressCss = `
    height:10px;
    position:absolute;
    width:0%;
    top:50%;
    transform: translate(0, -50%);
`

const DisabledSpan = styled(Typography.Text)`
    font-size: 12px;
    color: rgba(0,0,0,0.25);
`

interface ProgressProp {
    width: any
}

const CompleteProgress = styled(Row) <ProgressProp>`
    left:0;
    ${progressCss}
    background: #55AB50;
    width:${({ width }) => width || 0};
`

const FailProgress = styled(Row) <ProgressProp>`
    right:0;
    ${progressCss}
    width:${({ width }) => width || 0};
    background: #DE5657;
`

interface CountTextProp {
    color?: string
    top?: number
    bottom?: number
    left?: number;
    right?: number;
}

const countTextCss = `
    font-size: 12px;
    position:absolute;
`

const CompleteCountText = styled(Typography.Text) <CountTextProp>`
    ${countTextCss}
    color:${({ color }) => color || '#55AB50'};
    top:${({ top }) => `${top}px` || 'unset'};
    bottom:${({ bottom }) => `${bottom}px` || 'unset'};
    left:${({ left }) => `${left}px` || 'unset'};
    right:${({ right }) => `${right}px` || 'unset'};
`

const FailCountText = styled(Typography.Text) <CountTextProp>`
    ${countTextCss}
    color:${({ color }) => color || '#DE5657'};
    top:${({ top }) => `${top}px` || 'unset'};
    bottom:${({ bottom }) => `${bottom}px` || 'unset'};
    left:${({ left }) => `${left}px` || 'unset'};
    right:${({ right }) => `${right}px` || 'unset'};
`

interface ProgressSliderProp {
    left: string
}

const ProgressSlider = styled.div<ProgressSliderProp>`
    left:${({ left }) => left || 0};
    width: 0px;
    height: 0;
    position: absolute;
    border-left: 6px solid transparent;
    border-top: 6px solid transparent;
    border-right: 6px solid #F8FAFB;
    border-bottom: 6px solid #F8FAFB;
    top:50%;
    transform: translate(0, -50%);

    ::after {
        content:'';
        width: 0px;
        height: 0px;
        position: absolute;
        border-left: 6px solid #F8FAFB;
        border-top: 6px solid #F8FAFB;
        border-right: 6px solid transparent;
        border-bottom: 6px solid transparent;

        top: -6px;
        left: 5px;
    }
`

const WeatherIcon = styled.div`
    position:absolute;
    right:16px;
    top:16px;
    width:24px;
    height:24px;
`

const WorkpsaceDashboard = (props: any) => {
    const { ws_id } = props.match.params
    const layoutHeight = resizeDocumentHeightHook()
    const access = useAccess();
    const { data, loading } = useRequest(() => queryWorkspaceProductData({ ws_id }))

    writeDocumentTitle(`menu.Workspace.Dashboard`)
    return (
        <Container height={layoutHeight - 50}>
            <Spin spinning={loading}>
                <Row gutter={16}>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Icondroduct />
                            <CommonStatic groupSeparator="" title={'总产品/总项目'} value={data?.total_product} suffix={`/${data?.total_project}`} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Iconjob />
                            <CommonStatic groupSeparator="" title={'Job总数'} value={data?.total_job} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <IconTestconf />
                            <CommonStatic groupSeparator="" title={'TestConf总数'} value={data?.total_conf} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Iconip />
                            <CommonStatic groupSeparator="" title={'机器使用数'} value={data?.server_use_num} />
                        </WhiteBlock>
                    </Col>
                </Row>
                <ProductTitle>
                    <Typography.Text strong>产品列表({data?.product_list.length})</Typography.Text>
                </ProductTitle>
                {
                    data?.product_list.map(
                        (item: any, index: number) => (
                            // item.project_list.length > 0 &&
                            <PaddingRow key={index}>
                                <Row justify="space-between" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                    <Typography.Text ellipsis strong>{item.product_name}</Typography.Text>
                                    <DisabledSpan>{moment(item.product_create).fromNow()}</DisabledSpan>
                                </Row>
                                <DisabledSpan ellipsis style={{ paddingLeft: 20, paddingRight: 20 }}>{item.product_description}</DisabledSpan>
                                {
                                    item.project_list.length > 0 ?
                                        <Row style={{ marginTop: 10 }}>
                                            {
                                                item.project_list.map(
                                                    (i: any, idx: number) => (
                                                        <GaryBlock key={idx} onClick={() => history.push(`${location.pathname}/${i.project_id}`)}>
                                                            <div>
                                                                <Typography.Text ellipsis>{i.project_name}</Typography.Text>
                                                            </div>
                                                            <div>
                                                                <DisabledSpan ellipsis>{i.project_description}</DisabledSpan>
                                                            </div>
                                                            <Divider style={{ margin: 5 }} />
                                                            <ProgressContainer justify="center">
                                                                <ProgressWrapper >
                                                                    <CompleteProgress width={`${i.complete_num / (i.complete_num + i.fail_num) * 100}%`} />
                                                                    <FailProgress width={`${i.fail_num / (i.complete_num + i.fail_num) * 100}%`} />
                                                                    {
                                                                        (i.complete_num && i.fail_num) ?
                                                                            <ProgressSlider left={`calc(${i.complete_num / (i.complete_num + i.fail_num) * 100}% - (11px -100% ))`} /> :
                                                                            ''
                                                                    }
                                                                </ProgressWrapper>
                                                                <CompleteCountText top={0} left={0} color={i.complete_num === 0 ? 'rgba(0,0,0,0.25)' : ''}>{i.complete_num}</CompleteCountText>
                                                                <CompleteCountText left={0} bottom={0} color={i.complete_num === 0 ? 'rgba(0,0,0,0.25)' : ''}>Complete</CompleteCountText>
                                                                <FailCountText top={0} right={0} color={i.fail_num === 0 ? 'rgba(0,0,0,0.25)' : ''}>{i.fail_num}</FailCountText>
                                                                <FailCountText right={0} bottom={0} color={i.fail_num === 0 ? 'rgba(0,0,0,0.25)' : ''}>Fail</FailCountText>
                                                            </ProgressContainer>
                                                            <WeatherIcon >
                                                                {
                                                                    i.complete_num > i.fail_num ?
                                                                        <Well /> :
                                                                        <Bad />
                                                                }
                                                            </WeatherIcon>
                                                        </GaryBlock>
                                                    )
                                                )
                                            }
                                        </Row> :
                                        <Col span={24} style={{ paddingBottom: 1, width: '100%' }}>
                                            <Empty 
                                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                                description={ `产品中还没有项目`}
                                            >
                                                <Access
                                                    accessible={access.canWsAdmin()}
                                                    // fallback={ 
                                                    //     <Button type="primary" disabled={true}>
                                                    //         立刻创建
                                                    //     </Button>
                                                    // }
                                                >
                                                    <Button
                                                    onClick={
                                                        () => history.push(`/ws/${ws_id}/product?current=${item.product_id}`)
                                                        }
                                                        type="primary"
                                                    >
                                                        立刻创建
                                                    </Button>
                                                </Access>
                                            </Empty>
                                        </Col>
                                }
                            </PaddingRow>
                        )
                    )
                }
            </Spin>
        </Container>
    )
}

export default WorkpsaceDashboard