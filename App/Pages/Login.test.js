import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LogIn from './Login'; 
import axios from 'axios';


jest.mock('axios');

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });

jest.mock('react-native-paper', () => ({
    Provider: ({ children }) => children,
    Portal: ({ children }) => children,
    Dialog: function Dialog({ children, visible, onDismiss }) {
      return visible ? children : null;
    },
    Dialog: Object.assign(
      function Dialog({ children, visible, onDismiss }) {
        return visible ? children : null;
      },
      {
        Title: ({ children }) => children,
        Content: ({ children }) => children,
        Actions: ({ children }) => children,
      }
    ),
    Button: ({ children, onPress }) => (
      <button onPress={onPress}>{children}</button>
    ),
  }));
const mockNavigation = {
    replace: jest.fn(),
};



describe('LogIn Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });


    test('test test', () => {
        expect(true).toBe(true);
    });


    test('renders correctly', () => {
        const { getByPlaceholderText, getByText, getByTestId } = render(
          <LogIn navigation={mockNavigation} />
        );
    
        expect(getByPlaceholderText('Email or Username')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByTestId('login-button')).toBeTruthy();
      });



    test('shows error dialog when fields are empty', async () => {
        const { getByTestId, getByText } = render(
          <LogIn navigation={mockNavigation} />
        );
    
        fireEvent.press(getByTestId('login-button'));
    
        await waitFor(() => {
          expect(getByText('Please fill in both fields.')).toBeTruthy();
        });
    });



    test('shows error dialog on login failure', async () => {
        const errorMessage = 'Invalid credentials';
        axios.post.mockRejectedValueOnce({
          response: { data: { error: errorMessage } }
        });
    
        const { getByPlaceholderText, getByText, getByTestId } = render(
          <LogIn navigation={mockNavigation} />
        );
    
        fireEvent.changeText(getByPlaceholderText('Email or Username'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByTestId('login-button'));
    
        await waitFor(() => {
          expect(getByText(errorMessage)).toBeTruthy();
        });
      });

      
   
      test('shows error dialog on network error', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network Error'));
    
        const { getByPlaceholderText, getByText, getByTestId } = render(
          <LogIn navigation={mockNavigation} />
        );
    
        fireEvent.changeText(getByPlaceholderText('Email or Username'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByTestId('login-button'));
    
        await waitFor(() => {
          expect(getByText('Unable to connect to the server. Please check your internet connection.')).toBeTruthy();
        });
      });
    



});