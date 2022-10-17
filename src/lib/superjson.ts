import superjson from 'superjson';

// bigint as normal string
superjson.registerCustom<string, string>(
  {
    //@ts-ignore
    isApplicable: (v): v is BigInt => typeof v === 'bigint',
    serialize: (v) => v,
    deserialize: (v) => v.toString()
  },
  'bigint'
);
