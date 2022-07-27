import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthState} from "../context/auth.context";

const JoypadLayout = () => {
  const useAuth = useAuthState();
  const navigate = useNavigate();

  onMount(async () => {
    if (!useAuth?.isAuthenticated) {
      navigate("/auth/login", {replace: true});
    }
  });

  return (
    <>
      <Outlet></Outlet>
    </>
  )
}

export default JoypadLayout;