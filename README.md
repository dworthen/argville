[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=for-the-badge)](http://www.typescriptlang.org/) [![NPM](https://img.shields.io/npm/v/argville?style=for-the-badge)](https://www.npmjs.com/package/argville) [![Build Status](https://img.shields.io/github/workflow/status/dworthen/argville/CI?style=for-the-badge)](https://github.com/dworthen/argville/actions?query=workflow%3ACI) [![Test Coverage](https://img.shields.io/coveralls/github/dworthen/argville?style=for-the-badge)](https://coveralls.io/github/dworthen/argville)

# Argville

Another CLI arg parser.

```JavaScript
// index.js
const { parseAndValidate } = require('argville')

const flags = {
  pm: {
    type: 'string',
    required: true,
    map: (arg) => {
      return (arg as string).toLowerCase()
    },
  },

  name: {
    type: 'string',
    default: 'John',
    expected: /^John$/
  },

  age: {
    type: 'number',
    alias: 'a',
    validator: (age) => {
      if(age < 0) {
        return [false, "Error. Age must be > 0"]
      } else {
        return [true]
      }
    }
  },

  toppings: {
    type: 'string',
    alias: 't',
    multiple: true,
    expected: ["sprinkles", "candy"]
  },

  repeat: {
    alias: 'r',
    count: true,
  },

  verbose: {
    type: 'boolean',
    default: false,
  },
}

const args = parseAndValidate({ flags }, process.argv.slice(2))
```

```shell
node index.js cmd --pm PNPM -a 100 -t sprinkles candy -rrr --verbose
# args:
# {
#   _: ['cmd'],
#   pm: 'pnpm',
#   age: 100,
#   toppings: ['sprinkles', 'candy'],
#   repeat: 3,
#   verbose: true,
#   name: 'John',
# }
```
