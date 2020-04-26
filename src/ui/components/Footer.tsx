import React, { FC } from 'react';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useTranslation } from 'react-i18next';

import logo from '../static/logo.svg';

interface Props {
  onSelectFiles: () => void;
  onOpenSettings: () => void;
}

const Container = styled.div`
  height: 5rem;
  width: 100%;
  padding: 0 2rem;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Logo = styled.div`
  align-self: center;
  width: 10rem;

  img {
    width: 3.5rem;
    filter: grayscale(1);
    opacity: 0.5;
    transition: opacity 0.1s ease-in, filter 0.1s ease-in;
    cursor: pointer;

    &:hover {
      filter: grayscale(0);
      opacity: 1;
    }
  }
`;

const Middle = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
`;

const Links = styled.div`
  align-self: center;
  width: 10rem;
`;

const Link = styled.a`
  padding: 1rem;

  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.secondary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.palette.secondary.main};
  }
`;

const Footer: FC<Props> = ({ onSelectFiles, onOpenSettings }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Logo>
        <a href="https://octosign.com" target="blank">
          <img src={logo} alt={t('Logo')} />
        </a>
      </Logo>

      <Middle>
        <Button variant="contained" color="primary" onClick={onSelectFiles}>
          {t('Select files')}
        </Button>
        <Box m={1} fontSize="1rem" fontWeight="500" color="text.secondary">
          {t('or drag and drop your files anywhere')}
        </Box>
      </Middle>

      <Links>
        <Link href="https://octosign.com/help" target="blank">
          {t('Help')}
        </Link>
        <Link href="#settings" onClick={onOpenSettings}>
          {t('Settings')}
        </Link>
      </Links>
    </Container>
  );
};

export default React.memo(Footer);
