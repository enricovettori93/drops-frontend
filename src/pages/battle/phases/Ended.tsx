import {Link} from "solid-app-router";

const Intro = () => {
  return (
    <>
      Thank you for playing!
      <br/>
      <Link href={"/battle"}>
        Play again
      </Link>
    </>
  )
}

export default Intro;
