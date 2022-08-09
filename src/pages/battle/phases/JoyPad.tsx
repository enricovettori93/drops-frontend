import {createStore} from "solid-js/store";
import {DEVELOPMENT_AT_END_ROUND, RESOURCES_AT_END_ROUND, SLIDER_TYPE} from "../../../shared/constants";
import {createMemo} from "solid-js";
import {BattleInfoCurrentPlayer} from "../../../models/user";

interface SliderState {
  military: ResourceType
  production: ResourceType
  research: ResourceType
}

interface ResourceType {
  value: number
  disabled: boolean
}

const initialState: SliderState = {
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

interface JoyPadProps {
  onChange: ({military, research, production}: {military: number, research: number, production: number}) => void,
  playerStats: BattleInfoCurrentPlayer
}

const JoyPad = ({onChange, playerStats}: JoyPadProps) => {
  const [joyPadStore, setJoyPadStore] = createStore<SliderState>(initialState);
  const MIN = 0;
  const MAX = 100;

  const handleSliderInput = (value: number, type: SLIDER_TYPE) => {

    if (value < MIN || value > MAX) return;

    const sum = getTotal();
    const maxTotal = 100;
    const blocked = 0;

    setJoyPadStore(type, {value});

    if (sum > maxTotal || sum < maxTotal) {
      for (let sliderType in SLIDER_TYPE) {
        if (type !== sliderType && !joyPadStore[sliderType.toLowerCase() as SLIDER_TYPE].disabled) {
          setJoyPadStore(sliderType.toLowerCase() as SLIDER_TYPE,(oldValue) => {
            return { value: oldValue.value - ((sum - maxTotal) / (2 - blocked)) };
          });
        }
      }
    }
  }

  const getTotal = createMemo(() => {
    return joyPadStore.research.value + joyPadStore.production.value + joyPadStore.military.value;
  })

  const handleSliderChange = () => {
    onChange({
      military: joyPadStore.military.value / 100,
      production: joyPadStore.production.value / 100,
      research: joyPadStore.research.value / 100
    });
  }

  const lockIcon = (type: SLIDER_TYPE) => {
    return joyPadStore[type.toLowerCase() as SLIDER_TYPE].disabled ? "fa fa-lock" : "fa fa-lock-open";
  }

  const triggerLock = (type: SLIDER_TYPE) => {
    setJoyPadStore(type.toLowerCase() as SLIDER_TYPE, (oldValue) => {
      return { disabled: !oldValue.disabled };
    });
  }

  const isInputDisabled = (type: SLIDER_TYPE) => {
    return joyPadStore[type.toLowerCase() as SLIDER_TYPE].disabled;
  }

  return (
    <>
      <div class={"w-100 h-[100px]"} style={{"background-color": playerStats.color}}></div>
      <p>
        resources: {playerStats.resources}
      </p>
      <p>
        cells: {playerStats.score}
      </p>
      <p>
        level: {playerStats.milestones_reached}
      </p>
      <input type="range" min={0} max={100} value={playerStats.milestones_reached === 9 ? 100 : playerStats.development} disabled/>
      <div class={"flex flex-col"}>
        <div class="range-container">
          <label for={SLIDER_TYPE.MILITARY}>Military</label>
          <div class={"flex"}>
            <button class={"w-[20px]"} onClick={(e: any) => triggerLock(SLIDER_TYPE.MILITARY)}>
              <em class={lockIcon(SLIDER_TYPE.MILITARY)}></em>
            </button>
            <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.MILITARY)}
                   onChange={handleSliderChange}
                   type="range"
                   min={0}
                   max={100}
                   id={SLIDER_TYPE.MILITARY}
                   value={joyPadStore.military.value}
                   step={1}
                   class={"basis-10/12"}
                   disabled={isInputDisabled(SLIDER_TYPE.MILITARY)}
            />
            <span class={"mx-auto"}>{Math.ceil(joyPadStore.military.value)}</span>
          </div>
        </div>
        <div class="range-container">
          <label for={SLIDER_TYPE.PRODUCTION}>Production</label>
          <div class={"flex"}>
            <button class={"w-[20px]"} onClick={(e: any) => triggerLock(SLIDER_TYPE.PRODUCTION)}>
              <em class={lockIcon(SLIDER_TYPE.PRODUCTION)}></em>
            </button>
            <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.PRODUCTION)}
                   onChange={handleSliderChange}
                   type="range"
                   min={0}
                   max={100}
                   id={SLIDER_TYPE.PRODUCTION}
                   value={joyPadStore.production.value}
                   step={1}
                   class={"basis-10/12"}
                   disabled={isInputDisabled(SLIDER_TYPE.PRODUCTION)}
            />
            <span class={"mx-auto"}>{((joyPadStore.production.value / 100) * RESOURCES_AT_END_ROUND).toFixed(1)}/turn</span>
          </div>
        </div>
        <div class="range-container">
          <label for={SLIDER_TYPE.RESEARCH}>Research</label>
          <div class={"flex"}>
            <button class={"w-[20px]"} onClick={(e: any) => triggerLock(SLIDER_TYPE.RESEARCH)}>
              <em class={lockIcon(SLIDER_TYPE.RESEARCH)}></em>
            </button>
            <input onInput={(e: any) => handleSliderInput(parseInt(e.target.value, 10), SLIDER_TYPE.RESEARCH)}
                   onChange={handleSliderChange}
                   type="range"
                   min={0}
                   max={100}
                   id={SLIDER_TYPE.RESEARCH}
                   value={joyPadStore.research.value}
                   step={1}
                   class={"basis-10/12"}
                   disabled={isInputDisabled(SLIDER_TYPE.RESEARCH)}
            />
            <span class={"mx-auto"}>{((joyPadStore.research.value / 100) * DEVELOPMENT_AT_END_ROUND).toFixed(1)}/turn</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default JoyPad;
