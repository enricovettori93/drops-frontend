import {Outlet, useNavigate} from "solid-app-router";
import {onMount} from "solid-js";
import {useAuthState} from "../context/auth.context";

const JoypadLayout = () => {
  const useAuth = useAuthState();
  const navigate = useNavigate();

  onMount(async () => {
    // TODO: riabilita auth appena il capo fa cose
    if (false) {
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