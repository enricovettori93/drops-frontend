import {useAuthDispatch} from "../shared/context/auth.context";

const Login = () => {
  const authDispatch = useAuthDispatch();

  return (
    <>
      <button onClick={() => authDispatch?.login()}
              style={"bg-blue-300 p-5"}>
        Auth pls
      </button>
    </>
  )
}

export default Login;