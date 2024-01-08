import { Row } from 'antd';
import styled from 'styled-components';

export const LoadingWrapper = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
`
export const Layout = styled.div`
    height: calc(${innerHeight}px - 96px - 90px);
    width: 100%;
    overflow: hidden;
    display: flex;
    gap: 20px;
`
export const Left = styled.div`
    width: 300px;
    border: 1px solid #eee;
    height: 100%;
`
export const Right = styled.div`
    width: calc(100% - 300px - 20px);
    height: 100%;
` 
export const CreateBtnWrap = styled.div`
    padding: 20px;
 
` 
export const LeftTitle = styled(Row)`
    position: relative;
    width: 100%;
    height: 32px;
    background-color: rgba( 0,0,0, .02 );
    padding-left: 20px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 700;
    color: rgba(0 , 0 , 0 , .85);
`       
export const StoreWrapper = styled.div`
    height: calc(100% - 72px - 32px - 8px);
    overflow: auto;  
`