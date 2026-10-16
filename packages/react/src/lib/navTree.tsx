import React from 'react';
import { IconBookmark, IconDrive, IconFolder, IconGallery, IconHome, IconMonitor, IconNetwork, IconPin, IconStar } from '../icons';
import type { TreeNode } from '../components/TreeView';
import { defaultLabels, type Labels } from '../labels';
import { isContainer, type FsEntry } from './fs';

// The navigation tree that FileExplorer and FileDialog share: places, shortcuts, then the folders.

/** A folder subtree as tree nodes, folders and drives only. */
function folderNodes(e: FsEntry): TreeNode {
  const kids = (e.children ?? []).filter((c) => isContainer(c) && !c.hidden);
  return {
    id: e.id,
    label: e.name,
    icon: e.kind === 'drive' ? <IconDrive size={16} /> : <IconFolder size={16} />,
    children: kids.map(folderNodes),
    hasChildren: kids.length > 0,
  };
}

export interface NavTreeOptions {
  home?: FsEntry;
  gallery?: FsEntry;
  network?: FsEntry;
  /** Folders pinned to Quick access. */
  pinned?: FsEntry[];
  /** Recently used folders (a file dialog). */
  recent?: FsEntry[];
  /** Folders the person bookmarked (a file dialog). */
  bookmarks?: FsEntry[];
  labels?: Pick<Labels, 'quickAccess' | 'recent' | 'bookmarks'>;
}

/** Home and Gallery, recent and bookmarked folders, Quick access, the computer's folders, Network. */
export function buildNavTree(computer: FsEntry, o: NavTreeOptions = {}): TreeNode[] {
  const labels = o.labels ?? defaultLabels;
  const leaf = (e: FsEntry, icon: React.ReactNode, prefix = '', trailing?: React.ReactNode): TreeNode => ({ id: prefix + e.id, label: e.name, icon, trailing });
  const nodes: TreeNode[] = [];
  if (o.home) nodes.push(leaf(o.home, <IconHome size={16} />));
  if (o.gallery) nodes.push(leaf(o.gallery, <IconGallery size={16} />));
  if (o.recent?.length) nodes.push({ id: '__recent', label: labels.recent, heading: true }, ...o.recent.map((e) => leaf(e, <IconFolder size={16} />, 'recent:')));
  if (o.bookmarks?.length) nodes.push({ id: '__bookmarks', label: labels.bookmarks, heading: true }, ...o.bookmarks.map((e) => leaf(e, <IconBookmark size={16} />, 'bookmark:')));
  if (o.pinned?.length) {
    if (nodes.length) nodes.push({ id: '__gap-quick', label: '', separator: true });
    nodes.push({ id: '__quick', label: labels.quickAccess, icon: <IconStar size={16} />, children: o.pinned.map((e) => leaf(e, <IconFolder size={16} />, 'pin:', <IconPin size={13} />)) });
  }
  if (nodes.length) nodes.push({ id: '__gap-computer', label: '', separator: true });
  nodes.push({ ...folderNodes(computer), icon: <IconMonitor size={16} /> });
  if (o.network) nodes.push(leaf(o.network, <IconNetwork size={16} />));
  return nodes;
}

/** The entry behind a tree row: shortcut rows carry a prefix so their ids stay unique. */
export const entryIdOf = (id: string) => id.replace(/^(pin|recent|bookmark):/, '');

/** Rows that are only groups, such as Quick access, open nothing. */
export const isGroupRow = (id: string) => id.startsWith('__');
