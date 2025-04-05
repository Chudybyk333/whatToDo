import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Tasks from './Tasks'; 
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('axios');

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });

test('renders loading state correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
  
    const { getByText } = render(
      <NavigationContainer>
        <Tasks navigation={{}} />
      </NavigationContainer>
    );
  
    expect(getByText('Loading...')).toBeTruthy();
  });
  
  test('renders error state correctly', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to load tasks'));
  
    const { getByText } = render(
      <NavigationContainer>
        <Tasks navigation={{}} />
      </NavigationContainer>
    );
  
    await waitFor(() => getByText('Failed to load tasks'));
  });

  test('shows error message when API call fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to load tasks'));
  
    const { getByText } = render(
      <NavigationContainer>
        <Tasks navigation={{}} />
      </NavigationContainer>
    );
  
    await waitFor(() => getByText('Failed to load tasks'));
    expect(getByText('Failed to load tasks')).toBeTruthy();
  });
  
