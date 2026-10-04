import type React from 'react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Width and height in px. Default 18. */
  size?: number;
}
