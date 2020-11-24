// @ts-nocheck
import { ArgOption, parseAndValidate } from '../src/index'
import tap from 'tap'

tap.test('Flag configuration error.', async (t) => {
  // Arrange
  const command = ''
  const flagOptions: Record<string, ArgOption> = {
    pm: {
      type: 'stringd',
    },
  }

  // Act
  t.throws(() => parseAndValidate({ flags: flagOptions }, command.split(' ')))
})

tap.test('Missing required flag error.', async (t) => {
  // Arrange
  const command = ''
  const flagOptions: Record<string, ArgOption> = {
    pm: {
      type: 'string',
      required: true,
    },
  }

  // Act
  t.throws(() => parseAndValidate({ flags: flagOptions }, command.split(' ')))
})

tap.test('Flag validation error.', async (t) => {
  // Arrange
  const command = '--name Jane'
  const flagOptions: Record<string, ArgOption> = {
    name: {
      type: 'string',
      required: true,
      validator: (arg) => {
        if (arg !== 'John') {
          return [false, 'Error. --name is expected to be John.']
        } else {
          return [true]
        }
      },
    },
  }

  // Act
  t.throws(() => parseAndValidate({ flags: flagOptions }, command.split(' ')))
})

tap.test('Expected RegExp flag value error.', async (t) => {
  // Arrange
  const command = '--name Jane'
  const flagOptions: Record<string, ArgOption> = {
    name: {
      type: 'string',
      required: true,
      expected: /John/,
    },
  }

  // Act
  t.throws(() => parseAndValidate({ flags: flagOptions }, command.split(' ')))
})

tap.test('Expected flag value error.', async (t) => {
  // Arrange
  const command = '--name Joe'
  const flagOptions: Record<string, ArgOption> = {
    name: {
      type: 'string',
      required: true,
      expected: ['John', 'Jane'],
    },
  }

  // Act
  t.throws(() => parseAndValidate({ flags: flagOptions }, command.split(' ')))
})
