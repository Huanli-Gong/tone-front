import { useState } from 'react'
import { Tabs } from 'antd'
import { history, FormattedMessage } from 'umi'

import ProductManagement from './ProductManagement'
import CodeManagement from './CodeManagement'

import styles from '@/pages/WorkSpace/index.less'
import { TabCard } from '@/components/UpgradeUI'

// workspace 产品管理
export default (props: any) => {
    const { ws_id } = props.match.params
    const { location } = props
    const [key, setTab] = useState(location.query.t || 'product')

    const handleTab = ($key: string) => {
        setTab($key)
        history.push(`/ws/${ws_id}/product?t=${$key}`)
    }

    return (
        <TabCard
            title={
                <Tabs
                    activeKey={key}
                    onChange={handleTab}
                    className={styles.tab_style}
                >
                    <Tabs.TabPane tab={<FormattedMessage id="product.manage" />} key="product" />
                    <Tabs.TabPane tab={<FormattedMessage id="code.manage" />} key="code" />
                </Tabs>
            }
        >
            {
                key === 'product' ?
                    <ProductManagement /> :
                    <CodeManagement ws_id={ws_id} />
            }
        </TabCard>
    )
}