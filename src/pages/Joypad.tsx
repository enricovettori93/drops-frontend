import {createStore} from "solid-js/store";
import {SLIDER_TYPE} from "../shared/constants";
import {createEffect, createMemo} from "solid-js";

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

  const handleSliderChange = (value: number, type: SLIDER_TYPE) => {
    const sum = getTotal();
    const maxTotal = 100;
    const blocked = 0;

    console.log("value channge", value, type);
    console.log("input", sum, maxTotal);

    if (sum > maxTotal || sum < maxTotal) {
      for (let sliderType in SLIDER_TYPE) {
        const oldValue = joypadStore[sliderType.toLowerCase() as SLIDER_TYPE].value;
        const newValue = oldValue - ((sum - maxTotal) / (2 - blocked));

        if (type !== sliderType && !joypadStore[sliderType.toLowerCase() as SLIDER_TYPE].disabled) {
          console.log("setto", sliderType.toLowerCase(), newValue);
          setJoypadStore(sliderType.toLowerCase() as SLIDER_TYPE, { value: newValue });
        }
      }

      console.log("setto", type,  value - (sum - maxTotal));

      // unique store mutation
      setJoypadStore(type, { value: value - (sum - maxTotal) });
    }
  }

  const ciao = createEffect(() => {
    console.log(joypadStore.research.value, joypadStore.production.value, joypadStore.military.value);
  })

  const getTotal = createMemo(() => {
    console.log(joypadStore.research.value, joypadStore.production.value, joypadStore.military.value);
    return joypadStore.research.value + joypadStore.production.value + joypadStore.military.value;
  });

  /*const getTotal = (): number => {
    console.log(joypadStore.research.value, joypadStore.production.value, joypadStore.military.value);
    return joypadStore.research.value + joypadStore.production.value + joypadStore.military.value;
  }*/

  return (
    <div class={"flex flex-col"}>
      <input onInput={(e: any) => handleSliderChange(parseInt(e.target.value, 10), SLIDER_TYPE.MILITARY)}
             type="range" min={0} max={100} id={SLIDER_TYPE.MILITARY} value={joypadStore.military.value} step={1}/>
      <input onInput={(e: any) => handleSliderChange(parseInt(e.target.value, 10), SLIDER_TYPE.RESEARCH)}
             type="range" min={0} max={100} id={SLIDER_TYPE.RESEARCH} value={joypadStore.research.value} step={1}/>
      <input onInput={(e: any) => handleSliderChange(parseInt(e.target.value, 10), SLIDER_TYPE.PRODUCTION)}
             type="range" min={0} max={100} id={SLIDER_TYPE.PRODUCTION} value={joypadStore.production.value} step={1}/>
    </div>
  )
}

export default Joypad;