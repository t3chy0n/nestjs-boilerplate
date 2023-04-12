import { Test, TestingModule } from '@nestjs/testing';
import { getCommonPath } from '@libs/discovery/get-common-path';
import { expect } from '@utils/test-utils';

describe('Get Common Path', () => {
  it('should return the correct common folder path for two simple paths', () => {
    const path1 = '/Users/user1/Documents/project1/src';
    const path2 = '/Users/user1/Documents/project2';
    const expectedResult = '/Users/user1/Documents';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should return the correct common folder path when the paths are the same', () => {
    const path1 = '/Users/user1/Documents/project1/src';
    const path2 = '/Users/user1/Documents/project1/src';
    const expectedResult = '/Users/user1/Documents/project1/src';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should return an empty string when there is no common folder path', () => {
    const path1 = '/Users/user1/Documents/project1/src';
    const path2 = '/Users2/user2/Documents/project2';
    const expectedResult = '';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should work with mixed path separators', () => {
    const path1 = '/Users/user1/Documents/project1/src';
    const path2 = '\\Users\\user1\\Documents\\project2';
    const expectedResult = '/Users/user1/Documents';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should work with relative paths', () => {
    const path1 = './project1/src';
    const path2 = './project1/test';
    const expectedResult = './project1';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should return the correct common folder path when both paths end with a file', () => {
    const path1 = '/Users/user1/Documents/project1/src/file1.txt';
    const path2 = '/Users/user1/Documents/project1/src/file2.txt';
    const expectedResult = '/Users/user1/Documents/project1/src';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should return the correct common folder path when one path ends with a file', () => {
    const path1 = '/Users/user1/Documents/project1/src/file.txt';
    const path2 = '/Users/user1/Documents/project1/src';
    const expectedResult = '/Users/user1/Documents/project1/src';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should work with mixed path separators and paths that end with a file', () => {
    const path1 = '/Users/user1/Documents/project1/src/file1.txt';
    const path2 = '\\Users\\user1\\Documents\\project1\\src\\file2.txt';
    const expectedResult = '/Users/user1/Documents/project1/src';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  it('should work with relative paths that end with a file', () => {
    const path1 = './project1/src/file1.txt';
    const path2 = './project1/src/file2.txt';
    const expectedResult = './project1/src';

    expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
  });

  describe('On windows', () => {
    it('should return the correct common folder path for two Windows paths', () => {
      const path1 = 'C:\\Users\\user1\\Documents\\project1\\src';
      const path2 = 'C:\\Users\\user1\\Documents\\project2';
      const expectedResult = 'C:/Users/user1/Documents';

      expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
    });

    it('should work with mixed path separators for Windows paths', () => {
      const path1 = 'C:/Users/user1/Documents/project1/src';
      const path2 = 'C:\\Users\\user1\\Documents\\project2';
      const expectedResult = 'C:/Users/user1/Documents';

      expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
    });

    it('should return the correct common folder path when both Windows paths end with a file', () => {
      const path1 = 'C:\\Users\\user1\\Documents\\project1\\src\\file1.txt';
      const path2 = 'C:\\Users\\user1\\Documents\\project1\\src\\file2.txt';
      const expectedResult = 'C:/Users/user1/Documents/project1/src';

      expect(getCommonPath(path1, path2)).to.be.equal(expectedResult);
    });
  });
});
