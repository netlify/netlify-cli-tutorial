import expect from 'expect';
import { addHistory } from '../../src/actions/base';
import { history } from '../../src/reducers/history';

describe('history', () => {
  it('should handle an empty state', () => {
    expect(history(undefined, {})).toEqual([]);
  });

  it('should add a history event', () => {
    expect(history([], addHistory('hello'))).toEqual(['hello']);
  });

  it('should add multiple history events', () => {
    expect(history([], addHistory('hello', 'world'))).toEqual(['hello', 'world']);
  });
});
