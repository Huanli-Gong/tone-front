import React, { forwardRef, useState, useEffect } from 'react'
import { message, Select, Pagination, Divider } from 'antd'
import { FormattedMessage } from 'umi';
import { debounce } from 'lodash';

/**
 * @description 分页Select组件
 * @param {Object} props
 * @param {any} parentId 依赖的父级id; 没有的话传null。
 * @param {func} fetchListData 请求函数。
 * @param {Object} SelectItem 下拉框选项的{ key, name}字段名。
 */
const PaginSelect = forwardRef((props, ref, ) => {
  const { 
    parentId, 
    fetchListData = ()=> {}, 
    SelectItem: { key, name}, 
    refresh = false,
    placeholder = <FormattedMessage id="upload.list.Drawer.select.placeholder" />
  } = props;
  // console.log('parentId:', parentId);

  // 分页参数、数据源
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] =  useState({
    total: 0,
    page_num: 1,
    page_size: 20,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectValue, setSelectValue] = useState(undefined);
  const [loading, setLoading] = useState(false);

  // 1.请求数据
  const fetchList = async(query) => {
    const tempValue = { parentId, searchKeyword, ...pagination, ...query };
    try {
      setLoading(true)
      const { code, msg, data, total, page_num, page_size } = await fetchListData(tempValue);
      if (code === 200) {
        setDataSource(data);

        if (page_num && page_size) {
          setPagination({
            total: total || 0,
            page_num,
            page_size,
          });
        }
      }
      else {
        message.error(msg || '请求数据失败');
      }
      setLoading(false);
    } catch(e) {
      setLoading(false);
      console.log(e);
    }
  }
  
  useEffect(()=> {
    if (parentId || parentId === 0) {
      // case1.有依赖项的数据源查询
      fetchList({ parentId });
      setSearchKeyword('');
      setSelectValue(undefined);
      props.onChange();
    }
  }, [parentId])

  useEffect(()=> {
    if (parentId === null && refresh ) {
      // case2.无依赖项的数据源查询
      fetchList();
    }
  }, [refresh])

  // 搜索
  const handleSearch = (value) => {
    if (parentId || parentId === 0 || parentId === null) {
      
      if (value) {
        setSearchKeyword(value);
        fetchList({ searchKeyword: value, page: 1, pageSize: 10 });
      } else {
        setSearchKeyword('');
        fetchList({ searchKeyword: '', page: 1, pageSize: 10 });
        // 查而未选： 数据源发生改变，表单中select选项要清除。
        setSelectValue(undefined);
        props.onChange();
      }
    }
  }

  // 分页请求
  const onChange = (page, pageSize) => {
    fetchList({ page, pageSize });
    setSelectValue(undefined);
    props.onChange();
  };

  // 选中某一项回调
  const handleSelect = (value) => {
    setSelectValue(value);
    props.onChange(value);
  }
  
  return (
    <div ref={ref}>
      <Select
        disabled={parentId === null ? false : !(parentId || parentId === 0)}
        showSearch
        loading={loading}
        value={selectValue}
        placeholder={placeholder}
        filterOption={false}
        dropdownRender={menu => (
          <div>
            {menu}
            {pagination.total > 10 && (
              <>
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: '8px 0 8px 8px' }}>
                  <Pagination size="small" showLessItems hideOnSinglePage
                    total={pagination.total}
                    showTotal={(total) => `Total ${total}`}
                    showSizeChanger={false}
                    onChange={onChange} />
                </div>
              </>
            )}
          </div>
        )}
        onSelect={handleSelect}
        onSearch={debounce(handleSearch, 500)}
      >
        {dataSource.map((item, index) => (
          <Select.Option key={item[key] || index}>{item[name]}</Select.Option>
        ))}
      </Select>
    </div>
  );
});

export default PaginSelect;
