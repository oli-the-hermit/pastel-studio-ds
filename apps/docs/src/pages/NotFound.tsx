import React from 'react';
import { Link } from 'react-router';
import { Page } from '../blocks/Page';

export function NotFound() {
  return (
    <Page title="This page isn't here" lead={<>It may have moved. The <Link to="/">overview</Link> lists everything in the docs.</>}>
      {null}
    </Page>
  );
}
