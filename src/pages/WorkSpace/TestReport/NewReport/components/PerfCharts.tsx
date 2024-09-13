/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { Row, Space, Typography, Tooltip } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styled from 'styled-components';
import { ReactComponent as GaryBaseIcon } from '@/assets/svg/Report/GaryBaseIcon.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { queryCompareResultList } from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/services';
import RenderConfChart from './RenderConfChart';
import RenderMetricChart from './RenderMetricChart';
import { cloneDeep } from 'lodash';
const FullRow = styled(Row)`
  width: 100%;
`;
const Wrapper = styled(FullRow)`
  margin-top: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;
const ModalHeader = styled(FullRow)`
  background: rgba(0, 0, 0, 0.02);
  min-height: 40px;
  align-items: center;
  padding: 0 20px;
  // overflow-x: scroll;
  // white-space: nowrap;
  word-break: break-all;
`;
interface DotProp {
  color: string;
}

const Dot = styled.div<DotProp>`
  width: 8px;
  height: 8px;
  display: inline-block;
  background: ${({ color }) => color};
`;
const ModalBody = styled(FullRow)`
  padding: 20px 16px;
  background: #fff;
`;
const ModalSlider = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  width: 340px;
  min-height: 367px;
`;
const SliderTitle = styled(Typography.Text)`
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
`;
interface ConfNameProp {
  is_active?: number;
}

const ConfName = styled(Typography.Text) <ConfNameProp>`
  cursor: pointer;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  ${({ is_active }) => is_active && 'color:#1890FF;'}
`;
const ModalContent = styled.div`
  width: calc(100% - 340px);
  .ant-typography {
    margin-bottom: 0;
  }
`;
interface JumpChartProp {
  conf_name: string;
  test_conf_id?: number;
}

const ChartModal = (props: any) => {
  const { formatMessage } = useIntl();
  const { chartType, suite_id, conf_list, suite_name, envData, group_jobs, base_index } = props;
  const [legend, setLegend] = useState<string>('');
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState<any>(null);
  const [color, setColor] = useState<any>([]);
  const queryChart = async (newObj: any) => {
    setLoading(true);
    const res = await queryCompareResultList(newObj);
    if (res.code === 200) {
      setLoading(false);
      setChartMetric(res.data);
    }
  };
  useEffect(() => {
    const obj: any = {
      suite_id,
      suite_name,
      is_all: 0,
      async_request: 1,
      base_index,
      show_type: 2,
    };
    
    // "group_jobs": [{ "job_list": [362695, 362547], "is_baseline": 0, "ws_id": "fgq5x4by" }]
    if (group_jobs) {
      obj.group_jobs = group_jobs
    } else {
      let job_list = []
      const base_job_length = envData.base_group.base_objs.length
      for (let i = 0; i < base_job_length; i++) {
        job_list.push(envData.base_group.base_objs[i].obj_id)
      }
      if (envData.compare_groups && envData.compare_groups.length == 0) {
        obj.group_jobs = [{ job_list, is_baseline: envData.base_group.is_baseline }]
      } else {
        let baseObj = [{ job_list, is_baseline: envData.base_group.is_baseline }]
        let compareObj = []
        let compare_groups_list = envData.compare_groups
        for (let j = 0; j < compare_groups_list.length; j++) {
          compareObj.push({
            job_list: [].concat(compare_groups_list[j].base_objs.map((item: any) => {
              return item.obj_id
            })),
            is_baseline: compare_groups_list[j].is_baseline
          })
        }
        obj.group_jobs = baseObj.concat(compareObj)
      }
    }
    let conf_info: any = [];
    conf_list?.forEach((conf: any, index: number) => {
      conf_info.push({
        conf_id: conf.conf_id,
        conf_name: conf.conf_name,
      });
    });
    obj.conf_info = conf_info;
    if (chartType === '2') {
      queryChart(obj);
    }
  }, [chartType]);

  const handleJumpChart = ({ conf_name }: JumpChartProp, idx: number) => {
    const id = `${conf_name}-${idx}`;
    setCurrent(id);
    document.getElementById(id)?.scrollIntoView();
  };
  const handleToggle = (name: any) => {
    setLegend(name);
    setTimeout(() => {
      setLegend('');
    }, 100);
  };
  const handleChartColor = (arr: any) => {
    setColor(arr);
  };
  const legData = useMemo(() => {
    let le: any = [];
    let newData: any = cloneDeep(envData);
    newData.compare_groups.splice(base_index, 0, envData.base_group);
    for (let compare = newData.compare_groups, k = 0; k < compare.length; k++) {
      le.push({
        name: `${compare[k].tag}`,
        inner: (
          <Space align="start" style={{ cursor: 'pointer' }}>
            <Dot color={color[k]} />
            {base_index === k && (
              <Tooltip title={formatMessage({ id: 'report.benchmark.group' })}>
                <GaryBaseIcon style={{ transform: 'translateY(3px)', marginLeft: 8 }} />
              </Tooltip>
            )}
            <Typography.Text strong>{compare[k].tag}</Typography.Text>
          </Space>
        ),
      });
    }
    return le;
  }, [envData, color]);

  return (
    <Wrapper>
      <ModalHeader>
        <Space align="start">
          <Space style={{ whiteSpace: 'nowrap', marginRight: 16 }}>
            <Typography.Text strong>
              <FormattedMessage id="report.legend.comparison.group" />
            </Typography.Text>
          </Space>
          {legData.map((i: any, idx: number) => (
            <Space size={28} style={{ marginRight: 16 }} key={i.name}>
              <span onClick={() => handleToggle(i.name)}>{i.inner}</span>
            </Space>
          ))}
        </Space>
      </ModalHeader>
      {chartType === '2' ? (
        <ModalBody>
          <ModalSlider>
            <Space direction="vertical">
              <SliderTitle>
                {formatMessage({ id: 'report.conf.list' }, { data: `(${conf_list.length})` })}
              </SliderTitle>
              {conf_list.map((conf: any, idx: number) => (
                <span key={conf?.conf_id}>
                  <ConfName>
                    <EllipsisPulic width={330} title={conf.conf_name} />
                  </ConfName>
                </span>
              ))}
            </Space>
          </ModalSlider>
          <ModalContent>
            <RenderMetricChart
              current={current}
              handleChartColor={handleChartColor}
              legend={legend}
              envData={envData}
              loading={loading}
              chartMetric={chartMetric}
              chartType={chartType}
            />
          </ModalContent>
        </ModalBody>
      ) : (
        <ModalBody>
          <ModalSlider>
            <Space direction="vertical">
              <SliderTitle>
                {formatMessage({ id: 'report.conf.list' }, { data: `(${conf_list.length})` })}
              </SliderTitle>
              {conf_list.map((conf: any, idx: any) => (
                <span onClick={() => handleJumpChart(conf, idx)} key={conf?.conf_id}>
                  <ConfName is_active={current === `${conf.conf_name}-${idx}` ? 1 : 0}>
                    <EllipsisPulic width={330} title={conf.conf_name} />
                  </ConfName>
                </span>
              ))}
            </Space>
          </ModalSlider>
          <ModalContent>
            <RenderConfChart
              current={current}
              handleChartColor={handleChartColor}
              legend={legend}
              envData={envData}
              loading={loading}
              chartConf={conf_list}
              chartType={chartType}
            />
          </ModalContent>
        </ModalBody>
      )}
    </Wrapper>
  );
};

export default React.memo(ChartModal);
