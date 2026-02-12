export const generateUUID = () => {
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    const random = (Math.random() * 16) | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16)
  }
  return uuid
}

export const handleProp = (prop) => {
  if (!prop) return ''
  return prop.includes('.') ? prop.split('.').pop() : prop
}

export const handleRowAccordingToProp = (row, prop) => {
  if (!prop) return row
  if (!prop.includes('.')) return row[prop]
  const propArr = prop.split('.')
  let value = row
  for (const key of propArr) {
    if (value === null || value === undefined) return undefined
    value = value[key]
  }
  return value
}

export const filterEnum = (value, enumData, fieldNames, returnType = 'label') => {
  if (!enumData || !Array.isArray(enumData)) return ''
  const label = fieldNames?.label ?? 'label'
  const valueKey = fieldNames?.value ?? 'value'
  const children = fieldNames?.children ?? 'children'

  const findItem = (data) => {
    for (const item of data) {
      if (item[valueKey] === value) {
        return item
      }
      if (item[children] && item[children].length) {
        const found = findItem(item[children])
        if (found) return found
      }
    }
    return null
  }

  const item = findItem(enumData)
  if (!item) return ''
  return returnType === 'tag' ? (item.tag ?? item[label]) : item[label]
}

export const formatValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? '是' : '否'
  return value
}
