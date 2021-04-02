function addPhonesToUrl() {
    var phonesArray = [];
    Object.values(activePhones).forEach(val => {
        var phoneFile = val.fileName;
        phonesArray.push(phoneFile);
    });

    var rootUrl = window.location.href.split('?').shift(),
        phonesString = encodeURI(phonesArray.join().replaceAll(' ', '_')),
        viewString = '?share=' + phonesString,
        pageTitle = phonesArray.join().replace(',', ', ') + ' - CrinGraph',
        pageTitleDefault = 'CrinGraph';

    if ( phonesString.length ) {
        window.history.replaceState('', pageTitle, viewString);
        document.title = pageTitle;
    } else {
        window.history.replaceState('', pageTitleDefault, rootUrl);
        document.title = pageTitleDefault;
    }    
}