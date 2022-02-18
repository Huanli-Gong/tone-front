import styled from 'styled-components'
import { Row } from 'antd'

interface Props {
    height : number
}

export const CreateContainer = styled.div<Props>`
    width : 100%;
    /* height : ${ props => props.height - 50 }px; */
    background-color: #f5f5f5;
`

export const ContainerBody = styled( Row )<Props>`
    height : ${ props => props.height - 100 }px;
    width : 100%;
    padding-left : 20px;
    background : #fff;
`

interface LeftWrapperProps {
    state : Boolean
}

export const LeftWrapper = styled.div<LeftWrapperProps>`
    height : 100%;
    width : 240px;
    border-right : 1px solid rgba(0,0,0,.1);
    padding-top : 24px;
    padding-left : 65px;
    ${
        ({ state }) => state && `
            .ant-steps-item-process .ant-steps-item-tail::after{
                background-color: #1890ff!important;
            }
            .ant-steps-item-wait .ant-steps-item-icon {
                border-color: #1890ff!important;
            }
            .ant-steps-item-wait .ant-steps-item-tail::after{
                background-color: #1890ff!important;
            }
            .ant-steps-item-wait .ant-steps-icon {
                color : #1890ff!important;
            }
        `
    }
`

export const RightWrapper = styled.div`
    height : 100%;
    width : calc( 100% - 240px );
    overflow : hidden;
`

export const RightNav = styled.div`
    width : 100% ;
    height : 50px ;
    background : #fff ;
    border-bottom : 1px solid rgba(0,0,0,.1) ;
    padding-left : 20px ;
    padding-right : 20px;
`

export const RightBody = styled.div`
    width : 100% ;
    height : calc( 100% - 50px ) ;
    overflow : hidden ;
`

export const ContainerBreadcrumb = styled( Row )`
    height : 50px;
    width : 100%;
    padding-left : 20px;
`
export const SuccessDescriptionContainer = styled(Row)`
    // height: 140px;
    width: 1072px;
    background: rgba(0,0,0,0.04);
    padding:20px 40px;
    margin:0 auto;
`