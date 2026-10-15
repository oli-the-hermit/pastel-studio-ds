import React, { forwardRef } from 'react';
import { IconClose, IconSearch } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { IconButton } from '../IconButton';

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSubmit' | 'type' | 'size'> {
  value: string;
  onChange: (value: string) => void;
  /** "Search music". Also its accessible name. */
  placeholder: string;
  /** Enter: search now (otherwise results follow the typing). */
  onSubmit?: (value: string) => void;
  labels?: LabelOverrides<'clearSearch'>;
}

/** A pill-shaped search field with a search icon and a clear button. Escape clears it. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(({ value, onChange, placeholder, onSubmit, labels: ownLabels, className, onKeyDown, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  return (
    <div className={cx('ps-search-field', value && 'is-filled', className)}>
      <span className="ps-search-field-icon" aria-hidden="true"><IconSearch size={16} /></span>
      <input
        ref={ref}
        type="search"
        className="ps-search-field-input"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Escape' && value) {
            e.stopPropagation();
            onChange('');
          }
          if (e.key === 'Enter') onSubmit?.(value);
        }}
        {...rest}
      />
      {value && (
        <IconButton label={labels.clearSearch} size="xs" className="ps-search-field-clear" onClick={() => onChange('')}>
          <IconClose size={14} />
        </IconButton>
      )}
    </div>
  );
});
SearchField.displayName = 'SearchField';
