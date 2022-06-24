import styled from 'styled-components'
import { Menu, Row } from 'antd'

export const HeaderContainer = styled(Row)`
    width:100%;
    background: #051136;
    height:50px;
    line-height:50px;
    padding:0 18px;
    flex-flow: row nowrap;
    position: relative;
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
    position: relative;
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

export const HeaderCls = styled.div`
    user-select: none;

    .ant-pro-top-nav-header-main-left,
    .ant-pro-top-nav-header-logo {
        min-width: 130px;
    }

    #logo a h1 {
        color: #fff;
    }

    .ant-pro-top-nav-header {
        background-color: rgba(5,17,54,1);
    }
    
    .ant-pro-top-nav-header-menu {
        .ant-menu.ant-menu-horizontal {
            height: 43px;
        }
    }

    .ant-menu {
        color: #fff;
    }

    .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item, .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu {
        padding: 0;
    }

    .ant-menu-horizontal,
    .ant-menu-horizontal:not(.ant-menu-dark) {
        .ant-menu-item {
            /* padding: 0 14px; */
            &::after {
                right: 14px;
                left: 14px;
            }
        }

        .ant-menu-item-active{
            &::after {
                border-bottom: none;
            }
        }

        .ant-menu-item:focus-visible, .ant-menu-submenu-title:focus-visible {
            box-shadow: unset;
        }

        .ant-menu-item-selected {
            color: #fff;
            &::after {
                border-bottom: 2px solid #fff;
            }
        }

        .ant-menu-item{
            :hover {
                color: rgb(255 255 255 / 50%);
                transition: unset;
                border-bottom: 2px solid transparent;

                .ant-pro-menu-item-title {
                    color: rgb(255 255 255 / 50%);
                }

                svg { 
                    path {
                        fill: rgb(255 255 255 / 50%)!important;
                        fill-opacity : 1;
                    }
                }
            }
        }

        .ant-menu-item {
            &:hover {
                &::after {
                    border-bottom: none;
                }
            }
        }
    }

    .ant-menu-horizontal > .ant-menu-item::after, 
    .ant-menu-horizontal > .ant-menu-submenu::after {
        transition: unset;
        &:hover {
            transition: unset;
            border-bottom: none;
        }
    }
`