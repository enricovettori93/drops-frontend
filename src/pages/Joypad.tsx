import {createStore} from "solid-js/store";
import {SLIDER_TYPE} from "../shared/constants";
import {createMemo} from "solid-js";

interface JoypadState {
  military: ResourceType
  production: ResourceType
  research: ResourceType
}

interface ResourceType {
  value: number
  disabled: boolean
}

const initialState: JoypadState = {
  military: {
    value: 34,
    disabled: false
  },
  production: {
    value: 33,
    disabled: false
  },
  research: {
    value: 33,
    disabled: false
  },
}

const Joypad = () => {
  const [joypadStore, setJoypadStore] = createStore<JoypadState>(initialState);
  const MIN = 0;
  const MAX = 100;

  const handleSliderInput = (value: number, type: SLIDER_TYPE) => {

    if (value < MIN || value > MAX) return;

    const sum = getTotal();
    const maxTotal = 100;
    const blocked = 0;

    setJoypadStore(type, {value});

    if (sum > maxTotal || sum < maxTotal) {
      for (let sliderType in SLIDER_TYPE) {
        if (type !== sliderType && !joypadStore[sliderType.toLowerCase() as SLIDER_TYPE].disabled) {
          setJoypadStore(sliderType.toLowerCase() as SLIDER_TYPE,(oldValue) => {
            return { value: oldValue.value - ((sum - maxTotal) / (2 - blocked)) };
          });
        }
      }
    }
  }

  const getTotal = createMemo(() => {
    return joypadStore.research.value + joypadStore.production.value + joypadStore.military.value;
  });


  return (
    <div class={"flex flex-col"}>
      <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.MILITARY)}
             type="range" min={0} max={100} id={SLIDER_TYPE.MILITARY} value={joypadStore.military.value} step={1}/>
      <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.RESEARCH)}
             type="range" min={0} max={100} id={SLIDER_TYPE.RESEARCH} value={joypadStore.research.value} step={1}/>
      <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.PRODUCTION)}
             type="range" min={0} max={100} id={SLIDER_TYPE.PRODUCTION} value={joypadStore.production.value} step={1}/>
    </div>
  )
}

export default Joypad;
