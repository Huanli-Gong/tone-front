import React from "react"

import { Select, Space, Typography, Input } from "antd"
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons"

import { useSize } from "ahooks"

const FilterItem: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { onChange, columns = [], defaultValue = [], title } = props
    const [filter, setFilter] = React.useState(defaultValue)

    React.useImperativeHandle(ref, () => (
        {
            reset(vals: any) {
                setFilter(vals)
            }
        }
    ))

    const wrapperRef = React.useRef(null) as any

    const hasFields = React.useMemo(() => {
        return filter.map((field: any) => field.name);
    }, [filter])

    const leftSelectOption = React.useMemo(() => {
        return columns.map(
            ({ label, name }: any) => (
                {
                    label,
                    value: name,
                    disabled: hasFields.includes(name)
                }
            )
        )
    }, [hasFields])

    const handleFieldChange = (evt: any, index: number) => {
        const val = Object.prototype.toString.call(evt) === "[object Object]" && evt.target ? evt.target.value : evt
        handleValueChange(filter.map((row: any, idx: number) => {
            if (index === idx)
                return {
                    ...row,
                    value: val
                }
            return row
        }))
    }

    const hanldeOptionChange = (evt: any, index: number) => {
        handleValueChange(
            filter.map((row: any, idx: number) => {
                if (index === idx)
                    return {
                        name: evt, value: undefined
                    }
                return row
            })
        )
    }

    const handleRemove = (index: number) => {
        handleValueChange(filter.filter((i: any, idx: number) => index !== idx))
    }

    const handleValueChange = (values: any) => {
        setFilter(values)
        onChange &&
            onChange(
                values.reduce((p: any, c: any) => {
                    const [field, val]: any = Object.values(c)
                    p[field] = val
                    return p
                }, {})
            )
    }

    const handleAddField = () => {
        const hasFields = leftSelectOption.filter(({ disabled }: any) => !disabled)
        const field = hasFields[0]
        const { value }: any = field
        setFilter((p: any) => p.concat({ name: value, value: undefined }))
    }

    const renderRightElement = (col: any, index: number) => {
        const idx = columns.findIndex((c: any) => c.name === col.name)
        const { render, ...rest } = columns[idx]

        const rowProps: any = {
            ...rest,
            value: col.value,
            allowClear: true,
            style: { width: "100%" },
            onChange: (evt: any) => handleFieldChange(evt, index)
        }

        if (!render)
            return <Input {...rowProps} autoComplete="off" spellCheck={false} />
        return React.cloneElement(render, rowProps)
    }

    const wrapperSize = useSize(wrapperRef)

    const wrapperWdith = wrapperSize?.width ? wrapperSize.width : 0
    const selectWidth = wrapperWdith - 120 - 70 - 80

    return (
        <div ref={wrapperRef}>
            <Typography.Text style={{ marginRight: 8, width: 70 }}>
                {title}
            </Typography.Text>
            <Space direction="vertical">
                {
                    filter.map((col: any, index: number) => {
                        const { name } = col
                        return (
                            <Space align="start" key={name}>
                                <Select
                                    style={{ width: 120 }}
                                    value={name}
                                    options={leftSelectOption}
                                    onChange={evt => hanldeOptionChange(evt, index)}
                                />
                                <div style={{ width: selectWidth }}>
                                    {
                                        renderRightElement(col, index)
                                    }
                                </div>
                                <Space align="center" style={{ paddingTop: 5 }}>
                                    {
                                        (index === filter.length - 1 && filter.length !== columns.length) &&
                                        < span onClick={handleAddField}>
                                            <Typography.Link>
                                                <PlusCircleOutlined />
                                            </Typography.Link>
                                        </span>
                                    }
                                    {
                                        filter.length > 1 &&
                                        <MinusCircleOutlined
                                            style={{ color: "#E02020", cursor: "pointer" }}
                                            onClick={() => handleRemove(index)}
                                        />
                                    }
                                </Space>
                            </Space>
                        )
                    })
                }
            </Space>
        </div >
    )
}

export default React.forwardRef(FilterItem)