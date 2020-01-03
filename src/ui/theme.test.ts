import theme from './theme';
import { createMuiTheme } from '@material-ui/core';

describe('Theme', () => {
  it('Creates Mui theme', () => {
    expect(Object.keys(theme)).toMatchObject(Object.keys(createMuiTheme()));
  });

  it('Defines spacing as function', () => {
    expect(theme.spacing(1)).toBe('0.5rem');
    expect(theme.spacing(16)).toBe('8rem');
  });
});
