import { IconApp, IconBook, IconBug, IconGithub, IconStar, ListRow } from '@pastel-studio/react';
import { labels } from '../labels';
import { issueUrl, links, openExternal, version } from '../lib/about';

const a = labels.aboutView;

/** About Pastel Studio: version, privacy, license, credits and the project's links. */
export function AboutView() {
  return (
    <div className="pastel-about">
      <div className="pastel-about-head">
        <span className="pastel-about-mark" aria-hidden="true">
          <IconApp size={28} />
        </span>
        <div>
          <h3 className="pastel-about-name">{labels.appName}</h3>
          <p className="pastel-about-version">
            {a.version(version)} <span className="pastel-about-stage">{a.stage}</span>
          </p>
        </div>
      </div>
      <p>{a.tagline}</p>
      <div className="pastel-about-note">
        <strong>{a.privacyTitle}</strong>
        <p>{a.privacyBody}</p>
      </div>
      <div className="pastel-about-links">
        <ListRow icon={<IconGithub size={18} />} title={a.source} description={a.sourceHint} external onClick={() => openExternal(links.repo)} />
        <ListRow icon={<IconBug size={18} />} title={a.report} description={a.reportHint} external onClick={() => openExternal(issueUrl())} />
        <ListRow icon={<IconStar size={18} />} title={a.star} description={a.starHint} external onClick={() => openExternal(links.repo)} />
        <ListRow icon={<IconBook size={18} />} title={a.docs} description={a.docsHint} external onClick={() => openExternal(links.docs)} />
      </div>
      <p className="pastel-about-fine">
        {a.license} {a.credits}
      </p>
    </div>
  );
}
