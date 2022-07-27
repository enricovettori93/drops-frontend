import * as Colyseus from "colyseus.js";

const Joypad = () => {
  const client = new Colyseus.Client('ws://localhost:2567');

  return (
    <>
      Joypad page
    </>
  )
}

export default Joypad;