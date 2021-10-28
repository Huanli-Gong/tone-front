import { Breadcrumb, Row, Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { FormattedMessage, useRequest , history } from 'umi'
import { RenderDataRow } from '../components'
import ViewTable from '../components/ViewTable'
import { resizeDocumentHeightHook, resizeDocumentWidthHooks , writeDocumentTitle } from '@/utils/hooks'

import { queryPlanViewList } from '@/pages/WorkSpace/TestPlan/PlanView/services'

interface ContainerProps {
    width: number
    height: number
}

const DetailContainer = styled.div<ContainerProps>`
    width:${props => props.width}px;
    height:${props => props.height}px;
    overflow:auto;
    min-height:100%;
`

const DetailHeader = styled.div`
    // height:182px;
    width:100%;
    background:#fff;
    padding:20px;
`

const DescriptionRow = styled(Row)`
    margin-top:8px;
`

const DetailBody = styled.div`
    background:#fff;
    padding:20px;
    margin-top:20px;
`

const LinkSpan = styled.span`
    cursor:pointer;
    &:hover {
        color : #1890FF;
    }
`

const ViewDetail = (props: any) => {
    const { route, match } = props
    const { plan_id, ws_id } = match.params

    writeDocumentTitle( `Workspace.TestPlan.${ route.name }` )

    const layoutHeight = resizeDocumentHeightHook()
    const layoutWidth = resizeDocumentWidthHooks()

    const { data } = useRequest(
        () => queryPlanViewList({ ws_id, plan_id }),
        {
            initialData: {},
        }
    )

    return (
        <DetailContainer height={layoutHeight - 50} width={layoutWidth} >
            <DetailHeader>
                <Row style={{ marginBottom: 8 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <LinkSpan onClick={() => history.push(`/ws/${ ws_id }/test_plan/view`)}>
                                <FormattedMessage id={`Workspace.TestPlan.View`} />
                            </LinkSpan>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <FormattedMessage id={`Workspace.TestPlan.${ route.name }`} />
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </Row>
                <Typography.Title level={3}>
                    {data?.name}
                </Typography.Title>
                <RenderDataRow {...data} />
                <DescriptionRow >
                    {data?.description}
                </DescriptionRow>
            </DetailHeader>
            
            <DetailBody >
                <ViewTable plan_id={plan_id} ws_id={ws_id} showPagination={true} />
            </DetailBody>
        </DetailContainer>
    )
}

export default ViewDetail