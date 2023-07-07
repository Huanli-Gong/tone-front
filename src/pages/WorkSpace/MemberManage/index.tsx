import React, { useState, useEffect } from 'react'
import { Layout, Tabs, Space, Avatar, Typography, Button, message, Input, Modal, Select, Row, Col, Form, AutoComplete } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { queryMember, addWorkspaceMember, queryWorkspaceMemberCounts, queryWorkspaceMember } from '@/services/Workspace'
import styles from './index.less'
import TableComponent from './Components/Table'
import { roleList } from '@/pages/SystemConf/UserManagement/service'
import { Access, useAccess } from 'umi'
import { SingleTabCard } from '@/components/UpgradeUI';
import { requestCodeMessage, switchUserRole2 } from '@/utils/utils';
import lodash from "lodash"

let timeout: any
let timer: any
export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = props.match.params
    const access = useAccess();
    const [role, setRole] = useState('ws_owner')
    const [keyword, setKeyword] = useState('')
    const [memberCounts, setMemberCounts] = useState<any>({
        all_count: 0,
        ws_owner: 0,
        ws_admin: 0,
        ws_test_admin: 0,
        ws_member: 0
    })
    const [memberList, setMemberList] = useState<any[]>([])
    const [options, setOptions] = useState<any>([])
    const [visible, setVisible] = useState(false)
    const [refresh, setRefresh] = useState<any>(new Date().getTime())
    const [padding, setPadding] = useState(false)
    const [select, setSelect] = useState<any[]>([]);
    const [roleData, setRoleData] = useState<any[]>([]);
    const [form] = Form.useForm()

    const getMemberList = async (name: string = '') => {
        const { data } = await queryMember({ keyword: name, scope: 'aligroup' })
        setMemberList(data)
    }

    const getRoleWsList = async () => {
        const { data } = await roleList({ role_type: 'workspace', ws_id, is_filter: '1' })
        data && setRoleData(data.list)
    };

    useEffect(() => { getRoleWsList() }, [ws_id])

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

    const searchResult = (results: any[], name: string) => results.map(
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

    const handleSearchWorkspaceMember = lodash.debounce(
        async (name: string) => {
            if (name) {
                let { data } = await queryWorkspaceMember({ keyword: name, ws_id })
                setOptions(data ? searchResult(data, name) : [])
            }
        },
        200
    )

    const onSelect = (value: string) => {
        setKeyword(value)
    };

    const handleOk = () => {
        if (padding) return;
        form
            .validateFields()
            .then(
                async values => {
                    console.log(values)
                    setPadding(true)
                    const data = await addWorkspaceMember({
                        ws_id,
                        ...values
                    })
                    setPadding(false)

                    if (data.code === 200) {
                        message.success(formatMessage({ id: 'operation.success' }))
                        setVisible(false)
                        //getMemberCounts()
                        setRefresh(new Date().getTime())
                    }
                    else {
                        requestCodeMessage(data.code, data.msg)
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
        { name: `${formatMessage({ id: 'member.ws_owner' })} ${memberCounts.ws_owner}`, role: 'ws_owner' },
        { name: `${formatMessage({ id: 'member.ws_admin' })} ${memberCounts?.ws_admin}`, role: 'ws_admin' },
        { name: `${formatMessage({ id: 'member.ws_test_admin' })} ${memberCounts?.ws_test_admin}`, role: 'ws_test_admin' },
        { name: `${formatMessage({ id: 'member.ws_member' })} ${memberCounts.ws_member}`, role: 'ws_member' }
    ]

    const getMemberCounts = async () => {
        const { data } = await queryWorkspaceMemberCounts({ ws_id })
        setMemberCounts(data)
    }

    useEffect(() => {
        getMemberCounts()
    }, [role, refresh])

    const handleChangeTab = (val: string) => {
        setKeyword('')
        setRole(val)
    }
    return (
        <Layout.Content>
            <SingleTabCard
                title={`${formatMessage({ id: 'all' })} ${memberCounts.all_count}`}
                extra={
                    <Space>
                        <AutoComplete
                            dropdownMatchSelectWidth={true}
                            style={{ width: 200 }}
                            options={options}
                            onSelect={onSelect}
                            onSearch={handleSearchWorkspaceMember}
                        >
                            <Input.Search
                                placeholder={formatMessage({ id: 'member.search.users' })}
                                onPressEnter={(evt: any) => setKeyword(evt.target.value)}
                            />
                        </AutoComplete>
                        <Access
                            accessible={access.WsBtnPermission()}
                        >
                            <Button type="primary" onClick={handleOpenAddMemberModal}><FormattedMessage id="member.add.member" /></Button>
                        </Access>
                    </Space>
                }
            >
                <Tabs className={styles.tab_style} onChange={handleChangeTab} type="card">
                    {childTabs.map((item: any) => {
                        return (
                            <Tabs.TabPane tab={item.name} key={item.role}>
                                {role === item.role &&
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
                    })}
                </Tabs>
            </SingleTabCard>
            {
                visible &&
                <Modal
                    title={formatMessage({ id: 'member.add.member' })}
                    open={visible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    maskClosable={false}
                >
                    <Form
                        layout="vertical"
                        form={form}
                    >
                        <Form.Item
                            label={<FormattedMessage id="member.user" />}
                            name="emp_id_list"
                            rules={[
                                { required: true, message: formatMessage({ id: 'member.please.select.user' }) }
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
                                    memberList?.map((item) => (
                                        <Select.Option key={item.id} value={item.emp_id} label={item.last_name} >
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
                        <Form.Item
                            label={<FormattedMessage id="member.role" />}
                            name="role_id"
                            rules={[
                                {
                                    required: true,
                                    message: formatMessage({ id: 'member.please.select.role' }),
                                }
                            ]}
                        >
                            <Select
                                style={{ width: '100%', minHeight: 32 }}
                                placeholder={formatMessage({ id: 'member.please.select.role' })}
                                allowClear
                                showArrow
                            >
                                {select.map((item: any) => {
                                    return <Select.Option key={item.id} value={item.id}>{switchUserRole2(item.name, formatMessage)}</Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            }
        </Layout.Content>
    )
}