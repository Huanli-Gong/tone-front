import React from 'react';
import { Form, Radio } from 'antd';
import styled from 'styled-components';
import clsx from 'classnames';
import { ReactComponent as ActiveRightPrimariy } from '@/assets/svg/select_right_primary.svg';
import { FormattedMessage } from 'umi';

const ShowTypeBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 500px;

    .show-type-wrapper-item {
        display: flex;
        padding: 16px;
        flex-direction: column;
        gap: 8px;
        position: relative;
        background-color: #ffffff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        cursor: pointer;

        .show-type-title {
            font-weight: 400;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.85);
        }

        .show-type-desc {
            font-weight: 400;
            font-size: 12px;
            color: #8c8c8c;
        }

        .active-right-icon {
            position: absolute;
            right: 4px;
            top: 4px;
        }
    }

    .active {
        background-color: #e6f7ff;
        border: 1px solid #1890ff;
        border-radius: 4px;
    }
`;

export const localesZhCN = {
    'job.type.mamage.fields.suite_show_type.label': '用例展示方式',
    'job.type.mamage.fields.suite_show_type.default': '常规模式',
    'job.type.mamage.fields.suite_show_type.default.desc': '启用后，展示两层树状结构+高级配置',
    'job.type.mamage.fields.suite_show_type.conf': '显示Test Conf树状模式',
    'job.type.mamage.fields.suite_show_type.conf.desc':
        '启用后，展示Test Suite和Test Conf树状结构。仅可配置机器，无高级配置',
    'job.type.mamage.fields.suite_show_type.case': '无Test Conf树状模式',
    'job.type.mamage.fields.suite_show_type.case.desc':
        '启用后，展示Test Suite和Test Case层级。仅可配置机器，无高级配置',
};

export const localesEnUS = {
    'job.type.mamage.fields.suite_show_type.label': '用例展示方式',
    'job.type.mamage.fields.suite_show_type.default': '常规模式',
    'job.type.mamage.fields.suite_show_type.default.desc': '启用后，展示两层树状结构+高级配置',
    'job.type.mamage.fields.suite_show_type.conf': '显示Test Conf树状模式',
    'job.type.mamage.fields.suite_show_type.conf.desc':
        '启用后，展示Test Suite和Test Conf树状结构。仅可配置机器，无高级配置',
    'job.type.mamage.fields.suite_show_type.case': '无Test Conf树状模式',
    'job.type.mamage.fields.suite_show_type.case.desc':
        '启用后，展示Test Suite和Test Case层级。仅可配置机器，无高级配置',
};

export const SuiteShowTypeItem: React.FC = () => {
    const form = Form.useFormInstance();
    const showType = Form.useWatch('suite_show_type', form);

    return (
        <>
            <Form.Item
                label={<FormattedMessage id="job.type.mamage.fields.suite_show_type.label" />}
            >
                <ShowTypeBox>
                    {['default', 'conf', 'case'].map((key: any) => {
                        return (
                            <div
                                className={clsx(
                                    'show-type-wrapper-item',
                                    showType === key && 'active',
                                )}
                                key={key}
                                onClick={() => form.setFieldsValue({ suite_show_type: key })}
                            >
                                <div className="show-type-title">
                                    <FormattedMessage
                                        id={`job.type.mamage.fields.suite_show_type.${key}`}
                                    />
                                </div>
                                <div className="show-type-desc">
                                    <FormattedMessage
                                        id={`job.type.mamage.fields.suite_show_type.${key}.desc`}
                                    />
                                </div>
                                {showType === key && (
                                    <ActiveRightPrimariy className="active-right-icon" />
                                )}
                            </div>
                        );
                    })}
                </ShowTypeBox>
            </Form.Item>
            <Form.Item noStyle hidden name="suite_show_type">
                <Radio.Group
                    options={[
                        { value: 'default', label: '' },
                        { value: 'case', label: '' },
                        { value: 'conf', label: '' },
                    ]}
                />
            </Form.Item>
        </>
    );
};
