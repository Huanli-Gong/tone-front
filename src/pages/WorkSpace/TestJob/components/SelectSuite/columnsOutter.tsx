import React from 'react'

import { MinusCircleOutlined } from '@ant-design/icons'

import { noop } from 'lodash'
import styles from './style.less'
import { Button , Tooltip } from 'antd'

import PopoverEllipsis from '@/components/Public/PopoverEllipsis';

interface Props {
    contrl : any ,
    checked : boolean,
    disabled : boolean,
    openSuite : any ,
    dataSource : any ,
    onDataSourceChange : any ,
    run_mode : string,
    width:number
}

export default ({
    checked = false , 
    contrl,
    disabled = false ,
    openSuite = noop,
    dataSource = [],
    onDataSourceChange = noop,
    run_mode = '',
    width
} : Props) => {
    const onRemoveSuite = ( key : string ) => {
		onDataSourceChange(
            dataSource.filter(( item : any ) => item.id !== key ),
            run_mode
        )
    }

    const name = {
        title : 'Test Suite',
        dataIndex : 'title',
        ellipsis: {
            shwoTitle: false,
        },
        width : 200,
        render : ( _ : any ) => (
            _ ? 
                <Tooltip placement="topLeft" title={ _ }>
                    { _ }
                </Tooltip> : 
                '-'
        ),
    }

    const reboot = {
        title: '重启',
        dataIndex: 'reboot',
        width : 100,
        render: (_: any, row: any) => row.need_reboot ? '是' : '否',
    }

    const script = {
        title: '脚本',
        dataIndex: 'script',
        width : 150,
        render: (_: any, row: any) => (
            row.setup_info || row.cleanup_info ?
                <PopoverEllipsis 
                    title={ `[重启前]:${row.setup_info || '-'}，[重启后]:${row.cleanup_info || '-'}` } 
                    width={'180px'}
                />
                : '-'
        )
    }

    const monitor = {
        title: '监控',
        dataIndex: 'monitor',
        width : 150,
        render: (_: any, row: any) => (
            row.console === undefined ? '-' : row.console ? '是' : '否'
        ),
    }

    const priority = {
        title: '执行优先级',
        width : 150,
        dataIndex: 'priority',
    }

    const option = {
        title: '操作',
        width : 65,
        dataIndex : 'title',
        render: ( _ : any , row : any , index: number ) => (
            <>
                {
                    ( !disabled && checked ) && 
                    <Button 
                        type="link" 
                        style={{ padding: 0, height: 'auto' }} 
                        onClick={() => openSuite(index, row)}
                    >
                        配置
                    </Button>
                }
                {
                    !disabled &&
                    <MinusCircleOutlined 
                        className={ styles.remove } 
                        style={ 
                            checked ? 
                                { marginTop : 6 , padding : 0 } :
                                { margin : 0 , paddingRight : 6 , width : 60 , textAlign : 'right' }
                        }
                        onClick={ () => onRemoveSuite( row.id ) } 
                    />
                }
            </>
        ),
    }

    if ( checked ) {
        let columns : any = [ name ]
        if ( 'reboot' in contrl ) columns.push( reboot )
        if ( 'script' in contrl ) columns.push( script )
        if ( 'monitor' in contrl ) columns.push( monitor )
        
        columns.push( priority )
        columns.push( option )
        
        const resultColumnsWidth = columns.reduce(( pre : any , cur : any ) => pre += cur.width , 0)

        if ( resultColumnsWidth < width ) {
            const elseWidth = width - name.width - option.width - 30 - 20 - 2;
            const elseColumnWidth = elseWidth / ( columns.length - 2 ) 

            return columns.reduce(( pre : any , cur : any ) => {
                if ( cur.dataIndex === 'title' ) return pre.concat( cur )
                return pre.concat({ ...cur , width : elseColumnWidth })
            }, [])
        }
        return columns
    }
    else {
        return [
            {
                ...name,
                width : width - option.width - 30,
            },
            option
        ]
    }
}

