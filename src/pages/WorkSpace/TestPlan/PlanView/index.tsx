import React from 'react'
import { Tabs } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { ViewContent , ViewLayout , TabContainer } from './styled'
import ViewCollapse from './components/ViewCollapse'

import { useClientSize , writeDocumentTitle } from '@/utils/hooks'

const PalnView = (props: any) => {
    const { formatMessage } = useIntl()
    const { route , match } = props
    const { ws_id } = match.params 

    const { height: layoutHeight, width: layoutWidth } = useClientSize()

    writeDocumentTitle( `Workspace.TestPlan.${ route.name }` )

    return (
        <ViewLayout height={ layoutHeight - 50 } width={ layoutWidth } >
            <ViewContent>
                <TabContainer
                    tabBarStyle={{
                        height :64,
                        background : '#FAFBFC'
                    }}
                >
                    <Tabs.TabPane tab={<FormattedMessage id={ `Workspace.TestPlan.${ route.name }` } />}>
                        <ViewCollapse ws_id={ ws_id }/>
                    </Tabs.TabPane>
                </TabContainer>
            </ViewContent>
        </ViewLayout>
    )
}

export default PalnView