import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import DialogContent from '@material-ui/core/DialogContent';
import { TransitionProps } from '@material-ui/core/transitions';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

import BackendState from '../../shared/BackendState';
import parseAuthor from '../../shared/parseAuthor';
import debounce from '../../shared/debounce';
import { OptionValues } from '../../preload/Settings';

interface Props {
  open: boolean;
  backends: BackendState[];
  onClose: () => void;
}

const AlmostFullScreenDialog = styled(Dialog)`
  &[style] {
    /* Important neccessary because of the inline styles */
    top: ${p => p.theme.spacing(4)}px !important;

    .MuiDialog-paper {
      border-top-left-radius: ${p => p.theme.shape.borderRadius}px;
      border-top-right-radius: ${p => p.theme.shape.borderRadius}px;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: ${p => p.theme.spacing(3)}px;
`;

const Title = styled(Typography)`
  font-size: 2.25rem;
`;

const BackendHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: ${p => p.theme.spacing(1)}px;
`;

const Transition = React.forwardRef<
  unknown,
  TransitionProps & { children?: React.ReactElement<unknown> }
>(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SettingsDialog: FC<Props> = ({ open, backends, onClose }) => {
  const [version, setVersion] = useState<string>();
  const [values, setValues] = useState<{ values: OptionValues; touched: boolean }>();
  useEffect(() => {
    if (version !== window.getVersion()) setVersion(window.getVersion());
    if (backends.length > 0 && (!values || values.touched === false))
      setValues({ values: window.OctoSign.getOptionValues(), touched: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, backends]);
  const debouncedPersist = useRef(
    debounce((values: OptionValues) => window.OctoSign.setOptionValues(values), 1000),
  );
  useEffect(() => {
    if (!values || !values.touched) return;
    debouncedPersist.current(values.values);
  }, [values]);
  const setValue = useCallback(
    (slug, id, value) => {
      setValues({
        values: { ...values?.values, [slug]: { ...values?.values[slug], [id]: value } },
        touched: true,
      });
    },
    [values],
  );

  return (
    <AlmostFullScreenDialog
      fullScreen
      keepMounted
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      data-cy="settings"
    >
      <Header>
        <Title variant="h2">Settings</Title>

        <Button
          autoFocus
          color="inherit"
          href="#"
          onClick={onClose}
          tabIndex={0}
          aria-label="close"
        >
          Close
        </Button>
      </Header>

      <DialogContent>
        <Typography variant="overline" display="block" gutterBottom>
          General
        </Typography>

        <Grid container spacing={1}>
          <Grid item sm={4} md={3}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel id="settings-language-label">Language</InputLabel>
              <Select
                labelId="settings-language-label"
                id="settings-language"
                value={'auto'}
                onChange={() => 0}
                label="Language"
              >
                <MenuItem value="auto">
                  <em>Automatic</em>
                </MenuItem>
                {/* TODO: Generate from list of available languages with i18n */}
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {backends.map(({ slug, config, options }) => {
          const author = config.author ? parseAuthor(config.author) : undefined;
          const authorName = author?.name ? `by ${author.name}` : '';
          const hasAuthorExtra = author && (author.email || author.web);
          const authorExtra =
            hasAuthorExtra && ` (${[author?.email, author?.web].filter(i => i).join(', ')})`;
          const byAuthor = author && ` ${authorName}${authorExtra}`;
          const licensedUnder = config.license && ` Licensed under ${config.license}.`;
          const codeAtRepository = config.repository && (
            <>
              {' '}
              Source code available at{' '}
              <Link href={config.repository} target="blank" color="secondary">
                repository
              </Link>
              .
            </>
          );

          return (
            <Box key={slug} my={3}>
              <BackendHeader>
                <Typography variant="overline">{config.name}</Typography>

                <Typography variant="body2">
                  v{config.version}
                  {byAuthor}
                </Typography>
              </BackendHeader>

              <Typography variant="body2" paragraph>
                {config.description}
                {licensedUnder}
                {codeAtRepository}
              </Typography>

              {options && (
                <Grid container spacing={1}>
                  {options.map(({ id, ...option }) => (
                    <Grid key={id} item sm={4} md={3}>
                      <FormControl fullWidth>
                        <TextField
                          id={`settings-${slug}-${id}`}
                          value={values?.values?.[slug]?.[id] || ''}
                          onChange={e => setValue(slug, id, e.target.value)}
                          label={option.label}
                          variant="outlined"
                          size="small"
                        />
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          );
        })}
      </DialogContent>

      <Typography variant="body2" align="center" gutterBottom>
        Octosign v{version}
      </Typography>
    </AlmostFullScreenDialog>
  );
};

export default React.memo(SettingsDialog);
