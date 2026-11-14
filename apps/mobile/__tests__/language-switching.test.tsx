import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LanguagePickerScreen } from '../src/screens/LanguagePickerScreen';
import i18n from '../src/i18n';
import { useAppStore } from '../src/store/useAppStore';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('Language Switching & Picker Screen', () => {
  beforeEach(() => {
    useAppStore.getState().setLanguage('hi');
  });

  it('renders all 7 Indian languages with their native scripts', async () => {
    const { getByText, getAllByText } = await render(
      <LanguagePickerScreen navigation={mockNavigation} route={{ params: {} }} />
    );

    expect(getByText('हिन्दी')).toBeTruthy();
    expect(getByText('ಕನ್ನಡ')).toBeTruthy();
    expect(getByText('தமிழ்')).toBeTruthy();
    expect(getByText('বাংলা')).toBeTruthy();
    expect(getByText('ଓଡ଼ିଆ')).toBeTruthy();
    expect(getByText('ਪੰਜਾਬੀ')).toBeTruthy();
    expect(getAllByText('English').length).toBeGreaterThan(0);
  });

  it('switches application language when a language card is pressed', async () => {
    const { getByText } = await render(
      <LanguagePickerScreen navigation={mockNavigation} route={{ params: {} }} />
    );

    // Tap Kannada card
    fireEvent.press(getByText('ಕನ್ನಡ'));

    // Check store & i18n language updated
    expect(useAppStore.getState().language).toBe('kn');
    expect(i18n.language).toBe('kn');
  });
});
