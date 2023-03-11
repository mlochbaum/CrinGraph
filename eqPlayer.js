// Removing filters: https://stackoverflow.com/questions/47368206/web-audio-api-removing-filter-while-playing
// Calculate gain: https://stackoverflow.com/questions/59913333/web-audio-api-calculate-cumulative-gain-of-filters

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

        const eqVals = getCurrenEqVals();
        console.log('eq values', eqVals);
        
        const filters = eqVals.filters || [];
        
//        let playerContext = new (window.AudioContext || window.webkitAudioContext)(),
        let playerContext = new window.AudioContext(),
            playerSource = playerContext.createMediaElementSource(elemPlayer);

        const equalizerNodes = filters.map(() => playerContext.createBiquadFilter());
        playerSource.connect(equalizerNodes[0]);
        equalizerNodes.forEach((node, index) => {
            if (index === equalizerNodes.length - 1)  node.connect(playerContext.destination)
            else node.connect(equalizerNodes[index + 1])
        })
        
        equalizerNodes.forEach((node, index) => {
            const { freq, gain, q, type } = filters[index]
            node.type = type
            node.frequency.value = freq
            node.gain.value = gain
            node.Q.value = q
        })
        
        console.log('nodes', equalizerNodes)
        console.log(playerSource);
    }
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
    return filtersData
}
