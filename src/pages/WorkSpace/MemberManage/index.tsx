import React, { useState, useEffect } from 'react'
import { Layout, Tabs, Space, Avatar, Typography, Button, message, Input, Modal, Select, Checkbox, Row, Col, Form, AutoComplete, Popover, Card } from 'antd'
import { queryMember, addWorkspaceMember, queryWorkspaceMemberCounts, queryWorkspaceMember } from '@/services/Workspace'
import { AuthCommon } from '@/components/Permissions/AuthCommon';
import styles from './index.less'
import TableComponent from './Components/Table'
import { roleList } from '@/pages/SystemConf/UserManagement/service'
import { handleRole } from '@/components/Role/index.js';
import { SingleTabCard } from '@/components/UpgradeUI';
import { requestCodeMessage } from '@/utils/utils';
let timeout: any

let timer: any

export default (props: any) => {
    const { ws_id } = props.match.params
    const [role, setRole] = useState('ws_owner')
    const [keyword, setKeyword] = useState('')
    const [memberCounts, setMemberCounts] = useState<any>({
        all_count: 0,
        ws_owner: 0,
        ws_admin: 0,
        ws_test_admin: 0,
        ws_member: 0
    })

    const [searchKey, setSearchKey] = useState('')

    const [memberList, setMemberList] = useState<any[]>([])
    const [options, setOptions] = useState<any>([])
    const [visible, setVisible] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [padding, setPadding] = useState(false)
    const [select, setSelect] = useState<any[]>([]);
    const [roleData, setRoleData] = useState<any[]>([]);
    const [form] = Form.useForm()

    const getMemberList = async (name: string = '') => {
        const { data } = await queryMember({ keyword: name, scope: 'aligroup' })
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }

        timeout = setTimeout(() => {
            setMemberList(data)
        }, 300)
    }
    const getRoleWsList = async () => {
        const { data } = await roleList({ role_type: 'workspace', ws_id,is_filter: '1' })
        data && setRoleData(data.list)

    };
    useEffect(() =>{getRoleWsList()},[ws_id])

    const getRoleList = async () => {
        const { data } = await roleList({ role_type: 'workspace', ws_id })
        data && setSelect(data.list)
    };

    useEffect(() => {
        getRoleList()
        return () => {
            clearTimeout(timeout)
            clearTimeout(timer)
        }
    }, [visible])

    

    const replaceWord = (title: string, word: string) => title.replace(new RegExp(`(${word})`), `<span style="color:#1890ff">$1</span>`)

    const searchResult = (results: Array<any>, name: string) => results.map(
        ({ user_info }) => (
            {
                value: user_info.last_name,
                label: (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: replaceWord(user_info.last_name, name) }} />
                    </div>
                ),
            }
        )
    )

    const handleSearchWorkspaceMember = async (name: string) => {
        setSearchKey(name)
        let { data } = await queryWorkspaceMember({ keyword: name, ws_id })

        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        timer = setTimeout(() => {
            setOptions(data ? searchResult(data, name) : [])
        }, 300);
    }

    const handleOk = () => {
        if (padding) return;
        form
            .validateFields()
            .then(
                async values => {
                    console.log(values)
                    setPadding(true)
                    let data = await addWorkspaceMember({
                        ws_id,
                        ...values
                    })
                    setPadding(false)

                    if (data.code === 200) {
                        message.success('添加成功!')
                        setVisible(false)
                        //getMemberCounts()
                        setRefresh(!refresh)
                    }
                    else {
                        requestCodeMessage( data.code , data.msg )
                    }
                }
            )
            .catch(err => {
                console.log(err)
                setPadding(false)
            })
    }

    const handleCancel = () => setVisible(false)

    const handleOpenAddMemberModal = async () => {
        form.resetFields()
        setVisible(true)
        getMemberList()
    }

    const childTabs = [
        { name: `所有者 ${memberCounts.ws_owner}`, role: 'ws_owner' },
        { name: `管理员 ${memberCounts.ws_admin}`, role: 'ws_admin' },
        { name: `测试管理员 ${memberCounts.ws_test_admin}`, role: 'ws_test_admin' },
        { name: `workspace成员 ${memberCounts.ws_member}`, role: 'ws_member' }
    ]

    const getMemberCounts = async () => {
        const { data } = await queryWorkspaceMemberCounts({ ws_id })
        setMemberCounts(data)
    }

    useEffect(() => {
        getMemberCounts()
    }, [role,refresh])

    const handleChangeTab = (val: string) => {
        setSearchKey('')
        setKeyword('')
        setRole(val)
    }
    return (
        <Layout.Content>
            <SingleTabCard
                title={`全部 ${memberCounts.all_count}`}
                extra={
                    <Space>
                        <AutoComplete
                            dropdownMatchSelectWidth={200}
                            style={{ width: 200 }}
                            showSearch
                            options={options}
                            onFocus={(evt: any) => {
                                if (evt.target.value) {
                                    handleSearchWorkspaceMember(evt.target.value)
                                }
                                else {
                                    setSearchKey(evt.target.value)
                                    setKeyword(evt.target.value)
                                }
                            }}
                            value={searchKey}
                            onSearch={handleSearchWorkspaceMember}
                            onChange={handleSearchWorkspaceMember}
                            onSelect={val => {
                                setKeyword(val)
                                setSearchKey(val)
                            }}
                        >
                            <Input.Search
                                placeholder="搜索用户"
                                onPressEnter={(evt: any) => setKeyword(evt.target.value)}
                            />
                        </AutoComplete>
                        {<AuthCommon
                            isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                            children={<Button type="primary">添加成员</Button>}
                            onClick={handleOpenAddMemberModal} />
                        }
                    </Space>
                }
            >
                <Tabs
                    className={styles.tab_style}
                    onChange={handleChangeTab}
                    type="card"
                >
                    {childTabs.map(
                        (item: any) => (
                            <Tabs.TabPane tab={item.name} key={item.role} >
                                {
                                    role === item.role &&
                                    <TableComponent
                                        refresh={refresh}
                                        role={role}
                                        keyword={keyword}
                                        {...props}
                                        roleData={roleData}
                                        onOk={getMemberCounts}
                                    />
                                }
                            </Tabs.TabPane>
                        )
                    )}
                </Tabs>
            </SingleTabCard>
            {
                visible &&
                <Modal
                    title="添加成员"
                    visible={visible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    maskClosable={false}
                >
                    <Form 
                        layout="vertical" 
                        form={form} 
                        /*hideRequiredMark*/
                    >
                        <Form.Item label="用户" name="emp_id_list"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择用户',
                                }
                            ]}
                        >
                            <Select
                                style={{ width: '100%' }}
                                optionLabelProp="label"
                                className={styles.select_baseline}
                                mode="multiple"
                                defaultActiveFirstOption={false}
                                filterOption={false}
                                onSearch={val => getMemberList(val)}
                            >
                                {
                                    memberList.map((item) => (
                                        <Select.Option key={item.emp_id} value={item.emp_id} label={item.last_name} >
                                            <Row>
                                                <Col span={2}>
                                                    <Avatar size={25} src={item.avatar} />
                                                </Col>
                                                <Col span={22}>
                                                    <Row>
                                                        <Space>
                                                            <Typography.Text>{item.last_name}({item.first_name === "" ? item.last_name : item.first_name}) - {item.emp_id}</Typography.Text>
                                                        </Space>
                                                    </Row>
                                                    <Row><Typography.Text>{item.job_desc}</Typography.Text></Row>
                                                    <Row><Typography.Text>{item.dep_desc}</Typography.Text></Row>
                                                </Col>
                                            </Row>
                                        </Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="角色" name="role_id"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择角色',
                                }
                            ]}
                        >
                            <Select
                                style={{ width: '100%', minHeight: 32 }}
                                placeholder="请选择角色"
                                allowClear
                                showArrow
                            >
                                {select.map((item: any) => {
                                    return <Select.Option key={item.id} value={item.id}>{handleRole(item.name)}</Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            }
        </Layout.Content>
    )
}