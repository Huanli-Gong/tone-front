import React from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { Pagination , Row , Col } from 'antd'
import styled from 'styled-components'

const CommonPagination = styled(Row)`
    margin-top:16px;
    margin-bottom:16px;
    width : 100%;
`

interface PaginationProps {
    total : number,
    pageSize : number ,
    currentPage : number,
    onPageChange : ( page : number , size? : number ) => void,
    style?:any,
    largePage?:boolean,
} 

export default ( props : PaginationProps ) => {
    const { formatMessage } = useIntl()
    const { total = 0 , largePage = false, pageSize = 10 , currentPage = 1 , onPageChange , ...rest } = props 
    let sizeNumber = ['10','20','50','100']
    if ( total === 0  ) return <CommonPagination className="commom_pagination" justify="space-around" {...rest} />
    if( largePage ) {
        sizeNumber = sizeNumber.concat(['200','500'])
    }
    return (
        <CommonPagination className="commom_pagination" justify="space-around" {...rest}>
            <Col span={ 4 } style={{ textAlign : 'left' }}>
               {formatMessage({id: 'pagination.total.strip'}, {data: total})}
            </Col>
            <Col span={ 20 } style={{ textAlign : 'right' }}>
                <Pagination 
                    total={ total }
                    pageSize={ pageSize }
                    current={ currentPage }
                    size="small"
                    showSizeChanger
                    pageSizeOptions={sizeNumber}
                    onChange={ onPageChange }
                    showQuickJumper={ true }
                    onShowSizeChange={ onPageChange }
                />
            </Col>
        </CommonPagination>
    )
}