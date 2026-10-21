import React, { forwardRef, useRef, useState } from 'react';
import { IconChevronDown } from '../../icons';
import { cx } from '../../lib/cx';
import { Menu, type MenuItem } from '../Menu';
import { Modal } from '../Modal';

export interface AccountProfile {
  name: string;
  /** A second line under the name in the menu, e.g. "@sam". */
  handle?: string;
  /** A picture URL; without one the badge shows the name's initials. */
  avatar?: string;
  /** Puts a dot on the avatar, e.g. for the main account; the text is its tooltip. */
  marker?: string;
}

/** One entry of the menu that opens a view in the dialog: Profile, Appearance, Settings. */
export interface AccountView {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** The dialog's title; the label by default. */
  title?: string;
  render: () => React.ReactNode;
}

export interface AccountMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  profile: AccountProfile;
  /** The avatar alone, for the rail; expanded, the badge also shows the name and a chevron. */
  compact?: boolean;
  views: AccountView[];
  /** The last item, in the danger look: sign out, switch profile. Disabled while its promise runs. */
  exit: { label: string; icon?: React.ReactNode; onSelect: () => void | Promise<void> };
  /** The open view's key, to control it from outside; null when the dialog is closed. */
  view?: string | null;
  onViewChange?: (key: string | null) => void;
}

const initialsOf = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

/**
 * The signed-in profile at the bottom of the navigation drawer: its avatar (and, expanded, its
 * name) opens a menu of views and the exit; a view opens in a wide dialog. It sits in NavRail's footer.
 */
export const AccountMenu = forwardRef<HTMLDivElement, AccountMenuProps>(({
  profile, compact = false, views, exit, view: controlled, onViewChange, className, ...rest
}, ref) => {
  const [own, setOwn] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const open = controlled !== undefined ? controlled : own;
  const setView = (key: string | null) => {
    if (controlled === undefined) setOwn(key);
    onViewChange?.(key);
  };
  // The last view stays while the dialog closes, so its content doesn't vanish under the animation.
  const last = useRef<AccountView | undefined>(undefined);
  const current = views.find((v) => v.key === open);
  if (current) last.current = current;
  const shown = current ?? last.current;

  const runExit = async () => {
    setBusy(true);
    try {
      await exit.onSelect();
    } finally {
      setBusy(false);
    }
  };
  const items: MenuItem[] = [
    ...views.map((v) => ({ key: v.key, label: v.label, icon: v.icon, onSelect: () => setView(v.key) })),
    { key: 'exit', label: exit.label, icon: exit.icon, danger: true, disabled: busy, onSelect: () => void runExit() },
  ];

  return (
    <div ref={ref} className={cx('ps-account-menu', compact && 'ps-account-menu--compact', className)} {...rest}>
      <Menu
        items={items}
        ariaLabel={profile.name}
        triggerClassName="ps-account-menu-trigger"
        align="start"
        header={
          <div className="ps-account-menu-head">
            <span className="ps-account-menu-head-name">{profile.name}</span>
            {profile.handle && <span className="ps-account-menu-head-handle">{profile.handle}</span>}
          </div>
        }
        trigger={
          <>
            <span className="ps-account-menu-avatar">
              {profile.avatar
                ? <img src={profile.avatar} alt="" className="ps-account-menu-avatar-img" />
                : <span aria-hidden="true">{initialsOf(profile.name)}</span>}
              {profile.marker && <span className="ps-account-menu-marker" title={profile.marker} />}
            </span>
            {!compact && (
              <>
                <span className="ps-account-menu-name">{profile.name}</span>
                <span className="ps-account-menu-chevron" aria-hidden="true"><IconChevronDown size={16} /></span>
              </>
            )}
          </>
        }
      />
      {shown && (
        <Modal isOpen={!!current} title={shown.title ?? shown.label} wide onClose={() => setView(null)}>
          {shown.render()}
        </Modal>
      )}
    </div>
  );
});
AccountMenu.displayName = 'AccountMenu';
