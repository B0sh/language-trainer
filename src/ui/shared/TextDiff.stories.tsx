import React, { useEffect, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextDiff } from './TextDiff.js';

const meta: Meta<typeof TextDiff> = {
  title: 'TextDiff',
  component: TextDiff,
  // parameters: {
  //   layout: 'centered',
  // },
  tags: ['autodocs'],
  argTypes: {
    before: {
      control: 'text',
      description: 'Before',
    },
    after: {
      control: 'text',
      description: 'After',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    before: 'こんにちわ！今日はいい天気ですね。',
    after: 'こんにちは！今日はいい天気ですね。',
  },
};
