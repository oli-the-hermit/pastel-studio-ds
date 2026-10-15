import React from 'react';
import { IconDrive, IconFolder, type Crumb, type TreeNode } from '@pastel-studio/react';

const folder = <IconFolder size={16} />;

// A small home folder for the file components' examples.
export const tree: TreeNode[] = [
  { id: 'places', label: 'Places', heading: true },
  { id: 'home', label: 'Home', icon: folder, children: [
    { id: 'music', label: 'Music', icon: folder, children: [
      { id: 'albums', label: 'Albums', icon: folder, children: [{ id: 'tidal', label: 'Tidal Lines', icon: folder }, { id: 'harbour', label: 'Harbour Lights', icon: folder }] },
      { id: 'podcasts', label: 'Podcasts', icon: folder },
      { id: 'recordings', label: 'Field recordings', icon: folder },
    ] },
    { id: 'documents', label: 'Documents', icon: folder, children: [{ id: 'notes', label: 'Notes', icon: folder }, { id: 'invoices', label: 'Invoices', icon: folder }] },
    { id: 'downloads', label: 'Downloads', icon: folder },
    { id: 'pictures', label: 'Pictures', icon: folder, hasChildren: true },
  ] },
  { id: 'gap', label: '', separator: true },
  { id: 'drives', label: 'Drives', heading: true },
  { id: 'backup', label: 'Backup drive', icon: <IconDrive size={16} />, hasChildren: true },
];

const byId = new Map<string, TreeNode>();
const parentOf = new Map<string, string>();
const index = (list: TreeNode[], parent?: string) => list.forEach((n) => {
  byId.set(n.id, n);
  if (parent) parentOf.set(n.id, parent);
  if (n.children) index(n.children, n.id);
});
index(tree);

/** From the root to a folder, as crumbs. */
export function pathTo(id: string): Crumb[] {
  const out: Crumb[] = [];
  for (let at: string | undefined = id; at; at = parentOf.get(at)) out.unshift({ id: at, label: byId.get(at)?.label ?? at });
  return out;
}

/** A folder's subfolders, as crumbs. */
export const childrenOf = (id: string): Crumb[] => (byId.get(id)?.children ?? []).map((c) => ({ id: c.id, label: c.label }));

/** The folder a typed path names ("Home\\Music"), if any. */
export const findPath = (text: string) => [...byId.values()].find((n) => pathTo(n.id).map((c) => c.label).join('\\').toLowerCase() === text.trim().toLowerCase())?.id;
