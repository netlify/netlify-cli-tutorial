import expect from 'expect';
import { initFilesystem } from '../../src/actions/base';
import { files } from '../../src/reducers/files';

describe('files', () => {
  it('should handle an empty state', () => {
    expect(
      files(undefined, {})
    ).toEqual(
      {}
    );
  });

  it('should set file system', () => {
    expect(
      files(undefined, initFilesystem({'folder': {'README': 'hello'}}))
    ).toEqual(
      {'folder': {'README': 'hello'}}
    );
  });
});
