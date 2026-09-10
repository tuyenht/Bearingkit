import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import SettingsPage from '../src/app/settings/page';

test('renders the save button', () => {
  render(<SettingsPage />);
  expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
});
