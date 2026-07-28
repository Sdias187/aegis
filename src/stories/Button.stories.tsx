import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui';

const meta = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'ghost', 'danger', 'outline', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button Default',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button Secondary',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Button Danger',
    variant: 'danger',
  },
};

export const Loading: Story = {
  args: {
    children: 'Carregando...',
    loading: true,
  },
};

export const Ghost: Story = {
  args: {
    children: 'Button Ghost',
    variant: 'ghost',
  },
};
