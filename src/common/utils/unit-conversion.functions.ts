import convert from 'convert-units'

export function millisecondsAsString(ms: number) {
  if (typeof ms !== 'number') {
    throw new Error(`${ms} is not a number...cannot convert to bytes string`)
  }

  const conv = convert(ms).from('ms').toBest()
  return `${Math.round(conv.val)} ${conv.unit}`
}

export function secondsAsString(seconds: number) {
  if (typeof seconds !== 'number') {
    throw new Error(`${seconds} is not a number...cannot convert to bytes string`)
  }

  const conv = convert(seconds).from('s').toBest()
  return `${Math.round(conv.val)} ${conv.unit}`
}

export function bytesAsString(numBytes: number) {
  if (typeof numBytes !== 'number') {
    throw new Error(`${numBytes} is not a number...cannot convert to bytes string`)
  }

  const conv = convert(numBytes).from('B').toBest()
  return `${Math.round(conv.val)} ${conv.unit}`
}
