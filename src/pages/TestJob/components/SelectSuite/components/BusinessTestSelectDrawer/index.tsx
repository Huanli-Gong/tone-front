import React, { useState, useImperativeHandle } from 'react';
import { Drawer, Button, Input, Tree, Spin, Checkbox, Empty } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest } from 'umi'
import { cloneDeep } from 'lodash';
import { getDomain } from '../../service';
import styles from './index.less';

/**
 * @author jpt
 * @module 业务测试(选择用例)
 */
const BusinessTestSelectDrawer: React.FC<any> = ({
    ws_id,
    testType,
    onRef, 
    handleSelect,
    config, 
    control, 
    treeData = [],
    onNameChange,
    suiteAllKeys,
    loading,
    onDomainChange
}) => {
    const { Search } = Input;
    const [ show, setShow ] = useState<boolean>(false)
    // 判断全选框的状态
    const [indeterminate, setIndeterminate] = useState(false); 
    const [checkAll, setCheckAll ] = useState<boolean>(false)
    const [selectData, setSelectData ] = useState<any>([])
    const [expand, setExpand ] = useState<boolean>(false)
	  const [domain, setDomain ] = useState<any>( '' )

    const checkAllChange = ( keys : any ) => {
        const selectedKeys = keys.slice().sort().join(',');
        if ( selectedKeys && selectedKeys === suiteAllKeys.slice().sort().join(',') ) {
            // 全选
            setIndeterminate(false)
            setCheckAll(true)
        } else if (keys && keys.length) {
            // 半选
            setIndeterminate(true)
            setCheckAll(false)
        } else {
            // 不选
            setIndeterminate(false)
            setCheckAll(false)
        }
    }

    const handleDomainChange = ( e : any ) => {
        setDomain( e )
        onDomainChange( e )
    }

    const { data: domainList } = useRequest(
        getDomain,
        { initialData : [] } 
    )
    useImperativeHandle(onRef, () => ({
        openDrawer: () => {
            let keys: any = []
            treeData.forEach((
                ( item : any ) => {
                    const suiteIdx = config.findIndex(({ id } : any ) => id === item.id )
                    if ( suiteIdx > -1 ) {
                        let row: any = []
                        item.test_case_list.forEach(
                            ( conf : any ) => {
                                const confIdx = config[ suiteIdx ].test_case_list.findIndex(({ id } : any) => id === conf.id )
                                if ( confIdx > -1 ) 
                                   row.push( conf.key )
                            }
                        )
                        if (row.length && (row.length === item.test_case_list.length)) {
                            keys.push( item.key ) // 如果子级全选，则包含父级key
                        }
                        if (row.length) {
                            keys.push(...row)
                        }
                    }
                }
            ))

            checkAllChange( keys )
            setSelectData( keys )
            setShow(true)
        },
    }))

    const onCheck = (checkedKeys: any) => {
        setSelectData(checkedKeys)
        checkAllChange( checkedKeys )
    };

    const selectAll = (e: any) => {
        setIndeterminate(false);
        setCheckAll(e.target.checked)
        e.target.checked ? setSelectData( suiteAllKeys ) : setSelectData([])
    }

    const onOk = () => {
        setShow(false)
        const treeDataCopy = cloneDeep(treeData)
        const data = treeDataCopy.filter((item: any) => {
            item.test_case_list = item.children.filter((el: any) => {
                if (selectData.indexOf(el.key) > -1) {
                    el.setup_info = ''
                    el.cleanup_info = ''
                    el.need_reboot = false
                    el.console = undefined
                    el.monitor_info = [{
                        items: undefined,
                        servers: undefined
                    }]
                    el.priority = 10
                    el.server_object_id = undefined
                    el.ip = el.ip || '随机'
                    el.env_info = el.var ? (JSON.parse(el.var).length > 0 ? JSON.parse(el.var) : []) : []
                    return el
                }
            })
            delete item.children
            if (item.test_case_list.length > 0) {
                item.need_reboot = false
                item.priority = 10
                item.console = undefined
                item.monitor_info = [{
                    items: undefined,
                    servers: undefined
                }]
                item.setup_info = ''
                item.cleanup_info = ''
                return item
            }
        })
        handleSelect(data)
        setSelectData([])
    }
    const onCancel = () => {
        setShow(false)
        setSelectData([])
    }

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false }
            className={styles.suite}
            title="用例列表"
            width={634}
            forceRender={true}
            destroyOnClose={true}
            onClose={() => setShow(false)}
            visible={show}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Checkbox disabled={ loading } 
                      indeterminate={indeterminate}
                      onChange={selectAll} 
                      checked={checkAll}
                      style={{float: 'left'}}
                    >
                      全选
                    </Checkbox>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>取消</Button>
                    <Button onClick={onOk} type="primary">确定</Button>
                </div>
            }
         >
            <Spin spinning={loading} wrapperClassName={styles.spinWrapper}>
                <div>
                  <Search onSearch={(value : any) => onNameChange(value.replace(/\s+/g, "") ) }
                    placeholder="请输入"
                    style={{ width: 420, marginBottom:16 }}
                  />
                  {control.includes('domain') && (
                    <>
                      <div style={{ position: 'relative', display: 'flex' }}>
                        <div className={styles.nav}>领域：</div>
                        <div className={styles.domainList_Tab}>
                            <Button className={styles.domain_all} size="small" type={domain === '' ? 'primary' : 'ghost'} onClick={()=> handleDomainChange('')}>全部</Button>
                            {domainList.map((item: any, index: number) => {
                              if (!expand && index > 6) {
                                  return
                              }
                              return item.id == domain ?
                                  <Button 
                                      key={item.id} 
                                      type="primary" 
                                      size="small" 
                                      style={{ marginRight: 8, marginBottom: 8 }} 
                                      onClick={() => handleDomainChange(item.id)} 
                                  >
                                      {item.name}
                                  </Button> :
                                  <Button 
                                      key={item.id} 
                                      type='ghost' 
                                      size="small" 
                                      style={{ border: 'none', marginRight: 8, marginBottom: 8 }} 
                                      onClick={() => handleDomainChange(item.id)}
                                  >
                                      {item.name}
                                  </Button>
                              }
                            )}
                        </div>
                        <Button type="link" size="small" onClick={() => setExpand(!expand)} 
                          icon={expand ? <UpOutlined /> : <DownOutlined />}
                          style={{ position: 'absolute', right: 0 }}>{expand ? '收起' : '展开'}</Button>
                      </div>
                      <hr className={styles.dividing_line} />
                    </>
                  )}
                </div>

                {treeData?.length ? (
                  <>
                    <div className={styles.selection_table_thead}>
                        <Checkbox className={styles.selection_Checkbox}
                            disabled={ loading } 
                            indeterminate={indeterminate}
                            onChange={selectAll}
                            checked={checkAll} />
                        <div style={{ width: 200}}>Test Suite</div>
                        <div>业务名称</div>
                    </div>
                    <Tree className={styles.selection_table_tbody}
                      treeData={treeData} 
                      checkedKeys={selectData} 
                      checkable 
                      onCheck={onCheck}
                      titleRender={(nodeData: any) => {
                          const { name, children, business_name } = nodeData || {}
                          return (
                            <div className={styles.selection_table_row}>
                              <div className={styles.col} style={{ width: children ? 200 : '100%'}}>{name || null}</div>
                              <div className={styles.otherCol}>{business_name || (children ? '-' : null)}</div>
                            </div>
                          )
                        }
                      }
                    />
                  </>
                ) : (
                  <div style={{ flex:1, display: 'flex' , justifyContent: 'center' , alignItems: 'center', flexDirection: 'column' }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用例" />
                    <Button type="primary" onClick={() => {
                        // 跳转至ws级TestSuite管理
                        const a = document.createElement('a');
                        a.target = "_blank";
                        a.rel = "noopener noreferrer"
                        a.href = testType ? `/ws/${ws_id}/test_suite?test_type=${testType}` : `/ws/${ws_id}/test_suite`;
                        a.click();
                    }}>添加用例</Button>
                  </div>
                )}
            </Spin>
        </Drawer>
    );
};

export default BusinessTestSelectDrawer;