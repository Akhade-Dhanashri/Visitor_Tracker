import LoginForm from '../components/LoginForm';

const LoginPage = ({ onLogin }) => {
  const handleLogin = (role) => {
    if (onLogin) {
      onLogin(role);
    }
  };

  return (
    <div className="login-page">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;

