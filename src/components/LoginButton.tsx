import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '@/contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Handle successful login (e.g., redirect)
    } catch (error) {
      console.error('Google login failed:', error);
      // Handle error (show error message)
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      fullWidth
    >
      Continue with Google
    </Button>
  );
};

export default LoginButton; 