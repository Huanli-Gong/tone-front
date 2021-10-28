import styled from 'styled-components'
import { Menu , Row } from 'antd'

export const HeaderContainer = styled( Row )`
    width:100%;
    background: #051136;
    height:50px;
    line-height:50px;
    padding:0 18px;
`
export const LogoWrapper = styled(Row)`
    cursor:pointer;
    h3 {
        color:#fff;
        margin-bottom:0;
        font-weight: normal;
    }
`

export const WorkspaceTitle = styled(Row)`
    color : #fff;
`

export const LeftWrapper = styled(Row)`

`
export const HeaderMenu = styled(Menu)`
    background: #051136;
    height:35px;
    line-height:35px!important;
    border-bottom:none;
    color:#fff;
    margin-left:20px;

    .ant-menu-item {
        height : 35px;
        top:0;
        margin: 0 16px;
        .anticon.anticon-caret-down {
            margin-right:0;
        }
    }

    .ant-menu-item:hover {
        color:rgba(255,255,255,.5)!important;
        border-bottom:2px solid transparent!important;
        svg { 
            path{
                fill:rgba(255,255,255,.5);
            }
        }
    }

    .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover {
        color:rgba(255,255,255,.5)!important;
        border-bottom:2px solid transparent!important;
    }

    .ant-menu-item-selected {
        border-bottom:2px solid #fff!important;
        color:#fff!important;
        svg  {
            path {
                fill:#fff;
            }
        }
    }

    .ant-menu-item.ant-menu-item-active.ant-menu-item-selected {
        border-bottom:2px solid #fff!important;
        color:#fff!important;
        svg {
            path{
                fill:#fff;
            }
        }
    }

    .ant-menu-submenu {
        color:#fff!important;
        border-bottom:2px solid transparent!important;
        &:hover {
            color:#fff!important;
            border-bottom:2px solid #fff!important;
        }
        .ant-menu-submenu-title:hover {
            color:#fff!important;
        }
    }
`