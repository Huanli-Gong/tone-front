/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { useIntl, useParams } from "umi"
import { queryWorkspaceApproveQuantity } from '@/services/Workspace'
import TableComponent from './Components/Table'
import styles from './index.less'
import { TabCard } from '@/components/UpgradeUI'
import { requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const [status, setStatus] = useState('0')
    const [tabNumbers, setTabNumbers] = useState({
        backlog_count: 0,
        finished_count: 0,
    })

    const initPage = async () => {
        const { data, code, msg } = await queryWorkspaceApproveQuantity({ ws_id, action: 'join' })
        if (code === 200) {
            setTabNumbers(data)
        }
        else requestCodeMessage(code, msg)
    }

    useEffect(() => {
        initPage()
    }, [status])

    //0为待审核 1为已审核
    return (
        <TabCard
            title={
                <Tabs
                    className={styles.tab_style}
                    defaultActiveKey={status}
                    onChange={val => setStatus(val)}
                >
                    <Tabs.TabPane tab={`${formatMessage({ id: 'approval.pending' })} ${tabNumbers.backlog_count}`} key="0" />
                    <Tabs.TabPane tab={`${formatMessage({ id: 'approval.record' })} ${tabNumbers.finished_count}`} key="1" />
                </Tabs>
            }
        >
            {status === '0' && <TableComponent {...props} status={status} onChange={initPage} />}
            {status === '1' && <TableComponent {...props} status={status} />}
        </TabCard>
    )
}