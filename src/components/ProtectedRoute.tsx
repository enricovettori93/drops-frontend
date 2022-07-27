import {Route, RouteProps, useNavigate} from "solid-app-router";
import {useAuthState} from "../shared/context/auth.context";

const ProtectedRoute = (props: RouteProps) => {
  const navigator = useNavigate();
  const useAuth = useAuthState();

  console.log("ahah")

  if (!useAuth?.isAuthenticated) {
    navigator("/login");
  }

  return(
    <Route {...props}>
      {props.children}
    </Route>
  )
}

export default ProtectedRoute;