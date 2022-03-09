import React , { useState } from 'react'
import { Space , Dropdown } from 'antd'
import { FilterFilled } from '@ant-design/icons'

import SelectDrop from './SelectDrop';
// import SearchInput from './SearchInput'
import SelectCheck from './SelectCheck';

import styles from './index.less'

interface InputFilterProps {
    title : string,
    name : string,
    params : any,
    setParams : ( props : any ) => void,
    confirm ? : () => void,
    list ? : any,
    ws_id?:string,
    configType? : string,
}


export const UserSearchColumnFilterTitle : React.FC<InputFilterProps> = ({  title, confirm , setParams , params , name, ws_id }) => {
    const [ visible , setVisible ] = useState( false )

    const handleVisible = ( v : boolean ) => {
        setVisible( v )
    }

    return (
        <div className={ styles.filter_wrapper_container }>
            <Space>
                <span>{ title }</span>
                <Dropdown 
                    visible={ visible }
                    onVisibleChange={ handleVisible }
                    trigger={['click']}
                    overlay={
                        <SelectDrop 
                            confirm={confirm} 
                            name={name}
                            ws_id={ws_id}
                            onConfirm={
                                ( val : any ) => {
                                    const obj = {}
                                    obj[ name ] = val;
                                    setVisible( false )
                                    setParams({ ...params , ...obj })
                                }
                            } 
                        />
                    }
                >
                    <div className={ styles.filter_icon_wrapper } >
                        <FilterFilled 
                            className={
                                params[ name ] ?
                                    styles.filter_icon_contaner_active:
                                    styles.filter_icon_contaner
                            }
                        />
                    </div>
                </Dropdown>
            </Space>
        </div>
    )
}

export const CheckboxColumnFilterTitle : React.FC<InputFilterProps> = ({ title , confirm , setParams , params , name , list, configType }) => {
    const [ visible , setVisible ] = useState( false )

    const handleVisible = ( v : boolean ) => {
        setVisible( v )
    }

    return (
        <div className={ styles.filter_wrapper_container }>
            <Space>
                <span>{ title }</span>
                <Dropdown 
                    visible={ visible }
                    onVisibleChange={ handleVisible }
                    trigger={['click']}
                    overlay={
                        <SelectCheck 
                            confirm={confirm} 
                            onConfirm={
                                ( val : any ) => {
                                    const obj = {}
                                    obj[ name ] = val;
                                    setVisible( false )
                                    setParams({ ...params , ...obj })
                                }
                            } 
                            list={ list }
                            configType={configType}
                        />
                    }
                >
                    <div className={ styles.filter_icon_wrapper } >
                        <FilterFilled 
                            className={
                                params[ name ] ?
                                    styles.filter_icon_contaner_active:
                                    styles.filter_icon_contaner
                            }
                        />
                    </div>
                </Dropdown>
            </Space>
        </div>
    )
}