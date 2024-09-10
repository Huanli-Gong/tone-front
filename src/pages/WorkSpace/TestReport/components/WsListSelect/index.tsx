/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Space, Avatar, Typography, Select, Spin } from 'antd';
import { queryWorkspaceHistory, queryHomeWorkspace } from '@/services/Workspace'
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
    />
    :
    <Cover size={24} theme_color={theme_color}>{show_name?.slice(0, 1)}</Cover>



const WsListSelect: React.FC<any> = ({ ws_id, onChange=()=> {}, onSelect=()=> {}, onClear=()=> {}, value, ...rest }) => {
  const [isOver, setIsOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wsList, setWsList] = useState({ data: [], page_num: 1 })

  const queryWorkspaceList = async (q?: any) => {
    setLoading(true)
    try {
      const res = await queryHomeWorkspace({
        scope: 'powerful',
        page_num: wsList.page_num, page_size: 999,
        ...q,
      })

      if (res.code === 200) {
        // setIsOver(res.total_page === res.page_num)
        setWsList({
          ...res, data: res.data || []
        })
      } else {
        redirectErrorPage(500)
      }
      setLoading(false) 
    } catch (err) {
      setLoading(false) 
    }
  }

  // const handleScroll = ({ target }: any) => {
  //   const { clientHeight, scrollTop, scrollHeight } = target
  //   if (clientHeight + scrollTop === scrollHeight && !isOver && Object.prototype.toString.call(wsList?.next) === '[object String]') {
  //       queryWorkspaceList({ page_num: wsList.page_num + 1 })
  //   }
  // }

  // const handleSearch = async (word?: string) => {
  //   console.log('word:', word)
	// 	// const param = word && word.replace(/\s*/g, "")
	// 	// queryWorkspaceList({ name: param, page_num: 1, ws_id })
	// }

	useEffect(() => {
		queryWorkspaceList()
	}, []);

	return (
			<Select
				notFoundContent={loading ? <Spin size="small" /> : null}
				showSearch
        // onSearch={handleSearch}
				// onPopupScroll={loading ? () => {}: handleScroll} // 防抖
        value={value}
        onSelect={onSelect}
        {...rest}
        filterOption={(input, option: any) => {
          return (
            option?.key?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0
          )
        }}
			>
        {wsList?.data?.map((item: any) => 
          <Select.Option key={item.show_name} value={item.id}>
              <Space>
                <WorkspaceCover {...item} />
                <ShowName ellipsis>{item.show_name}</ShowName>
              </Space>
          </Select.Option>)}
      </Select>
	);
};

export default WsListSelect;
