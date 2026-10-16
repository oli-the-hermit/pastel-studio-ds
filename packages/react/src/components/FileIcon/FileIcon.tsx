import React, { forwardRef } from 'react';
import {
  IconApp, IconDrive, IconFile, IconFile3d, IconFileArchive, IconFileAudio, IconFileCode, IconFileDoc, IconFileImage,
  IconFileSheet, IconFileText, IconFileVideo, IconFolderSolid, IconFont, IconLayers, type IconProps,
} from '../../icons';
import { cx } from '../../lib/cx';
import { categoryOf, extensionOf, type FileCategory, type FsEntry } from '../../lib/fs';

const GLYPHS: Record<FileCategory, React.FC<IconProps>> = {
  folder: IconFolderSolid,
  drive: IconDrive,
  image: IconFileImage,
  video: IconFileVideo,
  audio: IconFileAudio,
  text: IconFileText,
  document: IconFileDoc,
  pdf: IconFileDoc,
  spreadsheet: IconFileSheet,
  presentation: IconLayers,
  code: IconFileCode,
  archive: IconFileArchive,
  app: IconApp,
  font: IconFont,
  model: IconFile3d,
  file: IconFile,
};

const GLYPH_SIZE = { sm: 16, md: 20, lg: 22, xl: 30 };
const FOLDER_SIZE = { sm: 16, md: 20, lg: 30, xl: 48 };

export interface FileIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  entry: Pick<FsEntry, 'kind' | 'name'>;
  /** `sm` in a tree or list, `md` in rows, `lg` on a tile, `xl` on a large tile with the extension. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * The icon of a file type: one glyph per category, folders solid in the accent. Large sizes sit
 * on a tonal tile; `xl` adds the extension, so two images still tell PNG from PSD.
 */
export const FileIcon = forwardRef<HTMLSpanElement, FileIconProps>(({ entry, size = 'md', className, ...rest }, ref) => {
  const category = categoryOf(entry);
  const Glyph = GLYPHS[category];
  const ext = size === 'xl' && entry.kind === 'file' ? extensionOf(entry.name) : '';
  return (
    <span ref={ref} className={cx('ps-file-icon', `ps-file-icon--${size}`, `is-${category}`, className)} aria-hidden="true" {...rest}>
      <Glyph size={category === 'folder' ? FOLDER_SIZE[size] : GLYPH_SIZE[size]} />
      {ext && <span className="ps-file-icon-ext">{ext}</span>}
    </span>
  );
});
FileIcon.displayName = 'FileIcon';
