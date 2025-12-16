import { render, screen } from '@testing-library/react';
import App from './App';

test('renders valid entry point', () => {
  render(<App />);
  // The app starts on the Login screen, which has a title "Login"
  const loginTitle = screen.getByText(/Login/i);
  expect(loginTitle).toBeInTheDocument();
});
