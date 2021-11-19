import React, { useState , useEffect } from 'react'
import { Layout, Row, Typography, Space } from 'antd';
import styled from 'styled-components'
import LoginForm from './components/LoginForm'
import RegistForm from './components/RegistForm'
import bg from '@/assets/img/login_background.png';
import logo from '@/assets/img/logo.png'
import { useModel } from 'umi';

const LoginWrapper = styled(Row)`
    width : 460px;
    position:absolute;
    left:50%;
    top:30%;
    transform:translate(-50%,-0%);
    box-shadow: 0 0 40px 0 #1C4389;
    border-radius: 10px;
    padding:20px;
    background-color: #FFFFFF;
`

const Title = styled(Typography.Title)`
    margin: 0 auto;
    position:absolute;
    color: #fff !important;;
    font-weight: normal!important;
    font-size:36px!important;
    left:50%;
    top:20%;
    transform:translate(-50%,-50%);
`

const Text = styled(Typography.Text)`
    font-size: 24px;
    color: rgba(0,0,0,0.85);
`

const LogoCls = styled.img`
    width:50px;
    height:55px;
`

const LoginBackground = styled(Layout)`
    background:url(${bg}) no-repeat left center/100% 100%;
`

const UserLogin: React.FC = () => {
    const [tigger, setTigger] = useState(true)
    const switchTigger = () => setTigger(!tigger)

    const { initialState, setInitialState } = useModel('@@initialState')
    useEffect(() => {
        setInitialState({ ...initialState, ws_id: undefined })
    } , [])

    return (
        <LoginBackground>
            <Title level={1} >登录自动化测试系统T-One</Title>
            <LoginWrapper justify="center">
                <Space direction="vertical" align="center">
                    <LogoCls src={logo} alt="" />
                    <Text>T-One</Text>
                    {
                        tigger ?
                            <>
                                <LoginForm />
                                <Typography.Link onClick={switchTigger}>注册账号</Typography.Link>
                            </> :
                            <>
                                <RegistForm />
                                <Typography.Link onClick={switchTigger}>已有账户，去登录</Typography.Link>
                            </>
                    }
                </Space>
            </LoginWrapper>
        </LoginBackground>
    )
}

export default UserLogin