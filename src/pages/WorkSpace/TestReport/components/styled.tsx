import styled from 'styled-components'
import { Table } from 'antd'

export const OptBtn = styled.span<{ isDefault?: any }>`
    color:#1890FF;
    cursor:pointer;
    // display:${({ isDefault }) => isDefault ? 'none' : 'inline-block'};
`

const tableTdCls = `
    tr {
        &:hover {
            td.no_tourist {
                cursor: pointer;
                color : #1890FF;
            }
        }
    }
`

export const TableContainer = styled(Table)`
    ${tableTdCls}
`

export const ClsResizeTable = styled.div`
    ${tableTdCls}
`