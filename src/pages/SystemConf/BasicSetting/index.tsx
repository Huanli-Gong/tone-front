import { useState, useRef } from 'react'
import { Button, Tabs } from 'antd'
import SystemScript from './SystemScript'
import SystemParameter from './SystemParameter'
import { FormattedMessage } from 'umi'
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import styled from 'styled-components';

const Container = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
`
const Header = styled.div`
    width: 100%;
    height: 48px;
    display: flex;
    justify-content: space-between;
    border: 1px solid #f0f0f0;
    padding: 0 24px;
    margin-bottom: -1px;
`
const ButtonWrap = styled(Button)`
    margin-top: 8px;
`
const Content = styled.div`
    width: 100%;
    height: calc(100% - 48px - 16px);
    padding: 24px;
`

export default (props: any) => {
    const { location } = props

    const [tab, setTab] = useState(location.query.t || 'script')
    const addConfigDrawer: any = useRef()

    const handleTabClick = ($tab: string) => {
        setTab($tab)
        //history.push(`/system/basic?t=${ tab }`)
    }

    return (
        <Container>
            <Header>
                <Tabs
                    defaultActiveKey={'script'}
                    onTabClick={handleTabClick}
                    className={styles.tab_style}
                >
                    <Tabs.TabPane tab={<FormattedMessage id="basic.script" />} key="script" />
                    <Tabs.TabPane tab={<FormattedMessage id="basic.sys" />} key="sys" />
                </Tabs>
                {
                    tab === 'sys' &&
                    <ButtonWrap type="primary" onClick={() => addConfigDrawer.current.openSetting()}>
                        <FormattedMessage id="basic.new.config" />
                    </ButtonWrap>
                }
            </Header>
            <Content>
            {
                tab === 'sys' ?
                    <SystemParameter ref={addConfigDrawer} /> :
                    <SystemScript />
            }
            </Content>
        </Container>
        
    )
}