import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <SignIn routing="hash" />
      </div>
    </div>
  );
};

export default Login;


