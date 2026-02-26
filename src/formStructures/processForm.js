export const processFormStructure = {
  fields: [
    {
      fieldKey: 'processCode',
      label: '工序编码',
      type: 'string',
    },
    {
      fieldKey: 'processName',
      label: '工序名称',
      type: 'string',
    },
    {
      fieldKey: 'processType',
      label: '工序类型',
      type: 'string',
    },
    {
      fieldKey: 'description',
      label: '工序说明',
      type: 'text',
    },
    {
      fieldKey: 'standardTime',
      label: '标准工时(分钟)',
      type: 'number',
    },
    {
      fieldKey: 'preparationTime',
      label: '准备时间(分钟)',
      type: 'number',
    },
    {
      fieldKey: 'isKeyProcess',
      label: '是否关键工序',
      type: 'boolean',
    },
    {
      fieldKey: 'qualityRequired',
      label: '是否需要质检',
      type: 'boolean',
    },
  ],
}
