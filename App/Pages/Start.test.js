import { render, fireEvent  } from '@testing-library/react-native';
import Start from './Start'; // Zaktualizuj ścieżkę, jeśli jest inna


//j
test('renders correctly', () => {
  const { getByText } = render(<Start navigation={{}} />);
  
  expect(getByText('Welcome to')).toBeTruthy();
  
  expect(getByText('What To Do...')).toBeTruthy();
  
  expect(getByText('Sign Up')).toBeTruthy();
  expect(getByText('Log In')).toBeTruthy();
});

//f
test('navigates to SignUp screen when Sign Up button is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<Start navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Sign Up'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
  });
  

  //f
  test('navigates to LogIn screen when Log In button is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(<Start navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Log In'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('LogIn');
  });
