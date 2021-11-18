
import React, { useEffect, useState } from 'react';
import { Row, Col, Avatar } from 'antd';
import RoleIcon from '@/assets/svg/roleIcon.svg';
import { auth_admin } from '../services/Workspace';
import { history } from 'umi'

const rolepage: React.FC<any> = (props: any) => {
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const { state } = props.location

    const [person, setPerson] = useState<any>([])
    const [ws, setWsName] = useState<any>({})
    const windowHeight = () => setLayoutHeight(innerHeight)

    useEffect(() => {
        window.addEventListener("popstate", function (e) {
            history.push('/');
        }, false);
        return () => {
            window.addEventListener("popstate", function (e) {
                history.push('/');
            }, false);
        }
    }, [])

    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])

    const authAdmin = async () => {
        const data = await auth_admin({ ws_id: state })
        if (data.code === 200) {
            setPerson(data.data || [])
            setWsName(data.ws_info || {})
        }
    }

    useEffect(() => {
        state && authAdmin()
    }, [state])

    //

    return (
        // <Layout style={{ padding: 20, height: layoutHeight, minHeight: 0, overflow: 'auto' }}>
        //     <Layout.Content style={{ background: '#fff' }}>
        <div style={{ height: layoutHeight, minHeight: 0, overflow: 'auto' }}>
            <div style={{ width: '600px', height: '400px', background: '#fff', textAlign: 'center', margin: '0 auto', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
                <Row>
                    <Col span={8} style={{ marginTop: 120 }}>
                        <img alt="icon" src={RoleIcon}></img>
                    </Col>
                    <Col span={16} style={{ marginTop: 124 }}>
                        <div style={{ color: '#000', fontSize: 24, textAlign: 'left' }}>无权限</div>
                        <div style={{ color: 'rgba(0,0,0,0.85)', fontSize: 14, marginTop: 8, textAlign: 'left' }}>您不是Workspace 成员，没有访问权限。</div>
                        {/* <div style={{ color: 'rgba(0,0,0,0.85)', fontSize: 14, marginTop:8,textAlign:'left' }}>
                            <Space>
                                请联系 <span style={{ color:'#1890FF' }}>“前端测试”</span>  管理员
                                <Avatar size={28} icon={<UserOutlined />} />陶帅帅
                                <Avatar size={28} icon={<UserOutlined />} />陶帅帅
                            </Space>
                        </div> */}
                        <div style={{ color: 'rgba(0,0,0,0.85)', fontSize: 14, marginTop: 8, textAlign: 'left' }}>请联系 <span style={{ color: '#1890FF' }}>{ws.show_name}</span>  管理员
                            {
                                person.map((item: any, index: number) => {
                                    return <span style={{ marginLeft: 6 }} key={index}><Avatar size={28} src={item.avatar} /><span style={{ marginLeft: 6 }}>{item.name}</span></span>
                                })
                            }
                        </div>
                        <div style={{ color: '#1890FF', fontSize: 14, marginTop: 33, textAlign: 'left', cursor: 'pointer' }} onClick={() => location.href = '/'}>返回首页</div>
                    </Col>
                </Row>


            </div>
        </div>

        //     </Layout.Content>
        // </Layout>
    )
}

export default rolepage;
