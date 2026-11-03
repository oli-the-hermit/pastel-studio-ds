// The editor: the top bar (the window's title bar on the desktop), the layers and library on the left,
// the canvas, and the inspector on the right.
import { IconBack, IconButton, IconChevronLeft, IconExpand, IconForward, IconMinus, IconPlus, Tabs, TopBar } from '@pastel-studio/react';
import { DesktopWindowControls, DRAG_REGION, isDesktop, useFullscreenKeys } from '@pastel-studio/desktop';
import { Canvas } from './canvas/Canvas';
import { forgetAssets } from './canvas/assets';
import { zoomBy, zoomTo, zoomToFit } from './canvas/geometry';
import { closeProject, currentPage, redo, undo, useEditor } from './model/store';
import { Inspector } from './panels/Inspector';
import { Layers } from './panels/Layers';
import { Library } from './panels/Library';
import { usePref } from './panels/prefs';
import { Projects } from './Projects';
import { useShortcuts } from './shortcuts';

const desktop = isDesktop();
const drag = desktop ? DRAG_REGION : undefined;

const SAVE_TEXT = { saved: 'Saved', unsaved: 'Unsaved changes', saving: 'Saving…', error: 'Not saved' } as const;

function SaveState() {
  const save = useEditor((s) => s.save);
  const error = useEditor((s) => s.saveError);
  return <span className="cv-save" data-state={save} title={error}>{SAVE_TEXT[save]}</span>;
}

function Zoom() {
  const zoom = useEditor((s) => s.view.zoom);
  return (
    <div className="cv-zoom" role="group" aria-label="Zoom">
      <IconButton size="sm" label="Zoom out (Ctrl+−)" onClick={() => zoomBy(0.8)}><IconMinus size={16} /></IconButton>
      <button type="button" className="cv-zoom-value" title="Zoom to 100% (Ctrl+0)" onClick={() => zoomTo(1)}>{Math.round(zoom * 100)}%</button>
      <IconButton size="sm" label="Zoom in (Ctrl++)" onClick={() => zoomBy(1.25)}><IconPlus size={16} /></IconButton>
      <IconButton size="sm" label="Zoom to fit (Shift+1)" onClick={() => zoomToFit(currentPage())}><IconExpand size={16} /></IconButton>
    </div>
  );
}

function Editor() {
  const name = useEditor((s) => s.project?.name);
  const [tab, setTab] = usePref<string>('left-tab', 'library');
  return (
    <div className="cv-app">
      <TopBar
        className="cv-topbar"
        dragRegionProps={drag}
        title={
          <span className="cv-title" {...drag}>
            <IconButton size="sm" label="All projects" onClick={() => { void closeProject().then(forgetAssets); }}><IconChevronLeft size={18} /></IconButton>
            {name}
          </span>
        }
        status={<SaveState />}
        tools={
          <>
            <IconButton size="sm" label="Undo (Ctrl+Z)" onClick={undo}><IconBack size={16} /></IconButton>
            <IconButton size="sm" label="Redo (Ctrl+Shift+Z)" onClick={redo}><IconForward size={16} /></IconButton>
            <Zoom />
          </>
        }
        windowControls={desktop ? <DesktopWindowControls /> : undefined}
      />
      <aside className="cv-left">
        <Tabs ariaLabel="Panels" value={tab} onChange={setTab} tabs={[{ key: 'library', label: 'Library' }, { key: 'layers', label: 'Layers' }]} className="cv-left-tabs">
          {tab === 'layers' ? <Layers /> : <Library />}
        </Tabs>
      </aside>
      <main className="cv-main">
        <Canvas />
      </main>
      <aside className="cv-right">
        <Inspector />
      </aside>
    </div>
  );
}

export function App() {
  useShortcuts();
  useFullscreenKeys();
  const open = useEditor((s) => !!s.project);
  if (open) return <Editor />;
  return (
    <div className="cv-start">
      {desktop && (
        <div className="cv-start-bar" {...drag}>
          <DesktopWindowControls />
        </div>
      )}
      <Projects />
    </div>
  );
}
