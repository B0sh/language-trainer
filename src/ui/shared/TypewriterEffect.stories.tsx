import React, { useEffect, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypewriterEffect } from './TypewriterEffect.js';

const meta: Meta<typeof TypewriterEffect> = {
  title: 'TypewriterEffect',
  component: TypewriterEffect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'The text to be typed out character by character',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This is a much longer message that demonstrates how the typewriter effect works with extended text content.\nIt should type out each character one by one, creating a dynamic and engaging visual effect for the user to enjoy.',
  },
};

export const AutoChanging: Story = {
  render: () => {
    const texts = useMemo(() => [
      'First message...',
      'Second message appears...',
      'Third and final message!',
    ], []);
    const [currentText, setCurrentText] = React.useState(texts[0]);
    const [index, setIndex] = React.useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prev) => {
          const nextIndex = (prev + 1) % texts.length;
          setCurrentText(texts[nextIndex]);
          return nextIndex;
        });
      }, 4000);

      return () => clearInterval(interval);
    }, [texts]);

    return (
      <div>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Auto-changing every 4 seconds ({index + 1}/{texts.length})
        </p>
        <TypewriterEffect text={currentText} />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    text: '',
  },
};

export const SingleCharacter: Story = {
  args: {
    text: 'A',
  },
};
