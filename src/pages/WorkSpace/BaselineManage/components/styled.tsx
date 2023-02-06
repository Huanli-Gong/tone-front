
import styled from 'styled-components';
import { Drawer, Layout, Row, Typography, Modal } from "antd"

export const DrawerCls = styled(Drawer)`
    .ant-drawer-body {
        padding: 0;
    }
`
export const ModalCls = styled(Modal)`
    .ant-modal-body {
        padding: 0;
    }
`
export const DrawerLayout = styled(Layout)`
    min-height: unset!important;
    display: flex;
    flex-direction: column;
    gap: 10px;
`

export const InfoRow = styled(Row)`
    background-color: #fff;
    padding: 20px;
`

export const TableRow = styled.div`
    padding: 0 20px;
    background-color: #fff;
`

export const TableTitle = styled(Typography.Text)`
    display: block;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 16px;
    color: rgba(0,0,0,.85);
    font-weight: 500;
`