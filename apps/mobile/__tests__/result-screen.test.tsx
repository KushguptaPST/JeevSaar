import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResultScreen } from '../src/screens/ResultScreen';
import { Explanation } from '@reportsaathi/shared';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const sampleExplanation: Explanation = {
  language: 'en',
  overallSummary: 'Your hemoglobin is slightly below standard range.',
  doctorVisit: {
    level: 'soon',
    reason: 'Hemoglobin is mildly low, routine check advised.',
  },
  tests: [
    {
      name: 'Hemoglobin (Hb)',
      nameEnglish: 'Hemoglobin (Hb)',
      value: 10.4,
      unit: 'g/dL',
      printedRange: '12.0 - 15.5',
      status: 'low',
      whatItMeasures: 'Oxygen carrying protein in blood.',
      whatYourResultMeans: 'Mildly low level can cause fatigue.',
      generalPrecautions: ['Eat iron-rich foods', 'Get adequate sleep'],
    },
  ],
  questionsForDoctor: ['Should I take an iron supplement?'],
  spokenScript: 'Hello, your hemoglobin is ten point four grams.',
  disclaimer: 'This is educational guidance only. Not medical treatment.',
};

describe('ResultScreen Component Tests', () => {
  it('renders overall summary and doctor visit guidance banner', async () => {
    const { getByText } = await render(
      <ResultScreen
        navigation={mockNavigation}
        route={{ params: { initialExplanation: sampleExplanation } }}
      />
    );

    expect(getByText('Schedule a Doctor Visit Soon')).toBeTruthy();
    expect(getByText('Your hemoglobin is slightly below standard range.')).toBeTruthy();
  });

  it('renders test card with status chip and printed range', async () => {
    const { getByText } = await render(
      <ResultScreen
        navigation={mockNavigation}
        route={{ params: { initialExplanation: sampleExplanation } }}
      />
    );

    expect(getByText('Hemoglobin (Hb)')).toBeTruthy();
    expect(getByText('10.4 g/dL')).toBeTruthy();
    expect(getByText('Printed Range on Report: 12.0 - 15.5 g/dL')).toBeTruthy();
    expect(getByText('Mildly low level can cause fatigue.')).toBeTruthy();
  });

  it('renders persistent medical disclaimer and listen button', async () => {
    const { getByText } = await render(
      <ResultScreen
        navigation={mockNavigation}
        route={{ params: { initialExplanation: sampleExplanation } }}
      />
    );

    expect(getByText('Listen to Spoken Explanation')).toBeTruthy();
    expect(getByText('This is educational guidance only. Not medical treatment.')).toBeTruthy();
  });
});
