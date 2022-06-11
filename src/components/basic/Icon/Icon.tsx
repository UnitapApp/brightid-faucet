import * as React from 'react';
import { IconWrapper } from './icon.style';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  width?: string;
  height?: string;
  smWidth?: string;
  mr?: number;
  mrAuto?: boolean;
  mb?: number;
  smMb?: number;
  ml?: number;
  mt?: number;
  hoverable?: boolean;
  iconSrc: string;
}

const Icon = (props: IconProps) => (
  <IconWrapper {...props}>
    <img src={props.iconSrc} alt="" />
  </IconWrapper>
);

export default Icon;
