import parse from 'yargs-parser'

export interface ArgOption {
  type: 'string' | 'number' | 'boolean'
  multiple?: boolean
  alias?: string | string[]
  required?: boolean
  default?: unknown
  count?: boolean
  map?: (arg: string | number | string[] | number[]) => unknown
  expected?: string[] | RegExp
  validator?: (arg: any) => [boolean, string?]
}

export interface ArgvilleOptions {
  configuration?: Partial<parse.Configuration>
  flags?: Record<string, ArgOption>
}

export type ArgvilleParsedArguments = parse.Arguments

export class ArgvilleFlagConfigurationError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export class ArgvilleFlagError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

function buildFlagOptions(
  argvilleFlags: Record<string, ArgOption>,
): parse.Options {
  const options: parse.Options = {
    alias: {},
    boolean: [],
    number: [],
    string: [],
    array: [],
    count: [],
    default: {},
    coerce: {},
  }

  const validOptionTypes = ['string', 'number', 'boolean']

  for (const [
    flag,
    { type, multiple, alias, default: def, count, map },
  ] of Object.entries(argvilleFlags)) {
    if (type && !validOptionTypes.includes(type)) {
      throw new ArgvilleFlagConfigurationError(
        `Invalid type configured for ${flag}. Expecting ${validOptionTypes.join(
          '|',
        )}.`,
      )
    }

    if (type) options[type]!.push(flag)
    if (multiple) (options.array as string[]).push(flag)
    if (count) options.count!.push(flag)
    if (alias) options.alias![flag] = alias
    if (def !== undefined) options.default![flag] = def
    if (map) options.coerce![flag] = map
  }

  return options
}

function validateArgs(
  flagOptions: Record<string, ArgOption>,
  args: ArgvilleParsedArguments,
) {
  for (const [flag, { required, expected, validator }] of Object.entries(
    flagOptions,
  )) {
    if (required && args[flag] === undefined) {
      throw new ArgvilleFlagError(`${flag} flag is required.`)
    }

    const value = args[flag]

    if (value !== undefined) {
      if (validator) {
        const [isValid, message] = validator(value)
        if (!isValid) {
          throw new ArgvilleFlagError(message)
        }
      }

      const valueArray = [].concat(value)

      if (
        expected &&
        expected instanceof RegExp &&
        valueArray.some((v) => !expected.test(v))
      ) {
        throw new ArgvilleFlagError(
          `Invalid value for ${flag} flag. Values are expecting to match ${expected}`,
        )
      }

      if (
        expected &&
        Array.isArray(expected) &&
        valueArray.some((v) => !expected.includes(v))
      ) {
        throw new ArgvilleFlagError(
          `Invalid value for ${flag} flag. Expecting one of ${expected.join(
            '|',
          )}`,
        )
      }
    }
  }
}

export function parseAndValidate(): (argv: string[]) => ArgvilleParsedArguments
export function parseAndValidate(argv: string[]): ArgvilleParsedArguments
export function parseAndValidate(
  options: ArgvilleOptions,
): (argv: string[]) => ArgvilleParsedArguments
export function parseAndValidate(
  options: ArgvilleOptions,
  argv: string[],
): ArgvilleParsedArguments
export function parseAndValidate(
  options?: ArgvilleOptions | string[],
  argv?: string[],
) {
  const flagOptions =
    options && !Array.isArray(options) && options.flags
      ? buildFlagOptions(options.flags)
      : {}

  const configuration = {
    'parse-numbers': false,
    'strip-aliased': true,
    'strip-dashed': true,
    ...(options && !Array.isArray(options) && options.configuration
      ? options.configuration
      : {}),
  }

  function _parse(argv: string[]): ArgvilleParsedArguments {
    const results = parse(argv, {
      ...flagOptions,
      configuration,
    })

    if (options && !Array.isArray(options) && options.flags) {
      validateArgs(options.flags, results)
    }

    return results
  }

  if (argv) {
    return _parse(argv)
  } else if (Array.isArray(options)) {
    return _parse(options)
  } else {
    return _parse
  }
}
