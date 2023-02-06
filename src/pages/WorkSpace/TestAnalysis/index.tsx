import { Button, Popover, Layout, Modal } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/assets/img/compareHome.png';
import { useClientSize, writeDocumentTitle } from '@/utils/hooks';
import { history, useIntl, FormattedMessage } from 'umi'
import styles from './AnalysisCompare/index.less'
import Draggable from 'react-draggable';
import AddJob from './AnalysisCompare/AddJob'
// import Icon from '@/assets/img/loss.png';
const addGroup = {
    members: [],
    name: "Group1",
    product_version: "Group1",
    type: "job",
    disabled: false
}
export default (props: any) => {
    const { ws_id } = props.match.params
    writeDocumentTitle(`Workspace.TestAnalysis.${props.route.name}`)
    const [disabled, setDisabled] = useState(true)
    const [visibleAddGroupItem, setVisibleAddGroupItem] = useState(false);
    const [bounds, setBounds] = useState<any>({ left: 0, top: 0, bottom: 0, right: 0 })
    const draggleRef = useRef<any>(null);
    const { height: layoutHeight } = useClientSize()

    const handleAddJobGroup = () => {
        setVisibleAddGroupItem(true)
    }
    const handleAddGroupItemCancel = () => {
        setVisibleAddGroupItem(false);
        destroyAll()
    }
    const destroyAll = () => {
        Modal.destroyAll();
    }
    const handleAddGroupItemOk = (obj: any) => {
        setVisibleAddGroupItem(false)
        window.sessionStorage.setItem(`${ws_id}-compareData`, JSON.stringify([obj]))
        window.sessionStorage.setItem('originType', 'test_analysis')
        window.sessionStorage.setItem(`${ws_id}-noGroupJobData`, JSON.stringify([]))
        history.push(`/ws/${ws_id}/test_analysis/compare`)
    }
    const onStart = (event: any, uiData: any) => {
        const { clientWidth, clientHeight } = window?.document?.documentElement;
        const targetRect = draggleRef?.current?.getBoundingClientRect();
        setBounds({
            left: -targetRect?.left + uiData?.x,
            right: clientWidth - (targetRect?.right - uiData?.x),
            top: -targetRect?.top + uiData?.y,
            bottom: clientHeight - (targetRect?.bottom - uiData?.y),
        })
    }
    return (
        <Layout.Content style={{ background: '#fff' }}>
            <div style={{ backgroundColor: '#fff', height: layoutHeight }}>
                <div style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
                    <div>
                        <div style={{ display: 'inline-block' }}>
                            <img alt="icon" src={Icon} style={{width:438,height: 268,transform: 'translateY(-30px)'}}></img>
                        </div>
                        <div style={{ textAlign: 'left', display: 'inline-block', marginLeft: 80 }}>
                            <div style={{ color: '#000', fontSize: 46, opacity: 0.85, fontWeight: 'bold' }}><FormattedMessage id="analysis.title" /></div>
                            <div style={{ color: '#000', fontSize: 16, opacity: 0.45, marginTop: 20 }}><FormattedMessage id="analysis.subTitle" /></div>
                            <div style={{ marginTop: 16 }}>
                            <Button type="primary" onClick={handleAddJobGroup}><FormattedMessage id="analysis.start" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    title={
                        <div
                            style={{
                                width: '100%',
                                cursor: 'move',
                            }}
                            onMouseOver={() => {
                                if (disabled) {
                                    setDisabled(false)
                                }
                            }}
                            onMouseOut={() => {
                                setDisabled(true)
                            }}
                        >
                            {'Group1'}
                        </div>
                    }
                    centered={true}
                    visible={visibleAddGroupItem}
                    width={1000}
                    className={styles.baseline_del_modal}
                    onOk={handleAddGroupItemOk}
                    onCancel={handleAddGroupItemCancel}
                    maskClosable={false}
                    destroyOnClose={true}
                    wrapClassName={styles.job_Modal}
                modalRender={modal => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    onStart={(event: any, uiData: any) => onStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
                )}
                >
                   <AddJob ws_id={ws_id} onOk={handleAddGroupItemOk} onCancel={handleAddGroupItemCancel} currentGroup={addGroup} />
                </Modal>
            </div>
        </Layout.Content>
    )
}
