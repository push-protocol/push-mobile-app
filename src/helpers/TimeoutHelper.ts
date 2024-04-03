export const TimeoutHelper = {
  timeoutAsync<T>({
    asyncFunction,
    onError,
    timeout = 90000,
  }: {
    asyncFunction: Promise<T>;
    timeout?: number;
    onError: () => void;
  }): () => Promise<T | undefined> {
    return async () => {
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => {
          onError();
          reject();
        }, timeout),
      );
      try {
        const result = await Promise.race([asyncFunction, timeoutPromise]);
        return result;
      } catch (error) {}
    };
  },
};
