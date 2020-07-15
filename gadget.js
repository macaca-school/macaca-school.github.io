
const allInstructions = [
    {
        name: "Beat",
        instructions: ['beat']
    },
    {
        name: "Change",
        instructions: ['change']
    },
    {
        name: "Ipsi, Contra",
        instructions: ['ipsi', 'contra']
    },
    {
        name: "Directions + Ipsi, Contra",
        instructions: ['forward-ipsi', 'forward-contra', 'backward-ipsi', 'backward-contra', 'inside-ipsi', 'inside-contra', 'outside-ipsi', 'outside-contra']
    },
    {
        name: "Change Plane, Change Direction",
        instructions: ['change-plane', 'change-direction']
    },
    {
        name: "Up, Down, Change Plane, Change Direction",
        instructions: ['up', 'down','change-plane', 'change-direction'],
        repeat: true
    },
    {
        name: "Up, Down",
        instructions: ['up', 'down']
    },
];

var instructions = [];
var active_timer = 0;
var repeat = false;
var last_instruction;

const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx;

window.addEventListener("load", () => {
    const timeInterval = document.getElementById("time-interval");
    const timeVariance = document.getElementById("time-variance");
    const select = document.getElementById("instructions-select");

    timeInterval.value = 1.0;
    setInterval(timeInterval.value);

    timeVariance.value = 0;
    setVariance(timeVariance.value);

    allInstructions.map((instruction, index) => {
        const option = document.createElement("option");
        option.text = instruction.name;
        option.index = index;
        select.add(option);
    })
    select.selectedIndex = 0;
    setInstructions(select.selectedIndex);

    audioCtx = new AudioContext();

    const btn = document.getElementById("start-button");
    btn.onclick = function() {
      const instruction = instructions[Math.floor((Math.random() * instructions.length))];

      if(audioCtx.state === 'running') {
        audioCtx.suspend().then(function() {
          btn.textContent = 'Start';
          clearTimeout(active_timer);
          active_timer = 0;
          document.getElementById("instruction-text").innerHTML = "-";
          instruction.audio.pause();
        });
      } else if(audioCtx.state === 'suspended') {
        audioCtx.resume().then(function() {
          btn.textContent = 'Pause';
          instruction.audio.currentTime = 0;
          setInstructionTimer();
        });
      }
    }

    if (/\b(iPad|iPhone)\b/i.test(navigator.userAgent)) {
        document.getElementById('ios-alert').style.display = 'block';
    }
})

function setInterval(interval) {
    document.getElementById("display-interval").innerHTML = Number(interval).toFixed(1) + "s";
}

function setVariance(variance) {
    document.getElementById("display-variance").innerHTML = variance + "%";
}

function setInstructions(index) {
    instructions = allInstructions[index].instructions.map(item => {
        return { name: item, audio: document.getElementById('audio-' + item) }
    })

    repeat = allInstructions[index].repeat ? true : false;
 }

//Safari on iOS only allow to download audio on an user-initiated action
function loadAudios() {
    instructions.map(instruction => {
        instruction.audio.load();
        audioCtx.createMediaElementSource(instruction.audio).connect(audioCtx.destination);
    })
}

function setInstructionTimer() {
    const interval = document.getElementById("time-interval").value;
    const variance = document.getElementById("time-variance").value;

    active_timer = setTimeout(newInstruction, interval * 1000 * (1 + Math.random() * (variance / 100)));
}

function newInstruction() {
    const banner = document.getElementById("instruction-text");
    const options = instructions.length > 2 ? instructions.filter(i => i.name !== last_instruction) : instructions;
    const instruction = options[Math.floor((Math.random() * options.length))];

    if (!repeat)
        last_instruction = instruction.name;

    if (!active_timer)
        return;

    instruction.audio.play();
    banner.innerHTML = instruction.name.replace('-', ' ');
    banner.className = "visible";
    setTimeout(() => { banner.className = "hidden"; }, 200);

    setInstructionTimer();
}
