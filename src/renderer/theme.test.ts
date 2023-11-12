import theme from './theme';
import { createTheme } from '@material-ui/core/styles';

describe('Theme', () => {
  it('Creates Mui theme', () => {
    expect(Object.keys(theme)).toMatchObject(Object.keys(createTheme()));
  });
});
