const rules = {
  required: (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  },

  mobile: (value) => {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(value)
  },

  email: (value) => {
    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    return reg.test(value)
  },

  password: (value, minLength = 6) => {
    return value.length >= minLength
  },

  idCard: (value) => {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(value)
  },

  url: (value) => {
    const reg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    return reg.test(value)
  },

  number: (value) => {
    return !isNaN(value) && isFinite(value)
  },

  integer: (value) => {
    const reg = /^-?\d+$/
    return reg.test(value)
  },

  positiveInteger: (value) => {
    const reg = /^\d+$/
    return reg.test(value)
  },

  length: (value, min, max) => {
    const len = typeof value === 'string' ? value.length : value.length
    if (max === undefined) {
      return len >= min
    }
    return len >= min && len <= max
  },
}

function validateValue(value, rule, ...args) {
  if (typeof rule === 'function') {
    return rule(value, ...args)
  }
  if (rules[rule]) {
    return rules[rule](value, ...args)
  }
  return true
}

function validateForm(form, rulesConfig) {
  const errors = {}
  let isValid = true

  for (const field in rulesConfig) {
    if (rulesConfig.hasOwnProperty(field)) {
      const fieldRules = rulesConfig[field]
      const value = form[field]

      for (const ruleConfig of fieldRules) {
        let ruleName
        let message
        let args = []

        if (typeof ruleConfig === 'string') {
          ruleName = ruleConfig
          message = `${field}验证失败`
        } else {
          ruleName = ruleConfig.rule
          message = ruleConfig.message
          args = ruleConfig.args || []
        }

        let passed = true

        if (typeof ruleName === 'function') {
          passed = ruleName(value, ...args)
        } else if (rules[ruleName]) {
          passed = rules[ruleName](value, ...args)
        }

        if (!passed) {
          errors[field] = message
          isValid = false
          break
        }
      }
    }
  }

  return {
    isValid,
    errors,
  }
}

function addRule(name, rule) {
  rules[name] = rule
}

function getRule(name) {
  return rules[name]
}

export default {
  validateValue,
  validateForm,
  addRule,
  getRule,
  rules,
}
