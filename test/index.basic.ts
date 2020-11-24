// @ts-nocheck
import { ArgOption, parseAndValidate } from '../src/index'
import tap from 'tap'

tap.test('Basic usage with default configuration', async (t) => {
  // Arrange
  const command = 'cmd --pm PNPM -a 100 -t sprinkles candy -rrr -bcd --verbose'
  const expected = {
    _: ['cmd', 'candy'],
    pm: 'PNPM',
    a: '100',
    t: 'sprinkles',
    r: [true, true, true],
    b: true,
    c: true,
    d: true,
    verbose: true,
  }

  // Act
  const args = parseAndValidate(command.split(' '))

  // Assert
  t.deepEquals(expected, args)
})
tap.test('Basic usage with configuration', async (t) => {
  // Arrange
  const command = 'cmd --pm PNPM -a 100 -t sprinkles candy -rrr --verbose'
  const flagOptions: Record<string, ArgOption> = {
    pm: {
      type: 'string',
      map: (arg) => {
        return (arg as string).toLowerCase()
      },
    },

    name: {
      type: 'string',
      default: 'John',
    },

    age: {
      type: 'number',
      alias: 'a',
    },

    toppings: {
      type: 'string',
      alias: 't',
      multiple: true,
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
  const expected = {
    _: ['cmd'],
    pm: 'pnpm',
    age: 100,
    toppings: ['sprinkles', 'candy'],
    repeat: 3,
    verbose: true,
    name: 'John',
  }

  // Act
  const args = parseAndValidate(
    {
      flags: flagOptions,
      configuration: {
        'unknown-options-as-args': true,
      },
    },
    command.split(' '),
  )
  // Test curried parsing and validating.
  const args2 = parseAndValidate({ flags: flagOptions })(command.split(' '))

  // Assert
  t.deepEquals(expected, args)
  t.deepEquals(expected, args2)
})
