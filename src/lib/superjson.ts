import superjson from 'superjson';

// bigint to normal string
superjson.registerCustom<string, string>(
  {
    //@ts-ignore
    isApplicable: (v): v is BigInt => typeof v === 'bigint',
    serialize: (v) => v.toString(),
    deserialize: (v) => v.toString()
  },
  'bigint'
);

// Buffer to array
superjson.registerCustom<Buffer, number[]>(
  {
    isApplicable: (v): v is Buffer => v instanceof Buffer,
    serialize: (v) => [...v],
    deserialize: (v) => Buffer.from(v)
  },
  'buffer'
);
