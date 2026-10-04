import React from 'react';
import { Route, Routes } from 'react-router';
import { Shell } from './layout/Shell';
import { NotFound } from './pages/NotFound';
import { PAGES } from './registry';

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        {PAGES.map(({ path, component: Page }) => <Route key={path} path={path} element={<Page />} />)}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
