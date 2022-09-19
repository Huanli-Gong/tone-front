import React from 'react'

import { MinusCircleOutlined } from '@ant-design/icons'

import { noop } from 'lodash'
import styles from './style.less'
import { Button , Tooltip } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
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
    formatMessage: any,
}

export default ({
    checked = false , 
    contrl,
    disabled = false ,
    openSuite = noop,
    dataSource = [],
    onDataSourceChange = noop,
    run_mode = '',
    width,
    formatMessage,
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
        title: formatMessage({id: 'select.suite.restart'}),
        dataIndex: 'reboot',
        width : 80,
        render: (_: any, row: any) => row.need_reboot ? <FormattedMessage id="operation.yes"/> : <FormattedMessage id="operation.no"/>,
    }

    const script = {
        title: formatMessage({id: 'select.suite.script'}),
        dataIndex: 'script',
        width : 150,
        render: (_: any, row: any) => (
            row.setup_info || row.cleanup_info ?
                <PopoverEllipsis 
                    title={ `${formatMessage({id: 'select.suite.before.restart'})}:${row.setup_info || '-'}，${formatMessage({id: 'select.suite.after.restart'})}:${row.cleanup_info || '-'}` } 
                    width={'180px'}
                />
                : '-'
        )
    }

    const monitor = {
        title: formatMessage({id: 'select.suite.monitor'}),
        dataIndex: 'monitor',
        width : 80,
        render: (_: any, row: any) => (
            row.console === undefined ? '-' : row.console ? <FormattedMessage id="operation.yes"/> : <FormattedMessage id="operation.no"/>
        ),
    }

    const priority = {
        title: formatMessage({id: 'select.suite.priority'}),
        width : 80,
        dataIndex: 'priority',
    }

    const option = {
        title: formatMessage({id: 'Table.columns.operation'}),
        width : 100,
        dataIndex : 'title',
        fixed: 'right',
        render: ( _ : any , row : any , index: number ) => (
            <>
                {
                    ( !disabled && checked ) && 
                    <Button 
                        type="link" 
                        style={{ padding: 0, height: 'auto' }} 
                        onClick={() => openSuite(index, row)}
                    >
                        <FormattedMessage id="select.suite.config"/>
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

