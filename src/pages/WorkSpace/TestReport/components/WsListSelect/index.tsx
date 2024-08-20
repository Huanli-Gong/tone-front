/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Space, Avatar, Typography, Select, Spin } from 'antd';
import { queryWorkspaceHistory } from '@/services/Workspace'
import { useModel } from 'umi'
import { redirectErrorPage } from '@/utils/utils'
import styled from 'styled-components'

const ShowName = styled(Typography.Text)`
    width: 138px;
    font-size: 14px;
`
interface CoverProps {
    size: number
    theme_color: string
}

const Cover = styled.span<CoverProps>`
    display: inline-block;
    border-radius : 4px;
    font-size : 14px;
    font-weight : bold;
    width : ${({ size }) => size}px;
    height : ${({ size }) => size}px;
    line-height : ${({ size }) => size}px;
    text-align : center;
    color : #fff;
    background : ${({ theme_color }) => theme_color};
`
const WorkspaceCover: React.FC<any> = ({ logo, show_name, theme_color }) => logo ?
    <Avatar
        shape="square"
        size={24}
        src={logo}
    /> :
    <Cover size={24} theme_color={theme_color}>{show_name?.slice(0, 1)}</Cover>



const WsListSelect: React.FC<any> = ({ ws_id, onChange=()=> {}, onSelect=()=> {}, onClear=()=> {}, value, ...rest }) => {
  const { initialState: { wsList, listFetchLoading }, setInitialState } = useModel("@@initialState")
  const [isOver, setIsOver] = useState(false)

  const queryWorkspaceList = async () => {
      setInitialState((p: any) => ({ ...p, listFetchLoading: true }))
      let num = isOver ? wsList?.page_num : wsList?.page_num + 1
      const { code, data, page_num, total_page } = await queryWorkspaceHistory({
          page_num: num, page_size: 20, call_page: 'menu', ws_id
      })
      if (code !== 200) {
          redirectErrorPage(500)
          return
      }
      setIsOver(total_page === page_num)
      if (Object.prototype.toString.call(data) === "[object Array]" && !!data.length) {
          setInitialState((p: any) => {
              const obj = p.wsList.data.concat(data).reduce((pre: any, cur: any) => {
                  pre[cur.id] = cur
                  return pre
              }, {})
              return {
                  ...p,
                  listFetchLoading: false,
                  wsList: {
                      page_num,
                      data: Object.entries(obj).map((item: any) => {
                          const [, val] = item
                          return val
                      })
                  }
              }
          })
      }
  }

  const handleScroll = ({ target }: any) => {
    const { clientHeight, scrollTop, scrollHeight } = target
    if (clientHeight + scrollTop === scrollHeight && !isOver && Object.prototype.toString.call(wsList?.next) === '[object String]') {
        queryWorkspaceList()
    }
  }

	useEffect(() => {
		queryWorkspaceList()
	}, []);

	return (
			<Select
				notFoundContent={listFetchLoading ? <Spin size="small" /> : null}
				showSearch
				onSearch={queryWorkspaceList}
				onPopupScroll={listFetchLoading ? () => {}: handleScroll} // 防抖
				showArrow={false}
        value={value}
        onSelect={onSelect}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...rest}
			>
        {wsList?.data?.map((item: any) => 
          <Select.Option key={item.id} value={item.id}>
              <Space>
                <WorkspaceCover {...item} />
                <ShowName ellipsis>{item.show_name}</ShowName>
              </Space>
          </Select.Option>)}
      </Select>
	);
};

export default WsListSelect;
