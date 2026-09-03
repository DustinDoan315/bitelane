import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, 'name'> & {
  name: IconName;
};

export function Icon({ name, size = 22, color = '#15211D', ...props }: IconProps) {
  return <MaterialCommunityIcons color={color} name={name} size={size} {...props} />;
}
