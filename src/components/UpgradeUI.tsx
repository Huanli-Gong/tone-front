import { Card } from 'antd'
import styled from 'styled-components'

export const TabCard = styled(Card)`
    border:none !important;
    .ant-card-head {
        min-height: 48px;
        .ant-tabs-tab { min-height : 48px; }
        .ant-card-head-title{
            padding: 0;
        }
        .ant-card-extra {
            padding: 0;
        }
    }
    .common_pagination { padding-bottom:0 ;}
`

export const SingleTabCard = styled( TabCard )`
    border:none!important;
    .ant-card-head .ant-card-head-wrapper { min-height:48px; }
    .ant-card-head-title { font-weight: normal; font-size:14px;}
    .commom_pagination { margin-bottom:0 ;}
    .ant-tabs-nav { margin : 0 ;}
    .ant-spin-nested-loading > div > .ant-spin {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
`
export const YunWeiTabCard = styled(Card)`
    border:none !important;
    .ant-card-head {
        min-height: 48px;
        padding: 0 32px;
        .ant-tabs-tab { min-height : 48px; }
        .ant-card-head-title{
            padding: 0;
        }
        .ant-card-extra {
            padding: 0;
        }
    }
    .ant-card-body{
        padding: 24px 24px 24px 0px;
    }
    .common_pagination { padding-bottom:0 ;}
`
export const OperationTabCard = styled( YunWeiTabCard )`
    border:none!important;
    .ant-card-head .ant-card-head-wrapper { min-height:48px; }
    .ant-card-head-title { font-weight: normal; font-size:14px;}
    .commom_pagination { margin-bottom:0 ;}
    .ant-tabs-nav { margin : 0 ;}
    .ant-spin-nested-loading > div > .ant-spin {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
`
// export const ProTableLayout = styled.div`
//     .commom_pagination { padding : 0 20px 16px; }
//     .ant-card-body { padding : 0 ; }
//     .ant-pro-table-list-toolbar-container { min-height:52px; padding : 0 ;}
//     .ant-pro-table-list-toolbar-title { font-weight: normal; font-size: 14px;}
//     .ant-pro-table-list-toolbar { border-bottom: 1px solid rgba(0,0,0,0.09) ; padding : 0 20px; }
//     .ant-table-wrapper { padding : 16px 20px 0;}
// `