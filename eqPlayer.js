// https://stackoverflow.com/questions/47368206/web-audio-api-removing-filter-while-playing

function eqPlayer() {
    let eqPlayerStyle = document.createElement('style'),
        eqPlayerCss = `
            section.db-site-container {
                background-color: var(--background-color-contrast);
                border-radius: 6px;
            }
section.eq-player-container {
position: absolute;
top: 0;
right: 0;
z-index: 100;

display: flex;
justify-content: center;
align-items: center;

width: 500px;
height: 200px;

background-color: rgba(255,255,255, 0.95);
backdrop-filter: blur(3px);
}
        `;

    eqPlayerStyle.setAttribute('type','text/css');
    eqPlayerStyle.textContent = eqPlayerCss;
    document.querySelector('body').append(eqPlayerStyle);    
    
    let targetContainer = document.querySelector('body'),
        elemPlayerContainer = document.createElement('section'),
        elemPlayer = document.createElement('audio'),
        song1 = 'smp Blessed.mp3',
        song2 = 'smp Open the Door.mp3',
        song3 = 'smp Pictures of You.mp3',
        song4 = 'smp Rooster.mp3',
        elemButtonA = document.createElement('button'),
        elemButtonB = document.createElement('button');
    
    elemPlayerContainer.className = 'eq-player-container';
    elemPlayer.className = 'eq-player-audio';
    
    elemPlayer.setAttribute('src', song4);
    elemPlayer.setAttribute('controls','');
    elemPlayer.setAttribute('loop','');
    
    elemPlayerContainer.append(elemPlayer);
    targetContainer.append(elemPlayerContainer);
    
    elemPlayerContainer.append(elemButtonA);
    elemPlayerContainer.append(elemButtonB);
    
    elemButtonA.textContent = 'Apply EQ';
    elemButtonA.addEventListener('click', initEq);
    
    elemButtonB.textContent = 'Get EQ vals';
    elemButtonB.addEventListener('click', getCurrenEqVals);
    
    function initEq() {
        console.log('eq init');
        
//        let playerContext = new (window.AudioContext || window.webkitAudioContext)(),
        let playerContext = new window.AudioContext(),
            playerSource = playerContext.createMediaElementSource(elemPlayer),
            filterA = playerContext.createBiquadFilter(),
            filterB = playerContext.createBiquadFilter();

        filterA.type = 'lowshelf';
        filterA.frequency.value = 150;
        filterA.gain.value = 10;
        
        filterB.type = 'lowpass';
        filterB.frequency.value = 1000;
        filterB.Q.value = 1.0;
        
        playerSource.connect(filterB);
        filterB.connect(playerContext.destination);
        
        console.log(playerSource);
    }
    
    
//    var context = new (window.AudioContext || window.webkitAudioContext)();
//    var mediaElement = document.querySelector('audio');
//    var source = context.createMediaElementSource(mediaElement);
//    var highShelf = context.createBiquadFilter();
//    var lowShelf = context.createBiquadFilter();
//    var highPass = context.createBiquadFilter();
//    var lowPass = context.createBiquadFilter();
//
//    source.connect(highShelf);
//    highShelf.connect(lowShelf);
//    lowShelf.connect(highPass);
//    highPass.connect(lowPass);
//    lowPass.connect(context.destination);
//
//    highShelf.type = "highshelf";
//    highShelf.frequency.value = 4700;
//    highShelf.gain.value = 50;
//
//    lowShelf.type = "lowshelf";
//    lowShelf.frequency.value = 35;
//    lowShelf.gain.value = 50;
//
//    highPass.type = "highpass";
//    highPass.frequency.value = 800;
//    highPass.Q.value = 0.7;
//
//    lowPass.type = "lowpass";
//    lowPass.frequency.value = 880;
//    lowPass.Q.value = 0.7;
//
//    var ranges = document.querySelectorAll('input[type=range]');
//    ranges.forEach(function(range){
//      range.addEventListener('input', function() {
//        window[this.dataset.filter][this.dataset.param].value = this.value;
//      });
//    });

    
}

function getCurrenEqVals() {
    let filtersElems = document.querySelectorAll('div.extra-panel div.filters div.filter'),
        filtersData = {
            filters: [],
            maxGain: 0
        };
    
    filtersElems.forEach(function(filter) {
        let filterData = {},
            filterActive = filter.querySelector('input[name="enabled"]').checked,
            filterType = filter.querySelector('select[name="type"]').selectedIndex === 0 ? 'peaking' : filter.querySelector('select[name="type"]').selectedIndex === 1 ? 'lowshelf' : 'highshelf',
            freqVal = filter.querySelector('input[name="freq"]').value,
            gainVal = filter.querySelector('input[name="gain"]').value,
            qVal = filter.querySelector('input[name="q"]').value,
            maxGainVal = filtersData.maxGain > gainVal ? filtersData.maxGain : gainVal;
        
        filterData.type = filterType;
        filterData.freq = freqVal;
        filterData.gain = gainVal;
        filterData.q = qVal;
        
        if (filterActive && gainVal != 0) {
            filtersData.filters.push(filterData);
            filtersData.maxGain = maxGainVal;
        }
    });
    console.log(filtersData);
    console.log('Got filters');
}
