import React, { memo } from 'react'
import { BodyBreadcrumb } from '../styled'
import { Breadcrumb, Typography } from 'antd'
import { FormattedMessage, Link, useParams } from 'umi'
import { useProvider } from '../Provider'

const TemplateBreadcrumb = (props: any) => {
    const { route } = props
    const { ws_id } = useParams<any>()

    const { dataSource, bodyWidth } = useProvider()

    return (
        <BodyBreadcrumb>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to={`/ws/${ws_id}/test_report?t=template`}>
                        <FormattedMessage id="report.template" />
                    </Link>
                </Breadcrumb.Item>
                {
                    route.name === 'TemplateCreate' ?
                        <Breadcrumb.Item>
                            <FormattedMessage id="menu.Workspace.TestReport.TemplateCreate" />
                        </Breadcrumb.Item> :
                        <Breadcrumb.Item>
                            <span>
                                <Typography.Text ellipsis style={{ width: bodyWidth - 134 }}>
                                    {dataSource.name}
                                </Typography.Text>
                            </span>
                        </Breadcrumb.Item>
                }
            </Breadcrumb>
        </BodyBreadcrumb>
    )
}

export default memo(TemplateBreadcrumb)


// {
//     route.name === 'TemplateEdit' &&
    
// }
// {
//     route.name === 'ReportTemplatePreview' &&
//     <Breadcrumb.Item>
//         <span>
//             <Typography.Text ellipsis style={{ width: bodyWidth - 80 - 118 }}>
//                 {/* <FormattedMessage id={`menu.Workspace.TestReport.${route.name}`} /> */}
//                 {dataSource.name}
//             </Typography.Text>
//         </span>
//     </Breadcrumb.Item>
// }