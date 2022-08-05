import * as QRCode from "qrcode";
import {onMount} from "solid-js";
import {HOSTNAME} from "../shared/constants";

const Viewer = () => {

  onMount(async () => {
     await QRCode.toCanvas(document.getElementById("qr-right"), `${HOSTNAME}/battle/`);
     await QRCode.toCanvas(document.getElementById("qr-left"), `${HOSTNAME}/battle/`);
  });

  return (
    <>
      Viewer page
      <canvas id="qr-left" class={"fixed bottom-0 left-0"}></canvas>
      <canvas id="qr-right" class={"fixed bottom-0 right-0"}></canvas>
    </>
  )
}

export default Viewer;
