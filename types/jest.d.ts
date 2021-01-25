declare namespace jest {
  interface Matchers<R> {
    toHaveRenderedOutput(value: string): CustomMatcherResult;
  }
}
