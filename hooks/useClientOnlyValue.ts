// hooks/useClientOnlyValue.ts
import { useEffect, useState } from 'react';

/**
 * Returns the provided value on the client and null on the server.
 * This is useful for values that should only be computed on the client.
 */
export function useClientOnlyValue<T>(clientValue: T, serverValue: T): T {
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);

  return value;
}
