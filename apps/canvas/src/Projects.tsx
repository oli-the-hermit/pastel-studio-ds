// The start screen: the projects in the projects folder, a new one, or (on the desktop) any folder.
import { useEffect, useState } from 'react';
import { Button, Card, IconFolder, IconPlus } from '@pastel-studio/react';
import { isDesktop } from '@pastel-studio/desktop';
import { openProject } from './model/store';
import { fsApi } from './storage/fs';
import { createProject, listProjects, loadProject, PROJECT_EXT } from './storage/project';

export function Projects() {
  const [root, setRoot] = useState<string>();
  const [projects, setProjects] = useState<{ name: string; dir: string }[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    fsApi.root().then(async (r) => { setRoot(r); setProjects(await listProjects(r)); }, (e) => setError(String(e)));
  }, []);

  const open = async (dir: string) => {
    try {
      openProject(await loadProject(dir));
    } catch (e) {
      setError(`Couldn't open ${dir}: ${e instanceof Error ? e.message : e}`);
    }
  };

  const create = async () => {
    if (!root) return;
    try {
      await open(await createProject(root, name.trim() || 'Untitled'));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const openFolder = async () => {
    const dir = await fsApi.pickFolder();
    if (!dir) return;
    if (await fsApi.exists(`${dir}${dir.includes('\\') ? '\\' : '/'}project.json`)) await open(dir);
    else setError(`That folder isn't a Canvas project: it has no project.json. Projects are folders ending in ${PROJECT_EXT}.`);
  };

  return (
    <div className="cv-projects">
      <Card className="cv-projects-card">
        <h1 className="cv-projects-title">Pastel Studio Canvas</h1>
        <p className="cv-muted">Mockups made of the design system's own components. Projects live in <code>{root ?? '…'}</code>.</p>
        <form className="cv-row" onSubmit={(e) => { e.preventDefault(); void create(); }}>
          <input className="ps-input" aria-label="New project name" placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="primary" icon={<IconPlus size={18} />}>Create</Button>
        </form>
        {error && <p className="cv-error">{error}</p>}
        {projects.length > 0 && (
          <>
            <p className="ps-overline">Projects</p>
            <div className="cv-project-list">
              {projects.map((p) => (
                <button key={p.dir} type="button" className="cv-project" onClick={() => void open(p.dir)}>
                  <IconFolder size={18} /> {p.name}
                </button>
              ))}
            </div>
          </>
        )}
        {isDesktop() && <Button onClick={() => void openFolder()} icon={<IconFolder size={18} />}>Open a folder…</Button>}
      </Card>
    </div>
  );
}
