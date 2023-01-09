import { resolvePathRelativeToBaseUrl } from './resolvePathRelativeToBaseUrl';

describe('resolvePath', () => {
  let absoluteBaseUrl: string;
  let tsConfigPaths: Record<string, Array<string>>;
  let currentFilePath: string;

  beforeEach(() => {
    absoluteBaseUrl = '/Users/mycomputer/heap';
    tsConfigPaths = {
      '@app/*': ['front/src/app/*'],
      '@common/*': ['common/*'],
    };
    currentFilePath = '/Users/mycomputer/heap/front/src/app/views/my_view.ts';
  });

  it('should resolve path aliases', () => {
    const importPath = '@common/web_platform/some_file';
    const result = resolvePathRelativeToBaseUrl(
      absoluteBaseUrl,
      tsConfigPaths,
      currentFilePath,
      importPath,
    );
    expect(result).toBe('common/web_platform/some_file');
  });

  it('should handle imports that are not defined as path aliases', () => {
    const importPath = '@storybook/addon-actions';
    const result = resolvePathRelativeToBaseUrl(
      absoluteBaseUrl,
      tsConfigPaths,
      currentFilePath,
      importPath,
    );
    expect(result).toBe('@storybook/addon-actions');
  });

  it('should resolve relative imports that traverse parent folders', () => {
    const importPath = '../../design_system/layouts/MyLayout';
    const result = resolvePathRelativeToBaseUrl(
      absoluteBaseUrl,
      tsConfigPaths,
      currentFilePath,
      importPath,
    );
    expect(result).toBe('front/src/design_system/layouts/MyLayout');
  });

  it('should resolve relative imports that import from sibling files', () => {
    const importPath = './my_helper';
    const result = resolvePathRelativeToBaseUrl(
      absoluteBaseUrl,
      tsConfigPaths,
      currentFilePath,
      importPath,
    );
    expect(result).toBe('front/src/app/views/my_helper');
  });

  it('should handle imports that are already relative to base url', () => {
    const importPath = 'front/src/app/views/my_helper';
    const result = resolvePathRelativeToBaseUrl(
      absoluteBaseUrl,
      tsConfigPaths,
      currentFilePath,
      importPath,
    );
    expect(result).toBe('front/src/app/views/my_helper');
  });
});
